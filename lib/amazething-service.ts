import { Construct } from 'constructs';
import { NodejsFunction, NodejsFunctionProps } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Bucket, BlockPublicAccess, BucketAccessControl } from 'aws-cdk-lib/aws-s3';
import { AllowedMethods, Distribution, GeoRestriction, ViewerProtocolPolicy } from 'aws-cdk-lib/aws-cloudfront';

import { CfnOutput, Duration, RemovalPolicy, Stack } from 'aws-cdk-lib';
import { S3BucketOrigin } from 'aws-cdk-lib/aws-cloudfront-origins';
import { BucketDeployment, Source } from 'aws-cdk-lib/aws-s3-deployment';

import { Rule, Schedule } from 'aws-cdk-lib/aws-events';
import { LambdaFunction } from 'aws-cdk-lib/aws-events-targets';
import { Runtime } from 'aws-cdk-lib/aws-lambda';

import path = require('path');
import { envTag } from './common/helpers';

export class AMazeThingService extends Construct {
    constructor(scope: Construct, id: string, isProduction: boolean) {
        super(scope, id);

        //TODO: double check that stack name is append to all resources
        const stackName = Stack.of(this).stackName;
        const bucketName = envTag(`${stackName.toLowerCase()}-bucket`);

        const s3bucket = new Bucket(this, envTag(`${stackName}-Bucket`), {
            bucketName: bucketName,
            blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
            accessControl: BucketAccessControl.PRIVATE,
            enforceSSL: true,
            publicReadAccess: false,
            removalPolicy: isProduction
                ? RemovalPolicy.RETAIN
                : RemovalPolicy.DESTROY,
            versioned: isProduction,

        });

        //TODO: figure out SDK v2 warning from cdk deploy.
        const nodeJsFunctionProps: NodejsFunctionProps = {
            bundling: {
                externalModules: [
                    'aws-sdk', // Use the 'aws-sdk' available in the Lambda runtime
                ],
            },
            runtime: Runtime.NODEJS_18_X,
            timeout: Duration.minutes(3), // Default is 3 seconds
            memorySize: 256,
        };

        //TODO: create local link for maze.ts
        const writeS3ObjFn = new NodejsFunction(this, envTag(`${stackName}-${NodejsFunction.name}`), {
            entry: path.join('./lib/lambda', 's3WriteMazes.ts'),
            ...nodeJsFunctionProps,
            functionName: `${stackName.replace('-', '')}S3Write`,
            environment: {
                bucketName: s3bucket.bucketName,
            },
        });
        s3bucket.grantReadWrite(writeS3ObjFn);

        //TODO: clean bucket on redploy
        //TODO: remove bucket on destroy
        //TODO: make bucket sync with github repo?
        //TODO: check that permission are best practice for static website
        new BucketDeployment(this, envTag(`${stackName}-${BucketDeployment.name}`), {
            sources: [Source.asset('./website/dist')],
            destinationBucket: s3bucket,
            exclude: ["*_mazedata.json"], //don't delete lambda generated maze data
            // retainOnDelete: true,
            // prune: false
        });

        const distribution = new Distribution(this, envTag(`${stackName}-${Distribution.name}`), {
            defaultRootObject: 'index.html',
            defaultBehavior: {
                origin: S3BucketOrigin.withOriginAccessControl(s3bucket),
                compress: true,
                allowedMethods: AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
                viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
            },
            // geoRestriction: GeoRestriction.allowlist('US'),
        });

        //TODO: AWS logs show that schedule doesn't occur actually at 0:0:0. Check why.
        //TODO: Clear unused days
        const rule = new Rule(this, envTag(`${stackName}-${Rule.name}`), {
            schedule: Schedule.cron({ minute: '0', hour: '0' }),
        });

        rule.addTarget(new LambdaFunction(writeS3ObjFn));

        new CfnOutput(this, 'Distribution domain name', { value: distribution.domainName });

    }
}
