export const themeIds = ['yokohama', 'green-expo'] as const;
export type ThemeId = (typeof themeIds)[number];
export type ThemeConfig = {
  defaultTheme: ThemeId;
  override: ThemeId | null;
  seasons: { theme: ThemeId; startsAt: string; endsAt: string; enabled: boolean }[];
};
export const themeConfig: ThemeConfig = {
  defaultTheme: 'yokohama',
  override: null,
  seasons: [
    {
      theme: 'green-expo',
      startsAt: '2027-03-19T00:00:00+09:00',
      endsAt: '2027-09-27T00:00:00+09:00',
      enabled: true,
    },
  ],
};
export const themeColors: Record<ThemeId, string> = {
  yokohama: '#0067a6',
  'green-expo': '#286544',
};
// Self-contained: this function is also embedded in the HTML head before the first paint.
export function resolveTheme(config: ThemeConfig, now: number): ThemeId {
  if (config.override) return config.override;
  return (
    config.seasons.find(
      (season) =>
        season.enabled && now >= Date.parse(season.startsAt) && now < Date.parse(season.endsAt),
    )?.theme ?? config.defaultTheme
  );
}
