import React, { useRef, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Animated } from "react-native";

type CustomProps = {
    onFinish: () => void;
};

const OnboardingScreen = ({ onFinish }: CustomProps) => {
    const [currentStep, setCurrentStep] = useState(0);
    const fadeAnim = useRef(new Animated.Value(0)).current;

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

    const fadeIn = () => {
        fadeAnim.setValue(0);
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
        }).start();
    };

    const nextStep = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
            fadeIn();
        } else {
            onFinish();
        }
    };

    const skipOnboarding = () => {
        onFinish();
    };

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <Animated.View style={{ opacity: fadeAnim }}>
                    <Text style={styles.title}>{steps[currentStep].title}</Text>
                    <Text style={styles.description}>{steps[currentStep].description}</Text>
                </Animated.View>
            </View>

            <View style={styles.footer}>
                <TouchableOpacity onPress={skipOnboarding}>
                    <Text style={styles.skipText}>Lewati</Text>
                </TouchableOpacity>

                <View style={styles.steps}>
                    {steps.map((_, index) => (
                        <View
                            key={index}
                            style={[
                                styles.step,
                                index === currentStep && styles.activeStep,
                            ]}
                        />
                    ))}
                </View>

                <TouchableOpacity onPress={nextStep}>
                    <Text style={styles.nextText}>
                        {currentStep === steps.length - 1 ? "Mulai" : "Selanjutnya"}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 20,
    },
    content: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        textAlign: "center",
        marginBottom: 20,
    },
    description: {
        fontSize: 16,
        textAlign: "center",
        color: "#555",
    },
    footer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        width: "100%",
        marginBottom: 40,
    },
    skipText: {
        fontSize: 16,
        color: "#FF6600",
    },
    steps: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
    },
    step: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: "#ccc",
        marginHorizontal: 5,
    },
    activeStep: {
        backgroundColor: "#FF6600",
    },
    nextText: {
        fontSize: 16,
        color: "#FF6600",
    },
});

export default OnboardingScreen;