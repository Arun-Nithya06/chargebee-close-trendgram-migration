import { handlerPath } from "@libs/handler-resolver";
import { AWSFunction } from "@libs/lambda";

export const chargeebeeHandler = {
  handler: `${handlerPath(__dirname)}/chargeebee.handler`,
  timeout: 900,
  events: [
    {
      http: {
        method: "post",
        path: "chargebee-close-sync",
      },
    },
  ],
} as AWSFunction;

export const closeWorker = {
  handler: `${handlerPath(__dirname)}/worker.closeWorker`,
  timeout: 900,
  events: [
    {
      sqs: {
        arn: {
          "Fn::GetAtt": ["chargebeeCloseMigrationSQS", "Arn"],
        },
        batchSize: 1,
      },
    },
  ],
} as AWSFunction;
