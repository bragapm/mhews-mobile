import {
    View,
    Text,
    ImageBackground,
    useColorScheme,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    StatusBar,
    TextInput,
    ActivityIndicator,
    Image,
} from "react-native";
import React, { useEffect, useState } from "react";
import useAuthStore from "../../hooks/auth";
import { useRouter } from "expo-router";
import { AntDesign, Feather, MaterialIcons } from "@expo/vector-icons";
import COLORS from "../../config/COLORS";
import { useAlert } from "@/components/AlertContext";
import { HeaderNav } from "@/components/Header";

export default function FamilyProfileScreen() {
    const reset = useAuthStore((state) => state.reset);
    const router = useRouter();
    const { showAlert } = useAlert();
    const { profile, getProfile } = useAuthStore();
    const colorScheme = useColorScheme();
    const colors = COLORS();
    const [loading, setLoading] = useState(false);
    const backgroundSource =
        colorScheme === "dark"
            ? require("@/assets/images/bg-page-dark.png")
            : require("@/assets/images/bg-page-light.png");

    useEffect(() => {
        getProfile();
    }, []);

    const options = [
        {
            title: "Daftar Kerabat",
            icon:
                colorScheme === "dark"
                    ? require("@/assets/images/profil-kerabat-dark.png")
                    : require("@/assets/images/profil-kerabat-light.png"),
            route: "/pages/account/FamilyList",
        },
        {
            title: "Cari Kerabat",
            icon:
                colorScheme === "dark"
                    ? require("@/assets/icons/search.png")
                    : require("@/assets/icons/search.png"),
            route: "/pages/account/language",
        },
    ];

    const backToProfile = () => {
        router.push("/profile");
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
                    <>
                        <View style={styles.container}>
                            {/* Header */}
                            <HeaderNav onPress={backToProfile} title="Profil Kerabat" />

                            {/* Content */}
                            <View
                                style={[
                                    styles.contentOption,
                                    {
                                        backgroundColor:
                                            colorScheme === "dark" ? "#1c1c1c" : "#fff",
                                        borderRadius: 12,
                                        height: "95%",
                                        marginTop: "5%",
                                        paddingVertical: "4%",
                                        paddingHorizontal: 16,
                                    },
                                ]}
                            >
                                <Text style={[styles.subTitle,{color:colors.tabIconDefault}]}>
                                    Kelola dan cari profil kerabat anda pada aplikasi MHEWS
                                </Text>

                                <View>
                                    {options.map((item: any, index) => (
                                        <TouchableOpacity
                                            key={index}
                                            style={styles.optionContainer}
                                            onPress={() => {
                                                if (item.isExit && item.action) {
                                                    item.action();
                                                } else {
                                                    router.push(item.route);
                                                }
                                            }}
                                        >
                                            <View style={styles.optionLeft}>
                                                <View style={styles.iconWrapper}>
                                                    <Image source={item.icon} style={styles.iconImage} />
                                                </View>
                                                <View style={styles.textWrapper}>
                                                    <Text
                                                        style={[
                                                            styles.textOption,
                                                            { color: item.isExit ? "#d9534f" : colors.subText},
                                                        ]}
                                                    >
                                                        {item.title}
                                                    </Text>
                                                </View>
                                            </View>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                        </View>
                    </>
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
    contentOption: {
        borderRadius: 12,
        width: "100%",
    },
    optionContainer: {
        width: "100%",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: "2%",
    },
    optionLeft: {
        width: "60%",
        flexDirection: "row",
        alignItems: "center",
        paddingLeft: "2%",
    },
    iconWrapper: {
        width: "10%",
        justifyContent: "center",
    },
    iconImage: {
        width: 30,
        height: 20,
        resizeMode: "contain",
    },
    textWrapper: {
        width: "80%",
        paddingHorizontal: "5%",
        justifyContent: "center",
    },
    textOption: {
        fontSize: 14,
        fontWeight: "500",
        textAlign: "left",
    },
});
