import Client from "../../lib/client";
import {
	BgpToolsParser,
	BgpToolsQueryBuilder,
} from "../../lib/parsers/bgpTools";
import { BgpToolsService } from "../../lib/services/bgpTools";
import WhoisClient from "../../lib/whoisClient";

// const query = new BgpToolsQueryBuilder();

// const client = new Client({
//     host: 'bgp.tools',
//     port: 43,
//     connectTimeout: 5000,
//     queryTimeout: 10000,
//     parser: new BgpToolsParser(),
// });

// client.connect().then(async () => {
//     let q = await query
// 	.addAsn(69)
// 	.addPrefix("23.142.248.1")
// 	.finish();

//     let res = await client.query(q.data);

//     console.log("blehh ", res);
// }).catch((err) => {
//     console.error(err);
// });

(async () => {
    let whois = new WhoisClient();

    whois.registerService(new BgpToolsService());
    
    let query = await whois.query(new BgpToolsQueryBuilder().addAsn(69).finish());

    console.log(query);
})();
