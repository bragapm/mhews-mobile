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
        bottom: 10,
        right: 10,
        alignItems: "center",
        justifyContent: "center",
    },
    icon: {
        width: 80,
        height: 80,
        resizeMode: "contain",
    },
});

export default FloatingSOSButton;
