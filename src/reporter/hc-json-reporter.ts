import { HCContext } from '../model/hc-context';

import * as fs from "fs";

export class HCJsonReporter {

    constructor() {
    }

    public render(context: HCContext,  outFileName: string) {

        const result = {
            healthy: context.report.allHealthy,
            timestamp: context.report.timestamp,
            healthyServices: context.report.countSuccessful,
            unhealthyServices: context.report.countFailed,
            checkedServices: context.report.countAll,
            services: new Array<any>()
        }

        context.config.services.forEach(service => {
            result.services.push({
                name: service.name,
                method: service.method,
                url: service.renderedUrl,
                healthy: service.state? service.state.healthy : false,
                time: service.state? service.state.responseTimeNano : -1,
                responseStatus: service.state? service.state.status : status,
                expectedStatus: service.successStatus
            });
        })

        this.saveReport(outFileName, result);
    }

    private saveReport(fileName: string, content: any) {
        fs.writeFileSync(fileName, JSON.stringify(content, null, 2));
    }
}