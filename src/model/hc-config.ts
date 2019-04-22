import { ServiceInfo } from "./service-info";

export abstract class HCConfigNotify {
    public enabled: boolean = false;
    public healthy: boolean = false;
    public fullReport: boolean = false;
}

export class HCConfigSlack extends HCConfigNotify {
    public webhook?: string;
}

export class HCConfigMail extends HCConfigNotify {
    public sender?: string;
    public server: object | undefined;
    public recipients?: string[];
}

export class HCConfig {
    public globalTimeout = 10000;

    public slack = new HCConfigSlack();
    public mail = new HCConfigMail();

    public variables = new Map<string, string>();
    public services = new Array<ServiceInfo>();

    get servicesCount() {
        return this.services.length;
    }
}