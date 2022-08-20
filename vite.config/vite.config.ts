import { defineConfig } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";
import BuildInfo from 'vite-plugin-info';
import preact from "@preact/preset-vite";
import svgr from 'vite-plugin-svgr';
import { injectSlots, prefixIds } from "./svgr-utils";


export default defineConfig({
    build: {
        minify: false,
    },
    plugins: [
        preact({ 
            devtoolsInProd: true,
            babel: {
                plugins: ["@emotion/babel-plugin"],
            },
        }),
        BuildInfo(),
        svgr({
            svgrOptions: {
                template: (variables, { tpl }) => {
                    const { jsx } = variables;
                    injectSlots(jsx, tpl);
                    prefixIds(jsx, tpl);
                    
                    // dafault template 
                    // https://github.com/gregberge/svgr/blob/16664327ab3f039677c7651057e3538b2e1c5ae6/packages/babel-plugin-transform-svg-component/src/defaultTemplate.ts
                    return tpl` 
                        ${variables.imports};
                        
                        ${variables.interfaces};
                        
                        const ${variables.componentName} = (${variables.props}) => (
                        ${variables.jsx}
                        );
                        
                        ${variables.exports};
                    `;
                },
            }
        }),
        viteSingleFile(),
        {
            name: "clean up svgr-ed svgs",
            generateBundle(_, bundle) {
                const svgsToCleanUp = [
                    'src/tube.svg'
                ];

                for (const name of svgsToCleanUp) {
                    const key = Object.entries(bundle)
                        .find(([key, asset]) => asset.name === name)?.[0];
                    if (key) {
                        delete bundle[key];
                        console.log(
                            "clean up svgr-ed svgs:", 
                            key, "removed from bundle");
                    } else {
                        console.log(
                            "clean up svgr-ed svgs:", 
                            name, "not found in bundle");
                    }
                }
            },
        }
    ],
    server: {
        port: 3685,
    },
    base: "./",
});