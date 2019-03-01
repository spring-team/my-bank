import { TechnologyElement } from "@atomist/sdm-pack-analysis";

import { Environment, FunctionName, Handler, Runtime } from "aws-sdk/clients/lambda";

export interface FunctionInfo {
    name: FunctionName;
    runtime: Runtime;
    handler: Handler;
    environment?: Environment;
}

/**
 * Superinterface for Lambda stack variants.
 */
export interface LambdaStack extends TechnologyElement {

    name: "lambda";

    kind: string;

    functions: FunctionInfo[];

}
