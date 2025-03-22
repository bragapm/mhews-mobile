import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    ImageBackground,
    useColorScheme,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    StatusBar,
    Switch,
    ActivityIndicator,
} from "react-native";
import useAuthStore from "../../hooks/auth";
import { HeaderNav } from "../../components/Header";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../navigation/types";
import COLORS from "../../config/COLORS";
import { patchData } from "../../services/apiServices";
import { useAlert } from "../../components/AlertContext";

export default function TwoFactorAuthScreen() {
    const colorScheme = useColorScheme();
    const colors = COLORS();
    const { profile, getProfile } = useAuthStore();
    const [loading, setLoading] = useState(false);
    const [isTwoFactorEnabled, setIsTwoFactorEnabled] = useState(
        profile?.act_otp || false
    );
    const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
    const { showAlert } = useAlert();
    const backgroundSource =
        colorScheme === "dark"
            ? require("../../assets/images/bg-page-dark.png")
            : require("../../assets/images/bg-page-light.png");

    useEffect(() => {
        getProfile();
    }, []);

    const toggleTwoFactorAuth = async () => {
        const newStatus = !isTwoFactorEnabled;
        setIsTwoFactorEnabled(newStatus);
        setLoading(true);

        try {
            const response = await patchData("/users/" + profile?.id, {
                act_otp: newStatus,
            });

            if (response?.data) {
                showAlert("success", `2FA OTP Email telah ${newStatus ? "diaktifkan" : "dinonaktifkan"}`);
                getProfile();
            } else {
                showAlert("error", "Gagal mengupdate status 2FA. Silakan coba lagi.");
                setIsTwoFactorEnabled(!newStatus);
            }
        } catch (error: any) {
            showAlert("error", error.message || "Terjadi kesalahan pada server.");
            setIsTwoFactorEnabled(!newStatus);
        } finally {
            setLoading(false);
        }
    };

    const backToProfile = () => {
        navigation.goBack();
    };

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
                <ScrollView
                    contentContainerStyle={styles.scrollContainer}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.container}>
                        {/* Header */}
                        <HeaderNav onPress={backToProfile} title="2FA OTP Email" />

                        {/* Content */}
                        <View
                            style={[
                                styles.contentOption,
                                {
                                    backgroundColor: colorScheme === "dark" ? "#1c1c1c" : "#fff",
                                    borderRadius: 12,
                                    marginTop: "5%",
                                    paddingVertical: "4%",
                                    paddingHorizontal: 16,
                                },
                            ]}
                        >
                            <Text style={[styles.subTitle, { color: colors.tabIconDefault }]}>
                                Aktifkan atau nonaktifkan 2FA OTP Email untuk meningkatkan keamanan akun Anda.
                            </Text>

                            {/* Toggle 2FA OTP Email */}
                            <View style={styles.toggleContainer}>
                                <Text style={[styles.toggleLabel, { color: colors.text }]}>
                                    Aktifkan 2FA OTP Email
                                </Text>
                                <Switch
                                    value={isTwoFactorEnabled}
                                    onValueChange={toggleTwoFactorAuth}
                                    disabled={loading}
                                    trackColor={{ false: "#767577", true: colors.button }}
                                    thumbColor={isTwoFactorEnabled ? "#f4f3f4" : "#f4f3f4"}
                                />
                            </View>

                            {/* Informasi Tambahan */}
                            <Text style={[styles.infoText, { color: colors.subText }]}>
                                Dengan mengaktifkan 2FA OTP Email, Anda akan menerima kode OTP melalui email setiap kali melakukan login.
                            </Text>
                        </View>
                    </View>
                </ScrollView>
            </ImageBackground>
        </>
    );
}

const styles = StyleSheet.create({
    scrollContainer: {
        flexGrow: 1,
        paddingBottom: 20,
    },
    container: {
        flex: 1,
        padding: 16,
        marginTop: "5%",
    },
    background: {
        flex: 1,
        width: "100%",
        height: "100%",
    },
    contentOption: {
        borderRadius: 12,
        width: "100%",
    },
    subTitle: {
        fontSize: 14,
        textAlign: "left",
        color: "#666",
        marginBottom: 20,
    },
    toggleContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 10,
    },
    toggleLabel: {
        fontSize: 16,
        fontWeight: "500",
    },
    infoText: {
        fontSize: 14,
        marginTop: 10,
        textAlign: "left",
    },
});