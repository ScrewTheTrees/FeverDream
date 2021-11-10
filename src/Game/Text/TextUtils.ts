import { RGB } from "wc3-treelib/src/TreeLib/Utility/Data/RGB";


export namespace TextUtils {
    export function generateProgressString(value: number, max: number, length: number = 10, colorValid: RGB = RGB.green, colorInvalid: RGB = RGB.red) {
        let off = max / length;
        let asm = "[";
        for (let i = 0; i < length; i++) {
            if (value < off * i) {
                asm += RGB.textString(colorInvalid, "=");
            } else {
                asm += RGB.textString(colorValid, "=");
            }
        }
        return asm + "]";
    }
}