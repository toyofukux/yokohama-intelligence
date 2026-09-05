export const themeIds = ['yokohama', 'yokohama-night', 'green-expo'] as const;
export type ThemeId = (typeof themeIds)[number];
export type ThemeConfig = {
  defaultTheme: ThemeId;
  override: ThemeId | null;
  nightEnabled: boolean;
  seasons: { theme: ThemeId; startsAt: string; endsAt: string; enabled: boolean }[];
};
export const themeConfig: ThemeConfig = {
  defaultTheme: 'yokohama',
  override: null,
  nightEnabled: true,
  seasons: [
    {
      theme: 'green-expo',
      startsAt: '2027-03-19T00:00:00+09:00',
      endsAt: '2027-09-27T00:00:00+09:00',
      enabled: false,
    },
  ],
};
export const themeColors: Record<ThemeId, string> = {
  yokohama: '#0067a6',
  'yokohama-night': '#091b2d',
  'green-expo': '#286544',
};
// Self-contained: this function is also embedded in the HTML head before the first paint.
export function resolveTheme(
  config: ThemeConfig,
  now: number,
  sun = yokohamaSunTimes(now),
): ThemeId {
  if (config.override) return config.override;
  const season = config.seasons.find(
    (season) =>
      season.enabled && now >= Date.parse(season.startsAt) && now < Date.parse(season.endsAt),
  )?.theme;
  if (season) return season;
  if (config.nightEnabled && (now < sun.sunrise || now >= sun.sunset)) return 'yokohama-night';
  return config.defaultTheme;
}

// NOAA fractional-year approximation. Fixed Yokohama location, JST calendar date.
// Self-contained for use before first paint; no API or visitor location required.
export function yokohamaSunTimes(now: number): { sunrise: number; sunset: number } {
  const dayMs = 86400000;
  const jst = new Date(now + 9 * 3600000);
  const year = jst.getUTCFullYear();
  const date = Date.UTC(year, jst.getUTCMonth(), jst.getUTCDate());
  const day = (date - Date.UTC(year, 0, 1)) / dayMs;
  const days = (Date.UTC(year + 1, 0, 1) - Date.UTC(year, 0, 1)) / dayMs;
  const rad = Math.PI / 180;
  const latitude = 35.45 * rad;
  const longitude = 139.65;
  const event = (rising: boolean) => {
    let hour = rising ? 6 : 18;
    let minutes = 0;
    for (let i = 0; i < 3; i++) {
      const gamma = ((2 * Math.PI) / days) * (day + (hour - 12) / 24);
      const eq =
        229.18 *
        (0.000075 +
          0.001868 * Math.cos(gamma) -
          0.032077 * Math.sin(gamma) -
          0.014615 * Math.cos(2 * gamma) -
          0.040849 * Math.sin(2 * gamma));
      const decl =
        0.006918 -
        0.399912 * Math.cos(gamma) +
        0.070257 * Math.sin(gamma) -
        0.006758 * Math.cos(2 * gamma) +
        0.000907 * Math.sin(2 * gamma) -
        0.002697 * Math.cos(3 * gamma) +
        0.00148 * Math.sin(3 * gamma);
      const angle =
        Math.acos(
          Math.cos(90.833 * rad) / (Math.cos(latitude) * Math.cos(decl)) -
            Math.tan(latitude) * Math.tan(decl),
        ) / rad;
      minutes = 720 - 4 * (longitude + (rising ? angle : -angle)) - eq;
      hour = minutes / 60 + 9;
    }
    return date + minutes * 60000;
  };
  return { sunrise: event(true), sunset: event(false) };
}
