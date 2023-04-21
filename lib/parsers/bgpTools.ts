import { Parser, Query, QueryMetadata } from ".";

interface BgpToolsQuery {
	asn?: number[];
	prefix?: string[];
	counting?: boolean;
}

enum RowIndex {
	ASN = 0,
	PREFIX = 1,
	CIDR_NOTATION = 2,
	COUNTRY = 3,
	REGISTRY = 4,
	DATE = 5,
	ORGINIZATION = 6,
}

export class BgpToolsParser extends Parser {
	static fromQuery(query: BgpToolsQuery | BgpToolsQueryBuilder): Query {
		if (query instanceof BgpToolsQueryBuilder) query = query.query;

		return BgpToolsParser.parseQuery(query);
	}

	static parseQuery(obj: BgpToolsQuery) {
		return new BgpToolsParser().parseQuery(obj);
	}

	static parseQueryResult(input: Buffer, metadata: QueryMetadata) {
		return new BgpToolsParser().parseQueryResult(input, metadata);
	}

	constructor() {
		super();
	}

	parseQueryResult(input: Buffer, metadata: QueryMetadata) {
		let res = input.toString();

		let parsed = res.split("\r\n").map((i) => i.trim());

		let result: any = {};

		// Result will either be an array of 7 or 8 objects
		// 8 if counting is enabled, and 7 if not
		// ASN is defined by 2 white spaces after the first or second number
		for (let line of parsed) {
			let cols = line.split("|").map((i) => i.trim());

			if (cols.length !== 8 && cols.length !== 7) continue;

			let dataOffset = cols.length === 8 ? 1 : 0;

			result[
				cols[RowIndex.PREFIX + dataOffset] ||
					cols[RowIndex.ASN + dataOffset]
			] = {
				asn: cols[RowIndex.ASN + dataOffset],
				prefix: cols[RowIndex.PREFIX + dataOffset],
				cidrNotation: cols[RowIndex.CIDR_NOTATION + dataOffset],
				country: cols[RowIndex.COUNTRY + dataOffset],
				registry: cols[RowIndex.REGISTRY + dataOffset],
				date: cols[RowIndex.DATE + dataOffset],
				orginization: cols[RowIndex.ORGINIZATION + dataOffset],
			};
		}

		return result;
	}

	parseQuery(obj: BgpToolsQuery): Query {
		let query = `begin\n\r`;

		if (obj.counting) {
			query += "counting\r\n";
		}

		if (obj.asn) {
			let asns = obj.asn.map((i) => `as${i}`).join("\r\n");

			query += `${asns}\r\n`;
		}

		if (obj.prefix) {
			let prefixes = obj.prefix.map((i) => `${i}`).join("\r\n");

			query += `${prefixes}\r\n`;
		}

		query += `end\n\r`;

		return {
			data: Buffer.from(query),
			metadata: {},
		};
	}
}

export class BgpToolsQueryBuilder {
	query: BgpToolsQuery;

	static getAsn(asn: number) {
		return new BgpToolsQueryBuilder({ asn: [asn] });
	}

	static getPrefix(prefix: string) {
		return new BgpToolsQueryBuilder({ prefix: [prefix] });
	}

	constructor(query: BgpToolsQuery = {}) {
		this.query = query;
	}

	addAsn(asn: number | number[]) {
		if (!this.query.asn) this.query.asn = [];
		if (!Array.isArray(asn)) asn = [asn];

		this.query.asn.push(...asn);

		return this;
	}

	addPrefix(prefix: string | string[]) {
		if (!this.query.prefix) this.query.prefix = [];
		if (!Array.isArray(prefix)) prefix = [prefix];

		this.query.prefix.push(...prefix);

		return this;
	}

	enableCounting() {
		this.query.counting = true;

		return this;
	}

	finish() {
		return BgpToolsParser.fromQuery(this);
	}
}
