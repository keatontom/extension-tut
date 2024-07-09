import * as vscode from 'vscode';
import * as process from 'process';
import { exec }  from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { subscribeToDocumentChanges, EMOJI_MENTION } from './diagnostics';
const COMMAND = 'code-actions-sample.command';
import { webviewPanel } from './webviewPanel';
// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Register the Hello World command
	context.subscriptions.push(
		vscode.commands.registerCommand('extension-tut.helloWorld', () => {
			vscode.window.showInformationMessage('Hello World from extension-tut!');
		})
	);

	// Register the Ask Question command
	context.subscriptions.push(
		vscode.commands.registerCommand('extension-tut.askQuestion', async () => {
			const answer = await vscode.window.showInformationMessage('How is your day?', 'Good', 'Bad');
			if (answer === 'Bad') {
				vscode.window.showInformationMessage("Sorry to hear that");
			} else {
				vscode.window.showInformationMessage("That is great to hear!");
			}
			console.log({ answer });
		})
	);

	// Register the Touch command
	context.subscriptions.push(
		vscode.commands.registerCommand('extension-tut.touch', async () => {
			const fileName = await vscode.window.showInputBox({
				placeHolder: 'filename',
				prompt: "Please provide the file name",
			});
			const command = `touch ${fileName}`;
			exec(command, { cwd: 'extension-tut' }, (error, stderr, stdout) => {
				if (error) {
					vscode.window.showErrorMessage(`Error: ${error.message}`);
					return;
				}
				if (stderr) {
					vscode.window.showErrorMessage(`Error: ${stderr}`);
					return;
				}
				if (stdout) {
					vscode.window.showInformationMessage(`Output: ${stdout}`);
					return;
				}
			});
		})
	);

	// Register the Echo command
	context.subscriptions.push(
		vscode.commands.registerCommand('extension-tut.echo', async () => {
			const fileName = await vscode.window.showInputBox({
				placeHolder: 'file name',
				prompt: 'Please provide the file name'
			});
			const message = await vscode.window.showInputBox({
				placeHolder: 'message',
				prompt: "Please provide the message",
			});
			const command = `echo ${message} > ${fileName}`;
			exec(command, { cwd: 'extension-tut' }, (error, stderr, stdout) => {
				if (error) {
					vscode.window.showErrorMessage(`Error: ${error.message}`);
					return;
				}
				if (stderr) {
					vscode.window.showErrorMessage(`Error: ${stderr}`);
					return;
				}
				if (stdout) {
					vscode.window.showInformationMessage(`Output: ${stdout}`);
					return;
				}
			}
			);
		}));

	
	context.subscriptions.push(
		vscode.languages.registerCodeActionsProvider('queens', new Emojizer(), {
			providedCodeActionKinds: Emojizer.providedCodeActionKinds
		}));
	
	const emojiDiagnostics = vscode.languages.createDiagnosticCollection("emoji");
	context.subscriptions.push(emojiDiagnostics);
	
	subscribeToDocumentChanges(context, emojiDiagnostics);
	
	context.subscriptions.push(
		vscode.languages.registerCodeActionsProvider('queens', new Emojinfo(), {
			providedCodeActionKinds: Emojinfo.providedCodeActionKinds
		})
	);
	
	context.subscriptions.push(
		vscode.commands.registerCommand(COMMAND, () => vscode.env.openExternal(vscode.Uri.parse('https://unicode.org/emoji/charts-12.0/full-emoji-list.html')))
	);	

	let disposable = vscode.commands.registerCommand('extension-tut.createProjectTemplate', () => {
        // 获取工作区根目录
        const rootPath = vscode.workspace.rootPath;
        if (!rootPath) {
            vscode.window.showErrorMessage('Please open a workspace folder first.');
            return;
        }

        // 创建项目骨架目录和文件
        const projectPath = path.join(rootPath, 'Type1EntityProject');
        if (!fs.existsSync(projectPath)) {
            fs.mkdirSync(projectPath);
        }

        // 创建 YANG 模板文件
        const yangTemplate = `
module example-module {
    namespace "http://example.com/ns/example-module";
    prefix em;

    organization "Example Inc.";
    contact "example@example.com";

    description "Example YANG module.";

    revision 2020-01-01 {
        description "Initial revision.";
    }

    container example-container {
        leaf example-leaf {
            type string;
            description "An example leaf.";
        }
    }
}
        `;
        fs.writeFileSync(path.join(projectPath, 'example.yang'), yangTemplate);

        // 创建 XML 模板文件
        const xmlTemplate = `
<example-module xmlns="http://example.com/ns/example-module">
    <example-container>
        <example-leaf>example-value</example-leaf>
    </example-container>
</example-module>
        `;
        fs.writeFileSync(path.join(projectPath, 'example.xml'), xmlTemplate);

        vscode.window.showInformationMessage('Project template created successfully.');
    });

    context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}

export class Emojizer implements vscode.CodeActionProvider {

	public static readonly providedCodeActionKinds = [
		vscode.CodeActionKind.QuickFix
	];

	public provideCodeActions(document: vscode.TextDocument, range: vscode.Range): vscode.CodeAction[] | undefined {
		if (!this.isAtStartOfSmiley(document, range)) {
			return;
		}

		const replaceWithSmileyCatFix = this.createFix(document, range, '😺');

		const replaceWithSmileyFix = this.createFix(document, range, '😀');
		// Marking a single fix as `preferred` means that users can apply it with a
		// single keyboard shortcut using the `Auto Fix` command.
		replaceWithSmileyFix.isPreferred = true;

		const replaceWithSmileyHankyFix = this.createFix(document, range, '💩');

		const commandAction = this.createCommand();

		return [
			replaceWithSmileyCatFix,
			replaceWithSmileyFix,
			replaceWithSmileyHankyFix,
			commandAction
		];
	}

	private isAtStartOfSmiley(document: vscode.TextDocument, range: vscode.Range) {
		const start = range.start;
		const line = document.lineAt(start.line);
		return line.text[start.character] === ':' && line.text[start.character + 1] === ')';
	}

	private createFix(document: vscode.TextDocument, range: vscode.Range, emoji: string): vscode.CodeAction {
		const fix = new vscode.CodeAction(`Convert to ${emoji}`, vscode.CodeActionKind.QuickFix);
		fix.edit = new vscode.WorkspaceEdit();
		fix.edit.replace(document.uri, new vscode.Range(range.start, range.start.translate(0, 2)), emoji);
		return fix;
	}

	private createCommand(): vscode.CodeAction {
		const action = new vscode.CodeAction('Learn more...', vscode.CodeActionKind.Empty);
		action.command = { command: COMMAND, title: 'Learn more about emojis', tooltip: 'This will open the unicode emoji page.' };
		return action;
	}
}

/**
 * Provides code actions corresponding to diagnostic problems.
 */
export class Emojinfo implements vscode.CodeActionProvider {

	public static readonly providedCodeActionKinds = [
		vscode.CodeActionKind.QuickFix
	];

	provideCodeActions(document: vscode.TextDocument, range: vscode.Range | vscode.Selection, context: vscode.CodeActionContext, token: vscode.CancellationToken): vscode.CodeAction[] {
		// for each diagnostic entry that has the matching `code`, create a code action command
		return context.diagnostics
			.filter(diagnostic => diagnostic.code === EMOJI_MENTION)
			.map(diagnostic => this.createCommandCodeAction(diagnostic));
	}

	private createCommandCodeAction(diagnostic: vscode.Diagnostic): vscode.CodeAction {
		const action = new vscode.CodeAction('Learn more...', vscode.CodeActionKind.QuickFix);
		action.command = { command: COMMAND, title: 'Learn more about emojis', tooltip: 'This will open the unicode emoji page.' };
		action.diagnostics = [diagnostic];
		action.isPreferred = true;
		return action;
	}
}
