import buildTime from '~build/time';
import { abbreviatedSha as buildGitRevSha } from '~build/info';

const biuldTimeStr = buildTime.toISOString().replaceAll(/[^0-9ZT]/g, "");
export const appVersion = `0.3.0-alpha+${biuldTimeStr}-${buildGitRevSha}`
    + (import.meta.env.PROD ? "" : ("-" + import.meta.env.MODE));
console.log("appVersion", appVersion);