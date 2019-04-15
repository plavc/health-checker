import { ServiceInfo } from "./service-info";

export class HealthCheckerContext {

    public defaultTimeout: number = 10000;
    public healthy: boolean = false;

    public variables: Map<string, string> = new Map<string, string>();
    public services: Array<ServiceInfo> = new Array<ServiceInfo>();

}