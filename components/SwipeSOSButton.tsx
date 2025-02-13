import React from "react";
import { Dimensions, StyleSheet, Text, View, ActivityIndicator } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, { useAnimatedStyle, useSharedValue, withTiming, runOnJS } from "react-native-reanimated";
import { Entypo } from "@expo/vector-icons";

interface SwipeSOSButtonProps {
    onSwipeSuccess: () => void;
    loading: boolean;
}

const SwipeSOSButton: React.FC<SwipeSOSButtonProps> = ({ onSwipeSuccess, loading }) => {
    const END_POSITION = Dimensions.get("screen").width - 90;
    const onLeft = useSharedValue(true);
    const position = useSharedValue(0);

    const panGesture = Gesture.Pan()
        .runOnJS(true)
        .onUpdate((e) => {
            if (!loading) {
                if (onLeft.value) {
                    position.value = e.translationX;
                } else {
                    position.value = END_POSITION + e.translationX;
                }
            }
        })
        .onEnd(() => {
            if (!loading) {
                if (position.value > END_POSITION / 1.5) {
                    position.value = withTiming(END_POSITION, { duration: 100 });
                    onLeft.value = false;
                    runOnJS(onSwipeSuccess)();
                } else {
                    position.value = withTiming(0, { duration: 100 });
                    onLeft.value = true;
                }
            }
        });

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: position.value }],
        opacity: loading ? 0.5 : 1,
    }));

    return (
        <View style={styles.sliderContainer}>
            <Text style={styles.sliderText}>{loading ? <ActivityIndicator size="small" color="red" /> : "Geser untuk Kirim SOS"}</Text>
            {!loading && (
                <GestureDetector gesture={panGesture}>
                    <Animated.View style={[styles.swipeBtn, animatedStyle]}>
                        <Entypo name="chevron-thin-right" size={24} color="white" />
                    </Animated.View>
                </GestureDetector>
            )}
        </View>
    );
};

export default SwipeSOSButton;

const styles = StyleSheet.create({
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
    sliderText: {
        color: "#E64040",
        fontSize: 18,
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
