// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const beautify = require("js-beautify").html;

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */

function reformat(string) {
	var inputValue = ` ${string.toString()} `;

	// Brand sierotki
	// var brandName = document.getElementById("brand").value;

	// const brandRegex = new RegExp(brandName);
	// console.log(brandRegex);

	// const space = / /g;
	// var reformatedBrand = brandName.replace(space, "&nbsp;");
	// console.log(reformatedBrand);

	// var reformated = inputValue.replace(brandRegex, reformatedBrand);

	const sierotki =
	/ i | a | z | w | oraz | lub | u | I | A | Z | W | ORAZ | LUB | U | o | O | od | do | OD | DO | to | TO | za | ZA /g;
	const cyferki = /[0-9] /g;
	const literka_a = /, a |, A /g;
	const short_dash = /-/g;
	const long_dash_space = / – /g;

	// console.log([...inputValue.matchAll(sierotki)])

	// console.log("przed" + reformated)
	var reformated = inputValue.replace(sierotki, (t1) => {
		var val = t1.slice(0, -1);
		return `${val}&nbsp;`;
	});
	// console.log("po 1" + reformated)
	var reformated = reformated.replace(cyferki, (t2) => {
		var val = t2.slice(0, -1);
		return `${val}&nbsp;`;
	});
	// console.log("po 2" + reformated)

	reformated = reformated.replace(short_dash, (t3) => {
		var val = t3.slice(0, -1);
		return `${val}&#8209;`;
	});

	reformated = reformated.replace(long_dash_space, "&nbsp;&mdash;&nbsp;");

	reformated = reformated.replace(literka_a, (t2) => {
		var val = t2.slice(0, -1);
		return `${val}&nbsp;`;
	});

	// For strong use @@some text@@
	var occurances = [...reformated.matchAll(/\@{2}(.*?)\@{2}/g)]
	occurances.forEach(occurance => {
		reformated = reformated.replace(occurance[0], `<strong>${occurance[1]}</strong>`)
	})

	return reformated.slice(1,-1);
}

function activate(context) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "html-text-formater" is now active!');
	// The command has been defined in the package.json file
	// Now provide the implementation of the command with  registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerTextEditorCommand('html-text-formater.formatHTMLFile', (editor, edit) => {
		// The code you place here will be executed every time your command is executed
		if(editor.document.languageId.toLowerCase() != "html"){
			vscode.window.showErrorMessage('Błędne rozszerzenie pliku!')
			return 1;
		}

		let htmlFile  = editor.document.getText()

		let DOM = new JSDOM(htmlFile, {
			contentType: "text/html",
			includeNodeLocations: true,
		  });
		
		let body = DOM.window.document.body
		let bodyStringified = body.outerHTML
		
		//wszystkie stringi pomiedzy znacznikami > <
		let changes = [...bodyStringified.match(/>[\s\S]*?</gmi)]
		
		//filtrowanie wynikow zawierajacych tylko biale znaki pomiedzy znacznikami > <
		changes = changes.filter(element => !element.match(/>[\s]*?</gmi))
		// console.log(changes)
		
		//usuniecie znacznikow > < oraz białych znakow
		changes = changes.map(element => element.slice(1, -1).trim())
		console.log(changes)
		changes = Array.from(new Set(changes))
		console.log(changes)

		//zamiana duplikatow bialych znakow na spacje
		bodyStringified = bodyStringified.replace(/\s+/g, ' ')
		
		//nowa linia na spacje zeby wszystko one lin e(ulatwienie dla replace)
		bodyStringified = bodyStringified.replace(/\n/g, ' ')
		bodyStringified = bodyStringified.replace(/>\s+</g, '><')

		changes.forEach(change => {
			bodyStringified = bodyStringified.replace(change, reformat(change))
		})
		
		//poprawienie stylistyki pliku
		bodyStringified = bodyStringified.replace(/></g, '>\n<')
		bodyStringified = bodyStringified.replace(/> /g, '>\n')
		bodyStringified = bodyStringified.replace(/ </g, '\n<')
		bodyStringified = beautify(bodyStringified)
		body.innerHTML = bodyStringified
		vscode.window.activeTextEditor.edit(builder => {
			const doc = vscode.window.activeTextEditor.document;
			builder.replace(new vscode.Range(doc.lineAt(0).range.start, doc.lineAt(doc.lineCount - 1).range.end), `<!DOCTYPE HTML>\n<html lang="pl-PL">\n${DOM.window.document.documentElement.innerHTML}\n</html>`);
		});
		// Dodawanie na koncu
		// edit.replace(editor.selection.active, DOM.window.document.documentElement.outerHTML)

		// Display a message box to the user
		vscode.window.showInformationMessage('WHOOSH!');
	});

	context.subscriptions.push(disposable);
}


// This method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}
