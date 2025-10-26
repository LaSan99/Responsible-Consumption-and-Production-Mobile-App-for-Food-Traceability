import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Animated,
  Dimensions,
  StatusBar,
  Easing,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const SplashScreen = ({ onAnimationFinish }) => {
  // Main animations
  const logoFadeAnim = useRef(new Animated.Value(0)).current;
  const logoScaleAnim = useRef(new Animated.Value(0.8)).current;
  const logoRotateAnim = useRef(new Animated.Value(0)).current;
  const logoBounceAnim = useRef(new Animated.Value(0)).current;
  
  // Title animations
  const titleSlideAnim = useRef(new Animated.Value(100)).current;
  const titleFadeAnim = useRef(new Animated.Value(0)).current;
  const titleGlowAnim = useRef(new Animated.Value(0)).current;
  
  // Loading animations
  const dotAnim1 = useRef(new Animated.Value(0)).current;
  const dotAnim2 = useRef(new Animated.Value(0)).current;
  const dotAnim3 = useRef(new Animated.Value(0)).current;
  const dotScaleAnim1 = useRef(new Animated.Value(1)).current;
  const dotScaleAnim2 = useRef(new Animated.Value(1)).current;
  const dotScaleAnim3 = useRef(new Animated.Value(1)).current;
  
  // Background elements
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const circleAnim1 = useRef(new Animated.Value(0)).current;
  const circleAnim2 = useRef(new Animated.Value(0)).current;
  const circleAnim3 = useRef(new Animated.Value(0)).current;
  const circleScale1 = useRef(new Animated.Value(0)).current;
  const circleScale2 = useRef(new Animated.Value(0)).current;
  const circleScale3 = useRef(new Animated.Value(0)).current;
  
  // Particle animations
  const particlesAnim = useRef(new Animated.Value(0)).current;
  const particle1 = useRef(new Animated.Value(0)).current;
  const particle2 = useRef(new Animated.Value(0)).current;
  const particle3 = useRef(new Animated.Value(0)).current;
  const particle4 = useRef(new Animated.Value(0)).current;

  // Food-themed icons animation
  const iconsAnim = useRef(new Animated.Value(0)).current;
  const icon1Anim = useRef(new Animated.Value(0)).current;
  const icon2Anim = useRef(new Animated.Value(0)).current;
  const icon3Anim = useRef(new Animated.Value(0)).current;
  const icon4Anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Complex animation sequence
    const startAnimations = () => {
      // Phase 1: Logo entrance with sophisticated effects
      Animated.parallel([
        // Logo fade and scale with bounce
        Animated.sequence([
          Animated.timing(logoFadeAnim, {
            toValue: 1,
            duration: 800,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.spring(logoScaleAnim, {
            toValue: 1.2,
            tension: 120,
            friction: 8,
            useNativeDriver: true,
          }),
          Animated.spring(logoScaleAnim, {
            toValue: 1,
            tension: 120,
            friction: 8,
            useNativeDriver: true,
          }),
        ]),
        // Logo rotation with subtle effect
        Animated.timing(logoRotateAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        // Logo bounce
        Animated.sequence([
          Animated.spring(logoBounceAnim, {
            toValue: 1,
            tension: 100,
            friction: 6,
            useNativeDriver: true,
          }),
          Animated.spring(logoBounceAnim, {
            toValue: 0,
            tension: 100,
            friction: 6,
            useNativeDriver: true,
          }),
        ]),
      ]).start();

      // Phase 2: Title animation with glow effect
      setTimeout(() => {
        Animated.parallel([
          Animated.timing(titleSlideAnim, {
            toValue: 0,
            duration: 700,
            easing: Easing.out(Easing.back(1.5)),
            useNativeDriver: true,
          }),
          Animated.timing(titleFadeAnim, {
            toValue: 1,
            duration: 700,
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.timing(titleGlowAnim, {
              toValue: 1,
              duration: 800,
              useNativeDriver: true,
            }),
            Animated.timing(titleGlowAnim, {
              toValue: 0.3,
              duration: 1000,
              useNativeDriver: true,
            }),
          ]),
        ]).start();
      }, 600);

      // Phase 3: Loading dots with scale animation
      setTimeout(() => {
        // Dots fade in sequence
        Animated.stagger(200, [
          Animated.parallel([
            Animated.timing(dotAnim1, {
              toValue: 1,
              duration: 400,
              useNativeDriver: true,
            }),
            Animated.loop(
              Animated.sequence([
                Animated.timing(dotScaleAnim1, {
                  toValue: 1.4,
                  duration: 400,
                  useNativeDriver: true,
                }),
                Animated.timing(dotScaleAnim1, {
                  toValue: 1,
                  duration: 400,
                  useNativeDriver: true,
                }),
              ])
            ),
          ]),
          Animated.parallel([
            Animated.timing(dotAnim2, {
              toValue: 1,
              duration: 400,
              useNativeDriver: true,
            }),
            Animated.loop(
              Animated.sequence([
                Animated.timing(dotScaleAnim2, {
                  toValue: 1.4,
                  duration: 400,
                  useNativeDriver: true,
                }),
                Animated.timing(dotScaleAnim2, {
                  toValue: 1,
                  duration: 400,
                  useNativeDriver: true,
                }),
              ])
            ),
          ]),
          Animated.parallel([
            Animated.timing(dotAnim3, {
              toValue: 1,
              duration: 400,
              useNativeDriver: true,
            }),
            Animated.loop(
              Animated.sequence([
                Animated.timing(dotScaleAnim3, {
                  toValue: 1.4,
                  duration: 400,
                  useNativeDriver: true,
                }),
                Animated.timing(dotScaleAnim3, {
                  toValue: 1,
                  duration: 400,
                  useNativeDriver: true,
                }),
              ])
            ),
          ]),
        ]).start();
      }, 1200);

      // Phase 4: Background circles with scale
      setTimeout(() => {
        Animated.stagger(300, [
          Animated.parallel([
            Animated.timing(circleAnim1, {
              toValue: 1,
              duration: 600,
              useNativeDriver: true,
            }),
            Animated.spring(circleScale1, {
              toValue: 1,
              tension: 60,
              friction: 7,
              useNativeDriver: true,
            }),
          ]),
          Animated.parallel([
            Animated.timing(circleAnim2, {
              toValue: 1,
              duration: 600,
              useNativeDriver: true,
            }),
            Animated.spring(circleScale2, {
              toValue: 1,
              tension: 60,
              friction: 7,
              useNativeDriver: true,
            }),
          ]),
          Animated.parallel([
            Animated.timing(circleAnim3, {
              toValue: 1,
              duration: 600,
              useNativeDriver: true,
            }),
            Animated.spring(circleScale3, {
              toValue: 1,
              tension: 60,
              friction: 7,
              useNativeDriver: true,
            }),
          ]),
        ]).start();
      }, 1500);

      // Phase 5: Floating particles
      setTimeout(() => {
        Animated.parallel([
          Animated.timing(particlesAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.stagger(150, [
            createParticleAnimation(particle1),
            createParticleAnimation(particle2),
            createParticleAnimation(particle3),
            createParticleAnimation(particle4),
          ]),
        ]).start();
      }, 1800);

      // Phase 6: Food-themed floating icons
      setTimeout(() => {
        Animated.parallel([
          Animated.timing(iconsAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.stagger(200, [
            createIconAnimation(icon1Anim),
            createIconAnimation(icon2Anim),
            createIconAnimation(icon3Anim),
            createIconAnimation(icon4Anim),
          ]),
        ]).start();
      }, 2000);
    };

    // Helper function for particle animations
    const createParticleAnimation = (particle) => {
      return Animated.sequence([
        Animated.timing(particle, {
          toValue: 1,
          duration: 1200,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(particle, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
      ]);
    };

    // Helper function for icon animations
    const createIconAnimation = (iconAnim) => {
      return Animated.sequence([
        Animated.timing(iconAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.out(Easing.back(1.2)),
          useNativeDriver: true,
        }),
        Animated.delay(500),
        Animated.timing(iconAnim, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
      ]);
    };

    // Continuous background pulse
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );

    startAnimations();
    pulseAnimation.start();

    // Auto navigate after complete animation sequence
    const timer = setTimeout(() => {
      onAnimationFinish();
    }, 4500);

    return () => {
      clearTimeout(timer);
      pulseAnimation.stop();
    };
  }, []);

  // Interpolated values for complex animations
  const logoRotateInterpolate = logoRotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const logoBounceInterpolate = logoBounceAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, -25, 0],
  });

  const titleGlowInterpolate = titleGlowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 15],
  });

  const particle1Interpolate = particle1.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -150],
  });

  const particle2Interpolate = particle2.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -120],
  });

  const particle3Interpolate = particle3.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -180],
  });

  const particle4Interpolate = particle4.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -100],
  });

  // Animated styles
  const logoAnimatedStyle = {
    opacity: logoFadeAnim,
    transform: [
      { scale: logoScaleAnim },
      { rotate: logoRotateInterpolate },
      { translateY: logoBounceInterpolate },
    ],
  };

  const titleAnimatedStyle = {
    opacity: titleFadeAnim,
    transform: [{ translateY: titleSlideAnim }],
  };

  const titleGlowStyle = {
    shadowOpacity: titleGlowAnim,
    shadowRadius: titleGlowInterpolate,
  };

  const pulseStyle = {
    transform: [{ scale: pulseAnim }],
  };

  const dot1Style = {
    opacity: dotAnim1,
    transform: [{ scale: dotScaleAnim1 }],
  };

  const dot2Style = {
    opacity: dotAnim2,
    transform: [{ scale: dotScaleAnim2 }],
  };

  const dot3Style = {
    opacity: dotAnim3,
    transform: [{ scale: dotScaleAnim3 }],
  };

  return (
    <LinearGradient
      colors={['#1B5E20', '#2E7D32', '#4CAF50', '#66BB6A']}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" backgroundColor="#1B5E20" translucent />
      
      {/* Animated Background Elements */}
      <Animated.View style={[styles.backgroundPulse, pulseStyle]} />
      
      {/* Main Content */}
      <View style={styles.content}>
        {/* Logo with Enhanced Animations */}
        <Animated.View style={[styles.logoContainer, logoAnimatedStyle]}>
          <Animated.View style={pulseStyle}>
            <Image
              source={require('../assets/UEE_Logo-removebg-preview.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </Animated.View>
        </Animated.View>

        {/* App Title with Glow Effect */}
        <Animated.View style={[styles.titleContainer, titleAnimatedStyle]}>
          <Animated.Text style={[styles.appTitle, titleGlowStyle]}>
            Farm2Fork
          </Animated.Text>
          <Text style={styles.appSubtitle}>Your Food's Story in Your Hands</Text>
        </Animated.View>

        {/* Enhanced Loading Indicator */}
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading Sustainable Experience</Text>
          <View style={styles.loadingDots}>
            <Animated.View style={[styles.dot, dot1Style]} />
            <Animated.View style={[styles.dot, dot2Style]} />
            <Animated.View style={[styles.dot, dot3Style]} />
          </View>
        </View>
      </View>

      {/* Floating Food-themed Icons */}
      <Animated.View style={[styles.floatingIcons, { opacity: iconsAnim }]}>
        <Animated.View 
          style={[
            styles.foodIcon, 
            styles.icon1,
            { transform: [{ translateY: icon1Anim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, -80]
            }) }] }
          ]}
        >
          <Text style={styles.iconText}>🌱</Text>
        </Animated.View>
        <Animated.View 
          style={[
            styles.foodIcon, 
            styles.icon2,
            { transform: [{ translateY: icon2Anim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, -60]
            }) }] }
          ]}
        >
          <Text style={styles.iconText}>🚜</Text>
        </Animated.View>
        <Animated.View 
          style={[
            styles.foodIcon, 
            styles.icon3,
            { transform: [{ translateY: icon3Anim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, -100]
            }) }] }
          ]}
        >
          <Text style={styles.iconText}>📱</Text>
        </Animated.View>
        <Animated.View 
          style={[
            styles.foodIcon, 
            styles.icon4,
            { transform: [{ translateY: icon4Anim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, -70]
            }) }] }
          ]}
        >
          <Text style={styles.iconText}>🌍</Text>
        </Animated.View>
      </Animated.View>

      {/* Animated Particles */}
      <Animated.View style={[styles.particlesContainer, { opacity: particlesAnim }]}>
        <Animated.View style={[styles.particle, styles.particle1, { transform: [{ translateY: particle1Interpolate }] }]} />
        <Animated.View style={[styles.particle, styles.particle2, { transform: [{ translateY: particle2Interpolate }] }]} />
        <Animated.View style={[styles.particle, styles.particle3, { transform: [{ translateY: particle3Interpolate }] }]} />
        <Animated.View style={[styles.particle, styles.particle4, { transform: [{ translateY: particle4Interpolate }] }]} />
      </Animated.View>

      {/* Bottom Decorative Elements */}
      <View style={styles.bottomDecoration}>
        <Animated.View 
          style={[
            styles.decorativeCircle, 
            { 
              opacity: circleAnim1,
              transform: [{ scale: circleScale1 }]
            }
          ]} 
        />
        <Animated.View 
          style={[
            styles.decorativeCircle, 
            styles.circle2, 
            { 
              opacity: circleAnim2,
              transform: [{ scale: circleScale2 }]
            }
          ]} 
        />
        <Animated.View 
          style={[
            styles.decorativeCircle, 
            styles.circle3, 
            { 
              opacity: circleAnim3,
              transform: [{ scale: circleScale3 }]
            }
          ]} 
        />
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  backgroundPulse: {
    position: 'absolute',
    width: width * 2,
    height: width * 2,
    borderRadius: width,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    zIndex: 10,
  },
  logoContainer: {
    marginBottom: 40,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 15,
  },
  logo: {
    width: width * 0.5,
    height: width * 0.5,
    maxWidth: 220,
    maxHeight: 220,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  appTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 12,
    textShadowColor: 'rgba(255, 255, 255, 0.8)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 0 },
  },
  appSubtitle: {
    fontSize: 16,
    color: '#E8F5E8',
    textAlign: 'center',
    fontWeight: '300',
    letterSpacing: 1.2,
    opacity: 0.9,
  },
  loadingContainer: {
    alignItems: 'center',
  },
  loadingText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    marginBottom: 16,
    fontWeight: '300',
    letterSpacing: 0.5,
  },
  loadingDots: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FFFFFF',
    marginHorizontal: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  floatingIcons: {
    position: 'absolute',
    top: '30%',
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    zIndex: 5,
  },
  foodIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  iconText: {
    fontSize: 20,
  },
  icon1: { marginLeft: 30 },
  icon2: { marginLeft: -10 },
  icon3: { marginRight: -10 },
  icon4: { marginRight: 30 },
  particlesContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  particle: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
  },
  particle1: { left: '20%', top: '40%' },
  particle2: { left: '40%', top: '60%' },
  particle3: { left: '60%', top: '30%' },
  particle4: { left: '80%', top: '50%' },
  bottomDecoration: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 120,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    paddingBottom: 30,
    zIndex: 2,
  },
  decorativeCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  circle2: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  circle3: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
});

export default SplashScreen;