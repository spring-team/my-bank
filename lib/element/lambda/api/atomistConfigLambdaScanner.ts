/*
 * Copyright © 2019 Atomist, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Project } from "@atomist/automation-client";
import { TechnologyScanner } from "@atomist/sdm-pack-analysis";
import * as yaml from "yamljs";
import { PersistedFunctionData } from "../support/lambdaPrimitives";
import { LambdaApiStack } from "./LambdaApiStack";

export const ATOMIST_LAMBDA_CONFIG_PATH = "atomist-lambda.yml";

/**
 * Find Lambda data in Atomist lambda file
 * @param {Project} p
 * @return {Promise<any>}
 */
export const atomistConfigLambdaScanner: TechnologyScanner<LambdaApiStack> = async p => {
    const persisted = await parseLambda(p);
    if (!persisted) {
        return undefined;
    }

    const stack: LambdaApiStack = {
        kind: "api",
        // projectName: persisted.FunctionName,
        functionName: persisted.FunctionName,
        persisted,
        name: "lambda",
        tags: ["lambda", "aws"],
        deployedConfiguration: undefined,
        // TODO fix this
        referencedEnvironmentVariables: [],
    };
    return stack;
};

/**
 * Return lambda data if it's a lambda repo with Atomist info
 * @param {Project} p
 * @return {Promise<PersistedFunctionData | undefined>}
 */
async function parseLambda(p: Project): Promise<PersistedFunctionData | undefined> {
    const lambdaDeploy = await p.getFile(ATOMIST_LAMBDA_CONFIG_PATH);
    return !!lambdaDeploy ?
        yaml.parse(await lambdaDeploy.getContent()) :
        undefined;
}
