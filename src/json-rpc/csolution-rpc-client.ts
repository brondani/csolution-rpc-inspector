import { ChildProcess, spawn } from "node:child_process";
import { MessageConnection, ParameterStructures } from "vscode-jsonrpc";
import { createMessageConnection, StreamMessageReader, StreamMessageWriter } from "vscode-jsonrpc/node";

export interface ISolution {
    'solution': string
};

export interface IContext {
    'context': string
};

export interface IValidateComponents {
    'context': string
    'components': string[]
};

export interface IPack {
    'id': string;
    'description'?: string;
    'overview'?: string;
    'used'?: boolean;
    'references'?: string[];
}

export interface IPacksInfo {
    'packs': IPack[];
}

export interface IComponent {
    'id': string;
    'from-pack': string;
    'description'?: string;
    'doc'?: string;
    'implements'?: string;
    'selected'?: boolean;
    'instances'?: number;
    'maxInstances'?: number;
}

export interface IApi {
    'id': string;
    'description'?: string;
    'doc'?: string;
}

export interface ITaxonomy {
    'id': string;
    'description'?: string;
    'doc'?: string;
}

export interface IBundle {
    'id': string;
    'description'?: string;
    'doc'?: string;
}

export interface IComponentsInfo {
    'components': IComponent[];
    'taxonomy': ITaxonomy[];
    'apis': IApi[];
    'bundles': IBundle[];
}

export interface ICondition {
    'expression': string;
    'aggregates'?: string[];
}

export interface IResult {
    'result': string;
    'id': string;
    'aggregates'?: string[];
    'conditions'?: ICondition[];
}

export interface IResults {
    'validation'?: IResult[];
}

export interface ILogMessages {
    'info'?: string[];
    'errors'?: string[];
    'warnings'?: string[];
}

export interface CsolutionService {
    Shutdown(): Promise<void>;
    GetVersion(): Promise<string>;
    LoadPacks(): Promise<void>;
    LoadSolution(args: ISolution): Promise<void>;
    GetPacksInfo(args: IContext): Promise<IPacksInfo>;
    GetComponentsInfo(args: IContext): Promise<IComponentsInfo>;
    ValidateComponents(args: IValidateComponents): Promise<IResults>;
    GetLogMessages(): Promise<ILogMessages>;
}

export class CsolutionServiceImpl implements CsolutionService {

    // private members and functions for client handling ---------------------------------
    private child: ChildProcess|undefined;
    private connection: MessageConnection|undefined;
    private cwd: string;

    constructor(cwd: string) {
        this.cwd = cwd;
    }

    private async transceive<TResponse>
        (method: string, params?: ParameterStructures | any, ...rest: any[]):
        Promise<TResponse|undefined> {
        if (!this.child && !this.launch()) {
            return undefined;
        }
        console.log('csolution rpc request:', method);
        const response = params ?
            await this.connection?.sendRequest<TResponse>(method, params) :
            await this.connection?.sendRequest<TResponse>(method);
        console.log('csolution rpc response:', response);
        return response;
    }

    private launch(): Boolean {
        this.child = spawn('csolution', ['rpc', '--content-length'], // use --debug to log json raw messages
            { cwd: this.cwd }
        );
        if (!this.child || !this.child.pid || !this.child.stdout || !this.child.stdin) {
            console.error(`csolution rpc launch failed`);
            return false;
        }
        console.warn(`csolution rpc started`);

        // Use stdin and stdout for communication
        this.connection = createMessageConnection(
            new StreamMessageReader(this.child.stdout),
            new StreamMessageWriter(this.child.stdin)
        );

        // Listen for child process close event
        this.child.on('close', () => {
            console.warn(`csolution rpc child process closed`);
            this.child = undefined;
        });

        // Listen for rpc connection errors
        this.connection?.onError((error) => {
            console.error('csolution rpc connection error:', error);
        });

        // Start listening
        this.connection?.listen();
        return true;
    }

    // public functions implementing csolution services ---------------------------------
    public async Shutdown(): Promise<void> {
        await this.transceive<Boolean>('Shutdown');
    }

    public async GetVersion(): Promise<string> {
        type VersionResponse = string;
        const response = await this.transceive<VersionResponse>('GetVersion');
        return response ?? "<unknown>";
    }

    public async LoadPacks(): Promise<void> {
        await this.transceive<Boolean>('LoadPacks');
    }

    public async LoadSolution(args: ISolution): Promise<void> {
        await this.transceive<Boolean>('LoadSolution', args);
    }

    public async GetPacksInfo(args: IContext): Promise<IPacksInfo> {
        const response = await this.transceive<IPacksInfo>('GetPacksInfo', args);
        return (response ?? {}) as IPacksInfo;
    }

    public async GetComponentsInfo(args: IContext): Promise<IComponentsInfo> {
        const response = await this.transceive<IComponentsInfo>('GetComponentsInfo', args);
        return (response ?? {}) as IComponentsInfo;
    }

    public async ValidateComponents(args: IValidateComponents): Promise<IResults> {
        const results = await this.transceive<IResults>('ValidateComponents', args);
        return (results ?? {}) as IResults;
    }

    public async GetLogMessages(): Promise<ILogMessages> {
        const messages = await this.transceive<ILogMessages>('GetLogMessages');
        return (messages ?? {}) as ILogMessages;
    }
}
