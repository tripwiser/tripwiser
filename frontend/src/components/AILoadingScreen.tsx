import React, { useEffect } from 'react';
import { View, Text, Modal } from 'react-native';
import LottieView from 'lottie-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { 
  FadeIn, 
  FadeInDown, 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming,
  interpolate,
} from 'react-native-reanimated';

interface AILoadingScreenProps {
  visible: boolean;
  title?: string;
  subtitle?: string;
  onClose?: () => void;
}

export default function AILoadingScreen({ 
  visible, 
  title = "Creating your list...", 
  subtitle = "Getting things ready for your trip",
  onClose 
}: AILoadingScreenProps) {
  const progress = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      // Start progress animation
      progress.value = withRepeat(
        withTiming(1, { duration: 3000 }),
        -1,
        false
      );
    }
  }, [visible]);

  const progressStyle = useAnimatedStyle(() => {
    return {
      width: `${interpolate(progress.value, [0, 1], [0, 100])}%`,
    };
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={{ 
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)', 
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
        zIndex: 9999
      }}>
        <Animated.View 
          entering={FadeIn.duration(300)}
          style={{
            backgroundColor: 'white',
            borderRadius: 24,
            padding: 32,
            alignItems: 'center',
            width: '100%',
            maxWidth: 400,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 12,
            elevation: 8,
          }}
        >
          {/* Lottie Animation */}
          <View style={{ 
            width: 128, 
            height: 128, 
            marginBottom: 24, 
            alignItems: 'center', 
            justifyContent: 'center'
          }}>
            <LottieView
              source={require('../../assets/animations/Animation - 1751816551012.json')}
              autoPlay
              loop
              style={{ width: '100%', height: '100%' }}
            />
          </View>

          {/* Title */}
          <Animated.View entering={FadeInDown.delay(200).duration(500)}>
            <Text className="text-xl font-bold text-gray-900 text-center mb-2">
              {title}
            </Text>
          </Animated.View>

          {/* Subtitle */}
          <Animated.View entering={FadeInDown.delay(400).duration(500)}>
            <Text className="text-gray-600 text-center text-base leading-5">
              {subtitle}
            </Text>
          </Animated.View>

          {/* Progress Indicator */}
          <Animated.View 
            entering={FadeInDown.delay(600).duration(500)}
            className="mt-6 w-full"
          >
            <View className="bg-gray-200 rounded-full h-2 overflow-hidden">
              <Animated.View style={progressStyle}>
                <LinearGradient
                  colors={['#4F46E5', '#6366F1', '#8B5CF6']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{
                    height: '100%',
                    borderRadius: 8,
                  }}
                />
              </Animated.View>
            </View>
          </Animated.View>

          {/* AI Processing Text */}
          <Animated.View entering={FadeInDown.delay(800).duration(500)}>
            <Text className="text-sm text-gray-500 text-center mt-4">
              AI is analyzing your trip details...
            </Text>
          </Animated.View>
        </Animated.View>
      </View>
    </Modal>
  );
} 