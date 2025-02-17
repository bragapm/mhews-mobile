import React from "react";
import { Dimensions, StyleSheet, Text, View, ActivityIndicator } from "react-native";
import { Gesture, GestureDetector, GestureHandlerRootView } from "react-native-gesture-handler";
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    runOnJS,
} from "react-native-reanimated";
import { Entypo } from "@expo/vector-icons";

interface SwipeSOSButtonProps {
    onSwipeSuccess: () => void;
    loading: boolean;
    disabled?: boolean;
}

const SwipeSOSButton: React.FC<SwipeSOSButtonProps> = ({ onSwipeSuccess, loading, disabled }) => {
    const END_POSITION = Dimensions.get("screen").width - 90;
    const position = useSharedValue(0);

    const panGesture = Gesture.Pan()
        .onUpdate((event) => {
            if (!loading && !disabled) {
                position.value = Math.max(0, Math.min(event.translationX, END_POSITION));
            }
        })
        .onEnd(() => {
            if (!loading && !disabled) {
                if (position.value > END_POSITION * 0.7) {
                    position.value = withSpring(END_POSITION);
                    runOnJS(onSwipeSuccess)();
                } else {
                    position.value = withSpring(0);
                }
            }
        });

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: position.value }],
        opacity: loading || disabled ? 0.5 : 1,
    }));

    return (
        <GestureHandlerRootView style={styles.gestureRoot}>
            <View style={[styles.sliderContainer, disabled && styles.disabledContainer]}>
                <Text style={[styles.sliderText, disabled && styles.disabledText]}>
                    {loading ? <ActivityIndicator size="small" color="red" /> : "Geser untuk Kirim SOS"}
                </Text>
                {!loading && !disabled && (
                    <GestureDetector gesture={panGesture}>
                        <Animated.View style={[styles.swipeBtn, animatedStyle]} collapsable={false}>
                            <Entypo name="chevron-thin-right" size={24} color="white" />
                        </Animated.View>
                    </GestureDetector>
                )}
            </View>
        </GestureHandlerRootView>
    );
};

export default SwipeSOSButton;

const styles = StyleSheet.create({
    gestureRoot: {
        width: "100%",
    },
    sliderContainer: {
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "row",
        width: "100%",
        backgroundColor: "#fff",
        borderColor: "red",
        borderWidth: 2,
        position: "relative",
        height: 50,
        overflow: "hidden",
        borderRadius: 5,
    },
    disabledContainer: {
        borderColor: "#ccc",
    },
    sliderText: {
        color: "#E64040",
        fontSize: 18,
    },
    disabledText: {
        color: "#aaa",
    },
    swipeBtn: {
        width: 40,
        height: 40,
        backgroundColor: "#E64040",
        position: "absolute",
        left: 5,
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 5,
    },
});
