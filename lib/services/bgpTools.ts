import { Serivce } from ".";
import { BgpToolsParser } from "../parsers/bgpTools";

export class BgpToolsService extends Serivce {
    constructor() {
        super("bgp.tools", 43, new BgpToolsParser());
    }
}