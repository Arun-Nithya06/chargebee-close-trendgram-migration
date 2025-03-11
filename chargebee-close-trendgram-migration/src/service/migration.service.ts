import { Logger } from "@aws-lambda-powertools/logger";
import { ExportCustomer } from "src/interface/customer";
import closeCRMService from "./close.service";
import {
  CloseCrmObject,
  CloseCrmLeadCustomField,
  CloseCrmContactCustomFiled,
} from "./constant";
import chargebeeService from "./chargebee.service";
import { ChargebeeSubscription } from "src/interface/subscription";
import { formatDate, mapSubscriptionStatus } from "src/utils/builder";
import sqsService from "src/sqs/sqs.service";

class MigrationService {
  logger = new Logger({ serviceName: MigrationService.name });
  constructor() {}

  public async pushedDataSQS(
    start: number,
    end: number,
    processdata: ExportCustomer[]
  ) {
    this.logger.info(`Pushed Daata SQS `);
    const sqsUrl = process.env.CHARGEBEE_CLOSE_MIGRATION_SQS ?? "";
    const details = processdata.slice(start, end);
    for (let index = 0; index < details.length; index++) {
      const item = details[index];
      await sqsService.pushToQueue(item, sqsUrl);
      this.logger.info(`Processing item at index: ${index}`);
      await new Promise((resolve) => setTimeout(resolve, 10)); // Add a delay of 10ms
    }
  }

  private buildUrl(customerId: string, subscriptionId: string) {
    this.logger.info(
      `Chargebee Customer id :${customerId} & subscriptionId : ${subscriptionId}`
    );
    return {
      // ["custom.cf_e0YKEqWB1aiUJjg92ivepd74KPR4WkMsWYYxEN83mRE"]
      chargebeeCustomerUrl: `https://trendgramio.chargebee.com/d/customers/${customerId}`,
      chargebeeSubscriptionUrl: `https://trendgramio.chargebee.com/d/subscriptions/${subscriptionId}`,
    };
  }

  private buildLeadProperties(
    lead: Partial<ExportCustomer>,
    subscriptionId: string
  ) {
    this.logger.info(`Build lead proprties`);
    return {
      name: `${lead?.["First Name"] || ""} ${lead?.["Last Name"] || ""}`.trim(),
      ["custom.cf_LW2uzcBGpGsL6WaHLYSOnJviCGN8To1iUVqStif2iHJ"]:
        lead?.["Customer Id"] ?? undefined,
      ["custom.cf_OWKKcLali72gGxBrUcCLxr9R86h4Bqsb3jFezyoSFV3"]:
        this.buildUrl(lead["Customer Id"], subscriptionId)
          .chargebeeCustomerUrl ?? undefined, // customer url in custom property
      ["custom.cf_e0YKEqWB1aiUJjg92ivepd74KPR4WkMsWYYxEN83mRE"]:
        this.buildUrl(lead["Customer Id"], subscriptionId)
          .chargebeeSubscriptionUrl ?? undefined, // subscription url
    };
  }

  private planMapping: Record<string, string> = {
    "basic-discount-1-USD-Monthly": "basic-discount-1-monthly",
    "basic-discount-2-USD-Monthly": "basic-discount-2-monthly",
    "basic-discount-2-USD-Weekly": "basic-discount-2-weekly",
    "basic-monthly-USD-Monthly": "basic-monthly",
    "basic-yearly-USD-Yearly": "basic-yearly",
    "pro-discount-1-USD-Monthly": "pro-discount-1-monthly",
    "pro-discount-2-USD-Monthly": "pro-discount-2-monthly",
    "pro-discount-2-USD-Weekly": "pro-discount-2-weekly",
    "pro-monthly-USD-Monthly": "pro-monthly",
    "pro-yearly-USD-Yearly": "pro-yearly",
    "turbo-discount-1-USD-Monthly": "turbo-discount-1-monthly",
    "turbo-discount-2-USD-Monthly": "turbo-discount-2-monthly",
    "turbo-discount-2-USD-Weekly": "turbo-discount-2-weekly",
    "turbo-monthly-USD-Monthly": "turbo-monthly",
    "turbo-yearly-USD-Yearly": "turbo-yearly",
  };

  private getMappedPlan(externalPlan: string | undefined): string | null {
    if (!externalPlan) return null;

    // Direct mapping if available
    if (this.planMapping[externalPlan]) return this.planMapping[externalPlan];

    // Fallback: Remove "-USD" and normalize
    return externalPlan.replace(/-USD/g, "").replace(/\s+/g, "-").toLowerCase();
  }

  public buildContactProperties(
    leadId: string,
    contact: Partial<ExportCustomer>,
    subscription: ChargebeeSubscription
  ) {
    this.logger.info(`Building contact properties for lead: ${leadId}`);

    // Extract plan and map it
    const rawPlan = subscription?.subscription_items?.[0]?.item_price_id;
    const mappedPlan = this.getMappedPlan(rawPlan);

    const payload: Record<string, any> = {
      lead_id: leadId,
      name: `${contact?.["First Name"] || ""} ${contact?.["Last Name"] || ""}`.trim(),
      emails: contact?.Email ? [{ email: contact.Email, type: "other" }] : [],

      [`custom.${CloseCrmContactCustomFiled.CustomerID}`]:
        contact?.["Customer Id"] ?? null,
      [`custom.${CloseCrmContactCustomFiled.InstagramID}`]:
        contact?.sub_ins_id ?? null,
      [`custom.${CloseCrmContactCustomFiled.Plan}`]: mappedPlan ?? null,
      [`custom.${CloseCrmContactCustomFiled.InstagramURL}`]: contact?.sub_ins_id
        ? `https://www.instagram.com/${contact.sub_ins_id}`
        : null,
      [`custom.${CloseCrmContactCustomFiled.ChargebeeURL}`]: contact?.[
        "Customer Id"
      ]
        ? `https://trendgramio.chargebee.com/d/customers/${contact["Customer Id"]}`
        : null,
      [`custom.${CloseCrmContactCustomFiled.NextBillingON}`]:
        subscription?.next_billing_at
          ? formatDate(subscription.next_billing_at)
          : null,
      [`custom.${CloseCrmContactCustomFiled.TrialEndsOn}`]:
        subscription?.trial_end ? formatDate(subscription.trial_end) : null,
      [`custom.${CloseCrmContactCustomFiled.SubscriptionStatus}`]:
        mapSubscriptionStatus(subscription?.status) ?? null,
    };

    // Remove null or empty values
    Object.keys(payload).forEach((key) => {
      if (
        payload[key] === null ||
        (Array.isArray(payload[key]) && payload[key].length === 0)
      ) {
        delete payload[key];
      }
    });

    return payload;
  }

  private async handleIfLeadExist(
    customerId: string,
    cutomer?: Partial<ExportCustomer>
  ) {
    this.logger.info(
      `Handle lead Process search by chargeebeCustomer id : ${customerId}`
    );
    await new Promise((resolve) => setTimeout(resolve, 10000));
    const lead = await closeCRMService.searchCloseCRM(
      CloseCrmObject.Lead,
      true,
      CloseCrmLeadCustomField["Customer ID"],
      customerId ?? cutomer?.["Customer Id"],
      true
    );
    const subScriptionDeta =
      await chargebeeService.getSubscriptionsByCustomerId(
        customerId ?? cutomer?.["Customer Id"]
      );
    const subScriptionId = subScriptionDeta?.list?.[0]?.subscription?.id;
    const leadProperties = this.buildLeadProperties(cutomer, subScriptionId);
    const existleadId = lead?.data?.[0]?.id;
    if (!existleadId) {
      this.logger.info(`Create a lead`);
      const lead = await closeCRMService.createLead(
        leadProperties,
        customerId ?? cutomer?.["Customer Id"]
      );
      if (lead) return lead;
    }
    const updatedLead = await closeCRMService.updateLeadById(
      existleadId,
      leadProperties,
      customerId ?? cutomer?.["Customer Id"]
    );
    if (updatedLead) return updatedLead;
  }

  private async handleIfContactExist(
    contactInfo: Partial<ExportCustomer>,
    leadId: string
  ) {
    this.logger.info(
      `Handle Customer id:${contactInfo["Customer Id"]} , Lead Id : ${leadId}`
    );
    await new Promise((resolve) => setTimeout(resolve, 10000));
    const contact = await closeCRMService.searchCloseCRM(
      CloseCrmObject.Contact,
      true,
      CloseCrmContactCustomFiled.CustomerID,
      contactInfo?.["Customer Id"],
      true
    );
    const subScriptionDeta =
      await chargebeeService.getSubscriptionsByCustomerId(
        contactInfo?.["Customer Id"]
      );
    const existContactId = contact?.data?.[0]?.id;
    const contactProp = this.buildContactProperties(
      leadId,
      contactInfo,
      subScriptionDeta?.list[0]?.subscription
    );
    if (!existContactId) {
      this.logger.info(`Create new Contact`);
      const newContact = await closeCRMService.createContact(
        contactProp,
        contactInfo?.["Customer Id"]
      );
      if (newContact?.id) {
        this.logger.info(
          `Sucessfully created a new Contact with id : ${newContact?.id}`
        );
        return newContact;
      }
    }
  }

  public async checkAssociateContacts(contactInfo: Partial<ExportCustomer>) {
    await new Promise((resolve) => setTimeout(resolve, 10000));
    const response = await closeCRMService.searchCloseCRM(
      CloseCrmObject.Contact,
      true,
      CloseCrmContactCustomFiled.CustomerID,
      contactInfo?.["Customer Id"],
      true
    );

    if (!response?.data?.length) {
      this.logger.info(
        `No associated with lead contact found for Customer ID: ${contactInfo?.["Customer Id"]}`
      );
      return null;
    }

    const contactId = response.data[0]?.id;
    return contactId ? await closeCRMService.getContactById(contactId) : null;
  }

  public async processMigration(data: Partial<ExportCustomer>) {
    this.logger.info(
      `Starting migration for Customer ID: ${data["Customer Id"]}`
    );

    // Step 1: Check if Contact Exists
    await new Promise((resolve) => setTimeout(resolve, 10000));
    const contactResponse = await closeCRMService.searchCloseCRM(
      CloseCrmObject.Contact,
      true,
      CloseCrmContactCustomFiled.CustomerID,
      data?.["Customer Id"],
      true
    );

    const existingContact = contactResponse?.data?.[0];
    let leadId = existingContact?.["lead_id"];

    // Step 2: Get Subscription Details
    const subscriptionData =
      await chargebeeService.getSubscriptionsByCustomerId(
        data?.["Customer Id"]
      );
    const subscriptionId = subscriptionData?.list?.[0]?.subscription?.id;

    // Step 3: Build Lead Properties
    const leadProperties = this.buildLeadProperties(data, subscriptionId);

    if (existingContact) {
      this.logger.info(
        `Contact found: ${existingContact.id}, Lead ID: ${leadId}`
      );

      if (!leadId) {
        this.logger.info(
          `Contact exists but has no associated lead. Creating lead.`
        );
        const newLead = await closeCRMService.createLead(
          leadProperties,
          data["Customer Id"]
        );
        if (!newLead?.id) {
          this.logger.error(
            `Failed to create lead for Customer ID: ${data["Customer Id"]}`
          );
          return;
        }
        leadId = newLead.id;

        // Update contact with newly created lead ID
        await closeCRMService.updateContactById(
          existingContact.id,
          { lead_id: leadId },
          data["Customer Id"]
        );
      } else {
        this.logger.info(`Updating existing lead: ${leadId}`);
        await closeCRMService.updateLeadById(
          leadId,
          leadProperties,
          data["Customer Id"]
        );
      }

      // Step 4: Update Contact
      const contactProps = this.buildContactProperties(
        leadId,
        data,
        subscriptionData?.list?.[0]?.subscription
      );
      await closeCRMService.updateContactById(
        existingContact.id,
        contactProps,
        data["Customer Id"]
      );

      this.logger.info(
        `Successfully updated lead (${leadId}) and contact (${existingContact.id})`
      );
      return;
    }

    // // Step 5: If No Contact Exists, Create Lead & Contact
    // this.logger.info(
    //   `No existing contact found. Creating new lead and contact.`
    // );
    // const newLead = await closeCRMService.createLead(
    //   leadProperties,
    //   data["Customer Id"]
    // );
    // if (!newLead?.id) {
    //   this.logger.error(
    //     `Failed to create lead for Customer ID: ${data["Customer Id"]}`
    //   );
    //   return;
    // }

    // const newContact = await this.handleIfContactExist(data, newLead.id);
    // if (newContact?.id) {
    //   this.logger.info(
    //     `Successfully created lead (${newLead.id}) and contact (${newContact.id})`
    //   );
    // }
  }
}

const migrationService = new MigrationService();
export default migrationService;
