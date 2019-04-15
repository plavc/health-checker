
import { ServiceInfoReader } from "./service-info-reader";
import { HealthChecker } from "./health-checker";

class Startup {
    
    public static main() {

        const importer = new ServiceInfoReader();
        
        const context = importer.read(this.getYamlFileName());

        const healthChecker = new HealthChecker(context);

        healthChecker.check().then(() => {
            process.exitCode = context.healthy ? 0 : 1;
        });
    }

    private static getYamlFileName(): string {
        const args: string[] = process.argv.slice(2);
        if (args.length === 0) {
            throw new Error('Configuration file not provided.')
        }

        return args[0];
    }
}

Startup.main();