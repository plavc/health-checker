import { ServiceInfoHealth } from "./service-info-health";

export class ServiceInfo {

    public name?: string;
    public state?: ServiceInfoHealth;
    public renderedUrl?: string;

    constructor(
        public url: string,
        public method: string,
        public successStatus: number,
        public timeout: number = 10000
    ) { }
}