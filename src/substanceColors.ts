export const substanceColors = [
    "#99a9dbff",
    "#fcbc1dff",
    "#41bf74ff",
    "#59cee7ff",
    "#f94f8fff",
    "#8557CEff",
    "#D6413Aff",
    "#F2B92Cff",
    "#6ABC32ff",
    "#C877D0ff",
];

export const rgbToHsl = (rgb: { r: number, g: number, b: number }) => {
    const r = rgb.r / 255;
    const g = rgb.g / 255;
    const b = rgb.b / 255;

    const cmin = Math.min(r, g, b);
    const cmax = Math.max(r, g, b);
    const delta = cmax - cmin;

    const h = (() => {
        if (cmax === b) return (r - g) / delta * 60 + 240;
        if (cmax === g) return (b - r) / delta * 60 + 120;
        return ((g - b) < 0 ? 360 : 0) + (g - b) / delta * 60;
    })();

    return {
        h: h,
        s: (delta == 0 ? 0 : delta / (1 - Math.abs(cmax + cmin - 1))) * 100,
        l: (cmax + cmin) / 2 * 100,
    };
}

export const hexColorToRgb = (hexColor: string) => ({
    r: Number.parseInt(hexColor.substring(1, 3), 16),
    g: Number.parseInt(hexColor.substring(3, 5), 16),
    b: Number.parseInt(hexColor.substring(5, 7), 16),
});

// export const substanceColors = 
//     substanceColors1
//         .map(hexColorToRgb)
//         .map(rgbToHsl)
//         .map(({h, s, l}) => `hsl(${h}, ${s}%, ${l}%)`);
