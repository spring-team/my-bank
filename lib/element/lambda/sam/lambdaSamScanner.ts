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

import { logger, Project } from "@atomist/automation-client";
import { TechnologyScanner } from "@atomist/sdm-pack-analysis";
import { LambdaSamStack } from "./LambdaSamStack";
import * as yaml from "yamljs";
import { FunctionInfo } from "../LambdaStack";

/**
 * Path to SAM template within repo
 */
const SamTemplatePath = "template.yml";

/**
 * Find Lambda data in SAM template file
 * @param {Project} p
 * @return {Promise<any>}
 */
export const lambdaSamScanner: TechnologyScanner<LambdaSamStack> = async p => {
    const samTemplateFile = await p.getFile(SamTemplatePath);
    if (!samTemplateFile) {
        return undefined;
    }

    const parsed = yaml.parse(await samTemplateFile.getContent());

    const functions: FunctionInfo[] = [];
    const resources = parsed.Resources;

    for (const name of Object.getOwnPropertyNames(resources)
        .filter((r: any) => r.Type === "AWS::Serverless::Function")) {
        const f = resources[name];
        functions.push({
            name,
            runtime: f.Runtime,
            handler: f.Handler,
        });
    }

    const stack: LambdaSamStack = {
        functions,
        name: "lambda",
        kind: "sam",
        tags: ["lambda", "aws", "aws-sam"],
        // TODO gather these
        referencedEnvironmentVariables: [],
    };

    logger.info("Found stack %j", stack);
    return stack;
};
