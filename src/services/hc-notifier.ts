
import { HCContext } from "../model/hc-context";

export interface HCNotifier {

  notify(context: HCContext): void;

}
