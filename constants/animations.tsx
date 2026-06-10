import React, { useEffect, useRef, ReactNode } from 'react';
import { Animated, ViewProps } from 'react-native';

interface FadeInViewProps extends ViewProps {
  children: ReactNode;
  delay?: number;
  duration?: number;
  translateY?: number;
}

export function FadeInView({ children, delay = 0, duration = 500, translateY = 30, style, ...props }: FadeInViewProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translate = useRef(new Animated.Value(translateY)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration, delay, useNativeDriver: true }),
      Animated.timing(translate, { toValue: 0, duration, delay, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View style={[{ opacity, transform: [{ translateY: translate }] }, style]} {...props}>
      {children}
    </Animated.View>
  );
}

interface ScaleInViewProps extends ViewProps {
  children: ReactNode;
  delay?: number;
  duration?: number;
}

export function ScaleInView({ children, delay = 0, duration = 400, style, ...props }: ScaleInViewProps) {
  const scale = useRef(new Animated.Value(0.8)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, friction: 6, tension: 80, delay, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 1, duration, delay, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View style={[{ opacity, transform: [{ scale }] }, style]} {...props}>
      {children}
    </Animated.View>
  );
}

interface StaggerViewProps extends ViewProps {
  children: ReactNode;
  staggerDelay?: number;
  index: number;
}

export function StaggerView({ children, staggerDelay = 80, index, style, ...props }: StaggerViewProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translate = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 400, delay: index * staggerDelay, useNativeDriver: true }),
      Animated.timing(translate, { toValue: 0, duration: 400, delay: index * staggerDelay, useNativeDriver: true }),
    ]).start();
  }, [index]);

  return (
    <Animated.View style={[{ opacity, transform: [{ translateY: translate }] }, style]} {...props}>
      {children}
    </Animated.View>
  );
}

export function SlideFromBottom({ children, delay = 0, style, ...props }: FadeInViewProps) {
  const translate = useRef(new Animated.Value(60)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(translate, { toValue: 0, friction: 7, tension: 60, delay, useNativeDriver: true });
    Animated.timing(opacity, { toValue: 1, duration: 400, delay, useNativeDriver: true }).start();
  }, []);

  return (
    <Animated.View style={[{ opacity, transform: [{ translateY: translate }] }, style]} {...props}>
      {children}
    </Animated.View>
  );
}
