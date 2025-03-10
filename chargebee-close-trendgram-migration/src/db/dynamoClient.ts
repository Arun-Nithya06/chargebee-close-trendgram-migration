import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

class DynamoClient {
  private static instance: DynamoDBDocumentClient;

  private constructor() {}

  static getInstance(): DynamoDBDocumentClient {
    if (!DynamoClient.instance) {
      const client = new DynamoDBClient({
        region: "us-east-1",
        credentials: {
          accessKeyId: process.env.CHARGEBEE_AWS_ACCESS_KEY ?? "",
          secretAccessKey: process.env.CHARGEBEE_AWS_SECRET_KEY ?? "",
        },
      });
      DynamoClient.instance = DynamoDBDocumentClient.from(client);
    }
    return DynamoClient.instance;
  }
}

export default DynamoClient;
