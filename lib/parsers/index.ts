export interface QueryMetadata {
	[key: string]: string;
}

export interface Query {
    data: Buffer;
    metadata: QueryMetadata;
}

export class Parser {
	constructor() {}

	parseQueryResult(input: Buffer, meta: QueryMetadata): any {
		throw new Error("Custom parser class must override parseQueryResult method");
	}

	parseQuery(obj: any): Query {
		throw new Error("Custom parser class must override parseQuery method");
	}
}
