import { CodePipeline, CodePipelineSource, ShellStep } from 'aws-cdk-lib/pipelines';
import { Construct } from 'constructs';

import { envTag } from './common/helpers';
import { AmazethingStage } from './amazething-stage';
import { SecretValue, Stack, StackProps } from 'aws-cdk-lib';

// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class AmazethingPipelineStack extends Stack {
  constructor(scope: Construct, id: string, isProduction: boolean, props?: StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here

    // example resource
    // const queue = new sqs.Queue(this, 'CdkPipelineTestQueue', {
    //   visibilityTimeout: cdk.Duration.seconds(300)
    // });

    const pipeline = new CodePipeline(this, envTag(CodePipeline.name), {
      synth: new ShellStep(envTag(ShellStep.name), {
        input: CodePipelineSource.gitHub('paulcb/amazething-website-cdk', 'main', {
          authentication: SecretValue.secretsManager('github-token'),
        }),
        commands: [
          'cd website', 'npm ci', 'npm run build',
          'cd ../',
          'npm ci',
          'echo Building ...',
          'npm run build',
          'npx cdk synth']
      })
    });

    pipeline.addStage(new AmazethingStage(this, envTag(AmazethingStage.name), isProduction));
  }
}
