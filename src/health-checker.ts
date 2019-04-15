import { ServiceInfo } from "./service-info";

import axios from 'axios';
import * as http from 'http';
import * as https from 'https';

import { HealthCheckerContext } from "./health-checker-context";
import { ServiceHealth } from "./service-health";
import { Logger } from "./logger";

export class HealthChecker {

    constructor(public readonly context: HealthCheckerContext) { }

    public async check(): Promise<any> {

        Logger.info('Start checking services (' + this.context.services.length + ').\n');

        let requests: Array<Promise<any>> = [];

        this.context.services.forEach(serviceInfo => {
            requests.push(this.checkService(serviceInfo));
        });

        await Promise.all(requests);

        let healthy = 0;
        let unhealthy = 0;

        this.context.services.forEach(serviceInfo => {
            if (serviceInfo.state && !serviceInfo.state.healthy) {
                unhealthy += 1;
            } else if (serviceInfo.state && serviceInfo.state.healthy) {
                healthy += 1;
            } else {
                unhealthy += 1;
            }
        });

        this.context.healthy = unhealthy === 0;

        Logger.info('');
        Logger.info('Services (' + this.context.services.length + ') have been checked.');
        if(unhealthy === 0) {
            Logger.info('All services are healthy');
        } else {
            Logger.info('Healthy services: ' + healthy);
            Logger.info('Unhealthy services: ' + unhealthy);
        }
    }

    public async checkService(serviceInfo: ServiceInfo): Promise<any> {

        const url = this.normalizeUrl(serviceInfo.url);

        try {
            const response = await axios.request({
                method: serviceInfo.method,
                url: url,
                responseType: 'json',
                timeout: serviceInfo.timeout,
                httpAgent: new http.Agent({ keepAlive: false, timeout: 1000 }),
                httpsAgent: new https.Agent({ keepAlive: false })
            });

            this.updateState(serviceInfo, undefined, response, url);

        } catch(e) {
            this.updateState(serviceInfo, e, e.response, url);
        }
    }

    private normalizeUrl(rawUrl: string): string {

        this.context.variables.forEach((val, key) => {
            rawUrl = rawUrl.replace('${' + key + '}', val);
        });

        return rawUrl;
    }

    private updateState(serviceInfo: ServiceInfo, err: any, response: any, url: string) {
        const res: any = response;
        serviceInfo.state = new ServiceHealth(
            res ? (res.status === serviceInfo.successStatus) : false, 
            res ? res.status:undefined, 
            res);
        
            if (err) {
                Logger.error(':( [' + serviceInfo.method +'] Exp: ' + serviceInfo.successStatus + ' | ' + url + ' ' + err.message);
            } else {
                Logger.info('OK [' + serviceInfo.method +'] Exp: ' + serviceInfo.successStatus + ' | ' + url);
            }
    }
}