# DocAlert branding assets

| File | Usage |
|------|--------|
| `docalert-logo.png` | In-app logo (`DocAlertLogo` component) |
| `icon.png` | iOS/Android app icon |
| `splash-icon.png` | Native splash screen (white background in `app.json`) |
| `android-icon-foreground.png` | Android adaptive icon foreground |
| `favicon.png` | Web favicon |

Replace these files with higher-resolution production artwork (1024×1024 recommended for `icon.png`).

After replacing icons or splash assets, rebuild the native app:

```bash
npx expo prebuild --clean
```
