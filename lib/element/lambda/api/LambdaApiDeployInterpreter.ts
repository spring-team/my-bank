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
    Goal,
    goals,
    SdmContext,
} from "@atomist/sdm";
import {
    Interpretation,
    Interpreter,
    ProjectAnalyzer,
} from "@atomist/sdm-pack-analysis";
import {
    AwsCredentialsResolver,
    isDeployedFunctionByName,
} from "../support/lambdaPrimitives";
import { lambdaApiDeployGoal } from "./lambdaApiDeployGoal";
import { LambdaApiStack } from "./LambdaApiStack";

/**
 * Does deployment only
 */
export class LambdaApiDeployInterpreter implements Interpreter {

    private deployGoal: Goal;

    public setAnalyzer(analyzer: ProjectAnalyzer): void {
        // We need the analyzer to create this
        this.deployGoal = lambdaApiDeployGoal(this.credResolver, analyzer);
    }

    public async enrich(interpretation: Interpretation, sdmContext: SdmContext): Promise<boolean> {
        const lambdaStack = interpretation.reason.analysis.elements.lambda as LambdaApiStack;
        if (!lambdaStack || lambdaStack.kind !== "api") {
            return false;
        }

        const deployed = isDeployedFunctionByName(await this.credResolver(sdmContext), lambdaStack.persisted.FunctionName);

        if (!deployed) {
            return false;
        }

        if (!interpretation.deployGoals) {
            interpretation.deployGoals = goals("deploy").plan(this.deployGoal);
        }
        return true;
    }

    public paths: string[] = [];

    constructor(private readonly credResolver: AwsCredentialsResolver) {
    }
}
