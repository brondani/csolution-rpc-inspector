import * as vscode from 'vscode';
import { CsolutionServiceImpl } from './json-rpc/csolution-rpc-client';
import { ComponentsTreeProvider } from './treeview';

const outputChannel = vscode.window.createOutputChannel("csolution-rpc");
const cwd = vscode.workspace.workspaceFolders ? vscode.workspace.workspaceFolders[0].uri.fsPath : './';

export class CsolutionManager {

    private csolutionService = new CsolutionServiceImpl(cwd);

    public async GetVersion(): Promise<void> {
        const version = await this.csolutionService.GetVersion()
            .catch(error => outputChannel.appendLine(`[error]: ${error}`));
        outputChannel.appendLine(`[request]: GetVersion: ${version}`);
    }

    public async Shutdown(): Promise<void> {
        await this.csolutionService.Shutdown()
            .catch(error => outputChannel.appendLine(`[error]: ${error}`));
        outputChannel.appendLine(`[request]: Shutdown`);
    }

    public async LoadPacks(): Promise<void> {
        const start = new Date().getTime();
        await this.csolutionService.LoadPacks()
            .catch(error => outputChannel.appendLine(`[error]: ${error}`));
        const elapsedTime = new Date().getTime() - start;
        outputChannel.appendLine(`[request]: LoadPacks - time elapsed: ${elapsedTime}`);
    }

    public async LoadSolution(): Promise<void> {
        if (vscode.window.activeTextEditor) {
            const solution = vscode.window.activeTextEditor.document.fileName;
            const start = new Date().getTime();
            await this.csolutionService.LoadSolution({solution: solution})
                .catch(error => outputChannel.appendLine(`[error]: ${error}`));
            const elapsedTime = new Date().getTime() - start;
            outputChannel.appendLine(`[request]: LoadSolution - time elapsed: ${elapsedTime}`);
        }
    }

    public async GetPacksInfo(treeDataProvider: ComponentsTreeProvider): Promise<void> {
        const context = await vscode.window.showInputBox({
            prompt: "Enter the context in the format <project>.<build-type>+<target-type>",
        });
        const start = new Date().getTime();
        const packsInfo = await this.csolutionService.GetPacksInfo({context: context ?? ''})
            .catch(error => outputChannel.appendLine(`[error]: ${error}`));
        const elapsedTime = new Date().getTime() - start;
        outputChannel.appendLine(`[request]: GetPacksInfo - time elapsed: ${elapsedTime}`);
        treeDataProvider.refreshPacks(packsInfo!);
    }
    
    public async GetComponentsInfo(treeDataProvider: ComponentsTreeProvider): Promise<void> {
        const context = await vscode.window.showInputBox({
            prompt: "Enter the context in the format <project>.<build-type>+<target-type>",
        });
        const start = new Date().getTime();
        const componentsInfo = await this.csolutionService.GetComponentsInfo({context: context ?? ''})
            .catch(error => outputChannel.appendLine(`[error]: ${error}`));
        const elapsedTime = new Date().getTime() - start;
        outputChannel.appendLine(`[request]: GetComponentsInfo - time elapsed: ${elapsedTime}`);
        treeDataProvider.refreshComponents(componentsInfo!);
    }

    public async ValidateComponents(treeView: vscode.TreeView<vscode.TreeItem>): Promise<void> {
        if (vscode.window.activeTextEditor) {
            const context = await vscode.window.showInputBox({
                prompt: "Enter the context in the format <project>.<build-type>+<target-type>",
            });
            const selection: string[] = treeView.selection
                .map(item => typeof item.label === 'string' ? item.label : item.label?.label)
                .filter((label): label is string => Boolean(label));
            const start = new Date().getTime();
            const validationResults = await this.csolutionService.ValidateComponents({context: context ?? '', components: selection})
                .catch(error => outputChannel.appendLine(`[error]: ${error}`));
            const elapsedTime = new Date().getTime() - start;
            outputChannel.appendLine(`[request] ValidateComponents - time elapsed: ${elapsedTime}`);
            outputChannel.appendLine(`Validation results: ${JSON.stringify(validationResults, null, 2)}`);
        }
    }

    public async GetLogMessages(): Promise<void> {
        const logMessages = await this.csolutionService.GetLogMessages()
            .catch(error => outputChannel.appendLine(`[error]: ${error}`));
        outputChannel.appendLine(`[request]: GetLogMessages`);
        outputChannel.appendLine(`Log Messages: ${JSON.stringify(logMessages, null, 2)}`);
    }
}
