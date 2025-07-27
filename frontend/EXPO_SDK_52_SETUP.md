# Expo SDK 52 Setup Guide

## Overview
This guide will help you set up the TripWiser app to work with Expo SDK 52 and Expo Go.

## Changes Made for SDK 52 Compatibility

### 1. React Native Version
- **Before**: React Native 0.79.5
- **After**: React Native 0.76.3 (compatible with Expo SDK 52)

### 2. New Architecture
- **Disabled**: `newArchEnabled: false` in app.json
- **Reason**: New Architecture is not fully supported in Expo Go

### 3. Removed Custom Patches
- Removed React Native patch file that was causing compatibility issues
- Removed `patchedDependencies` from package.json

### 4. Updated Configuration Files
- **babel.config.js**: Added Reanimated plugin and Hermes stable profile
- **metro.config.js**: Added platform resolver configuration
- **app.json**: Added necessary plugins and disabled new architecture

## Setup Instructions

### Step 1: Clean Installation
Run one of these commands based on your OS:

**Windows:**
```bash
clean-install.bat
```

**macOS/Linux:**
```bash
chmod +x clean-install.sh
./clean-install.sh
```

**Manual (if scripts don't work):**
```bash
# Remove existing dependencies
rm -rf node_modules
rm -f package-lock.json
rm -f yarn.lock

# Clear Expo cache
npx expo install --fix
```

### Step 2: Install Dependencies
```bash
npm install
# or
yarn install
```

### Step 3: Start Development Server
```bash
npx expo start
```

### Step 4: Run on Expo Go
1. Install Expo Go on your device
2. Scan the QR code from the terminal
3. The app should now work properly

## Troubleshooting

### Common Issues

#### 1. Metro Bundler Errors
```bash
npx expo start --clear
```

#### 2. Dependency Conflicts
```bash
npx expo install --fix
```

#### 3. Cache Issues
```bash
npx expo start --clear
# or
npx expo r -c
```

#### 4. Font Loading Issues
- Ensure fonts are properly placed in `assets/fonts/`
- Check font file names match the require statements

#### 5. Navigation Issues
- Ensure all navigation dependencies are properly installed
- Check for version conflicts in package.json

### Development vs Production

#### Development (Expo Go)
- Use `npx expo start` for development
- Works with Expo Go app
- Limited to Expo SDK APIs

#### Production (Custom Build)
- Use `npx expo run:android` or `npx expo run:ios`
- Requires custom development build
- Can use native modules and new architecture

## Key Features Working in Expo Go

✅ **Navigation**: React Navigation v7
✅ **Styling**: NativeWind (Tailwind CSS)
✅ **Animations**: React Native Reanimated
✅ **Icons**: Expo Vector Icons
✅ **Fonts**: Expo Font
✅ **Storage**: AsyncStorage
✅ **Maps**: React Native Maps
✅ **Lottie**: Lottie React Native
✅ **HTTP**: Axios
✅ **State Management**: Zustand

## Known Limitations in Expo Go

❌ **New Architecture**: Not supported
❌ **Custom Native Modules**: Limited support
❌ **Some Advanced Features**: May require custom builds

## Next Steps

1. Test all features in Expo Go
2. Report any issues
3. For production builds, consider using EAS Build
4. Enable new architecture for custom builds when needed

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Clear cache and reinstall dependencies
3. Ensure you're using the latest Expo Go version
4. Check Expo documentation for SDK 52 specific issues 