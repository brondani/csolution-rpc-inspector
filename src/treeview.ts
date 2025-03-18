import * as vscode from 'vscode';
import { IComponentsInfo } from './json-rpc/csolution-rpc-client';

export class ComponentsTreeProvider implements vscode.TreeDataProvider<vscode.TreeItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<vscode.TreeItem | undefined | void> = new vscode.EventEmitter<vscode.TreeItem | undefined | void>();
    readonly onDidChangeTreeData: vscode.Event<vscode.TreeItem | undefined | void> = this._onDidChangeTreeData.event;

    private componentsInfo: IComponentsInfo;

    constructor(componentsInfo: IComponentsInfo) {
        this.componentsInfo = componentsInfo;
    }

    refresh(componentsInfo: IComponentsInfo): void {
        this.componentsInfo = componentsInfo;
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: vscode.TreeItem): vscode.TreeItem {
        return element;
    }

    getChildren(element?: vscode.TreeItem): Thenable<vscode.TreeItem[]> {
        if (!element) {
            return Promise.resolve([
                new vscode.TreeItem('Components', vscode.TreeItemCollapsibleState.Collapsed),
                new vscode.TreeItem('APIs', vscode.TreeItemCollapsibleState.Collapsed),
                new vscode.TreeItem('Taxonomy', vscode.TreeItemCollapsibleState.Collapsed),
            ]);
        }

        if (element.label === 'Components' && this.componentsInfo.components) {
            return Promise.resolve(this.componentsInfo.components.map(c =>
                new TreeItem(c.id, `${c['from-pack']}\n${c.description}\n${c.doc ? c.doc : ''}`)));
        }
        if (element.label === 'APIs' && this.componentsInfo.apis) {
            return Promise.resolve(this.componentsInfo.apis.map(a =>
                new TreeItem(a.id, `${a.description}\n${a.doc ? a.doc : ''}`)));
        }
        if (element.label === 'Taxonomy' && this.componentsInfo.taxonomy) {
            return Promise.resolve(this.componentsInfo.taxonomy.map(t =>
                new TreeItem(t.id, `${t.description}\n${t.doc ? t.doc : ''}`)));
        }

        return Promise.resolve([]);
    }
}

export class TreeItem extends vscode.TreeItem {
    constructor(label: string, tooltip: string) {
        super(label, vscode.TreeItemCollapsibleState.None);
        this.tooltip = tooltip;
    }
}
