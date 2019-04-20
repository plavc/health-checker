import { ServiceInfo } from "./model/service-info";

import axios from 'axios';

import { HCContext } from "./model/hc-context";
import { ServiceInfoHealth } from "./model/service-info-health";
import { Logger } from "./services/logger";
import { ServiceInfoReader } from "./services/service-info-reader";
import { HCVariablesProvider } from "./services/hc-variables-provider";
import { HCReport } from "./model/hc-report";

export class HealthChecker {

    static load(fileName: string) {
        const importer = new ServiceInfoReader();
        const context = importer.read(fileName);
        return new HealthChecker(context);
    }

    private varProvider: HCVariablesProvider;

    constructor(public readonly context: HCContext) {
        this.varProvider = new HCVariablesProvider(context.config);
     }

    public async check(): Promise<HCContext> {

        Logger.info('Start checking services (' + this.context.config.servicesCount + ').\n');

        let requests: Array<Promise<any>> = [];

        this.context.config.services.forEach(serviceInfo => {
            requests.push(this.checkService(serviceInfo));
        });

        await Promise.all(requests);

        this.prepareReport(this.context);
        this.printReport(this.context.report);

        return this.context;
    }

    private prepareReport(context: HCContext) {
        let healthy = 0;
        let unhealthy = 0;

        context.config.services.forEach(serviceInfo => {
            if (serviceInfo.state && !serviceInfo.state.healthy) {
                unhealthy += 1;
            } else if (serviceInfo.state && serviceInfo.state.healthy) {
                healthy += 1;
            } else {
                unhealthy += 1;
            }
        });

        context.report.countAll = context.config.servicesCount;
        context.report.allHealthy = unhealthy === 0;
        context.report.countFailed = unhealthy;
        context.report.countSuccessful = healthy;
    }

    private printReport(report: HCReport) {
        Logger.info('');
        Logger.info('Services (' + report.countAll + ') have been checked.');
        if(report.allHealthy) {
            Logger.info('All services are healthy.', true);
        } else {
            Logger.info('Healthy services: ' + report.countSuccessful + '.', true);
            Logger.info('Unhealthy services: ' + report.countFailed + '.', true);
        }
    }

    public async checkService(serviceInfo: ServiceInfo): Promise<any> {

        serviceInfo.renderedUrl = this.varProvider.substitute(serviceInfo.url);

        const hrstart = process.hrtime.bigint();

        try {
            const response = await axios.request({
                method: serviceInfo.method,
                url: serviceInfo.renderedUrl,
                responseType: 'json',
                timeout: serviceInfo.timeout
            });

            this.updateState(serviceInfo, undefined, response, serviceInfo.renderedUrl, process.hrtime.bigint() - hrstart);

        } catch(e) {
            this.updateState(serviceInfo, e, e.response, serviceInfo.renderedUrl, process.hrtime.bigint() - hrstart);
        }
    }

    private updateState(serviceInfo: ServiceInfo, err: any, response: any, url: string, responseTime: bigint) {
        const res: any = response;
        serviceInfo.state = new ServiceInfoHealth(
            res ? (res.status === serviceInfo.successStatus) : false, 
            res ? res.status:undefined, 
            res,
            responseTime);
        
        if (err) {
            Logger.error(':( [' + serviceInfo.method +'] Exp: ' + serviceInfo.successStatus + ' | ' + url + ' ' + err.message);
        } else {
            Logger.info('OK [' + serviceInfo.method +'] Exp: ' + serviceInfo.successStatus + ' | ' + url);
        }
    }

}