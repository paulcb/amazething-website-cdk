import { CodeBuildStep, CodePipeline, CodePipelineSource, ShellStep } from 'aws-cdk-lib/pipelines';
import { BuildSpec, LinuxBuildImage } from 'aws-cdk-lib/aws-codebuild';

import { Construct } from 'constructs';

import { envTag } from '@local/shared';
import { AmazethingStage } from './amazething-stage';
import { SecretValue, Stack, StackProps } from 'aws-cdk-lib';
// import { codebuild } from 'cdk-nag/lib/rules';

// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class AmazethingPipelineStack extends Stack {
  constructor(scope: Construct, id: string, isProduction: boolean, props?: StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here

    // example resource
    // const queue = new sqs.Queue(this, 'CdkPipelineTestQueue', {
    //   visibilityTimeout: cdk.Duration.seconds(300)
    // });

    const pipeline = new CodePipeline(this, 'Pipeline', {
      synth: new ShellStep('Synth', {
        input: CodePipelineSource.gitHub('paulcb/amazething-website-cdk', 'mono-repo-refactor', {
          authentication: SecretValue.secretsManager('github-token'),
        }),
        installCommands: [
          'npm ci'
        ],
        commands: [
          'npm run build --workspace=packages/shared',
          'npm run build --workspace=packages/cdk-app',
          'npm run build --workspace=packages/web-app',
          'cd packages/cdk-app && npx cdk synth'],
        // buildEnvironment: {
        //   buildImage: LinuxBuildImage.STANDARD_7_0,
        // },
        // partialBuildSpec: BuildSpec.fromObject({
        //   version: '0.2',
        //   phases: {
        //     install: {
        //       'runtime-versions': { nodejs: '24' },
        //     },
        //   },
        // }),
        primaryOutputDirectory: 'packages/cdk-app/cdk.out',
      }),
      codeBuildDefaults: {
        buildEnvironment: {
          buildImage: LinuxBuildImage.STANDARD_7_0,
        },
      },

    });


    pipeline.addStage(new AmazethingStage(this, envTag(AmazethingStage.name), isProduction));
  }
}
