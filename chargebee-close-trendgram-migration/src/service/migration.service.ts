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

  private buildContactProperties(
    leadId: string,
    contact: Partial<ExportCustomer>,
    subscription: ChargebeeSubscription
  ) {
    this.logger.info(`Contact properties : ${leadId}`);

    const plan = subscription?.subscription_items?.[0]?.item_price_id
      ? subscription.subscription_items[0].item_price_id.replace(/-USD.*/, "")
      : undefined;

    const payload: Record<string, any> = {
      lead_id: leadId,
      name: `${contact?.["First Name"] || ""} ${contact?.["Last Name"] || ""}`.trim(),
      emails: contact?.Email
        ? [
            {
              email: contact.Email,
              type: "other",
            },
          ]
        : [], // Removes empty email objects

      [`custom.${CloseCrmContactCustomFiled.CustomerID}`]:
        contact?.["Customer Id"] ?? null,
      [`custom.${CloseCrmContactCustomFiled.InstagramID}`]:
        contact?.sub_ins_id ?? null,
      [`custom.${CloseCrmContactCustomFiled.Plan}`]:
        plan === "0" ? "0-USD-Plan" : (plan ?? null),
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

    // Remove keys with `null` values
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
    const updataedContact = await closeCRMService.updateContactById(
      existContactId,
      contactProp,
      contactInfo?.["Customer Id"]
    );
    if (!updataedContact?.id) {
      this.logger.info(`Failed to contact update`);
      return;
    }
    this.logger.info(
      `SucessFully update a contact id : ${updataedContact?.id}`
    );
    return updataedContact;
  }

  public async migrationProceess(data: Partial<ExportCustomer>) {
    this.logger.info(
      `Migration process start chargeebee to close crm: ${new Date()}`
    );

    const lead = await this.handleIfLeadExist(data["Customer Id"], data);
    if (!lead.id) {
      this.logger.info(
        `Skip the contact create and update process chargeebe Customer id : ${data?.["Customer Id"]}`
      );
      return;
    }
    const contact = await this.handleIfContactExist(data, lead?.id);
    if (contact?.id) {
      this.logger.info(
        `Sucesss fully lead and contact synced closeCrm contact id : ${contact?.id} & chargebee customer id : ${data?.["Customer Id"]}`
      );
    }
    return contact;
  }
}

const migrationService = new MigrationService();
export default migrationService;
