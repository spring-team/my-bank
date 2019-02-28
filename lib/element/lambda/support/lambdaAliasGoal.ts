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

import {
    goal,
    Goal,
} from "@atomist/sdm";
import { ProjectAnalyzer } from "@atomist/sdm-pack-analysis";
import { LambdaStack } from "../LambdaStack";
import {
    AwsCredentialsResolver,
    createOrUpdateAlias,
    deployedFunctionInfo,
    publishVersion,
} from "./lambdaPrimitives";

export interface StagedDeployment {
    alias: string;

    /**
     * Whether to promote automatically
     */
    approvalRequired: boolean;
}

/**
 * Create an alias from $LATEST
 * @param {AwsCredentialsResolver} credResolver
 * @param {string} alias
 * @return {Goal}
 */
export function lambdaAliasGoal(credResolver: AwsCredentialsResolver,
                                stage: StagedDeployment,
                                analyzer: ProjectAnalyzer): Goal {
    return goal({
        displayName: `Promote to ${stage.alias}`,
        preApproval: stage.approvalRequired,
    }, async gi => {
        return gi.configuration.sdm.projectLoader.doWithProject({
            id: gi.id,
            credentials: gi.credentials,
            readOnly: true,
        }, async p => {
            const creds = await credResolver(gi);
            // Find it
            const interpretation = await analyzer.interpret(p, gi);
            const lambda = interpretation.reason.analysis.elements.lambda as LambdaStack;
            if (!lambda) {
                throw new Error(`Not a lambda project: ${p.id.url}`);
            }
            const info = await deployedFunctionInfo(creds, lambda.functionName);
            if (!info) {
                throw new Error(`Can't find deployment info for lambda project: ${p.id.url}`);
            }
            const version = await publishVersion(await credResolver(gi), { FunctionName: lambda.functionName });
            const aliased = await createOrUpdateAlias(creds, {
                FunctionName: lambda.functionName,
                FunctionVersion: version.Version,
                Name: stage.alias,
            });
            await gi.addressChannels(`Promoted to \`${stage.alias}\`` + JSON.stringify(aliased));
        });
    });
}
