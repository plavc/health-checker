import * as fs from 'fs';
import * as YAML from 'yaml';
import { HealthCheckerContext } from './health-checker-context';
import { ServiceInfo } from './service-info';

export class ServiceInfoReader {

    static supportedMethods = [ 'GET', 'POST', 'PATCH', 'PUT', 'HEAD', 'OPTIONS' ];

    public read(fileName: string): HealthCheckerContext {
        
        const file = fs.readFileSync(fileName, 'utf8')
        const obj = YAML.parse(file);

        const context = new HealthCheckerContext();
        if (obj.vars) {
            context.variables = new Map(Object.entries(obj.vars));
        }

        if (obj.config) {
            if (obj.config.timeout) {
                context.defaultTimeout = obj.config.timeout;
            }
        }

        if (obj.services) {
            this.parseServices2(obj, context);
        }

        return context;
    }

    private parseServices(obj: any, context: HealthCheckerContext) {
        const rawServices: any[] = obj.services;
        rawServices.forEach((element: any) => {
            context.services.push(this.parseServiceInfo(element, context.defaultTimeout));
        });
    }

    private parseServiceInfo(raw: any, defaultTimeout: number): ServiceInfo {
        
        const objProperties = Object.keys(raw);

        if (objProperties.length !== 1) {
            throw new Error('Invalid Service Info: ' + raw);
        }

        const method = ServiceInfoReader.supportedMethods.find(item => item.toUpperCase() === objProperties[0]);

        if (method === undefined || method === null) {
            throw new Error('Invalid HTTP method: ' + method);
        }

        let timeout = raw[method].timeout ? raw[method].timeout : defaultTimeout;

        return new ServiceInfo(raw[method].url, method, raw[method].successCode, timeout);
    }

    private parseServices2(obj: any, context: HealthCheckerContext) {
        const serviceNames: string[] = Object.keys(obj.services);

        serviceNames.forEach((element: any) => {
            context.services.push(this.parseServiceInfo2(obj.services[element], context.defaultTimeout));
        });
    }

    private parseServiceInfo2(raw: any, defaultTimeout: number): ServiceInfo {
        
        const method = ServiceInfoReader.supportedMethods.find(item => item.toUpperCase() === raw.method) || 'GET';

        if (method === undefined || method === null) {
            throw new Error('Invalid HTTP method: ' + method);
        }

        const timeout = raw.timeout ? raw.timeout : defaultTimeout;
        const successCode = raw.successCode ? raw.successCode : 200;

        return new ServiceInfo(raw.url, method, successCode, timeout);
    }
}