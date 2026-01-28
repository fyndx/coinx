---
name: reanimated
description: React Native Reanimated for animations. Use when creating animations, gestures, or animated transitions in CoinX.
---

# Reanimated

Animations for CoinX using react-native-reanimated.

## Basic Animation

```tsx
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from "react-native-reanimated";

const MyComponent = () => {
  const offset = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: offset.value }],
  }));

  const move = () => {
    offset.value = withSpring(100);
  };

  return (
    <Animated.View style={[styles.box, animatedStyle]}>
      <Button onPress={move}>Move</Button>
    </Animated.View>
  );
};
```

## Animation Types

### Spring

```typescript
// Natural spring
offset.value = withSpring(100);

// Customized spring
offset.value = withSpring(100, {
  damping: 15,
  stiffness: 100,
  mass: 1,
});
```

### Timing

```typescript
import { Easing } from "react-native-reanimated";

// Linear timing
opacity.value = withTiming(1, { duration: 300 });

// With easing
scale.value = withTiming(1.2, {
  duration: 200,
  easing: Easing.bezier(0.25, 0.1, 0.25, 1),
});
```

### Sequence & Delay

```typescript
import { withSequence, withDelay, withRepeat } from "react-native-reanimated";

// Sequence
scale.value = withSequence(
  withTiming(1.2, { duration: 100 }),
  withTiming(1, { duration: 100 })
);

// Delay
opacity.value = withDelay(500, withTiming(1));

// Repeat
rotation.value = withRepeat(
  withTiming(360, { duration: 1000 }),
  -1, // infinite
  false // don't reverse
);
```

## Animated Styles

```typescript
const animatedStyle = useAnimatedStyle(() => {
  return {
    opacity: opacity.value,
    transform: [
      { translateX: x.value },
      { translateY: y.value },
      { scale: scale.value },
      { rotate: `${rotation.value}deg` },
    ],
  };
});
```

## Interpolation

```typescript
import { interpolate, Extrapolate } from "react-native-reanimated";

const animatedStyle = useAnimatedStyle(() => {
  const opacity = interpolate(
    scrollY.value,
    [0, 100],           // input range
    [1, 0],             // output range
    Extrapolate.CLAMP   // clamp output
  );

  return { opacity };
});
```

## Gesture Integration

```tsx
import { Gesture, GestureDetector } from "react-native-gesture-handler";

const MyComponent = () => {
  const x = useSharedValue(0);
  const y = useSharedValue(0);

  const pan = Gesture.Pan()
    .onUpdate((e) => {
      x.value = e.translationX;
      y.value = e.translationY;
    })
    .onEnd(() => {
      x.value = withSpring(0);
      y.value = withSpring(0);
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: x.value },
      { translateY: y.value },
    ],
  }));

  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={[styles.box, animatedStyle]} />
    </GestureDetector>
  );
};
```

## Entering/Exiting

```tsx
import Animated, { FadeIn, FadeOut, SlideInRight } from "react-native-reanimated";

<Animated.View entering={FadeIn.duration(300)} exiting={FadeOut}>
  <Text>Animated content</Text>
</Animated.View>

<Animated.View entering={SlideInRight.springify()}>
  <Text>Slides in from right</Text>
</Animated.View>
```

## Layout Animations

```tsx
import Animated, { LinearTransition } from "react-native-reanimated";

// Smooth layout changes
<Animated.View layout={LinearTransition.springify()}>
  {items.map(item => <Item key={item.id} />)}
</Animated.View>
```

## Callbacks

```typescript
import { runOnJS } from "react-native-reanimated";

const gesture = Gesture.Tap().onEnd(() => {
  // Call JS function from worklet
  runOnJS(onComplete)();
});

// With timing callback
opacity.value = withTiming(0, { duration: 300 }, (finished) => {
  if (finished) {
    runOnJS(onAnimationComplete)();
  }
});
```

## Scroll Animations

```tsx
import Animated, { useScrollViewOffset } from "react-native-reanimated";

const scrollRef = useAnimatedRef<Animated.ScrollView>();
const scrollOffset = useScrollViewOffset(scrollRef);

const headerStyle = useAnimatedStyle(() => ({
  opacity: interpolate(scrollOffset.value, [0, 100], [1, 0]),
}));
```
