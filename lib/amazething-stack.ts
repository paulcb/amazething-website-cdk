import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { AMazeThingService } from './amazething-service';
import { envTag } from './common/helpers';
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class AmazethingStack extends cdk.Stack {
  constructor(scope: Construct, id: string, isProduction: boolean, props?: cdk.StackProps) {
    super(scope, id, props);
    // The code that defines your stack goes here

    // example resource
    // const queue = new sqs.Queue(this, 'AmazethingWebsiteCdkQueue', {
    //   visibilityTimeout: cdk.Duration.seconds(300)
    // });

    new AMazeThingService(this, envTag(AMazeThingService.name), isProduction);
  }
}
