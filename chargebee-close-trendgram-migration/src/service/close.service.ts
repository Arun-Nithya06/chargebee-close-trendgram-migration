import { Logger } from "@aws-lambda-powertools/logger";
import axios from "axios";
import { URLBuilder } from "src/helper/url.builder";
import { CreateContact } from "src/interface/contact";
import { CloseCustomerInfo } from "src/interface/customer";
import { CloseCrmLead } from "src/interface/lead";
import { SearchMetaData } from "src/interface/search";
import { searchBuilder } from "src/utils/builder";

class CloseCRMService {
  logger = new Logger({ serviceName: CloseCRMService.name });
  private readonly baseUrl: string;
  private readonly apiKey: string;

  constructor() {
    this.baseUrl = "https://api.close.com/api/v1";
    this.apiKey =
      process.env.CLOSE_CRM_API_KEY ||
      "api_3fJ1n6GZKs63K7PEYMHDFe.0ra3jX9lCVAWZvD5UXsR8e"; // Securely store API key
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
      const response = await axios.get(url, {
        headers: this.getAuthHeaders(),
      });

      return response.data as CloseCustomerInfo;
    } catch (e) {
      this.logger.error(
        `Failed to fetch contact by ID: ${contactId}, error: ${JSON.stringify(e)}`
      );
      return null;
    }
  }

  public async updateContactById(
    contactId: string,
    updateData: Record<string, any>
  ) {
    try {
      this.logger.info(`Updating Contact ID: ${contactId}`);
      this.logger.info(`Update data is : ${JSON.stringify(updateData)}`);
      const url = new URLBuilder(
        `${this.baseUrl}/contact/${contactId}`
      ).build();
      const response = await axios.put(url, updateData, {
        headers: this.getAuthHeaders(),
      });
      return response.data as CloseCustomerInfo;
    } catch (e) {
      this.logger.error(
        `Failed to update contact ${contactId}: ${JSON.stringify(e)}`
      );
      return null;
    }
  }

  public async searchCloseCRM(
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

      console.log(JSON.stringify(payload), "payload");

      const response = await axios.post(url, payload, {
        headers: this.getAuthHeaders(),
      });
      return response.data as SearchMetaData;
    } catch (error) {
      this.logger.error(`Close CRM search failed: ${JSON.stringify(error)}`);
      return null;
    }
  }

  public async createContact(contactData: Record<string, any>) {
    try {
      this.logger.info(
        `Creating new contact with data: ${JSON.stringify(contactData)}`
      );
      const url = new URLBuilder(`${this.baseUrl}/contact`).build();
      const response = await axios.post(url, contactData, {
        headers: this.getAuthHeaders(),
      });
      return response.data as CreateContact;
    } catch (e) {
      this.logger.error(`Failed to create contact: ${JSON.stringify(e)}`);
      return null;
    }
  }

  public async createLead(leadData: Record<string, any>) {
    try {
      this.logger.info(
        `Creating new lead with data: ${JSON.stringify(leadData)}`
      );

      const url = new URLBuilder(`${this.baseUrl}/lead`).build();
      const response = await axios.post(url, leadData, {
        headers: this.getAuthHeaders(),
      });

      return response.data as CloseCrmLead;
    } catch (e) {
      this.logger.error(`Failed to create lead: ${JSON.stringify(e)}`);
      return null;
    }
  }

  public async updateLeadById(leadId: string, updateData: Record<string, any>) {
    try {
      this.logger.info(`Updating Lead ID: ${leadId}`);
      this.logger.info(`Update data is: ${JSON.stringify(updateData)}`);

      const url = new URLBuilder(`${this.baseUrl}/lead/${leadId}`).build();
      const response = await axios.put(url, updateData, {
        headers: this.getAuthHeaders(),
      });

      return response.data as CloseCrmLead;
    } catch (e) {
      this.logger.error(
        `Failed to update lead ${leadId}: ${JSON.stringify(e)}`
      );
      return null;
    }
  }
}

const closeCRMService = new CloseCRMService();
export default closeCRMService;
