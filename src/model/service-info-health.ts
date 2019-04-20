
export class ServiceInfoHealth {
    constructor(
        public readonly healthy: boolean,
        public readonly status: number,
        public readonly response?: any,
        /**
         * first number - seconds
         * second number - nanoseconds
         */
        public readonly responseTime?: bigint
    ) { }

    get responseString() {
        console.log(this.response);
        if (this.response) {
            return JSON.stringify(this.response.data);
        }

        return undefined;
    }

    get responseTimeSeconds(): number {
        return this.responseTime ? Number(this.responseTime / BigInt(10e9)) : 0;
    }

    get responseTimeMillis(): number {
        return this.responseTime ? Number(this.responseTime / BigInt(10e6)) : 0;
    }

    get responseTimeNano(): number {
        return this.responseTime ? Number(this.responseTime) : 0;
    }
}