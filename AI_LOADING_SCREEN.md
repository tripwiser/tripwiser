# AI Loading Screen Feature

## Overview
This feature adds a beautiful loading screen with Lottie animation that appears when AI is generating content in the app.

## Components

### AILoadingScreen
A reusable modal component that displays:
- Lottie animation (rotating sparkles)
- Customizable title and subtitle
- Animated progress bar
- AI processing status text

## Usage

### Basic Usage
```tsx
import AILoadingScreen from '../components/AILoadingScreen';

<AILoadingScreen
  visible={isLoading}
  title="Creating your list..."
  subtitle="Getting things ready for your trip"
/>
```

### Custom Messages
```tsx
<AILoadingScreen
  visible={isCreating}
  title="Creating your template..."
  subtitle="AI is generating smart packing suggestions"
/>
```

## Implementation Locations

The AI loading screen has been integrated into:

1. **QuickTripSetupScreen** - When "Create Trip & Start Packing" button is clicked, shows until packing list is generated
2. **TripSetupScreen** - When creating new trips with AI-generated packing lists
3. **SmartTemplateSetupScreen** - When creating AI-powered packing templates

## Features

- **Smooth Animations**: Uses React Native Reanimated for smooth transitions
- **Lottie Integration**: Beautiful animated sparkles icon
- **Progress Indicator**: Animated progress bar with gradient colors
- **Customizable**: Easy to customize title and subtitle text
- **Modal Design**: Overlay modal that doesn't interfere with navigation

## Assets

- **Lottie Animation**: `assets/animations/Animation - 1751816551012.json`
  - Custom loading animation provided by user
  - Smooth and engaging animation
  - Matches app design theme

## Technical Details

- Uses `lottie-react-native` for animations
- Implements `react-native-reanimated` for smooth transitions
- Responsive design with Tailwind CSS classes
- TypeScript support with proper interfaces

## Future Enhancements

- Add more Lottie animation options
- Implement different animation styles for different AI operations
- Add sound effects (optional)
- Add haptic feedback 