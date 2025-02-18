import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, Alert, Platform, PermissionsAndroid } from "react-native";
import Modal from "react-native-modal";
import { useAlert } from "./AlertContext";
import { useColorScheme } from "react-native";
import COLORS from "../config/COLORS";
import { postData } from "../services/apiServices";
import GetLocation from 'react-native-get-location';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';

// Context untuk mengontrol modal
const SOSModalContext = createContext({
    showModal: () => { },
    hideModal: () => { },
});

export const SOSModalProvider = ({ children }: { children: React.ReactNode }) => {
    const { showAlert } = useAlert();
    const colorScheme = useColorScheme();
    const colors = COLORS();
    const [modalVisible, setModalVisible] = useState(false);
    const [isSuccessSubmitSOS, setIsSuccessSubmitSOS] = useState(false);
    const [emergencyMessage, setEmergencyMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [holding, setHolding] = useState(false);
    const [countdown, setCountdown] = useState(5);
    const countdownRef = useRef<NodeJS.Timeout | null>(null);
    const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);

    const requestLocationPermission = async () => {
        try {
            if (Platform.OS === 'android') {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
                );
                return granted === PermissionsAndroid.RESULTS.GRANTED;
            }
            const result = await request(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);
            return result === RESULTS.GRANTED;
        } catch (error) {
            console.log('Permission Error:', error);
            return false;
        }
    };

    const fetchLocation = async () => {
        try {
            const result = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION)
            if (result == true) {
                getLocation();
            }
            else if (result == false) {
                const hasPermission = await requestLocationPermission();
                if (!hasPermission) {
                    showAlert('error', 'Izin lokasi diperlukan untuk mengirim SOS.');
                    return;
                }

                getLocation();
            }
        } catch (error) {
            console.log(JSON.stringify(error));
            showAlert('error', 'Gagal mengambil lokasi. Pastikan GPS aktif.');
        }
    };

    const getLocation = async () => {
        GetLocation.getCurrentPosition({
            enableHighAccuracy: true,
            timeout: 60000,
        })
            .then(location => {
                console.log(location);
                const { latitude, longitude } = location;
                setLocation({ latitude, longitude });
            })
            .catch(error => {
                const { code, message } = error;
                console.warn(code, message);
            })
    };

    useEffect(() => {
        if (modalVisible) {
            fetchLocation();
            setEmergencyMessage("");
        }
    }, [modalVisible]);

    const onSubmitSOS = async () => {
        if (!emergencyMessage.trim()) {
            showAlert("error", "Pesan harus diisi!");
            return;
        }

        if (!location) {
            setLoading(false);
            setModalVisible(false);
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
                setIsSuccessSubmitSOS(true);
            } else {
                setLoading(false);
                showAlert("error", "Gagal mengirim SOS. Silakan coba lagi.");
            }
        } catch (error: any) {
            showAlert("error", error.message);
            setLoading(false);
        }
    }

    const closeModal = () => {
        setModalVisible(false);
        setIsSuccessSubmitSOS(false);
    }

    const handleLongPress = () => {
        if (!loading && emergencyMessage.trim()) {
            setHolding(true);
            setCountdown(5); // Reset countdown setiap kali ditekan

            let timer = 5;
            countdownRef.current = setInterval(() => {
                timer -= 1;
                setCountdown(timer);
                if (timer <= 0) {
                    clearInterval(countdownRef.current!);
                    countdownRef.current = null;
                    setHolding(false);
                    setLoading(true);
                    onSubmitSOS();
                }
            }, 1000);
        }
    };

    const handlePressOut = () => {
        if (countdownRef.current) {
            clearInterval(countdownRef.current);
            countdownRef.current = null;
        }
        setHolding(false);
    };

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
                {!isSuccessSubmitSOS ? (
                    <View style={styles.modalContent}>
                        <View style={styles.dragIndicator} />
                        <Text style={styles.modalTitle}>SOS</Text>
                        <Text style={styles.modalSubtitle}>
                            Kirimkan Pesan Darurat untuk mendapatkan penanganan segera atas situasi darurat yang Anda alami.
                        </Text>

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Pesan Darurat</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Masukkan Pesan Darurat beserta Lokasi dan Detail Bencana"
                                multiline
                                value={emergencyMessage}
                                onChangeText={setEmergencyMessage}
                            />
                        </View>


                        <View style={styles.infoContainer}>
                            <Image source={require("../assets/icons/questionCircle.png")} style={styles.infoIcon} />
                            <Text style={styles.infoText}>
                                Pesan Darurat akan terkirim ketika Anda memiliki koneksi internet.
                            </Text>
                        </View>

                        {/* Hold Button untuk Kirim SOS */}
                        <TouchableOpacity
                            style={[styles.outlineButton, !emergencyMessage.trim() && styles.disabledButton]}
                            onLongPress={handleLongPress}
                            onPressOut={handlePressOut}
                            delayLongPress={5000}
                            disabled={loading || !emergencyMessage.trim()}
                        >
                            <Text style={[styles.outlineButtonText, !emergencyMessage.trim() && styles.disableOutlineButtonText]}>
                                {loading ? "Mengirim..." : holding ? `Tahan ${countdown} detik lagi` : "Tahan untuk Kirim SOS"}
                            </Text>
                        </TouchableOpacity>

                        {/* Swipe Button untuk Kirim SOS */}
                        {/* <SwipeSOSButton onSwipeSuccess={onSubmitSOS} loading={loading} disabled={!emergencyMessage.trim()} /> */}
                    </View>
                ) : (
                    <View style={styles.modalContent}>
                        <View style={styles.dragIndicator} />

                        <Image source={require("../assets/icons/alert.png")} style={styles.icon} />
                        <Text style={styles.modalTitle}>SOS Terkirim</Text>
                        <Text style={styles.modalSubtitle}>
                            Pesan Darurat anda telah terkirim dan akan segera diproses oleh petugas kami. Selama dalam proses menunggu, pastikan anda dalam keadaan aman.
                        </Text>


                        <TouchableOpacity
                            style={styles.button}
                            onPress={closeModal}
                            disabled={loading}
                        >
                            <Text style={styles.textButton}>Kembali ke Beranda</Text>
                        </TouchableOpacity>
                    </View>
                )}
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
        minHeight: "60%",
        maxHeight: "80%",
    },
    inputContainer: {
        width: "100%",
        marginBottom: 10,
    },
    label: {
        fontSize: 14,
        color: "#555",
        marginBottom: 5,
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
        textAlign: "left",
        marginBottom: 20,
    },
    input: {
        width: "100%",
        borderWidth: 1,
        borderColor: "#ccc",
        padding: 10,
        borderRadius: 5,
        minHeight: 100,
        marginBottom: 10,
    },
    infoContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 10,
        marginLeft: 5,
        marginRight: 5
    },
    infoIcon: {
        width: 20,
        height: 20,
        marginRight: 5,
    },
    infoText: {
        fontSize: 14,
    },
    button: {
        backgroundColor: "#FF6200",
        paddingVertical: 15,
        borderRadius: 10,
        marginTop: 10,
        padding: 15
    },
    textButton: {
        color: "white",
        fontWeight: "bold",
        textAlign: "center",
        fontSize: 18,
    },
    icon: {
        marginTop: 20
    },
    outlineButton: {
        borderWidth: 2,
        borderColor: "#E64040",
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: "center",
        marginTop: 20,
        padding: 20,
        width: "100%"
    },
    outlineButtonText: {
        color: "#E64040",
        fontSize: 16,
        fontWeight: "600",
    },
    disabledButton: {
        borderWidth: 2,
        borderColor: "#BDBDBD",
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: "center",
        marginTop: 20,
        padding: 20,
        width: "100%"
    },
    disableOutlineButtonText: {
        color: "#BDBDBD",
        fontSize: 16,
        fontWeight: "600",
    },
});
