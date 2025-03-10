import { Logger } from "@aws-lambda-powertools/logger";
import axios from "axios";
import { URLBuilder } from "src/helper/url.builder";
import { ChargebeeCusomerMetaInfo } from "src/interface/customer";
import { ChargebeeSubscriptionMetaData } from "src/interface/subscription";

class ChargebeeService {
  logger = new Logger({ serviceName: ChargebeeService.name });
  private readonly baseUrl: string;
  private readonly apiKey: string;

  constructor() {
    this.baseUrl = "https://trendgramio.chargebee.com/api/v2";
    this.apiKey = process.env.CHARGEBEE_API_KEY_PRD ?? "";
  }

  private getAuth() {
    this.logger.info(`Get Basic Auth`);
    return {
      auth: {
        username: process.env.CHARGEBEE_API_KEY || this.apiKey,
        password: "",
      },
    };
  }

  public async getCustomerById(customerId: string) {
    try {
      this.logger.info(`Get customer by id : ${customerId}`);
      const url = new URLBuilder(`${this.baseUrl}/customers/:customerId`)
        .setPathParams({ customerId })
        .build();
      const response = await axios.get(url, this.getAuth());
      return response?.data as ChargebeeCusomerMetaInfo;
    } catch (e) {
      this.logger.info(
        `Failed to customer by id : ${customerId} And error : ${JSON.stringify(e)}`
      );
      return;
    }
  }

  public async getSubscriptionsByCustomerId(customerId: string) {
    try {
      this.logger.info(`Get subscription by customerId : ${customerId}`);

      const url = new URLBuilder(`${this.baseUrl}/subscriptions`)
        .setQueryParams({ "customer_id[is]": customerId })
        .build();

      const response = await axios.get(url, this.getAuth());
      return response?.data as ChargebeeSubscriptionMetaData;
    } catch (e) {
      this.logger.error(
        `Failed to get subscriptions for customerId: ${customerId}, Error: ${JSON.stringify(e)}`
      );
      return;
    }
  }
}

const chargebeeService = new ChargebeeService();
export default chargebeeService;
