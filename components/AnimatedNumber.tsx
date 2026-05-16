import { useEffect, useRef } from 'react';
import { Animated, Text, StyleSheet } from 'react-native';

interface AnimatedNumberProps {
  value: number;
  duration?: number;
  formatValue?: (v: number) => string;
  style?: any;
}

export default function AnimatedNumber({ value, duration = 800, formatValue, style }: AnimatedNumberProps) {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const displayValue = useRef(0);

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: value,
      duration,
      useNativeDriver: false,
    }).start();
  }, [value]);

  useEffect(() => {
    const listener = animatedValue.addListener(({ value: v }) => {
      displayValue.current = v;
    });
    return () => animatedValue.removeListener(listener);
  }, []);

  const animatedText = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  return (
    <Animated.Text style={style}>
      {formatValue ? formatValue(value) : value.toFixed(2)}
    </Animated.Text>
  );
}
