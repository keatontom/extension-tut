// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	//Pop-up Message
	context.subscriptions.push(
		vscode.commands.registerCommand('extension-tut.helloWorld', () => {
			vscode.window.showInformationMessage('Hello World from extension-tut!');
		}));
	
	//Pop-up Message with user input 
	context.subscriptions.push(
		vscode.commands.registerCommand('extension-tut.askQuestion', async () => {
			const answer = await vscode.window.showInformationMessage('How is your day?', 'Good', 'Bad');
			if (answer === 'Bad') {
				vscode.window.showInformationMessage("Sorry to hear that");
			} else {
				vscode.window.showInformationMessage("That is great to hear!");
			}
			console.log({ answer });
		}));
	
	//Terminal Commands
	context.subscriptions.push(
		vscode.commands.registerCommand('extension-tutorial.terminalCommand', async () => {
			const fileName = await vscode.window.showInputBox({
				placeHolder: 'filename', prompt: "Please provide the file name",
			});
		}));
}

// This method is called when your extension is deactivated
export function deactivate() {}
