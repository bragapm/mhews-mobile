import {
    View,
    Text,
    ImageBackground,
    TouchableOpacity,
    StyleSheet,
    Image,
    ActivityIndicator,
    useColorScheme,
    Animated,
} from "react-native";
import { useEffect, useRef, useState } from "react";
import COLORS from "./config/COLORS";
import { StatusBar } from "react-native";
import useAuthStore from "./hooks/auth";
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from "./navigation/types";
import { PanGestureHandler, State } from "react-native-gesture-handler";

const SplashScreen = () => {
    const token = useAuthStore((state) => state.token);
    const colorScheme = useColorScheme();
    const colors = COLORS();
    const [showOnboarding, setShowOnboarding] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);

    const logoOpacity = useRef(new Animated.Value(0)).current;
    const textOpacity = useRef(new Animated.Value(0)).current;
    const loadingOpacity = useRef(new Animated.Value(0)).current;
    const onboardingOpacity = useRef(new Animated.Value(0)).current;

    const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

    const steps = [
        {
            title: "Informasi Potensi Bahaya di Sekitar Anda",
            description: "Ketahui tingkat resiko bahaya di sekitar anda, dengan info lokasi evakuasi terdekat hingga informasi mitigasi bencana.",
        },
        {
            title: "Peringatan Dini dan Informasi Jalur Evakuasi",
            description: "Dapatkan peringatan dini ketika terjadi bencana secara real-time, lengkap dengan petunjuk rute evakuasi untuk keselamatan anda.",
        },
        {
            title: "Pantau Kondisi Kerabat Saat Terjadi Bencana",
            description: "Pantau dan pastikan kondisi orang terdekat anda ketika terjadi bencana, dengan melihat lokasi terkini dan kondisi disekitarnya.",
        },
    ];

    useEffect(() => {
        const logoTimeout = setTimeout(() => fadeIn(logoOpacity), 500);
        const textTimeout = setTimeout(() => fadeIn(textOpacity), 2000);
        const loadingTimeout = setTimeout(() => fadeIn(loadingOpacity), 3500);

        const onboardingTimeout = setTimeout(() => {
            setShowOnboarding(true);
            fadeIn(onboardingOpacity);
        }, 4500);

        return () => {
            clearTimeout(logoTimeout);
            clearTimeout(textTimeout);
            clearTimeout(loadingTimeout);
            clearTimeout(onboardingTimeout);
        };
    }, []);

    const fadeIn = (element: Animated.Value, duration: number = 1000) => {
        Animated.timing(element, {
            toValue: 1,
            duration,
            useNativeDriver: true,
        }).start();
    };

    const nextStep = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            setShowOnboarding(false);
        }
    };

    const prevStep = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const skipOnboarding = () => {
        setShowOnboarding(false);
    };

    const onHandlerStateChange = (event: any) => {
        if (event.nativeEvent.oldState === State.ACTIVE) {
            const { translationX } = event.nativeEvent;
            if (translationX < -50) {
                nextStep();
            } else if (translationX > 50) {
                prevStep();
            }
        }
    };

    const backgroundSource = showOnboarding
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

    const onboardImage = require("./assets/images/onboard.png");

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
                {!showOnboarding ? (
                    <>
                        <View style={styles.overlay} />
                        <View style={styles.content}>
                            <Animated.View style={{ opacity: logoOpacity }}>
                                <Image source={logoSource} style={styles.brand} />
                            </Animated.View>

                            <Animated.Text style={[styles.title, { color: colors.text, opacity: textOpacity }]}>
                                Multi-Hazard Early{"\n"}Warning System
                            </Animated.Text>

                            <Animated.View style={{ opacity: loadingOpacity }}>
                                <ActivityIndicator size="large" color="#FF6600" style={styles.loader} />
                            </Animated.View>
                        </View>
                    </>
                ) : showOnboarding ? (
                    <PanGestureHandler
                        onHandlerStateChange={onHandlerStateChange}
                    >
                        <Animated.View style={[styles.onboardingContainer, { opacity: onboardingOpacity }]}>
                            <View style={styles.overlay} />

                            <View style={styles.header}>
                                <View style={styles.stepLine}>
                                    {steps.map((_, index) => (
                                        <View
                                            key={index}
                                            style={[
                                                styles.stepLineSegment,
                                                index === currentStep && styles.activeStepLineSegment,
                                            ]}
                                        />
                                    ))}
                                </View>
                            </View>

                            <View style={styles.contentOnBoard}>
                                <Text style={styles.onboardingTitle}>{steps[currentStep].title}</Text>
                                <Text style={styles.onboardingDescription}>{steps[currentStep].description}</Text>
                                <Image source={onboardImage} style={styles.onboardImage} />
                            </View>

                            <View style={styles.footer}>
                                {currentStep < steps.length - 1 ? (
                                    <>
                                        <TouchableOpacity onPress={skipOnboarding}>
                                            <Text style={styles.skipText}>Lewati</Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            style={styles.buttonNext}
                                            onPress={nextStep}
                                        >
                                            <View>
                                                <Text style={styles.buttonText}>Selanjutnya</Text>
                                            </View>
                                        </TouchableOpacity>
                                    </>
                                ) : (
                                    <View style={styles.footerRow}>
                                        <TouchableOpacity
                                            style={styles.button}
                                            onPress={() => navigation.replace("Login")}
                                        >
                                            <View>
                                                <Text style={styles.buttonText}>Mulai Sekarang</Text>
                                            </View>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={styles.buttonGuest}
                                            onPress={() => navigation.replace("Tabs")}
                                        >
                                            <View>
                                                <Text style={styles.buttonGuestText}>Masuk Tanpa Akun</Text>
                                            </View>
                                        </TouchableOpacity>
                                    </View>
                                )}
                            </View>
                        </Animated.View>
                    </PanGestureHandler>
                ) : (
                    <>
                        <View style={styles.overlay} />
                        <View style={styles.content}>
                            <Image source={logoSource} style={styles.brand} />
                            <Text style={[styles.title, { color: colors.text }]}>
                                Multi-Hazard Early{"\n"}Warning System
                            </Text>
                            <Text style={[styles.description, { color: colors.text }]}>
                                Sistem Peringatan Dini Bencana Alam yang dapat diakses dimanapun
                                dan kapanpun dalam genggaman tangan pengguna
                            </Text>
                        </View>
                    </>
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
        backgroundColor: "rgba(255, 255, 255, 0.85)",
    },
    content: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 30,
    },
    header: {
        width: "100%",
        alignItems: "center",
        marginTop: 60,
        marginBottom: 20,
    },
    stepLine: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        position: "relative",
        width: "100%",
    },
    stepLineSegment: {
        flex: 1,
        height: 3,
        backgroundColor: "#ccc",
        marginHorizontal: 2,
    },
    activeStepLineSegment: {
        backgroundColor: "#FF6600",
    },
    brand: {
        width: 150,
        height: 50,
        resizeMode: "contain",
    },
    onboardingContainer: {
        flex: 1,
        paddingHorizontal: 20,
    },
    contentOnBoard: {
        flex: 1,
    },
    onboardingTitle: {
        fontSize: 36,
        fontWeight: "bold",
        textAlign: "left",
        marginBottom: 10,
    },
    onboardingDescription: {
        fontSize: 16,
        textAlign: "left",
        color: "#555",
        marginBottom: 20,
    },
    onboardImage: {
        width: "100%",
        height: 350,
        resizeMode: "contain",
        alignSelf: "center",
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        textAlign: "center",
        marginBottom: 20,
    },
    description: {
        fontSize: 14,
        color: "#555",
        textAlign: "center",
        marginBottom: 20,
    },
    loader: {
        marginTop: 20,
    },
    footerRow: {
        flexDirection: "column",
        gap: 10,
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
    },
    button: {
        width: "100%",
        backgroundColor: "#FF6600",
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: "center",
    },
    buttonGuest: {
        width: "100%",
        borderWidth: 2,
        borderColor: "#FF6600",
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: "center",
    },
    buttonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },
    buttonGuestText: {
        color: "#FF6600",
        fontSize: 16,
        fontWeight: "bold",
    },
    buttonNext: {
        backgroundColor: "#FF6600",
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
    },
    footer: {
        flexDirection: "row",
        gap: "20%",
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
        marginBottom: 40,
    },
    skipText: {
        fontSize: 16,
        color: "#FF6600",
    },
});