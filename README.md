## Upgrading

- `npx expo install expo@^51.0.0 --fix` to fix expo and it's dependencies to latest
- `npx expo-doctor@latest` to verify for any issues
- `npx expo install --check` to upgrade deps

# To Try Beta
- `npx expo@next install --fix` run this
- `npx expo prebuild --clean` clean the build
- `yarn ios` run the iOS app

# Build for Production

- `eas build --platform ios --profile production --local` to build for iOS production
- `eas build --platform android --profile production --local` to build for Android production
