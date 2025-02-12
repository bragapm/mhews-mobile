import { View, Text, ImageBackground, TouchableOpacity, StyleSheet, Image, ActivityIndicator } from "react-native";
import { useEffect, useState } from "react";
import { router } from "expo-router";

const SplashScreen = () => {
    const [showNextBtn, setShowNextBtn] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setShowNextBtn(true);
        }, 3000);
        return () => clearTimeout(timer);
    }, []);

    return (
        <ImageBackground
            source={require("../assets/images/splashscreen.png")}
            style={styles.background}
            resizeMode="cover"
        >
            {!showNextBtn ? (
                <View style={styles.loaderContainer}>
                    <ActivityIndicator size="large" color="#FF6600" />
                </View>
            ) : (
                <>
                    <View style={styles.overlay} />
                    <View style={styles.content}>
                        <Image
                            source={require("../assets/images/braga-logo.png")}
                            style={styles.brand}
                        />
                        <Text style={styles.title}>Multi-Hazard{"\n"}Early Warning System</Text>
                        <Text style={styles.description}>
                            Sistem Peringatan Dini Bencana Alam yang dapat diakses dimanapun dan kapanpun dalam genggaman tangan pengguna
                        </Text>
                    </View>
                </>
            )}

            {showNextBtn && (
                <TouchableOpacity style={styles.button} onPress={() => router.replace("/auth/login")}>
                    <Text style={styles.buttonText}>Mulai →</Text>
                </TouchableOpacity>
            )}
        </ImageBackground>
    );
};

export default SplashScreen;

const styles = StyleSheet.create({
    background: {
        flex: 1,
        width: "100%",
        height: "100%",
        justifyContent: "space-between",
        alignItems: "center",
        paddingBottom: 50,
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(255, 255, 255, 0.8)",
    },
    loaderContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    content: {
        marginTop: 50,
        paddingHorizontal: 30,
    },
    brand: {
        width: 150,
        height: 50,
        resizeMode: "contain",
        marginBottom: 10,
    },
    title: {
        fontSize: 28,
        fontWeight: "bold",
        color: "#000",
        marginBottom: 10,
    },
    description: {
        fontSize: 14,
        color: "#555",
        marginBottom: 20,
    },
    button: {
        position: "absolute",
        bottom: 50,
        width: "80%",
        backgroundColor: "#FF6600",
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: "center",
    },
    buttonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },
});
