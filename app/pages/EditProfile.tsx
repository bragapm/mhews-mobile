import {
    View,
    Text,
    ImageBackground,
    useColorScheme,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    TextInput,
} from "react-native";
import COLORS from "../config/COLORS";
import { LinearGradient } from "expo-linear-gradient";
import FloatingSOSButton from "@/components/FloatingSOSButton";
import { useEffect, useState } from "react";
import Modal from "react-native-modal";
import useAuthStore from "../hooks/auth";
import { useRouter } from "expo-router";
import { AntDesign } from "@expo/vector-icons";

export default function ProfileScreen() {
    const reset = useAuthStore((state) => state.reset);
    const router = useRouter();
    const { profile, getProfile } = useAuthStore();
    const colorScheme = useColorScheme();
    const backgroundSource =
        colorScheme === "dark"
            ? require("../../assets/images/bg-page-dark.png")
            : require("../../assets/images/bg-page-light.png");

    useEffect(() => {
        getProfile();
    }, []);

    return (
        <ImageBackground
            source={backgroundSource}
            style={styles.background}
            resizeMode="cover"
        >
            <ScrollView
                contentContainerStyle={styles.scrollContainer}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.overlay} />
                <View style={styles.container}>
                    <View style={styles.header}>
                        <TouchableOpacity onPress={() => router.back()}>
                            <AntDesign name="arrowleft" size={24} color="black" />
                        </TouchableOpacity>
                        <Text style={styles.title}>Edit Profil</Text>
                    </View>
                </View>
            </ScrollView>
            <FloatingSOSButton />
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    scrollContainer: {
        flexGrow: 1,
        paddingBottom: 20,
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
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(255, 255, 255, 0.1)",
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
        paddingHorizontal: 8,
    },
    headerTextContainer: {
        flex: 1,
    },
    greeting: {
        fontSize: 32,
        fontWeight: "bold",
    },
    card: {
        // marginRight: 14,

        alignItems: "center",
        justifyContent: "center",
        // marginBottom: 10,

        borderWidth: 1,
        borderRadius: 12,
        borderColor: "#C3C3BF",
    },

    cardOption: {
        // marginRight: 14,

        alignItems: "center",
        justifyContent: "center",
        // marginBottom: 10,

        borderWidth: 1,
        borderRadius: 12,
        borderColor: "#C3C3BF",
        width: "100%",
        alignSelf: "center",
        marginTop: "5%",
    },
    contentOption: {
        borderRadius: 12,
        // paddingHorizontal: "5%",
        // paddingVertical: "7%",
        width: "100%",
        alignItems: "center",
        justifyContent: "center",
    },

    gradient: {
        borderRadius: 12,
        paddingHorizontal: "5%",
        paddingVertical: "7%",
        width: "100%",
        alignItems: "center",
        justifyContent: "center",
    },

    iconContainer: {
        width: "100%",
        paddingHorizontal: "0%",
        paddingVertical: "0%",
        flexDirection: "row",
        justifyContent: "flex-start",
        alignItems: "center",
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: "600",
        textAlign: "left",
    },
    textOption: {
        fontSize: 14,
        fontWeight: "500",
        textAlign: "left",
    },
    txtSubTitle: {
        fontSize: 12,
        fontWeight: "400",
        textAlign: "left",
    },
    textContent: {
        alignSelf: "flex-start",
        paddingHorizontal: "5%",
        alignItems: "flex-start",
        justifyContent: "center",
    },
    cardSubtitle: {
        fontSize: 14,
        marginTop: 4,
        color: "#4F4D4A",
        textAlign: "right",
    },
    textContainer: {
        flex: 1,
        marginLeft: 10,
    },
    optionContainer: {
        width: "100%",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: "5%",
    },
    optionLeft: {
        width: "60%",
        flexDirection: "row",
        alignItems: "center",
        paddingLeft: "5%",
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

    arrowWrapper: {
        width: "10%",
        alignItems: "center",
        justifyContent: "center",
    },
    arrowIcon: {
        width: 12,
        height: 12,
        marginRight: 15,
        resizeMode: "contain",
        tintColor: "#999",
    },
    label: {
        fontSize: 14,
        color: '#6C757D',
        marginTop: 10,
    },
    value: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#212529',
    },
    editButton: {
        backgroundColor: '#007BFF',
        paddingVertical: 12,
        paddingHorizontal: 40,
        borderRadius: 5,
    },
    editButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
});