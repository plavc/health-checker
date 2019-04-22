
export class HCLogger {

    public static trace = false;

    static info(message?: any, force = false) {
        if (this.trace || force) console.info(message);
    }

    static error(message?: any, force = false) {
        if (this.trace || force) console.error(message);
    }
}