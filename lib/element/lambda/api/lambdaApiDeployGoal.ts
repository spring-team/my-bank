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
import {
    AwsCredentialsResolver,
    updateFunctionCode,
} from "../support/lambdaPrimitives";

/**
 * Deploy using Lambda API without a SAM build
 * @param {AwsCredentialsResolver} credResolver
 * @param {ProjectAnalyzer} analyzer
 * @return {Goal}
 */
export function lambdaApiDeployGoal(credResolver: AwsCredentialsResolver,
                                    analyzer: ProjectAnalyzer): Goal {
    return goal({
        displayName: "deployLambda",
    }, async gi => {
        return gi.configuration.sdm.projectLoader.doWithProject({
            id: gi.id,
            credentials: gi.credentials,
            readOnly: true,
        }, async p => {
            const update = await updateFunctionCode(await credResolver(gi), p, analyzer, gi);
            await gi.addressChannels("Update: " + JSON.stringify(update));
        });
    });
}
