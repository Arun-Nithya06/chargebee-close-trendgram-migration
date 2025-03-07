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
    // const info = JSON.parse(event.body);
    // const start = info.start;
    // const end = info.end;
    const payload = {
      "Customer Id": "1nLgeV5UEKeKY47a",
      Email: "testtrial123@gmail.com",
      "First Name": "MR GEORDIE KORDAS",
      "Auto Collection": "On",
      "Offline payment method": "No Preference",
      "Card Status": "Valid",
      "Created At": "31-May-2024 16:47",
      sub_ins_id: "Testtrial",
      "Customer Portal Status": "Not Signed-up",
      "Net Term Days": "0",
      Taxability: "Taxable",
    };
    // await migrationService.pushedDataSQS(start, end, customers);
    const data = await migrationService.migrationProceess(payload);
    return {
      statusCode: 200,
      body: JSON.stringify({ totalCustomers: data as any }),
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
