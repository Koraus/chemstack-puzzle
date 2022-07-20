import { atom, DefaultValue, useRecoilTransaction_UNSTABLE, useRecoilValue } from "recoil";
import { craftingActionsRecoil } from "./CraftingTable";
import { apipe } from "./utils/apipe";
import * as it from "./utils/it";
import { useEffect, useRef } from "preact/hooks";
import { levelPresets } from "./levelPresets";
type CSSProperties = import("preact").JSX.CSSProperties;

export const levelPresetRecoil = atom({
    key: "levelPreset",
    default: levelPresets[0],
});

export const gameProgressState = atom({
    key: "gameProgress",
    default: {} as Record<string, boolean>,
    effects: [({ node, setSelf, onSet }) => {
        const key = node.key;
        const savedValue = localStorage.getItem(key)
        if (savedValue != null) {
            const __DEBUG_setAllLevels = false && import.meta.env.DEV;

            if (__DEBUG_setAllLevels) {
                setSelf(Object.fromEntries(apipe(levelPresets,
                    it.map(p => [p.name, true] as const),
                )));
            } else {
                setSelf(JSON.parse(savedValue));
            }
        }

        onSet((newValue, _, isReset) => {
            isReset
                ? localStorage.removeItem(key)
                : localStorage.setItem(key, JSON.stringify(newValue));
        });
    }],
});


export function LoadHighestLevelEffect() {
    const gameProgress = useRecoilValue(gameProgressState);
    const setLevelPreset = useRecoilTransaction_UNSTABLE(({ get, set }) => (lp: typeof levelPresets[0]) => {
        set(levelPresetRecoil, lp);
        set(craftingActionsRecoil, []);
    });

    useEffect(() => {
        const highestProgressedIndex = Object.keys(gameProgress)
            .map(name => levelPresets.findIndex(x => x.name === name))
            .sort((a, b) => b - a)[0] ?? -1;
        setLevelPreset(levelPresets[Math.min(
            highestProgressedIndex + 1,
            levelPresets.length - 1)]);
    }, []);

    return <></>;
}

export function LevelList({ style }: { style?: CSSProperties }) {
    const gameProgress = useRecoilValue(gameProgressState);
    const currentLevelPreset = useRecoilValue(levelPresetRecoil);
    const setLevelPreset = useRecoilTransaction_UNSTABLE(({ get, set }) => (lp: typeof currentLevelPreset) => {
        set(levelPresetRecoil, lp);
        set(craftingActionsRecoil, []);
    });
    const resetLevel = useRecoilTransaction_UNSTABLE(({ get, set }) => () => {
        set(levelPresetRecoil, levelPresets[0]);
        set(gameProgressState, {});
        set(craftingActionsRecoil, []);
    });

    const scrollToRef = useRef<HTMLAnchorElement>(null);
    useEffect(
        () => scrollToRef.current?.scrollIntoView({ block: "center" }),
        []);

    return <div>
        <div
            style={{
                overflowY: "scroll",
                height: "140px",
                backgroundColor: "#ffffff20",
                ...style,
            }}
        > {levelPresets.map(levelPreset => {
            const levelPresetIndex = levelPresets.findIndex(x => x.name === levelPreset.name);
            const isCurrent = levelPreset.name === currentLevelPreset.name;
            const isOpen =
                levelPresetIndex === 0
                || (levelPresetIndex > 0 && (levelPresets[levelPresetIndex - 1].name in gameProgress));
            const __DEBUG_allowAnyLevel = true && import.meta.env.DEV;
            return <a
                style={{
                    padding: "3px",
                    display: "block",
                    textDecoration: "none",
                    textTransform: "uppercase",
                    color: "grey",

                    ...(isOpen && {
                        color: "white"
                    }),

                    ...(isCurrent && {
                        backgroundColor: "#ffffff50",
                    }),
                }}
                {...((isOpen || __DEBUG_allowAnyLevel) && {
                    href: "#",
                    onClick: () => setLevelPreset(levelPreset)
                })}
                {...isCurrent && {
                    ref: scrollToRef,
                }}
            >{levelPreset.name}</a>
        })} </div>

        <button
            style={{fontSize:"16px"}}
            onClick={
                () => {
                    confirm('Progress will be lost! Click "Ok" to confirm')
                        &&
                        resetLevel()
                }
            }
        > lvl reset </button>
    </div>
};
