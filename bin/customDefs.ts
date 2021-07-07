import * as fs from "fs-extra";
import {buildConfig} from "./Utils";


const config = buildConfig;

export function Make() {
    let file: string = "" + fs.readFileSync(`./maps/${config.mapFolder}/war3map.lua`);
    let outputFile = config.defsFile;
    let output = "//Destructables \n";
    output = extractDestructables(file, output);
    output += "\n//Rects \n";
    output = extractRegions(file, output);
    fs.writeFileSync("./" + outputFile, output);
}



function extractDestructables(file: string, output: string) {
    let destRegex = new RegExp(/(udg_Dest_[A-Za-z0-9_]*)\s*=\s*(nil)/gm);
    let destNames: string[] = [];
    let match = destRegex.exec(file);
    while (match != null) {
        let name = match[1];
        if (destNames.indexOf(name) < 0) destNames.push(name);
        console.log(match[1])
        match = destRegex.exec(file);
    }
    for (let name of destNames) {
        output += `declare const ${name}: destructable;\n`;
    }
    return output;
}
function extractRegions(file: string, output: string) {
    let destRegex = new RegExp(/(gg_rct_[A-Za-z0-9_]*)\s*=\s*(nil)/gm);
    let destNames: string[] = [];
    let match = destRegex.exec(file);
    while (match != null) {
        let name = match[1];
        if (destNames.indexOf(name) < 0) destNames.push(name);
        console.log(match[1])
        match = destRegex.exec(file);
    }
    for (let name of destNames) {
        output += `declare const ${name}: rect;\n`;
    }
    return output;
}