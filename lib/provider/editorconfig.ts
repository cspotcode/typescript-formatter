import * as ts from "typescript";

import * as editorconfig from "editorconfig";

import { Options } from "../";

let emitBaseDirWarning = false;

export default function makeFormatCodeOptions(fileName: string, opts: Options, formatSettings: ts.FormatCodeSettings): Promise<ts.FormatCodeSettings> {

    if (opts.verbose && opts.baseDir && !emitBaseDirWarning) {
        console.log("editorconfig is not supported baseDir options");
        emitBaseDirWarning = true;
    }

    return editorconfig
        .parse(fileName)
        .then(config => {
            if (Object.keys(config).length === 0) {
                return formatSettings;
            }
            if (opts.verbose) {
                console.log("editorconfig: \n" + "file: " + fileName + "\n" + JSON.stringify(config, null, 2));
            }

            if (config.indent_style === "tab") {
                formatSettings.convertTabsToSpaces = false;
                // if (typeof config.tab_width === "number") {
                // 	options.TabSize = config.tab_width;
                // }
            } else if (typeof config.indent_size === "number") {
                formatSettings.convertTabsToSpaces = true;
                formatSettings.indentSize = config.indent_size;
            }
            if (config.end_of_line === "lf") {
                formatSettings.newLineCharacter = "\n";
            } else if (config.end_of_line === "cr") {
                formatSettings.newLineCharacter = "\r";
            } else if (config.end_of_line === "crlf") {
                formatSettings.newLineCharacter = "\r\n";
            }

            return formatSettings;
        });
}


export function postProcess(fileName: string, formattedCode: string, opts: Options, _formatSettings: ts.FormatCodeSettings): Promise<string> {

    if (opts.verbose && opts.baseDir && !emitBaseDirWarning) {
        console.log("editorconfig is not supported baseDir options");
        emitBaseDirWarning = true;
    }

    return editorconfig
        .parse(fileName)
        .then(config => {
            if (config.insert_final_newline && !/\n$/.test(formattedCode)) {
                formattedCode += "\n";
            }
            return formattedCode;
        });
}
