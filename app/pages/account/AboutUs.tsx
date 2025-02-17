import {
    View,
    Text,
    ImageBackground,
    useColorScheme,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    StatusBar,
    ActivityIndicator,
    Image
} from "react-native";
import FloatingSOSButton from "@/components/FloatingSOSButton";
import React, { useEffect, useState } from "react";
import useAuthStore from "../../hooks/auth";
import { useRouter } from "expo-router";
import { AntDesign, Feather } from "@expo/vector-icons";
import COLORS from "../../config/COLORS";
import { useAlert } from "@/components/AlertContext";
import { useLanguageStore } from "@/app/hooks/languageStore";

export default function AboutUsScreen() {
    const reset = useAuthStore((state) => state.reset);
    const router = useRouter();
    const { showAlert } = useAlert();
    const { profile, getProfile } = useAuthStore();
    const colorScheme = useColorScheme();
    const colors = COLORS();
    const { selectedLanguage, setSelectedLanguage, loadLanguage } = useLanguageStore();

    const backgroundSource =
        colorScheme === "dark"
            ? require("@/assets/images/bg-page-dark.png")
            : require("@/assets/images/bg-page-light.png");

    useEffect(() => {
        loadLanguage();
        getProfile();
    }, []);

    const backToProfile = () => {
        router.push("/profile");
    };

    const handleLanguageChange = (language: string) => {
        setSelectedLanguage(language);
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
                        <View style={styles.header}>
                            <TouchableOpacity onPress={backToProfile}>
                                <AntDesign name="arrowleft" size={24} color="black" />
                            </TouchableOpacity>
                            <Text style={styles.title}>Tentang Kami</Text>
                        </View>

                        <View
                            style={[styles.contentOption, {
                                backgroundColor: colorScheme === "dark" ? "#1c1c1c" : "#fff",
                                borderRadius: 12,
                                height: "95%",
                                marginTop: "5%",
                                paddingVertical: "4%",
                                paddingHorizontal: 16,
                            }]}
                        >
                            <Text style={styles.subTitle}>
                                Penjelasan tentang aplikasi MHEWS dan profil perusahaan
                            </Text>
                        </View>
                    </View>
                </ScrollView>
                <FloatingSOSButton />
            </ImageBackground>
        </>
    );
}

const styles = StyleSheet.create({
    scrollContainer: {
        flexGrow: 1,
        paddingBottom: 20,
    },
    subTitle: {
        fontSize: 14,
        textAlign: "left",
        color: "#666",
        marginBottom: 10,
        marginLeft: 10,
    },
    container: { flex: 1, padding: 16, marginTop: "5%" },
    background: {
        flex: 1,
        width: "100%",
        height: "100%",
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        textAlign: "center",
        marginRight: 20,
        flex: 1,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
        paddingHorizontal: 8,
    },
    contentOption: {
        borderRadius: 12,
        width: "100%",
    },
});
