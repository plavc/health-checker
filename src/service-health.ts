
export class ServiceHealth {
    constructor(
        public readonly healthy: boolean,
        public readonly status: number,
        public readonly response?: any
    ) { }
}