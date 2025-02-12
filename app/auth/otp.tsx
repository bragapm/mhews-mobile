import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from "react-native";
import OTPInputView from "@twotalltotems/react-native-otp-input";
import { router } from "expo-router";
import AntDesign from "@expo/vector-icons/AntDesign";

const OTPConfirmation = () => {
    const [otp, setOtp] = useState("");
    const [loading, setLoading] = useState(false);

    const handleVerifyOTP = () => {
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            Alert.alert("OTP Verified!");
            router.push("/(tabs)/home");
        }, 2000);
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <AntDesign name="arrowleft" size={24} color="black" />
                </TouchableOpacity>
                <Text style={styles.title}>Konfirmasi Kode OTP</Text>
            </View>
            <View style={styles.card}>
                <Text style={styles.description}>
                    Kode OTP (One-Time Password) telah dikirimkan ke nomor whatsapp <b>(+62 812-3456-7890)</b>.
                    <br />
                    Harap periksa whatsapp Anda secara berkala.
                </Text>

                <TouchableOpacity>
                    <Text style={styles.changeMethod}>Ganti Metode?</Text>
                </TouchableOpacity>

                <OTPInputView
                    style={styles.otpInput}
                    pinCount={6}
                    autoFocusOnLoad
                    codeInputFieldStyle={styles.otpBox}
                    codeInputHighlightStyle={styles.otpBoxActive}
                    onCodeFilled={(code) => setOtp(code)}
                />

                <TouchableOpacity style={styles.verifyButton} onPress={handleVerifyOTP} disabled={loading}>
                    {loading ? (
                        <ActivityIndicator size="small" color="#fff" />
                    ) : (
                        <Text style={styles.verifyText}>Verifikasi Kode OTP</Text>
                    )}
                </TouchableOpacity>

                <TouchableOpacity>
                    <Text style={styles.resendText}>Kirim Ulang</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 40,
        paddingHorizontal: 20,
    },
    card: {
        position: "absolute",
        left: 0,
        right: 0,
        padding: 20,
        marginTop: 150,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        width: "100%",
        height: "80%",
        alignItems: "center",
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        textAlign: "center",
        marginRight: 20,
        flex: 1,
    },
    description: {
        fontSize: 14,
        textAlign: "center",
        color: "#666",
        marginBottom: 20,
    },
    changeMethod: {
        color: "#FF6200",
        fontWeight: "bold",
        marginBottom: 10,
    },
    otpInput: {
        width: "80%",
        height: 80,
        marginBottom: 20,
        color: "#FF6200",
    },
    otpBox: {
        width: 45,
        height: 50,
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 5,
        fontSize: 20,
        textAlign: "center",
        color: "#000",
    },
    otpBoxActive: {
        borderColor: "#FF6200",
        color: "#000",
    },
    verifyButton: {
        backgroundColor: "#FF6200",
        padding: 15,
        borderRadius: 10,
        width: "80%",
        alignItems: "center",
        marginBottom: 10,
    },
    verifyText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 16,
    },
    resendText: {
        color: "#FF6200",
        fontWeight: "bold",
    },
});

export default OTPConfirmation;
