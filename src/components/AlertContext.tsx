import React, { createContext, useContext, useState, useRef } from "react";
import { Platform, ToastAndroid, Text, View, StyleSheet, Animated } from "react-native";

interface AlertContextType {
    showAlert: (type: "success" | "error", message: string) => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const useAlert = () => {
    const context = useContext(AlertContext);
    if (!context) {
        throw new Error("useAlert harus digunakan dalam AlertProvider");
    }
    return context;
};

export const AlertProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [alert, setAlert] = useState<{ type: "success" | "error"; message: string } | null>(null);
    const opacity = useRef(new Animated.Value(0)).current;

    const showAlert = (type: "success" | "error", message: string) => {
        if (Platform.OS === "android") {
            ToastAndroid.show(message, ToastAndroid.SHORT);
        } else {
            setAlert({ type, message });

            // Fade in
            Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true }).start();

            setTimeout(() => {
                // Fade out
                Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }).start(() => {
                    setAlert(null);
                });
            }, 2000);
        }
    };

    return (
        <AlertContext.Provider value={{ showAlert }}>
            {children}
            {alert && (
                <Animated.View
                    style={[
                        styles.alertBox,
                        alert.type === "error" ? styles.errorBorder : styles.successBorder,
                        { opacity },
                    ]}
                >
                    <Text style={styles.alertText}>{alert.message}</Text>
                </Animated.View>
            )}
        </AlertContext.Provider>
    );
};

const styles = StyleSheet.create({
    alertBox: {
        position: "absolute",
        top: 20,
        left: "5%",
        right: "5%",
        padding: 10,
        borderRadius: 6,
        backgroundColor: "white",
        alignItems: "center",
        elevation: 5,
        zIndex: 999,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
    },
    successBorder: {
        borderWidth: 1,
        borderColor: "green",
    },
    errorBorder: {
        borderWidth: 1,
        borderColor: "red",
    },
    alertText: {
        fontSize: 14,
        color: "#333",
    },
});

export default AlertProvider;
