import { ServiceInfo } from "./service-info";

export class HCConfig {
    public globalTimeout: number = 10000;
    public variables = new Map<string, string>();
    public services = new Array<ServiceInfo>();

    get servicesCount() {
        return this.services.length;
    }
}