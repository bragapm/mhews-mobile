import React, { createContext, useContext, useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, Alert } from "react-native";
import Modal from "react-native-modal";
import SwipeSOSButton from "./SwipeSOSButton";
import { postData } from "@/app/services/apiServices";
import * as Location from "expo-location";
import { useAlert } from "./AlertContext";

// Context untuk mengontrol modal
const SOSModalContext = createContext({
    showModal: () => { },
    hideModal: () => { },
});

export const SOSModalProvider = ({ children }: { children: React.ReactNode }) => {
    const { showAlert } = useAlert();
    const [modalVisible, setModalVisible] = useState(false);
    const [emergencyMessage, setEmergencyMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);

    const fetchLocation = async () => {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== "granted") {
                showAlert("error", "Izin lokasi diperlukan untuk mengirim SOS.");
                return;
            }
            const { coords } = await Location.getCurrentPositionAsync({});
            setLocation({ latitude: coords.latitude, longitude: coords.longitude });
        } catch (error) {
            showAlert("error", "Gagal mengambil lokasi. Pastikan GPS aktif.");
        }
    };

    useEffect(() => {
        if (modalVisible) {
            fetchLocation();
        }
    }, [modalVisible]);

    const onSubmitSOS = async () => {
        if (!location) {
            showAlert("error", "Lokasi tidak tersedia.");
            return;
        }

        setLoading(true);
        try {
            const data = {
                "pesan_darurat": emergencyMessage,
                "geom": {
                    "coordinates": [location.longitude, location.latitude],
                    "type": "Point"
                },
                "sos_status": "bahaya"
            }

            const response = await postData("/items/sos_msg", data);
            if (response?.data) {
                setLoading(false);
                showAlert("success", "SOS berhasil dikirim!");
                setEmergencyMessage("");
                setModalVisible(false);
            } else {
                setLoading(false);
                showAlert("error", "Gagal mengirim SOS. Silakan coba lagi.");
            }
        } catch (error: any) {
            showAlert("error", error.message);
            setLoading(false);
        }
    }

    return (
        <SOSModalContext.Provider
            value={{
                showModal: () => setModalVisible(true),
                hideModal: () => setModalVisible(false),
            }}
        >
            {children}
            <Modal
                isVisible={modalVisible}
                onBackdropPress={() => setModalVisible(false)}
                swipeDirection="down"
                onSwipeComplete={() => setModalVisible(false)}
                style={styles.modal}
            >
                <View style={styles.modalContent}>
                    <View style={styles.dragIndicator} />

                    <Text style={styles.modalTitle}>SOS</Text>
                    <Text style={styles.modalSubtitle}>
                        Kirimkan Pesan Darurat untuk mendapatkan penanganan segera atas situasi darurat yang Anda alami.
                    </Text>

                    <TextInput
                        style={styles.input}
                        placeholder="Masukkan Pesan Darurat beserta Lokasi dan Detail Bencana"
                        multiline
                        value={emergencyMessage}
                        onChangeText={setEmergencyMessage}
                    />

                    <View style={styles.infoContainer}>
                        <Image source={require("../assets/icons/questionCircle.png")} style={styles.infoIcon} />
                        <Text style={styles.infoText}>
                            Pesan Darurat akan terkirim ketika Anda memiliki koneksi internet.
                        </Text>
                    </View>

                    {/* Swipe Button untuk Kirim SOS */}
                    <SwipeSOSButton onSwipeSuccess={onSubmitSOS} loading={loading} />
                </View>
            </Modal>
        </SOSModalContext.Provider>
    );
};

export const useSOSModal = () => useContext(SOSModalContext);

const styles = StyleSheet.create({
    modal: {
        justifyContent: "flex-end",
        margin: 0,
    },
    modalContent: {
        backgroundColor: "white",
        padding: 20,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        alignItems: "center",
    },
    dragIndicator: {
        width: 50,
        height: 5,
        backgroundColor: "#ccc",
        borderRadius: 10,
        marginBottom: 10,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 10,
    },
    modalSubtitle: {
        fontSize: 16,
        textAlign: "center",
        marginBottom: 20,
    },
    input: {
        width: "100%",
        borderWidth: 1,
        borderColor: "#ccc",
        padding: 10,
        borderRadius: 5,
        minHeight: 80,
        marginBottom: 10,
    },
    infoContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 10,
    },
    infoIcon: {
        width: 20,
        height: 20,
        marginRight: 5,
    },
    infoText: {
        fontSize: 14,
    },
    sosButton: {
        backgroundColor: "red",
        padding: 15,
        borderRadius: 10,
        alignItems: "center",
        width: "100%",
    },
    sosText: {
        color: "white",
        fontWeight: "bold",
    },
});
