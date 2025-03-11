import { middyfy } from "@libs/lambda";
import { Logger } from "@aws-lambda-powertools/logger";
import { APIGatewayEvent } from "aws-lambda";
import CustomerData from "../data/customers.json"; // Import JSON
import { ExportCustomer } from "src/interface/customer";
import migrationService from "src/service/migration.service";

const logger = new Logger({ serviceName: "chargebeeHandler" });

const chargebeeHandler = async (event: APIGatewayEvent) => {
  logger.info(`Chargebee process started: ${new Date().toISOString()}`);

  try {
    const customers = CustomerData["customers"] as ExportCustomer[];
    logger.info(`Total customers: ${customers.length}`);
    const body =
      typeof event.body === "string" ? event.body : JSON.stringify(event.body); // Ensure it's a string
    const parseData = JSON.parse(body);
    await migrationService.pushedDataSQS(
      parseData.start,
      parseData.end,
      customers
    );
    return {
      statusCode: 200,
      body: JSON.stringify({ start: parseData.start, end: parseData.end }),
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
