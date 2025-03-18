// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { CsolutionManager } from './csolution-manager';
import { ComponentsTreeProvider, TreeItem } from './treeview';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed

export function activate(context: vscode.ExtensionContext) {

    let csolution = new CsolutionManager();

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('The extension "csolution-rpc-inspector" is active!');

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with registerCommand
    // The commandId parameter must match the command field in package.json

    const treeDataProvider = new ComponentsTreeProvider({"apis" : [], "components" : [], "taxonomy" : []});
    const treeView = vscode.window.createTreeView('componentsView', { treeDataProvider });
    context.subscriptions.push(treeView);

    const GetVersion = vscode.commands.registerCommand('csolution-rpc-inspector.GetVersion', () => {
      csolution.GetVersion();
    });

    const Shutdown = vscode.commands.registerCommand('csolution-rpc-inspector.Shutdown', () => {
      csolution.Shutdown();
    });

    const LoadPacks = vscode.commands.registerCommand('csolution-rpc-inspector.LoadPacks', () => {
      csolution.LoadPacks();
    });

    const LoadSolution = vscode.commands.registerCommand('csolution-rpc-inspector.LoadSolution', () => {
      csolution.LoadSolution();
    });
  
    const GetComponentsInfo = vscode.commands.registerCommand('csolution-rpc-inspector.GetComponentsInfo', async () => {
      const userInput = await vscode.window.showInputBox({
        prompt: "Enter the context in the format <project>.<build-type>+<target-type>",
      });
      csolution.GetComponentsInfo(userInput ?? '', treeDataProvider);
    });

    context.subscriptions.push(
        GetVersion,
        Shutdown,
        LoadPacks,
        LoadSolution,
        GetComponentsInfo
    );
}

// This method is called when your extension is deactivated
export function deactivate() {}
