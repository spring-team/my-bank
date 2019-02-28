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
    SdmContext,
} from "@atomist/sdm";
import {
    Interpretation,
    Interpreter, ProjectAnalyzer,
} from "@atomist/sdm-pack-analysis";
import * as _ from "lodash";
import { LambdaStack } from "../LambdaStack";
import {
    lambdaAliasGoal,
    StagedDeployment,
} from "../support/lambdaAliasGoal";
import { AwsCredentialsResolver } from "../support/lambdaPrimitives";

/**
 * Adds promotion goals to an existing deployment
 */
export class LambdaPromotionInterpreter implements Interpreter {

    private promotionGoals: Goal[];

    public setAnalyzer(analyzer: ProjectAnalyzer): void {
        // We need the analyzer to create this
        this.promotionGoals =
            this.stages.map(alias => {
                return lambdaAliasGoal(this.credResolver, alias, analyzer);
            });
    }

    public async enrich(interpretation: Interpretation, sdmContext: SdmContext): Promise<boolean> {
        const lambdaStack = interpretation.reason.analysis.elements.lambda as LambdaStack;
        if (!lambdaStack) {
            return false;
        }

        // Add promotion to interpretation if we find a deploy goal
        if (interpretation.deployGoals) {
            let lastGoal = _.last(interpretation.deployGoals.goals);
            for (const promotionGoal of this.promotionGoals) {
                interpretation.deployGoals.plan(promotionGoal).after(lastGoal);
                lastGoal = promotionGoal;
            }
        }
        return true;
    }

    public paths: string[] = [];

    constructor(private readonly credResolver: AwsCredentialsResolver,
                public readonly stages: StagedDeployment[] = [{
            alias: "staging", approvalRequired: true,
        }, {
            alias: "production", approvalRequired: false,
        }],
    ) {
    }
}
