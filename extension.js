// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require("vscode");
const copyPaste = require("copy-paste");

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log(
    'Congratulations, your extension "unicode-escape-paste.paste" is now active!'
  );

  let paster = new Paster();

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with  registerCommand
  // The commandId parameter must match the command field in package.json
  let disposable = vscode.commands.registerCommand(
    "unicode-escape-paste.paste",
    function () {
      // The code you place here will be executed every time your command is executed
			paster.paste();
    }
  );

  context.subscriptions.push(disposable);
}
exports.activate = activate;

class Paster {
  constructor(_statusBarItem) {
    this._statusBarItem = Object;
  }

  paste() {
    if (!this._statusBarItem) {
      this._statusBarItem = vscode.window.createStatusBarItem(
        vscode.StatusBarAlignment.Left
      );
    }

    copyPaste.paste((error, content) => {
      if (content) {
        this.generateEncodedText(content);
      } else {
        this.showMessage();
      }
    });
  }

  generateEncodedText(content) {
    var _this = this;
		var formattedContent = this.unicodeEscape(content);
    var prefix = vscode.workspace
		.getConfiguration("encodeAndPaste")
		.get("prefix");

    if (typeof prefix === "string") {
      const prefixString = prefix.replace(/\\/gi, "\\\\");
      formattedContent = formattedContent.replace(/\\/gi, prefixString);
      vscode.window.showInformationMessage(
        "Original Text:  " + content
      );
      vscode.window.showInformationMessage(
        "pasted encorded text.  Prefix: " + prefixString
      );
    }

    _this.writeToEditor(formattedContent);
  }

  unicodeEscape(str) {
    var escapeOnlyMultiByte = vscode.workspace
		.getConfiguration("encodeAndPaste")
		.get("escapeOnlyMultiByte");

		if(typeof escapeOnlyMultiByte === "undefined") {
			escapeOnlyMultiByte = false;
		}

    if (!String.prototype.repeat) {
      String.prototype.repeat = function (digit) {
        var result = "";
        for (var i = 0; i < Number(digit); i++) {
          result += str;
        }
        return result;
      };
    }

    var strs = str.split("");
		var charCode;
		var hex;
		var result = "";
		const maxCharCode = 255;

		if (escapeOnlyMultiByte) {
			for (var i = 0, len = strs.length; i < len; i++) {
				charCode = strs[i].charCodeAt(0);
				if(charCode < maxCharCode) {
					result += strs[i];
					continue;
				}
				hex = charCode.toString(16);
				result += "\\u" + "0".repeat(Math.abs(hex.length - 4)) + hex;
			}
			result = this.escapeSpecialChars(result);
		} else {
			for (var i = 0, len = strs.length; i < len; i++) {
				hex = strs[i].charCodeAt(0).toString(16);
				result += "\\u" + "0".repeat(Math.abs(hex.length - 4)) + hex;
			}
		}
    return result;
	}

	escapeSpecialChars(str) {
    return str
			.replace(/\n/g, "\\r\\n")
			.replace(/"/g, "\\\"")
			.replace(/\//g, "\\\/");
	}

  writeToEditor(content) {
    const editor = vscode.window.activeTextEditor;

    if (typeof editor !== "undefined") {
      let startLine = editor.selection.start.line;
      var selection = editor.selection;
      let position = new vscode.Position(startLine, selection.start.character);
      return editor.edit((editBuilder) => {
        editBuilder.insert(position, content);
      });
    }
  }

  showMessage(content = null) {
    this._statusBarItem.text = "Paste encoded text!";
    this._statusBarItem.show();
    setTimeout(() => {
      this._statusBarItem.hide();
    }, 3000);
  }
}

// this method is called when your extension is deactivated
function deactivate() {}

module.exports = {
  activate,
  deactivate,
};
