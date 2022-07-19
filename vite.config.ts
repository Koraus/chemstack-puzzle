import { defineConfig } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";
import preact from "@preact/preset-vite";

export default defineConfig({
    plugins: [
        preact({ devtoolsInProd: true }),
        viteSingleFile(),
    ],
    server: {
        port: 3685,
    },
    base: "./",
});