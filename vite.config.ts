import { defineConfig } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";
import BuildInfo from 'vite-plugin-info';
import preact from "@preact/preset-vite";

export default defineConfig({
    plugins: [
        preact({ devtoolsInProd: true }),
        viteSingleFile(),
        BuildInfo(),
    ],
    server: {
        port: 3685,
    },
    base: "./",
});