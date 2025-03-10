import { PutCommand } from "@aws-sdk/lib-dynamodb";
import { v4 as uuidv4 } from "uuid";
import DynamoClient from "./dynamoClient";
import { Logger } from "@aws-lambda-powertools/logger";

const LOGS_TABLE = "chargebee-close-trendgram-migration-logs";

interface LogData {
  customerId: string; // Primary Key (PK)
  operation: string;
  timestamp: string;
  successData?: string;
  errorMessage?: string;
  errorStack?: string | null;
  metadata?: string;
}

class LoggerService {
  private dbClient = DynamoClient.getInstance();
  logger = new Logger({ serviceName: LoggerService.name });

  /**
   * Logs a successful operation to DynamoDB.
   */
  async logSuccess(
    customerId: string,
    operation: string,
    data: object
  ): Promise<void> {
    /* The line `this.logger.info(`Log Seccess :  data : ${JSON.stringify(data)}`);` is
  logging a message using the `info` method of the logger instance. It is creating a log message
  indicating a successful operation with the operation name and the data associated with that
  operation. The `operation` variable is interpolated into the log message, and the `data` object is
  stringified using `JSON.stringify()` before being included in the log message. */
    this.logger.info(
      `Log Seccess : ${operation} data : ${JSON.stringify(data)} and Customer Id : ${customerId}`
    );
    try {
      const params = {
        TableName: LOGS_TABLE,
        Item: {
          customerId: customerId, // Primary Key (PK)
          operation: operation,
          timestamp: new Date().toISOString(),
          successData: JSON.stringify(data),
        } as LogData,
      };

      await this.dbClient.send(new PutCommand(params));
    } catch (e) {
      this.logger.info(`Failed db save error : ${JSON.stringify(e)}`);
    }
  }

  /**
   * Logs an error to DynamoDB.
   */
  async logError(
    customerId: string,
    operation: string,
    error: unknown,
    metadata: object = {}
  ): Promise<void> {
    try {
      this.logger.info(
        `Log Failed : ${operation} data : ${JSON.stringify(metadata)}`
      );
      const params = {
        TableName: LOGS_TABLE,
        Item: {
          customerId: customerId, // Primary Key (PK)
          operation: operation,
          timestamp: new Date().toISOString(),
          errorMessage: error instanceof Error ? error.message : String(error),
          errorStack: error instanceof Error ? error.stack : null,
          metadata: JSON.stringify(metadata),
        } as LogData,
      };

      await this.dbClient.send(new PutCommand(params));
    } catch (e) {
      this.logger.info(`Failed to store failure data :${JSON.stringify(e)}`);
    }
  }
}
const loggerService = new LoggerService();
export default loggerService;
