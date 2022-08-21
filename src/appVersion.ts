import buildTime from '~build/time';
import { abbreviatedSha as buildGitRevSha } from '~build/info';

const biuldVersion = buildTime.toISOString().replaceAll(/[^0-9ZT]/g, "");
export const appVersion = `0.2f.${biuldVersion}.${buildGitRevSha}`
    + (import.meta.env.PROD ? "" : ("+" + import.meta.env.MODE));
console.log("appVersion", appVersion);