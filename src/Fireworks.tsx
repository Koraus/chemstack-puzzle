import { cx, css } from "@emotion/css";
import { JSX } from "preact";
import { useRef, useEffect } from "preact/hooks";
import { animate, linear } from "popmotion";
import { vec2 } from "gl-matrix";
import { tuple } from "./utils/tuple";

function randNormal(): number {
    const { random, sqrt, log, cos, PI } = Math;

    let u = 0, v = 0;
    do { u = random(); } while (u === 0) // Converting [0,1) to (0,1)
    do { v = random(); } while (v === 0) // Converting [0,1) to (0,1)
    let num = sqrt(-2 * log(u)) * cos(2 * PI * v);
    num = num / 10 + 0.5; // Translate to 0 -> 1
    if (num > 1 || num < 0) return randNormal() // resample between 0 and 1
    return num;
}

const vec2_fromPolar = (() => {
    const zero = vec2.zero(vec2.create());
    return (out: vec2, rad: number, len = 1) => {
        vec2.set(out, len, 0);
        vec2.rotate(out, out, zero, rad);
        return out;
    };
})();


const createEffect = ({
    particlesCount = 100,
    gravity = tuple(0, 3),
    dragFactor = 3,
    speedMax = 5,
    createParticleView = () => {
        const el = document.createElement('div');
        el.style.position = "absolute";
        el.style.width = "0.7vmax";
        el.style.aspectRatio = "1 / 1";
        el.style.borderRadius = "50%";
        return el;
    },
}: {
    particlesCount?: number,
    gravity?: [number, number],
    dragFactor?: number,
    speedMax?: number,
    createParticleView?: () => HTMLElement,
} = {}) => {
    const rootEl = document.createElement('div');
    rootEl.style.position = "relative";
    rootEl.style.width = "100%";
    rootEl.style.height = "100%";

    const opacityDegradationSpeed = 1;

    const startPosition = vec2.create();

    let rootElWidth = 0;
    const particles = Array.from({ length: particlesCount }, () => {
        const position = vec2.create();
        const velocity = vec2.create();
        const drag = tuple(0, 0);
        const force = tuple(0, 0);
        let opacity = 1;
        const el = createParticleView();
        return ({
            init() {
                rootEl.append(el);
            },
            reset() {
                vec2.copy(position, startPosition);
                vec2_fromPolar(velocity,
                    Math.random() * Math.PI * 2,
                    Math.random() * speedMax,
                );
                opacity = 1;
                el.style.backgroundColor = `hsl(${Math.random() * 360}, 100%, 50%)`;
            },
            update(dt: number) {
                vec2.scaleAndAdd(position, position, velocity, dt);

                vec2.scale(drag, velocity, -dragFactor * vec2.len(velocity));
                vec2.add(force, gravity, drag);
                vec2.scaleAndAdd(velocity, velocity, force, dt);

                opacity -= opacityDegradationSpeed * dt;
            },
            render() {
                el.style.translate = `${position[0] * rootElWidth}px ${position[1] * rootElWidth}px`;
                el.style.opacity = opacity.toString();
            },
            destroy() {
                el.remove();
            },
        });
    });

    return {
        el: rootEl,
        init() {
            for (const particle of particles) {
                particle.init();
            }
        },
        reset() {
            vec2.set(startPosition,
                randNormal(),
                randNormal() * rootEl.clientHeight / rootEl.clientWidth,
            );
            for (const particle of particles) {
                particle.reset();
            }
        },
        update(dt: number) {
            for (const particle of particles) {
                particle.update(dt);
            }
        },
        render() {
            rootElWidth = rootEl.clientWidth; // performance critical
            for (const particle of particles) {
                particle.render();
            }
        },
        destroy() {
            for (const particle of particles) {
                particle.destroy();
            }
        },
    }
};

function effectAnimation(
    effect: {
        init: () => void,
        reset: () => void,
        update: (dt: number) => void,
        render: () => void,
        destroy: () => void,
    },
    {
        duration
    }: {
        duration: number
    }
) {
    let lastLatest = 0;
    return {
        to: [0, duration],
        duration,
        ease: linear,
        onPlay() {
            effect.init();
            effect.reset();
            lastLatest = 0;
        },
        onRepeat() {
            effect.reset();
            lastLatest = 0;
        },
        onUpdate(latest: number) {
            const dt = latest - lastLatest;
            effect.update(dt / 1000);
            effect.render();
            lastLatest = latest;
        },
        onStop() {
            effect.destroy();
        }
    };
}

export function Fireworks
    ({
        className, duration, ...props
    }: {
        className?: string;
        duration: number;
        style?: JSX.CSSProperties;
    }) {
    const ref = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (!ref.current) { return; }
        const refEl = ref.current;

        const effect = createEffect();
        refEl.appendChild(effect.el);

        const { stop } = animate({
            ...effectAnimation(effect, { duration }),
            repeat: Infinity,
        });

        return () => {
            stop();
            refEl.removeChild(effect.el);
        }
    }, [ref.current, duration]);

    return <div
        ref={ref}
        className={cx(css`& { width: 100%; height: 100%; }`, className)}
        {...props}
    >

    </div>
}
