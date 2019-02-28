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
import { LambdaSamStack } from "./LambdaSamStack";

/**
 * Find Lambda data in Atomist lambda file
 * @param {Project} p
 * @return {Promise<any>}
 */
export const lambdaSamScanner: TechnologyScanner<LambdaSamStack> = async p => {
    const samTemplateFile = await p.getFile("template.yml");
    if (!samTemplateFile) {
        return undefined;
    }

    // TODO parse it with YAML parser

    const stack: LambdaSamStack = {
        // TODO this is wrong
        // projectName: p.id.repo,
        functionName: p.id.repo,
        name: "lambda",
        kind: "sam",
        tags: ["lambda", "aws", "aws-sam"],
        // TODO gather these
        referencedEnvironmentVariables: [],
    };
    return stack;
};
