import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";

type CustomToastProps = {
    message: string;
    type: "success" | "error";
    visible: boolean;
    onHide: () => void;
};

const CustomToast = ({ message, type, visible, onHide }: CustomToastProps) => {
    const opacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true }).start();

            const timeout = setTimeout(() => {
                Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }).start(() => {
                    onHide();
                });
            }, 2000);

            return () => clearTimeout(timeout);
        }
    }, [visible]);

    if (!visible) return null;

    return (
        <Animated.View
            style={[
                styles.toastContainer,
                type === "success" ? styles.successToast : styles.errorToast,
                { opacity },
            ]}
        >
            <Text style={styles.toastText}>{message}</Text>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    toastContainer: {
        position: "absolute",
        bottom: 50,
        left: "10%",
        right: "10%",
        padding: 15,
        borderRadius: 8,
        backgroundColor: "white",
        alignItems: "center",
        elevation: 5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
    },
    successToast: {
        borderWidth: 1,
        borderColor: "green",
    },
    errorToast: {
        borderWidth: 1,
        borderColor: "red",
    },
    toastText: {
        fontSize: 14,
        color: "#333",
    },
});

export default CustomToast;