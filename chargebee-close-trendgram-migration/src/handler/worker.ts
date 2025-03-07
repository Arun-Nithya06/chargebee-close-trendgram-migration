import { Logger } from "@aws-lambda-powertools/logger";
import { SQSEvent } from "aws-lambda";
import migrationService from "src/service/migration.service";
import sqsService from "src/sqs/sqs.service";

const logger = new Logger({ serviceName: "SQSWorker" });

const processMessage = async (
  parseData: any,
  receiptHandle?: string,
  queueUrl?: string
) => {
  const data = await migrationService.migrationProceess(parseData);
  await sqsService.deleteFromQueue(receiptHandle, queueUrl);
};
const worker = async (event: SQSEvent) => {
  logger.info(`SQS Process Start Lake land: ${new Date()}`);
  logger.info(`SQS recevied: `, JSON.stringify(event?.Records?.[0]?.body));
  try {
    const data = event?.Records?.[0]?.body;
    const queueUrl = process.env.CHARGEBEE_CLOSE_MIGRATION_SQS ?? "";
    // const data = event?.body;
    const parseData = JSON.parse(data);
    await processMessage(parseData, event?.Records[0]?.receiptHandle, queueUrl);
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Messages processed successfully.",
      }),
    };
  } catch (error) {
    logger.error(`Error on worker : ${error}`);

    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Error processing messages",
        error: error.message,
      }),
    };
  }
};

export const closeWorker = worker;
