#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { AmazethingStack } from '../lib/amazething-stack';
import { AmazethingPipelineStack } from '../lib/amazething-pipeline-stack';
import { envTag } from '../lib/common/helpers';

const app = new cdk.App();
console.log('CDK_DEFAULT_ACCOUNT', process.env.CDK_DEFAULT_ACCOUNT);
console.log('CDK_DEFAULT_REGION', process.env.CDK_DEFAULT_REGION);

const isDev = process.env.CDK_APP_DEV;
let isProduction = null;
if (!isDev) isProduction = true;
else isProduction = false;

const env = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION
};

if (isProduction) {
  new AmazethingPipelineStack(app,
    envTag(AmazethingPipelineStack.name),
    isProduction,
    { env: env });

} else {
  new AmazethingStack(app,
    envTag(AmazethingStack.name),
    isProduction,
    { env: env });

}
