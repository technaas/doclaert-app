# DocAlert branding assets

| File | Usage |
|------|--------|
| `docalert-logo.png` | Full lockup (icon + wordmark + tagline) for login/splash loading |
| `docalert-mark.png` | Icon-only mark for headers |
| `icon.png` | iOS/Android app icon |
| `splash-icon.png` | Native splash screen (white background in `app.json`) |
| `android-icon-foreground.png` | Android adaptive icon foreground |
| `android-icon-background.png` | Android adaptive icon background |
| `android-icon-monochrome.png` | Android themed/monochrome adaptive icon |
| `favicon.png` | Expo web favicon |

Replace these files with higher-resolution production artwork (1024×1024 recommended for `icon.png`).

After replacing icons or splash assets, rebuild the native app:

```bash
npx expo prebuild --clean
```
