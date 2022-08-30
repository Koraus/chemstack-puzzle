import types, { JSXElement, JSXAttribute, Statement } from '@babel/types';
import { TemplateBuilder } from '@babel/template';
import css from 'css';

type Tpl = TemplateBuilder<Statement | Statement[]>['ast'];

function* traverseJSXElementTree(el: JSXElement): Iterable<JSXElement> {
    for (const childEl of el.children) {
        if (childEl.type === 'JSXElement') {
            yield* traverseJSXElementTree(childEl);
        }
    }
    yield el;
};

export const injectSlots = (jsx: JSXElement, tpl: Tpl) => {
    for (const el of traverseJSXElementTree(jsx)) {
        if (el.openingElement.name.type !== 'JSXIdentifier') { continue; }
        const idAttr = el.openingElement.attributes
            .find((attr): attr is JSXAttribute =>
                attr.type === 'JSXAttribute'
                && attr.name.name === "id");
        if (!idAttr) { continue; }
        if (!idAttr.value) { continue; }
        if (idAttr.value.type !== "StringLiteral") { continue; }
        const id = idAttr.value.value;

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

        const slotFrag = tpl`<>{props.slots?.["${id}"]}</>`;
        // @ts-ignore 
        el.children.push(slotFrag.expression.children[0]);
    }
}

export const prefixIds = (jsx: JSXElement, tpl: Tpl) => {
    // add conditinal prefixes into css-style selectors and url(#...)
    for (const el of traverseJSXElementTree(jsx)) {
        if (el.openingElement.name.type !== "JSXIdentifier") { continue; }
        if (el.openingElement.name.name !== "style") { continue; }
        if ((el.children?.length ?? 0) < 1) { continue; }
        const strExprCntr = el.children[0];
        if (strExprCntr.type !== "JSXExpressionContainer") { continue; }
        if (strExprCntr.expression.type !== "StringLiteral") { continue; }

        const str = strExprCntr.expression.value;
        const parsed = css.parse(str);
        if (!parsed.stylesheet) { continue; }

        for (const rule of parsed.stylesheet.rules) {
            if (!("selectors" in rule) || !rule.selectors) { continue; }
            for (let i = 0; i < rule.selectors.length; i++) {
                rule.selectors[i] = "#__id_placeholder_cec1ab__" + rule.selectors[i];

                if (rule.declarations) {
                    for (var d of rule.declarations) {
                        if ("value" in d && d.value) {
                            d.value = d.value.replace(
                                "url(#",
                                "url(#__id_placeholder1_cec1ab__",);
                        }
                    }
                }
            }
        }

        const recomplied = css.stringify(parsed, { compress: true })
            .replaceAll(
                "#__id_placeholder_cec1ab__",
                "${props.id ? ('#' + props.id + ' ') : ''}")
            .replaceAll(
                "__id_placeholder1_cec1ab__",
                "${props.id ? (props.id + '_') : ''}");

        // @ts-ignore 
        el.children[0] = tpl(`<>{\`${recomplied}\`}</>`).expression.children[0];
    }

    // add conditinal prefixes into xlink:href
    for (const el of traverseJSXElementTree(jsx)) {
        if (el.openingElement.name.type !== 'JSXIdentifier') { continue; }
        const xlinkHrefAttr = el.openingElement.attributes
            .find((attr): attr is JSXAttribute =>
                attr.type === 'JSXAttribute'
                && attr.name.name === "xlinkHref");
        if (!xlinkHrefAttr) { continue; }
        if (!xlinkHrefAttr.value) { continue; }
        if (xlinkHrefAttr.value.type !== "StringLiteral") { continue; }
        const xlinkHref = xlinkHrefAttr.value.value;
        if (!xlinkHref.startsWith("#")) { continue; }

        const hostCtnr = tpl`<g xlinkHref={(props.id ? (props.id + '_') : '') + '${xlinkHref.substring(1)}'} />`;
        // @ts-ignore 
        xlinkHrefAttr.value = hostCtnr.expression.openingElement.attributes[0].value;
    }

    // add conditinal prefixes into id, move original id into class
    for (const el of traverseJSXElementTree(jsx)) {
        if (el.openingElement.name.type !== 'JSXIdentifier') { continue; }
        const idAttr = el.openingElement.attributes
            .find((attr): attr is JSXAttribute =>
                attr.type === 'JSXAttribute'
                && attr.name.name === "id");
        if (!idAttr) { continue; }
        if (!idAttr.value) { continue; }
        if (idAttr.value.type !== "StringLiteral") { continue; }
        const id = idAttr.value.value;

        const hostCtnr = tpl`<g id={(props.id ? (props.id + '_') : '') + '${id}'} />`;
        // @ts-ignore 
        idAttr.value = hostCtnr.expression.openingElement.attributes[0].value;


        const classAttr = el.openingElement.attributes
            .find((attr): attr is JSXAttribute =>
                attr.type === 'JSXAttribute'
                && attr.name.name === "className");

        if (classAttr) {
            if (!classAttr.value) { throw "Cannot retrieve class"; }
            if (classAttr.value.type !== "StringLiteral") { throw "Cannot retrieve class"; }
            const className = classAttr.value.value;

            const hostCtnr1 = tpl(`<g className={(props.id ? '${id} ' : '') + '${className}'} />`);

            // @ts-ignore 
            classAttr.value = hostCtnr1.expression.openingElement.attributes[0].value;
        } else {
            const hostCtnr1 = tpl(`<g className={(props.id ? ('${id} ') : '')} />`);
            // @ts-ignore 
            el.openingElement.attributes.push(hostCtnr1.expression.openingElement.attributes[0]);
        }
    }
}