
import { HCReport } from "./hc-report";
import { HCConfig } from "./hc-config";

export class HCContext {
    public report = new HCReport();

    constructor(public readonly config: HCConfig) { }

}