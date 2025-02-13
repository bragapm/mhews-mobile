import React from "react";
import { Image, TouchableOpacity, StyleSheet } from "react-native";
import { useSOSModal } from "../components/GlobalSOSModal";

const FloatingSOSButton: React.FC = () => {
    const { showModal } = useSOSModal();

    return (
        <TouchableOpacity style={styles.fab} onPress={showModal}>
            <Image source={require("../assets/icons/SOS.png")} style={styles.icon} />
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    fab: {
        position: "absolute",
        bottom: 20,
        right: 20,
        alignItems: "center",
        justifyContent: "center",
    },
    icon: {
        width: 70,
        height: 70,
        resizeMode: "contain",
    },
});

export default FloatingSOSButton;
