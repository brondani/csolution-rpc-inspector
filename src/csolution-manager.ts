import * as vscode from 'vscode';
// Transport layer: JSON-RPC 
import { CsolutionServiceImpl } from './json-rpc/csolution-rpc-client';
// Transport layer: protobuf
//import { CsolutionServiceImpl } from './protobuf/cproto-service';


export class CsolutionManager {

    private csolutionService = new CsolutionServiceImpl();

    public async GetVersion(): Promise<void> {
        const version = await this.csolutionService.GetVersion();
        vscode.window.showInformationMessage(`csolution rpc: GetVersion: ${version}`);
    }

    public async Shutdown(): Promise<void> {
        await this.csolutionService.Shutdown();
        vscode.window.showInformationMessage(`csolution rpc: Shutdown`);
    }

    public async LoadPacks(): Promise<void> {
        await this.csolutionService.LoadPacks();
        vscode.window.showInformationMessage(`csolution rpc: LoadPacks`);
    }

    public async LoadSolution(): Promise<void> {
        if (vscode.window.activeTextEditor) {
            await this.csolutionService.LoadSolution(vscode.window.activeTextEditor.document.fileName);
        }
        vscode.window.showInformationMessage(`csolution rpc: LoadSolution`);
    }

    public async ListPacks(): Promise<void> {
        await this.csolutionService.ListPacks();
        vscode.window.showInformationMessage(`csolution rpc: ListPacks`);
    }

    public async ListComponents(): Promise<void> {
        const start = new Date().getTime();
        await this.csolutionService.ListComponents();
        console.log('Time elapsed for ListComponents', new Date().getTime() - start);
        vscode.window.showInformationMessage(`csolution rpc: ListComponents`);
    }
}
