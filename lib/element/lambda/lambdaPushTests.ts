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
    predicatePushTest,
    PredicatePushTest,
} from "@atomist/sdm";
import * as yaml from "yamljs";
import { ATOMIST_LAMBDA_CONFIG_PATH } from "./api/atomistConfigLambdaScanner";
import { PersistedFunctionData } from "./support/lambdaPrimitives";

/**
 * Is this  a lambda persisted with Atomist config?
 * @type {PredicatePushTest}
 */
export const IsAtomistConfigLambda: PredicatePushTest =
    predicatePushTest("IsAtomistConfigLambda",
        async p => {
            const lambdaDeploy = await p.getFile(ATOMIST_LAMBDA_CONFIG_PATH);
            if (!!lambdaDeploy) {
                const persisted: PersistedFunctionData = yaml.parse(await lambdaDeploy.getContent());
                return !!persisted && !!persisted.FunctionName;
            }
            return false;
        });
