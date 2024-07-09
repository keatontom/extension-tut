import * as vscode from 'vscode';
import * as path from 'path';
import { exec } from 'child_process';
import { webviewPanel } from './webviewPanel';

export function activate(context: vscode.ExtensionContext) {

	// Register the Hello World command
	context.subscriptions.push(
		vscode.commands.registerCommand('extension-tut.helloWorld', () => {
			// vscode.window.showInformationMessage('Hello World from extension-tut!');
			webviewPanel.createOrShow(context.extensionUri);
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
			});
		})
	);
	
	//Webview
	context.subscriptions.push(
		vscode.commands.registerCommand('extension-tut.showWebview', () => {
			webviewPanel.createOrShow(context.extensionUri);
		})
	);
}

export function deactivate() {}
