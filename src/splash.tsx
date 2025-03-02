import {
    View,
    Text,
    ImageBackground,
    TouchableOpacity,
    StyleSheet,
    Image,
    ActivityIndicator,
    useColorScheme,
} from "react-native";
import { useEffect, useState } from "react";
import COLORS from "./config/COLORS";
import { StatusBar } from "react-native";
import useAuthStore from "./hooks/auth";
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from "./navigation/types";

const SplashScreen = () => {
    const token = useAuthStore((state) => state.token);
    const colorScheme = useColorScheme();
    const colors = COLORS();
    const [showNextBtn, setShowNextBtn] = useState(false);

    const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

    useEffect(() => {
        const timer = setTimeout(() => {
            if (token) {
                navigation.replace("Tabs");
            } else {
                setShowNextBtn(true);
            }
        }, 3000);
        return () => clearTimeout(timer);
    }, [token, navigation]);

    const backgroundSource = showNextBtn
        ? colorScheme === "dark"
            ? require("./assets/images/overlay-dark.png")
            : require("./assets/images/overlay-light.png")
        : colorScheme === "dark"
            ? require("./assets/images/splash-dark.png")
            : require("./assets/images/splashscreen.png");

    const logoSource =
        colorScheme === "dark"
            ? require("./assets/images/logo-dark.png")
            : require("./assets/images/braga-logo.png");

    return (
        <>
            <StatusBar
                translucent={true}
                backgroundColor="transparent"
                barStyle={colorScheme === "dark" ? "light-content" : "dark-content"}
            />
            <ImageBackground
                source={backgroundSource}
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
                            <Image source={logoSource} style={styles.brand} />
                            <Text style={[styles.title, { color: colors.text }]}>
                                Multi-Hazard{"\n"}Early Warning System
                            </Text>
                            <Text style={[styles.description, { color: colors.text }]}>
                                Sistem Peringatan Dini Bencana Alam yang dapat diakses dimanapun
                                dan kapanpun dalam genggaman tangan pengguna
                            </Text>
                        </View>
                    </>
                )}

                {showNextBtn && (
                    <TouchableOpacity
                        style={styles.button}
                        onPress={() => navigation.replace("Login")} // Navigasi ke halaman login
                    >
                        <View
                            style={{
                                flexDirection: "row",
                                alignItems: "center",
                                justifyContent: "center",
                                width: "100%",
                                position: "relative",
                            }}
                        >
                            <Text style={styles.buttonText}>Mulai</Text>
                            <Image
                                source={require("./assets/images/arrow-right.png")}
                                style={{
                                    width: 20,
                                    height: 20,
                                    resizeMode: "contain",
                                    position: "absolute",
                                    right: 16,
                                }}
                            />
                        </View>
                    </TouchableOpacity>
                )}
            </ImageBackground>
        </>
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
        paddingBottom: 0,
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(255, 255, 255, 0.5)",
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
        fontSize: 48,
        fontWeight: "bold",
        marginBottom: 10,
    },
    description: {
        fontSize: 14,
        color: "#555",
        marginBottom: 20,
    },
    button: {
        position: "absolute",
        bottom: 30,
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
