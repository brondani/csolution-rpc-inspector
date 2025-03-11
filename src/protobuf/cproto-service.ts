import * as vscode from 'vscode';
import { ChildProcess, spawn } from "node:child_process";
import { EventEmitter, once } from "events";
import { ID, GetVersionResponse, RequestEnvelope, ResponseEnvelope, ListComponentsResponse } from './cproto';

export interface CsolutionService {
    Shutdown(): Promise<void>;
    GetVersion(): Promise<string>;
    LoadPacks(): Promise<void>;
    LoadSolution(solution: string): Promise<void>;
    ListPacks(): Promise<string[]>;
    ListComponents(): Promise<string[]>;
}

export class CsolutionServiceImpl implements CsolutionService {

    public async Shutdown(): Promise<void> {
        const response = await this.transfer(ID.SHUTDOWN, undefined);
        if (!response?.status) {
            this.child?.kill();
        }
    }

    public async GetVersion(): Promise<string> {
        const response = await this.transfer(ID.GET_VERSION);
        return response ? GetVersionResponse.deserializeBinary(response.payload).version.toString() : "";
    }

    public async LoadPacks(): Promise<void> {
        await this.transfer(ID.LOAD_PACKS);
    }

    public async LoadSolution(solution: string): Promise<void> {
        await this.transfer(ID.LOAD_SOLUTION, Buffer.from(solution, 'utf-8'));
    }

    public async ListPacks(): Promise<string[]> {
        return [];
    }

    public async ListComponents(): Promise<string[]> {
        const response = await this.transfer(ID.LIST_COMPONENTS);
        return response ? ListComponentsResponse.deserializeBinary(response.payload).component : [];
    }

    // client private members and functions
    private child: ChildProcess|undefined;
    private emitter = new EventEmitter();
    private responseBuffer: Buffer|undefined;
    private expectedSize = 0;
    private receivedBytes = 0;

    private async transfer(id: ID, requestPayload?: Uint8Array|undefined): Promise<ResponseEnvelope|undefined> {
        if (this.sendRequest(id, requestPayload)) {
            const [response] = await once(this.emitter, 'response') as [ResponseEnvelope];
            if (response.status && response.id === id) {
                return response;
            } else {
                console.error(`csolution transfer failed => ${response.error}`);
            }
        }
        return undefined;
    }

    private sendRequest(id: ID, requestPayload: Uint8Array|undefined): Boolean {
        if (!this.child && !this.launch()) {
            return false;
        }
        const request = new RequestEnvelope();
        request.id = id;
        request.payload = requestPayload ?? request.payload;
        const serializedData = request.serializeBinary();
        const messageSize = Buffer.alloc(4);
        messageSize.writeUInt32LE(serializedData.length, 0);
        const requestBuffer = Buffer.concat([messageSize, Buffer.from(serializedData)]);
        this.child?.stdin?.write(requestBuffer);
        console.log(`csolution ipc sent:`, requestBuffer);
        return true;
    }

    private receiveResponse(buffer: Buffer): void {
        console.log(`csolution ipc received:`, buffer);
        if (!this.responseBuffer) {
            this.expectedSize = buffer.readUInt32LE(0);
            this.responseBuffer = Buffer.alloc(this.expectedSize);
            this.responseBuffer.set(buffer.subarray(4));
            this.receivedBytes = buffer.length - 4;
        } else {
            this.responseBuffer.set(buffer, this.receivedBytes);
            this.receivedBytes += buffer.length;
        }
        if (this.receivedBytes >= this.expectedSize ) {
            const response = ResponseEnvelope.deserializeBinary(this.responseBuffer);
            this.responseBuffer = undefined;
            this.receivedBytes = this.expectedSize = 0;
            this.emitter.emit('response', response);
        }
    }

    private launch(): Boolean {
        this.child = spawn('csolution', ['ipc']);
        console.warn(`csolution ipc started`);
        this.child.stdout?.on('data', (d) => {
            this.receiveResponse(Buffer.from(d, 'utf-8'));
        });
        this.child.on('close', () => {
            console.warn(`csolution ipc closed`);
            this.child = undefined;
        });
        if (!this.child || !this.child.pid) {
            console.error(`csolution ipc launch failed`);
            return false;
        }
        return true;
    }
}
