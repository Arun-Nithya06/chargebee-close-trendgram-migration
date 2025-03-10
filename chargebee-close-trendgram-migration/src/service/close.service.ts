import { Logger } from "@aws-lambda-powertools/logger";
import axios from "axios";
import { URLBuilder } from "src/helper/url.builder";
import { CreateContact } from "src/interface/contact";
import { CloseCustomerInfo } from "src/interface/customer";
import { CloseCrmLead } from "src/interface/lead";
import { SearchMetaData } from "src/interface/search";
import { searchBuilder } from "src/utils/builder";
import { OperationType } from "./constant";
import loggerService from "src/db/logger";

class CloseCRMService {
  logger = new Logger({ serviceName: CloseCRMService.name });
  private readonly baseUrl: string;
  private readonly apiKey: string;

  constructor() {
    this.baseUrl = "https://api.close.com/api/v1";
    this.apiKey = process.env.CLOSE_API_KEY_PRD;
  }

  private getAuthHeaders() {
    return {
      Authorization: `Basic ${Buffer.from(`${this.apiKey}:`).toString("base64")}`,
      "Content-Type": "application/json",
    };
  }

  async getContactById(contactId: string) {
    try {
      this.logger.info(`Fetching Contact by ID: ${contactId}`);
      const url = new URLBuilder(
        `${this.baseUrl}/contact/${contactId}`
      ).build();
      const response = await axios.get(url, { headers: this.getAuthHeaders() });

      await loggerService.logSuccess(
        contactId,
        OperationType.CONTACT_CREATED,
        response.data
      );

      return response.data as CloseCustomerInfo;
    } catch (error) {
      await loggerService.logError(OperationType.CONTACT_CREATED, error, {
        contactId,
      });
      return null;
    }
  }

  async updateContactById(
    contactId: string,
    updateData: Record<string, any>,
    chargebeeCustomerId: string
  ) {
    try {
      this.logger.info(`Updating Contact ID: ${contactId}`);
      const url = new URLBuilder(
        `${this.baseUrl}/contact/${contactId}`
      ).build();
      const response = await axios.put(url, updateData, {
        headers: this.getAuthHeaders(),
      });

      await loggerService.logSuccess(
        chargebeeCustomerId,
        OperationType.CONTACT_UPDATE,
        {
          contactId,
          updateData,
        }
      );

      return response.data as CloseCustomerInfo;
    } catch (error) {
      await loggerService.logError(
        chargebeeCustomerId,
        OperationType.CONTACT_UPDATE,
        error,
        {
          contactId,
          updateData,
        }
      );
      return null;
    }
  }

  async searchCloseCRM(
    objectType: string,
    isCustomField: boolean,
    fieldInternalName: string,
    searchValue: string,
    exactMatch: boolean = true
  ) {
    try {
      this.logger.info(
        `Searching ${objectType} with ${fieldInternalName}: ${searchValue}`
      );
      const url = new URLBuilder(`${this.baseUrl}/data/search/`).build();
      const payload = searchBuilder(
        objectType,
        isCustomField,
        fieldInternalName,
        searchValue,
        exactMatch
      );

      const response = await axios.post(url, payload, {
        headers: this.getAuthHeaders(),
      });

      await loggerService.logSuccess(searchValue, OperationType.SEARCH, {
        objectType,
        searchValue,
      });

      return response.data as SearchMetaData;
    } catch (error) {
      await loggerService.logError(searchValue, OperationType.SEARCH, error, {
        objectType,
        searchValue,
      });
      return null;
    }
  }

  async createContact(contactData: Record<string, any>, customerId: string) {
    try {
      this.logger.info(
        `Creating new contact with data: ${JSON.stringify(contactData)}`
      );
      const url = new URLBuilder(`${this.baseUrl}/contact`).build();
      const response = await axios.post(url, contactData, {
        headers: this.getAuthHeaders(),
      });

      await loggerService.logSuccess(
        customerId,
        OperationType.CONTACT_CREATED,
        contactData
      );

      return response.data as CreateContact;
    } catch (error) {
      await loggerService.logError(
        customerId,
        OperationType.CONTACT_CREATED,
        error,
        {
          contactData,
        }
      );
      return null;
    }
  }

  async createLead(leadData: Record<string, any>, customerId: string) {
    try {
      this.logger.info(
        `Creating new lead with data: ${JSON.stringify(leadData)}`
      );
      const url = new URLBuilder(`${this.baseUrl}/lead`).build();
      const response = await axios.post(url, leadData, {
        headers: this.getAuthHeaders(),
      });

      await loggerService.logSuccess(
        customerId,
        OperationType.LEAD_CREATED,
        leadData
      );

      return response.data as CloseCrmLead;
    } catch (error) {
      await loggerService.logError(OperationType.LEAD_CREATED, error, {
        leadData,
      });
      return null;
    }
  }

  async updateLeadById(
    leadId: string,
    updateData: Record<string, any>,
    customerId: string
  ) {
    try {
      this.logger.info(`Updating Lead ID: ${leadId}`);
      const url = new URLBuilder(`${this.baseUrl}/lead/${leadId}`).build();
      const response = await axios.put(url, updateData, {
        headers: this.getAuthHeaders(),
      });

      await loggerService.logSuccess(customerId, OperationType.LEAD_UPADATE, {
        leadId,
        updateData,
      });

      return response.data as CloseCrmLead;
    } catch (error) {
      await loggerService.logError(
        customerId,
        OperationType.LEAD_UPADATE,
        error,
        {
          leadId,
          updateData,
        }
      );
      return null;
    }
  }
}

const closeCRMService = new CloseCRMService();
export default closeCRMService;
