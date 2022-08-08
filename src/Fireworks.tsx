import { cx, css, keyframes } from "@emotion/css";
import { JSX } from "preact";

// Inspired by https://codepen.io/yshlin/pen/WNMmQX

const particlesCount = 50;
const width = 500;
const height = 500;

const particlesFadeout = Array.from(
    { length: particlesCount }, 
    () => `0 0 #fff`).join(",");

const gravity = keyframes`
    to {
        transform: translateY(200px);
        opacity: 0;
    }
`;

const generatePosition = () => keyframes`
    ${Array.from({ length: 5 }, (_, i) => `
        ${i * 20}%, ${i * 20 + 20 - 0.1}% {
            top: ${Math.random() * 100}%;
            left: ${Math.random() * 100}%;
        }
    `).join("\n")}
`;

const positions = [
    generatePosition(),
    generatePosition(),
    generatePosition(),
]

const generateParticles = () => Array.from(
    { length: particlesCount }, 
    () => `
        ${Math.random() * width - width / 2}px
        ${Math.random() * height - height / 1.2}px
        hsl(${Math.random() * 360}, 100%, 50%)
    `).join(",");
const bangs = [
    keyframes`to { box-shadow: ${generateParticles()}; }`,
    keyframes`to { box-shadow: ${generateParticles()}; }`,
    keyframes`to { box-shadow: ${generateParticles()}; }`,
];

function Firework({
    period = 1, variant = 0, className, ...props
}: {
    period?: number;
    variant?: number;
    className?: string;
    style?: JSX.CSSProperties;
}) {
    return <div {...props} className={cx(css`& {
      position: absolute;
      width: 5px;
      height: 5px;
      border-radius: 50%;
      box-shadow: ${particlesFadeout};
      animation: 
        ${period * 1}s ${bangs[variant]} ease-out infinite backwards,
        ${period * 1}s ${gravity} ease-in infinite backwards, 
        ${period * 5}s ${positions[variant]} linear infinite backwards;
    }`, className)} />
}

export function Fireworks({
    className, ...props
}: {
    className?: string;
    style?: JSX.CSSProperties;
}) {
    return <div {...props} className={cx(css`& {
    }`, className)} >
        <Firework variant={0} />
        <Firework period={1.25} variant={1} className={cx(css`& {
            animation-delay: 1.25s, 1.25s, 1.25s;
        }`)} />
    </div>
}
