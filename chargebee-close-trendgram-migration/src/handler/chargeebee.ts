import { middyfy } from "@libs/lambda";
import { Logger } from "@aws-lambda-powertools/logger";
import { APIGatewayEvent } from "aws-lambda";
import CustomerData from "../data/customers.json"; // Import JSON
import { Customer } from "src/interface/customer.chargebee";

const logger = new Logger({ serviceName: "chargebeeHandler" });

const chargebeeHandler = async (event: APIGatewayEvent) => {
  logger.info(`Chargebee process started: ${new Date().toISOString()}`);

  try {
    const customerCount = CustomerData["customers"] as Customer[];
    logger.info(`Total customers: ${customerCount.length}`);

    return {
      statusCode: 200,
      body: JSON.stringify({ totalCustomers: CustomerData as any }),
    };
  } catch (error) {
    logger.error("Error processing Chargebee data", { error });
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal Server Error" }),
    };
  }
};

export const handler = middyfy(chargebeeHandler);
