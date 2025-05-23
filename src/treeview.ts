import * as vscode from 'vscode';
import { IComponentsInfo, IPacksInfo } from './json-rpc/csolution-rpc-client';

export class ComponentsTreeProvider implements vscode.TreeDataProvider<vscode.TreeItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<vscode.TreeItem | undefined | void> = new vscode.EventEmitter<vscode.TreeItem | undefined | void>();
    readonly onDidChangeTreeData: vscode.Event<vscode.TreeItem | undefined | void> = this._onDidChangeTreeData.event;

    private componentsInfo: IComponentsInfo = {"apis" : [], "components" : [], "taxonomy" : [], "bundles" : []};
    private packsInfo: IPacksInfo = {"packs" : []};

    refreshComponents(componentsInfo: IComponentsInfo): void {
        this.componentsInfo = componentsInfo;
        this._onDidChangeTreeData.fire();
    }

    refreshPacks(packsInfo: IPacksInfo): void {
        this.packsInfo = packsInfo;
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
                new vscode.TreeItem('Bundles', vscode.TreeItemCollapsibleState.Collapsed),
                new vscode.TreeItem('Packs', vscode.TreeItemCollapsibleState.Collapsed),
            ]);
        }

        if (element.label === 'Components' && this.componentsInfo.components) {
            return Promise.resolve(this.componentsInfo.components.map(c =>
                new TreeItem(c.id,
                    `From-Pack: ${c['from-pack']}` +
                    `${c.description ? '\nDescription: ' + c.description : ''}` +
                    `${c.doc ? '\nDoc: ' + c.doc : ''}` +
                    `${c.implements ? '\nImplements: ' + c.implements : ''}` +
                    `${c.selected ? '\nSelected: ' + c.selected : ''}` +
                    `${c.instances ? '\nInstances: ' + c.instances : ''}` +
                    `${c.maxInstances ? '\nMaxInstances: ' + c.maxInstances : ''}`
                    )));
        }
        if (element.label === 'APIs' && this.componentsInfo.apis) {
            return Promise.resolve(this.componentsInfo.apis.map(a =>
                new TreeItem(a.id,
                    `${a.description ? 'Description: ' + a.description : ''}` +
                    `${a.doc ? '\nDoc: ' + a.doc : ''}`
                    )));
        }
        if (element.label === 'Taxonomy' && this.componentsInfo.taxonomy) {
            return Promise.resolve(this.componentsInfo.taxonomy.map(t =>
                new TreeItem(t.id,
                    `${t.description ? 'Description: ' + t.description : ''}` +
                    `${t.doc ? '\nDoc: ' + t.doc : ''}`
                    )));
        }
        if (element.label === 'Bundles' && this.componentsInfo.bundles) {
            return Promise.resolve(this.componentsInfo.bundles.map(b =>
                new TreeItem(b.id,
                    `${b.description ? 'Description: ' + b.description : ''}` +
                    `${b.doc ? '\nDoc: ' + b.doc : ''}`
                    )));
        }
        if (element.label === 'Packs' && this.packsInfo.packs) {
            return Promise.resolve(this.packsInfo.packs.map(p =>
                new TreeItem(p.id,
                    `${p.description ? 'Description: ' + p.description : ''}` +
                    `${p.overview ? '\nOverview: ' + p.overview : ''}` +
                    `${p.references ? '\nReferences: ' + p.references : ''}`
                    )));
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
