import { Parser } from "../parsers";

export class Serivce {
	host: string;
	port: number;
	parser: Parser;

	constructor(host: string, port: number, parser: Parser) {
		this.host = host;
		this.port = port;
		this.parser = parser;
	}
}
