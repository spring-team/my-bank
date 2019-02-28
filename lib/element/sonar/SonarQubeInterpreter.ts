import { CodeInspectionRegisteringInterpreter, Interpretation } from "@atomist/sdm-pack-analysis";
import { AutoInspectRegistration, SdmContext } from "@atomist/sdm";
import { sonarQubeReviewer, SonarQubeSupportOptions } from "./sonarQubeReviewer";
import { configurationValue } from "@atomist/automation-client";

export class SonarQubeInterpreter implements CodeInspectionRegisteringInterpreter {

    private readonly options: SonarQubeSupportOptions;

    public readonly codeInspections: Array<AutoInspectRegistration<any, any>>;

    public async enrich(interpretation: Interpretation, sdmContext: SdmContext): Promise<boolean> {
        // We always return true
        interpretation.inspections.push(...this.codeInspections);
        return true;
    }

    constructor() {
        this.options = configurationValue("sdm.sonar");
        this.codeInspections = [sonarQubeReviewer(this.options)];
    }
}
