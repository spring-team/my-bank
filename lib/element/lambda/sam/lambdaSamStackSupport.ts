import { StackSupport } from "@atomist/sdm-pack-analysis";
import { lambdaSamScanner } from "./lambdaSamScanner";
import { LambdaSamDeployInterpreter } from "./LambdaSamDeployInterpreter";
import { AwsCredentialsResolver } from "../support/lambdaPrimitives";
import { LambdaPromotionInterpreter } from "../support/LambdaPromotionInterpreter";

export function lambdaSamStackSupport(credResolver: AwsCredentialsResolver): StackSupport {
    return {
        scanners: [lambdaSamScanner],
        interpreters: [
            new LambdaSamDeployInterpreter(credResolver),
            new LambdaPromotionInterpreter(credResolver),
        ],

        // TODO make one
        transformRecipeContributors: [],
    };
}
