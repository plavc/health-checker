import { ServiceHealth } from "./service-health";

export class ServiceInfo {

    public state?: ServiceHealth;

    static fromObject(obj:any): ServiceInfo {
        return new ServiceInfo(obj.url, obj.method, obj.successStatus);
    }

    constructor(
        public url: string,
        public method: string,
        public successStatus: number,
        public timeout: number = 10000
    ) { }
}