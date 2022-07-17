import * as vscode from 'vscode';
import * as fs from 'fs';

const cats = {
	'Coding Cat': 'https://media.giphy.com/media/JIX9t2j0ZTN9S/giphy.gif',
	'Compiling Cat': 'https://media.giphy.com/media/mlvseq9yvZhba/giphy.gif',
	'Testing Cat': 'https://media.giphy.com/media/3oriO0OEd9QIDdllqo/giphy.gif'
};
let NEXT_TERM_ID = 1;
const manipulateTerminal = (callback)=>{
	if (ensureTerminalExists()) {
		selectTerminal().then(terminal => {
			if (terminal) {
				terminal.show();
				callback(terminal);
			}
		});
	}
	else{
		//const terminal = vscode.window.createTerminal(`Ext Terminal #${NEXT_TERM_ID++}`);
		const terminal = vscode.window.createTerminal(`Ext Terminal`);
		terminal.show();
		terminal.sendText("echo 'Sent text immediately after creating'");
		// terminal.sendText('mvn -version');
		// terminal.sendText('java -version');
		callback(terminal);
	}
};
export function activate(context: vscode.ExtensionContext) {
	
	context.subscriptions.push(
		vscode.commands.registerCommand('catCoding.start', () => {
			CatCodingPanel.createOrShow(context.extensionUri);
			
		})
	);

	context.subscriptions.push(
		vscode.commands.registerCommand('catCoding.doRefactor', () => {
			if (CatCodingPanel.currentPanel) {
				CatCodingPanel.currentPanel.doRefactor();
			}
		})
	);

	//workbench.action.terminal.openNativeConsole

	context.subscriptions.push(
		vscode.commands.registerCommand('catCoding.openTerminal', () => {
			vscode.commands.executeCommand(
				"workbench.action.terminal.new"
			);
		})
	);

	// vscode.window.createTerminal
	context.subscriptions.push(vscode.commands.registerCommand('catCoding.createTerminal', () => {
		// vscode.window.createTerminal(`Ext Terminal #${NEXT_TERM_ID++}`);
		// vscode.window.showInformationMessage('Hello World 2!');

		// const terminal = vscode.window.createTerminal(`Ext Terminal #${NEXT_TERM_ID++}`);
		// terminal.show();
		// terminal.sendText("echo 'Sent text immediately after creating'");
		// terminal.sendText('mvn -version');
		// terminal.sendText('java -version');
		manipulateTerminal((terminal)=>{
			terminal.sendText('mvn -version');
		});
		
	}));

	if (vscode.window.registerWebviewPanelSerializer) {
		// Make sure we register a serializer in activation event
		vscode.window.registerWebviewPanelSerializer(CatCodingPanel.viewType, {
			async deserializeWebviewPanel(webviewPanel: vscode.WebviewPanel, state: any) {
				console.log(`Got state: ${state}`);
				// Reset the webview options so we use latest uri for `localResourceRoots`.
				webviewPanel.webview.options = getWebviewOptions(context.extensionUri);
				CatCodingPanel.revive(webviewPanel, context.extensionUri);
			}
		});
	}
}

function getWebviewOptions(extensionUri: vscode.Uri): vscode.WebviewOptions {
	return {
		// Enable javascript in the webview
		enableScripts: true,
		
		// And restrict the webview to only loading content from our extension's `media` directory.
		localResourceRoots: [vscode.Uri.joinPath(extensionUri, 'media')]
	};
}

/**
 * Manages cat coding webview panels
 */
class CatCodingPanel {
	/**
	 * Track the currently panel. Only allow a single panel to exist at a time.
	 */
	public static currentPanel: CatCodingPanel | undefined;

	public static readonly viewType = 'catCoding';
	//this.file_vscode_harmonystate = vscode.Uri.joinPath(this._extensionUri, 'media','vscode_harmonystate').path;

	public file_vscode_harmonystate;
	private readonly _panel: vscode.WebviewPanel;
	private readonly _extensionUri: vscode.Uri;
	private _disposables: vscode.Disposable[] = [];

	public static createOrShow(extensionUri: vscode.Uri) {
		const column = vscode.window.activeTextEditor
			? vscode.window.activeTextEditor.viewColumn
			: undefined;

		// If we already have a panel, show it.
		if (CatCodingPanel.currentPanel) {
			CatCodingPanel.currentPanel._panel.reveal(column);
			return;
		}

		// Otherwise, create a new panel.
		const panel = vscode.window.createWebviewPanel(
			CatCodingPanel.viewType,
			'Cat Coding',
			column || vscode.ViewColumn.One,
			getWebviewOptions(extensionUri),
		);
		
		CatCodingPanel.currentPanel = new CatCodingPanel(panel, extensionUri);
	}

	public static revive(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
		CatCodingPanel.currentPanel = new CatCodingPanel(panel, extensionUri);
	}

	private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
		this._panel = panel;
		this._extensionUri = extensionUri;
		this.file_vscode_harmonystate = vscode.Uri.joinPath(this._extensionUri, 'media','vscode_harmonystate').path;
		// Set the webview's initial html content
		this._update();

		// Listen for when the panel is disposed
		// This happens when the user closes the panel or when the panel is closed programmatically
		this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

		// Update the content based on view changes
		this._panel.onDidChangeViewState(
			e => {
				if (this._panel.visible) {
					this._update();
				}
			},
			null,
			this._disposables
		);
		
		
		// Handle messages from the webview
		this._panel.webview.onDidReceiveMessage(
			message => {
				console.log("onDidReceiveMessage message ",message);
				switch (message.command) {
					case 'alert':
						vscode.window.showErrorMessage(message.text);
						break;
					case 'localdb':
						fs.writeFileSync(this.file_vscode_harmonystate,message.text);
						break;
					case 'vscodecommand:buildMaven':
						//manipulateTerminal();
						manipulateTerminal((terminal)=>{
							terminal.sendText('mvn -version');
						});
						break;
				}
			},
			null,
			this._disposables
		);
		
		this._panel.webview.postMessage({
			message:"status",
			text: "test divine"
		});
		
	}

	public doRefactor() {
		// Send a message to the webview webview.
		// You can send any JSON serializable data.
		this._panel.webview.postMessage({ command: 'refactor' });
	}

	public dispose() {
		CatCodingPanel.currentPanel = undefined;

		// Clean up our resources
		this._panel.dispose();

		while (this._disposables.length) {
			const x = this._disposables.pop();
			if (x) {
				x.dispose();
			}
		}
	}

	private _update() {
		const webview = this._panel.webview;

		// Vary the webview's content based on where it is located in the editor.
		switch (this._panel.viewColumn) {
			case vscode.ViewColumn.Two:
				this._updateForCat(webview, 'Compiling Cat');
				return;

			case vscode.ViewColumn.Three:
				this._updateForCat(webview, 'Testing Cat');
				return;

			case vscode.ViewColumn.One:
			default:
				this._updateForCat(webview, 'Coding Cat');
				return;
		}
	}

	private _updateForCat(webview: vscode.Webview, catName: keyof typeof cats) {
		this._panel.title = catName;
		this._panel.webview.html = this._getHtmlForWebview(webview, cats[catName]);
	}

	private _getHtmlForWebview(webview: vscode.Webview, catGifPath: string) {
		console.log("in _getHtmlForWebview");
		setTimeout(()=>{
			if(fs.existsSync(this.file_vscode_harmonystate)){
				console.log("file_vscode_harmonystate exists");
				const fileData = fs.readFileSync(this.file_vscode_harmonystate);
				console.log("fileData ",fileData);

				if(fileData && fileData.length >0){
					console.log("fileData exists");
					this._panel.webview.postMessage({
						message:"localdb",
						text: fileData.toString()
					});
				}
				else{
					console.log("fileData doesnot exists");
					this._panel.webview.postMessage({
						message:"localdbEmpty",
						text: ""
					});
				}
				
			}
			else{
				console.log("file_vscode_harmonystate doesnot exists");
				fs.writeFileSync(this.file_vscode_harmonystate,"{}");
				
			}
		},2000);
		// Local path to main script run in the webview
		const scriptPathOnDisk = vscode.Uri.joinPath(this._extensionUri, 'media', 'main.js');

		// And the uri we use to load this script in the webview
		const scriptUri = webview.asWebviewUri(scriptPathOnDisk);

		// Local path to css styles
		const styleResetPath = vscode.Uri.joinPath(this._extensionUri, 'media', 'reset.css');
		const stylesPathMainPath = vscode.Uri.joinPath(this._extensionUri, 'media', 'vscode.css');
		
		// Uri to load styles into webview
		const stylesResetUri = webview.asWebviewUri(styleResetPath);
		const stylesMainUri = webview.asWebviewUri(stylesPathMainPath);

		// Use a nonce to only allow specific scripts to be run
		const nonce = getNonce();

		return `<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">

				<!--
					Use a content security policy to only allow loading images from https or from our extension directory,
					and only allow scripts that have a specific nonce.
				-->
				<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline' ${webview.cspSource}; img-src ${webview.cspSource} https:; script-src 'nonce-${nonce}';">

				<meta name="viewport" content="width=device-width, initial-scale=1.0">

				<link href="${stylesResetUri}" rel="stylesheet">
				<link href="${stylesMainUri}" rel="stylesheet">
				<title>Cat Coding</title>
				<style>
					label,button{
						display:inline-block;
					}
					.projectdir{
						margin: 0.5rem 0;
					}
					.projectdir .label{
						width: 12rem;
					}
					label{
						width: 10rem;
					}
					.maven > div,
					.run > div{
						margin-bottom: 0.4rem;
					}
					.maven,.run,
					.git > div{
						margin-left: 2rem;
					}
				</style>
			</head>
			<body>
				<h2 style="text-align:center">Harmony Assist</h2>
				<div class="projectdir">
				<h3 style="display: inline-block;" class="label">Project Directory</h3>
				<input type="text" id="projectDir" value="" size="60" />
				</div>
				<h3>Build</h3>
				<div class="maven">
					<div>
						<label for="">Application</label>
						<input type="text" id="mvn_application" value="" size="40">
						<button id="mvn_execute">Build</button>
					</div>
				</div>
				<h3>Run</h3>
				<div class="run">
					<div>
						<label for="">Application</label><input type="text" id="run_appname" value="" size="40">
					</div>
					<div>
						<label for="">Groupinfo</label><input type="text" id="run_groupinfo" value="" size="40">
					</div>
					
					<div>
						<label for="">Suitename</label><input type="text" id="run_suitename" value="" size="40">
					</div>
					<div>
						<label for="">ExecutionParams</label><input type="text" id="run_ExecutionParams" value="" size="40">
					</div>
					<div>
						<label for="">Appid</label><input type="text" id="run_appid" value="">
					</div>
					<div>
						<label for="">Projectname</label><input type="text" id="run_projectname" value="">
					</div>
					<div>
						<label for="">Queue id</label><input type="text" id="run_queueid" value="">
					</div>
					<div>
						<label for="">RunId</label><input type="text" id="run_RunId" value="">
					</div>
					<div>
						<label for="">QueueParam</label><input type="text" id="run_QueueParam" value="">
					</div>
					<div>
						<label for="">Testsuite id</label><input type="text" id="run_testsuiteid" value="">
					</div>
					<div>
						<label for="">Browser</label><input type="text" id="run_browser" value="">
					</div>
					<div>
						<label for="">Environment</label><input type="text" id="run_environment" value="">
					</div>
					
					<div>
						<label for="">Autodefect</label><input type="text" id="run_autodefect" value="">
					</div>
					<div>
						<label for="">RunTrials</label><input type="text" id="run_runTrials" value="">
					</div>
					<div>
						<label for="">SourceId</label><input type="text" id="run_SourceId" value="">
					</div>
					
					<div>
						<label for="">security</label><input type="text" id="run_security" value="">
					</div>
					
					<div>
						<label for="">OutputRunId</label><input type="text" id="run_outputRunId" value="">
					</div>
					<div>
						<label for=""></label><button id="run_execute" >Run</button>
					</div>
					
				</div>
				<h3>Git</h3>
				<div class="git">
					<div>
						<button id="git_status_execute">Status</button>
						<button id="git_pull_execute">Pull</button> 
						<button id="git_commit_execute">Commit</button>
						<button id="git_push_execute">Push</button>
					</div>
				</div>
			</body>
			<script nonce="${nonce}" src="${scriptUri}"></script>
			</html>`;
	}
}

function getNonce() {
	let text = '';
	const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	for (let i = 0; i < 32; i++) {
		text += possible.charAt(Math.floor(Math.random() * possible.length));
	}
	return text;
}

function selectTerminal(): Thenable<vscode.Terminal | undefined> {
	interface TerminalQuickPickItem extends vscode.QuickPickItem {
		terminal: vscode.Terminal;
	}
	const terminals = <vscode.Terminal[]>(<any>vscode.window).terminals;
	const items: TerminalQuickPickItem[] = terminals.map(t => {
		return {
			label: `name: ${t.name}`,
			terminal: t
		};
	});
	return  new Promise((res,rej)=>{
		res(items[0].terminal);
	});
	// return vscode.window.showQuickPick(items).then(item => {
	// 	return item ? item.terminal : undefined;
	// });
}

function ensureTerminalExists(): boolean {
	if ((<any>vscode.window).terminals.length === 0) {
		vscode.window.showErrorMessage('No active terminals');
		return false;
	}
	return true;
}
