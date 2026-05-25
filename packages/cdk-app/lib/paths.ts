// packages/cdk-app/src/paths.ts
import * as path from 'path';

const repoRoot = path.resolve(__dirname, '../../..');

export const paths = {
  repoRoot,
  webdist: path.join(repoRoot, 'packages/web-app/dist'),
};