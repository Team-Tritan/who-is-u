import QueryClient from "./client";
import { Parser, Query } from "./parsers";
import { Serivce } from "./services";
import { BgpToolsService } from "./services/bgpTools";

export default class WhoisClient {
	// For in use clients
	private _clients: Record<string, QueryClient> = {};

    // List of services registered
	private _services: Record<string, Serivce> = {};

	constructor() {}

	registerService(service: Serivce) {
		this._services[service.host] = service;
	}

	async query<T>(query: Query) {
        let serivces = Object.values(this._services);

        return Promise.all(serivces.map(async (service) => {
            let client = new QueryClient({
                host: service.host,
                port: service.port,
                parser: service.parser,
            });

            await client.connect();

            return await client.query(query.data);
        }));
	}
}
