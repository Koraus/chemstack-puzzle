export function getOriginCoords(
    el: SVGSVGElement,
    anchor: [number, number] = [0.5, 0.5],
) {
    const bbox = el.getBBox();
    const origin = [
        bbox.x + bbox.width * (anchor[0] ?? 0.5),
        bbox.y + bbox.height * (anchor[1] ?? 0.5),
    ] as [number, number];
    return origin;
}