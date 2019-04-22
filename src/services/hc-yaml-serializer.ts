import * as fs from 'fs';
import * as YAML from 'yaml';
import { HCContext } from '../model/hc-context';
import { ServiceInfo } from '../model/service-info';
import { HCConfig } from '../model/hc-config';

export class HCYamlSerializable {

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

            if (obj.config.slack) {
                config.slack.enabled = obj.config.slack.enabled;
                config.slack.healthy = obj.config.slack.healthy;
                config.slack.webhook = obj.config.slack.webhook;
                config.slack.fullReport = obj.config.slack.fullReport;
            }

            if (obj.config.mail) {
                config.mail.enabled = obj.config.mail.enabled;
                config.mail.healthy = obj.config.mail.healthy;
                config.mail.sender = obj.config.mail.sender;
                config.mail.server = obj.config.mail.server;
                config.mail.recipients = obj.config.mail.recipients;
                config.mail.fullReport = obj.config.mail.fullReport;
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
        
        const method = HCYamlSerializable.supportedMethods.find(item => item.toUpperCase() === raw.method) || 'GET';

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