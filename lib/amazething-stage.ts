import { Construct } from "constructs";
import { envTag } from './common/helpers';
import { AmazethingStack } from './amazething-stack';
import { Stage, StageProps } from 'aws-cdk-lib';

export class AmazethingStage extends Stage {

  constructor(scope: Construct, id: string, isProduction: boolean, props?: StageProps) {
    super(scope, id, props);
    new AmazethingStack(this, envTag(AmazethingStack.name), isProduction);
  }
}
