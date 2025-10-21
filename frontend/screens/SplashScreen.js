import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Animated,
  Dimensions,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const SplashScreen = ({ onAnimationFinish }) => {
  const logoFadeAnim = useRef(new Animated.Value(0)).current;
  const logoScaleAnim = useRef(new Animated.Value(0.5)).current;
  const logoBounceAnim = useRef(new Animated.Value(0)).current;
  const titleSlideAnim = useRef(new Animated.Value(100)).current;
  const titleFadeAnim = useRef(new Animated.Value(0)).current;
  const dotAnim1 = useRef(new Animated.Value(0)).current;
  const dotAnim2 = useRef(new Animated.Value(0)).current;
  const dotAnim3 = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const circleAnim1 = useRef(new Animated.Value(0)).current;
  const circleAnim2 = useRef(new Animated.Value(0)).current;
  const circleAnim3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Staggered animation sequence
    const animationSequence = Animated.sequence([
      // Logo entrance with bounce
      Animated.parallel([
        Animated.timing(logoFadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.spring(logoScaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.spring(logoBounceAnim, {
          toValue: 1,
          tension: 80,
          friction: 6,
          useNativeDriver: true,
        }),
      ]),
      
      // Title slide in
      Animated.parallel([
        Animated.timing(titleSlideAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(titleFadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
      
      // Loading dots animation
      Animated.stagger(200, [
        Animated.timing(dotAnim1, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(dotAnim2, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(dotAnim3, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
      
      // Decorative circles animation
      Animated.stagger(300, [
        Animated.timing(circleAnim1, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(circleAnim2, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(circleAnim3, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
    ]);

    // Start the sequence
    animationSequence.start();

    // Continuous pulse animation
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    pulseAnimation.start();

    // Auto navigate after animation
    const timer = setTimeout(() => {
      onAnimationFinish();
    }, 4000);

    return () => {
      clearTimeout(timer);
      pulseAnimation.stop();
    };
  }, []);

  const logoBounceInterpolate = logoBounceAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -20],
  });

  const logoAnimatedStyle = {
    opacity: logoFadeAnim,
    transform: [
      { scale: logoScaleAnim },
      { translateY: logoBounceInterpolate },
    ],
  };

  const titleAnimatedStyle = {
    opacity: titleFadeAnim,
    transform: [{ translateY: titleSlideAnim }],
  };

  const pulseStyle = {
    transform: [{ scale: pulseAnim }],
  };

  return (
    <LinearGradient
      colors={['#2E7D32', '#4CAF50', '#66BB6A']}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" backgroundColor="#2E7D32" />
      
      <View style={styles.content}>
        {/* Logo Container with Pulse Effect */}
        <Animated.View style={[styles.logoContainer, logoAnimatedStyle]}>
          <Animated.View style={pulseStyle}>
            <Image
              source={require('../assets/UEE_Logo-removebg-preview.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </Animated.View>
        </Animated.View>

        {/* App Title */}
        <Animated.View style={[styles.titleContainer, titleAnimatedStyle]}>
          <Text style={styles.appTitle}>Food Traceability</Text>
          <Text style={styles.appSubtitle}>Transparent • Trusted • Traceable</Text>
        </Animated.View>

        {/* Loading Indicator with Staggered Animation */}
        <View style={styles.loadingContainer}>
          <View style={styles.loadingDots}>
            <Animated.View style={[styles.dot, { opacity: dotAnim1 }]} />
            <Animated.View style={[styles.dot, { opacity: dotAnim2 }]} />
            <Animated.View style={[styles.dot, { opacity: dotAnim3 }]} />
          </View>
        </View>
      </View>

      {/* Bottom decorative elements with animation */}
      <View style={styles.bottomDecoration}>
        <Animated.View style={[styles.decorativeCircle, { opacity: circleAnim1 }]} />
        <Animated.View style={[styles.decorativeCircle, styles.circle2, { opacity: circleAnim2 }]} />
        <Animated.View style={[styles.decorativeCircle, styles.circle3, { opacity: circleAnim3 }]} />
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  logoContainer: {
    marginBottom: 40,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  logo: {
    width: width * 0.4,
    height: width * 0.4,
    maxWidth: 200,
    maxHeight: 200,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  appSubtitle: {
    fontSize: 16,
    color: '#E8F5E8',
    textAlign: 'center',
    fontWeight: '300',
    letterSpacing: 1,
  },
  loadingContainer: {
    alignItems: 'center',
  },
  loadingDots: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
    marginHorizontal: 4,
    opacity: 0.7,
  },
  bottomDecoration: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    paddingBottom: 20,
  },
  decorativeCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  circle2: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  circle3: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
});

export default SplashScreen;
