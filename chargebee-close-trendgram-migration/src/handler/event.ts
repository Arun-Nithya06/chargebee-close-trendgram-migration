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
  handler: `${handlerPath(__dirname)}/worker.closeworker`,
  timeout: 900,
  events: [
    {
      // http: {
      //   method: 'post',
      //   path: 'lakeranch-worker',
      // },
      sqs: {
        arn: {
          "Fn::GetAtt": ["chargebeeCloseMigrationSQS", "Arn"],
        },
        batchSize: 1,
      },
    },
  ],
} as AWSFunction;
