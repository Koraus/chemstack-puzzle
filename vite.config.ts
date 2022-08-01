import { defineConfig } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";
import BuildInfo from 'vite-plugin-info';
import preact from "@preact/preset-vite";
import svgr from 'vite-plugin-svgr';

function* traverseJSXElementTree(el) {
    for (const childEl of el.children) {
        if (childEl.type === 'JSXElement') {
            yield* traverseJSXElementTree(childEl);
        }
    }
    yield el;
};
const injectSlots = (jsx, tpl) => {
    for (const el of traverseJSXElementTree(jsx)) {
        const id = el.openingElement.attributes.find(attr => attr.name.name === "id")?.value.value;
        if (!id) { continue; }

        if (el.openingElement.selfClosing) {
            el.openingElement.selfClosing = false;
            el.closingElement = {
                type: "JSXClosingElement",
                name: {
                    type: "JSXIdentifier",
                    name: el.openingElement.name.name,
                }
            }
        }
        el.children = el.children ?? [];

        const slotExpr = tpl`<>{props.slots?.${id}}</>`.expression;
        el.children.push(...slotExpr.children);
    }
}

const svgrTemplate = (variables, { tpl }) => {
    injectSlots(variables.jsx, tpl);
    return tpl`
        ${variables.imports};
        
        ${variables.interfaces};
        
        const ${variables.componentName} = (${variables.props}) => (
        ${variables.jsx}
        );
        
        ${variables.exports};
    `;
}

export default defineConfig({
    plugins: [
        preact({ devtoolsInProd: true }),
        viteSingleFile(),
        BuildInfo(),
        svgr({
            svgrOptions: {
                template: svgrTemplate,
            }
        }),
    ],
    server: {
        port: 3685,
    },
    base: "./",
});