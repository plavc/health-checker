import * as fs from 'fs';
import * as YAML from 'yaml';
import { HCContext } from '../model/hc-context';
import { ServiceInfo } from '../model/service-info';
import { HCConfig } from '../model/hc-config';

export class ServiceInfoReader {

    static supportedMethods = [ 'GET', 'POST', 'PATCH', 'PUT', 'HEAD', 'OPTIONS' ];

    public read(fileName: string): HCContext {
        
        const file = fs.readFileSync(fileName, 'utf8')
        const obj = YAML.parse(file);

        const config = new HCConfig();

        if (obj.vars) {
            config.variables = new Map(Object.entries(obj.vars));
        }

        if (obj.config) {
            if (obj.config.timeout) {
                config.globalTimeout = obj.config.timeout;
            }
        }

        if (obj.services) {
            this.parseServices(obj, config);
        }

        return new HCContext(config);
    }

    private parseServices(obj: any, config: HCConfig) {
        const serviceNames: string[] = Object.keys(obj.services);

        serviceNames.forEach((element: any) => {
            config.services.push(this.parseServiceInfo(obj.services[element], config.globalTimeout, element));
        });
    }

    private parseServiceInfo(raw: any, defaultTimeout: number, serviceName: string): ServiceInfo {
        
        const method = ServiceInfoReader.supportedMethods.find(item => item.toUpperCase() === raw.method) || 'GET';

        if (method === undefined || method === null) {
            throw new Error('Invalid HTTP method: ' + method);
        }

        const timeout = raw.timeout ? raw.timeout : defaultTimeout;
        const successCode = raw.successCode ? raw.successCode : 200;

        const info = new ServiceInfo(raw.url, method, successCode, timeout);
        info.name = serviceName;

        return info;
    }
}