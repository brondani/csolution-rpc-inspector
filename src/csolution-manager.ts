import * as vscode from 'vscode';
// Transport layer: JSON-RPC 
import { CsolutionServiceImpl } from './json-rpc/csolution-rpc-client';
import { ComponentsTreeProvider } from './treeview';

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
        const start = new Date().getTime();
        await this.csolutionService.LoadPacks();
        console.log('Time elapsed for LoadPacks', new Date().getTime() - start);
    }

    public async LoadSolution(): Promise<void> {
        if (vscode.window.activeTextEditor) {
            const start = new Date().getTime();
            const solution = vscode.window.activeTextEditor.document.fileName;
            await this.csolutionService.LoadSolution({solution: solution});
            console.log('Time elapsed for LoadSolution', new Date().getTime() - start);
        }
    }

    public async GetComponentsInfo(context: string, treeDataProvider: ComponentsTreeProvider): Promise<void> {
        const start = new Date().getTime();
        const componentsInfo = await this.csolutionService.GetComponentsInfo({context: context});
        console.log('Time elapsed for GetComponentsInfo', new Date().getTime() - start);
        treeDataProvider.refresh(componentsInfo);
    }
}
