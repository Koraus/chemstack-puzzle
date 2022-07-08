import { SHA256 } from "crypto-js";

export function createRand(seed: string) {
    let arr = SHA256(seed).words;
    let i = 0;
    return () => {
        if (i === arr.length - 1) {
            i = 0;
            arr = SHA256(arr[i].toString()).words;
        }
        return (arr[i++] >>> 0) / (2 ** 32);
    };
}
