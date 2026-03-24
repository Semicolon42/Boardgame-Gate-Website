#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib/core';
import { GateStaticWebsiteS3Stack } from '../lib/gate-static-website-s3-stack';

const app = new cdk.App();
new GateStaticWebsiteS3Stack(app, 'GateStaticWebsiteS3', {
  env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },
});
