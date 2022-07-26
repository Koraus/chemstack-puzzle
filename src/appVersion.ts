import buildTime from '~build/time';
import { abbreviatedSha as buildGitRevSha } from '~build/info';
export const appVersion = `0.1a.${+buildTime}.${buildGitRevSha}+${import.meta.env.MODE}`;
console.log("appVersion", appVersion);
