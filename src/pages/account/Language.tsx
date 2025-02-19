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
    Image,
} from "react-native";
import React, { useEffect, useState } from "react";
import useAuthStore from "../../hooks/auth";
import AntDesign from "react-native-vector-icons/AntDesign";
import Feather from "react-native-vector-icons/Feather";
import COLORS from "../../config/COLORS";
import { useAlert } from "../../components/AlertContext";
import { useLanguageStore } from "../../hooks/languageStore";
import { HeaderNav } from "../../components/Header";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../navigation/types";

export default function LanguageScreen() {
    const reset = useAuthStore((state) => state.reset);
    const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
    const { showAlert } = useAlert();
    const { profile, getProfile } = useAuthStore();
    const colorScheme = useColorScheme();
    const colors = COLORS();
    const { selectedLanguage, setSelectedLanguage, loadLanguage } =
        useLanguageStore();

    const backgroundSource =
        colorScheme === "dark"
            ? require("../../assets/images/bg-page-dark.png")
            : require("../../assets/images/bg-page-light.png");

    useEffect(() => {
        loadLanguage();
        getProfile();
    }, []);

    const backToProfile = () => {
        navigation.replace("Tabs");
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
                        <HeaderNav onPress={backToProfile} title="Language" />
                        <View
                            style={[
                                styles.contentOption,
                                {
                                    backgroundColor: colorScheme === "dark" ? "#1c1c1c" : "#fff",
                                    borderRadius: 12,
                                    height: "95%",
                                    marginTop: "5%",
                                    paddingVertical: "4%",
                                    paddingHorizontal: 16,
                                },
                            ]}
                        >
                            <Text style={[styles.subTitle, { color: colors.tabIconDefault }]}>
                                Ubah Bahasa yang digunakan dalam Aplikasi MHEWS
                            </Text>

                            <View style={styles.languageOptionContainer}>
                                <TouchableOpacity
                                    style={[
                                        [styles.languageOption],
                                        selectedLanguage === "indonesia" &&
                                        styles.activeLanguageOption,
                                    ]}
                                    onPress={() => handleLanguageChange("indonesia")}
                                >
                                    <View style={styles.radioButton}>
                                        {selectedLanguage === "indonesia" && (
                                            <Feather name="circle" size={15} color="orange" />
                                        )}
                                    </View>
                                    <Text
                                        style={[
                                            styles.languageText,
                                            selectedLanguage === "indonesia" &&
                                            styles.activeLanguageText,
                                        ]}
                                    >
                                        Indonesia
                                        {selectedLanguage === "indonesia" && `\n`}
                                        {selectedLanguage === "indonesia" && (
                                            <Text style={styles.defaultText}>Default</Text>
                                        )}
                                    </Text>
                                    {selectedLanguage === "indonesia" && (
                                        <Feather name="check" size={20} color="orange" />
                                    )}
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[
                                        styles.languageOption,
                                        selectedLanguage === "english" &&
                                        styles.activeLanguageOption,
                                    ]}
                                    onPress={() => handleLanguageChange("english")}
                                >
                                    <View style={styles.radioButton}>
                                        {selectedLanguage === "english" && (
                                            <Feather name="circle" size={15} color="orange" />
                                        )}
                                    </View>
                                    <Text
                                        style={[
                                            styles.languageText,
                                            selectedLanguage === "english" &&
                                            styles.activeLanguageText,
                                        ]}
                                    >
                                        English
                                        {selectedLanguage === "english" && `\n`}
                                        {selectedLanguage === "english" && (
                                            <Text style={styles.defaultText}>Default</Text>
                                        )}
                                    </Text>
                                    {selectedLanguage === "english" && (
                                        <Feather name="check" size={20} color="orange" />
                                    )}
                                </TouchableOpacity>
                            </View>
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
    languageOptionContainer: {
        marginTop: 20,
    },
    languageOption: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 5,
        marginBottom: 10,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    radioButton: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: "orange",
        marginRight: 10,
        justifyContent: "center",
        alignItems: "center",
    },
    languageText: {
        fontSize: 16,
        color: "#333",
        flex: 1,
    },
    activeLanguageOption: {
        backgroundColor: "#FEF9EF",
    },
    activeLanguageText: {
        color: "#F36A1D",
        fontWeight: "700",
    },
    defaultText: {
        fontSize: 12,
        color: "gray",
    },
});
