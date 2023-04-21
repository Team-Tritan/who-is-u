import net, { Socket } from "net";
import { EventEmitter } from "stream";
import { Parser } from "./parsers";

interface QueryClientOptions {
	host: string;
	port?: number;
	connectTimeout?: number;
	queryTimeout?: number;
	parser: Parser;
}

export default class QueryClient extends EventEmitter {
	private _socket?: Socket;
	private _queryTimeoutTimer?: NodeJS.Timeout;
	private _buffer: Buffer = Buffer.alloc(0);
	private _parser: Parser;

	port: number;
	host: string;

	queryTimeout: number;
	connectTimeout: number;

	isConnected: boolean = false;
	isQuerying: boolean = false;

	constructor({
		port = 43,
		host,
		connectTimeout = 5000,
		queryTimeout = 60000,
		parser,
	}: QueryClientOptions) {
		super();

		this.port = port;
		this.host = host;
		this.connectTimeout = connectTimeout;
		this.queryTimeout = queryTimeout;
		this._parser = parser;
	}

	private _startQueryTimeout() {
		this._queryTimeoutTimer = setTimeout(() => {
			this._socket?.destroy();
			this.emit(
				"error",
				new Error(`Query timeout after ${this.queryTimeout}`)
			);
		}, this.queryTimeout);
	}

	async query(query: string | Buffer): Promise<any> {
		return new Promise<any>((resolve, reject) => {
			if (!this._socket)
				return reject(new Error("Not connected to server"));

			if (this.isQuerying)
				return reject(
					new Error(
						"Already querying, if you must query multiple times, use a new client instance"
					)
				);

			this.isQuerying = true;

			this._socket?.write(query, (err) => {
				if (err) return reject(err);
			});

			// Start query timeout
			this._startQueryTimeout();

			// Resolve once we have a result :3
			this.once("result", (res) => {
				resolve(res);
			});
		});
	}

	async connect(): Promise<void> {
		return new Promise((resolve, reject) => {
			this.once("connected", resolve);
			this.once("error", reject);

			this._socket = net.createConnection({
				port: this.port,
				host: this.host,
				timeout: this.connectTimeout,
			});

			// Bind handlers nd stuff :3
			this._socket.on("connect", this._onconnect.bind(this));
			this._socket.on("error", this._onerror.bind(this));
			this._socket.on("data", this._ondata.bind(this));
			this._socket.on("end", this._onend.bind(this));
			this._socket.on("ready", this._onready.bind(this));
		});
	}

	private _onready() {
		console.log("ready");
	}

	private async _onend() {
		let res = await this._parser
			.parseQueryResult(this._buffer, {});

		if (this._queryTimeoutTimer) clearTimeout(this._queryTimeoutTimer);

		this.emit("result", res);
	}

	private _ondata(buffer: Buffer) {
		this._buffer = Buffer.concat([this._buffer, buffer]);
	}

	private _onconnect() {
		this.isConnected = true;
		this.emit("connected");
	}

	private _onerror(err: Error) {
		this.emit("error", err);
		console.error(err);
	}
}
