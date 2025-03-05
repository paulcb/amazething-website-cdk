#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { AmazethingWebsiteCdkStack } from '../lib/amazething-website-cdk-stack';

const app = new cdk.App();
console.log('CDK_DEFAULT_ACCOUNT', process.env.CDK_DEFAULT_ACCOUNT);
console.log('CDK_DEFAULT_REGION', process.env.CDK_DEFAULT_REGION);
new AmazethingWebsiteCdkStack(app, 'AmazethingWebsiteCdkStack', {

  env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },
});