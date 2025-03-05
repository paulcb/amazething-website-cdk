#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { AmazethingWebsiteCdkStack } from '../lib/amazething-website-cdk-stack';

const app = new cdk.App();
new AmazethingWebsiteCdkStack(app, 'AmazethingWebsiteCdkStack', {
  env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },
});