import type { AWS } from "@serverless/typescript";
import { chargeebeeHandler, closeWorker } from "src/handler/event";

const serverlessConfiguration: AWS = {
  service: "chargebee-close-trendgram-migration",
  frameworkVersion: "3",
  plugins: [
    "serverless-esbuild",
    "serverless-offline",
    "serverless-plugin-scripts",
  ],
  provider: {
    name: "aws",
    runtime: "nodejs16.x",
    profile: "chargebee-close-trendgram-migration",
    stage: "${opt:stage, 'dev'}", // Explicitly define stage
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    iamRoleStatements: [
      {
        Effect: "Allow",
        Action: ["lambda:InvokeFunction", "lambda:InvokeAsync"],
        Resource: [
          {
            "Fn::Sub":
              "arn:aws:lambda:${AWS::Region}:${AWS::AccountId}:function:chargebee-close-migration-${opt:stage, 'dev'}-handler",
          },
          {
            "Fn::Sub":
              "arn:aws:lambda:${AWS::Region}:${AWS::AccountId}:function:chargebee-close-migration-${opt:stage, 'dev'}-closeWorker",
          },
        ],
      },
      {
        Effect: "Allow",
        Action: [
          "sqs:ReceiveMessage",
          "sqs:SendMessage",
          "sqs:GetQueueAttributes",
        ],
        Resource: {
          "Fn::GetAtt": ["chargebeeCloseMigrationSQS", "Arn"],
        },
      },
      {
        Effect: "Allow",
        Action: [
          "ssm:GetParameter",
          "ssm:GetParameters",
          "ssm:GetParametersByPath",
        ],
        Resource: [
          {
            "Fn::Sub":
              "arn:aws:ssm:${AWS::Region}:${AWS::AccountId}:parameter/close_chargebee/*",
          },
        ],
      },
    ],
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: "1",
      NODE_OPTIONS: "--enable-source-maps --stack-trace-limit=1000",

      // Chargebee Credentials
      CHARGEBEE_AWS_ACCESS_KEY: "${ssm:/close_chargebee/aws_access_key}",
      CHARGEBEE_AWS_SECRET_KEY: "${ssm:/close_chargebee/aws_secret_key}",
      CHARGEBEE_AWS_ACCOUNT_ID: "${ssm:/close_chargebee/aws_account_id}",

      CHARGEBEE_API_KEY_DEV: "${ssm:/close_chargebee/dev/chargebee_api_key}",
      CHARGEBEE_BASIC_CRED_DEV:
        "${ssm:/close_chargebee/dev/chargebee_basic_cred}",
      CLOSE_API_KEY_DEV: "${ssm:/close_chargebee/dev/close_api_key}",
      WEBHOOK_SIGN_KEY_DEV: "${ssm:/close_chargebee/dev/webhook_sign_key}",

      CHARGEBEE_API_KEY_PRD: "${ssm:/close_chargebee/prd/chargebee_api_key}",
      CHARGEBEE_BASIC_CRED_PRD:
        "${ssm:/close_chargebee/prd/chargebee_basic_cred}",
      CLOSE_API_KEY_PRD: "${ssm:/close_chargebee/prd/close_api_key}",
      WEBHOOK_SIGN_KEY_PRD: "${ssm:/close_chargebee/prd/webhook_sign_key}",

      ENABLE_LOGGER: "${ssm:/close_chargebee/enable_logger}",
      CHARGEBEE_CLOSE_MIGRATION_SQS: {
        Ref: "chargebeeCloseMigrationSQS",
      },
    },
  },
  resources: {
    Resources: {
      chargebeeCloseMigrationSQS: {
        Type: "AWS::SQS::Queue",
        Properties: {
          QueueName: "${opt:stage, 'dev'}-chargebee-close-migration.fifo",
          FifoQueue: true,
          VisibilityTimeout: 910,
          MessageRetentionPeriod: 345600,
        },
      },
    },
  },
  // Import the function via paths
  functions: { chargeebeeHandler, closeWorker },
  package: { individually: true },
  custom: {
    esbuild: {
      bundle: true,
      minify: false,
      sourcemap: true,
      exclude: ["aws-sdk"],
      target: "node14",
      define: { "require.resolve": undefined },
      platform: "node",
      concurrency: 10,
    },
  },
};

module.exports = serverlessConfiguration;
