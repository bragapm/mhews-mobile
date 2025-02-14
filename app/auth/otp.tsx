import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  StatusBar,
  useColorScheme,
} from "react-native";
// import OTPInputView from "@twotalltotems/react-native-otp-input";
import {
  CodeField,
  Cursor,
  useBlurOnFulfill,
  useClearByFocusCell,
} from "react-native-confirmation-code-field";
import { router, useLocalSearchParams } from "expo-router";
import AntDesign from "@expo/vector-icons/AntDesign";
import { postData } from "../services/apiServices";

const CELL_COUNT = 6;
const OTPConfirmation = () => {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(300);
  const colorScheme = useColorScheme();
  const { email, phone, sendTo } = useLocalSearchParams();
  // console.log("sendTo", sendTo);

  useEffect(() => {
    let interval: any = null;

    if (countdown > 0) {
      interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    // Bersihkan interval jika unmount
    return () => clearInterval(interval);
  }, [countdown]);

  const formatTime = (secs: number) => {
    const minutes = Math.floor(secs / 60);
    const seconds = secs % 60;
    const sMinutes = minutes < 10 ? `0${minutes}` : minutes;
    const sSeconds = seconds < 10 ? `0${seconds}` : seconds;
    return `${sMinutes}:${sSeconds}`;
  };

  // - useBlurOnFulfill: otomatis fokus ke cell berikutnya
  // - useClearByFocusCell: membersihkan cell saat di-tap
  const ref = useBlurOnFulfill({ value: otp, cellCount: CELL_COUNT });
  const [propsCell, getCellOnLayoutHandler] = useClearByFocusCell({
    value: otp,
    setValue: setOtp,
  });

  const handleVerifyOTP = async () => {
    setLoading(true);
    try {
      // const response = await postData("/users", requestData);
    } catch {}
    setTimeout(() => {
      setLoading(false);
      Alert.alert("OTP Verified!");
      router.push("/(tabs)/home");
    }, 2000);
  };

  const handleResendOTP = () => {
    // Lakukan logic kirim ulang OTP ke server (jika perlu), lalu reset timer
    setCountdown(300);
    Alert.alert("OTP Dikirm Ulang");
  };

  // Apakah OTP lengkap 6 digit?
  const isOtpComplete = otp.length === CELL_COUNT;

  return (
    <>
      <StatusBar
        translucent={true}
        backgroundColor="transparent"
        barStyle={colorScheme === "dark" ? "light-content" : "dark-content"}
      />
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <AntDesign name="arrowleft" size={24} color="black" />
          </TouchableOpacity>
          <Text style={styles.title}>Konfirmasi Kode OTP</Text>
        </View>

        {/* Card Content */}
        <View style={styles.card}>
          <Text style={styles.description}>
            Kode OTP (One-Time Password) telah dikirimkan ke nomor whatsapp (+
            {phone}). Harap periksa whatsapp Anda secara berkala.
          </Text>

          <TouchableOpacity
            style={{
              width: "100%",
            }}
          >
            <Text style={styles.changeMethod}>Ganti Metode?</Text>
          </TouchableOpacity>

          {/* OTP Input (CodeField) */}
          <CodeField
            ref={ref}
            {...propsCell}
            cellCount={CELL_COUNT}
            value={otp}
            onChangeText={setOtp}
            rootStyle={styles.codeFieldRoot}
            keyboardType="number-pad"
            textContentType="oneTimeCode"
            renderCell={({ index, symbol, isFocused }) => (
              <View
                key={index}
                style={[styles.cell, isFocused && styles.focusCell]}
                onLayout={getCellOnLayoutHandler(index)}
              >
                <Text style={styles.cellText}>
                  {symbol || (isFocused ? <Cursor /> : null)}
                </Text>
              </View>
            )}
          />

          {/* Tombol verifikasi OTP -> disabled kalau belum 6 digit */}
          <TouchableOpacity
            style={[
              styles.verifyButton,
              // Jika belum 6 digit, ubah warna agar terlihat disabled
              !isOtpComplete && { backgroundColor: "#ccc" },
            ]}
            onPress={handleVerifyOTP}
            disabled={!isOtpComplete || loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.verifyText}>Verifikasi Kode OTP</Text>
            )}
          </TouchableOpacity>

          {/* Kirim Ulang */}
          {countdown > 0 ? (
            // Countdown belum habis: tampilkan text countdown
            <Text style={styles.countdownText}>
              Kirim Ulang ({formatTime(countdown)})
            </Text>
          ) : (
            // Countdown habis => tombol resend
            <TouchableOpacity onPress={handleResendOTP}>
              <Text style={styles.resendText}>Kirim Ulang</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </>
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
    textAlign: "left",
    color: "#666",
    marginBottom: 20,
  },
  changeMethod: {
    color: "#FF6200",
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "left",
  },
  codeFieldRoot: {
    marginTop: 20,
    marginBottom: 20,
    width: "100%",
    justifyContent: "space-between",
  },
  cell: {
    width: 45,
    height: 50,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    justifyContent: "center",
    alignItems: "center",
  },
  focusCell: {
    borderColor: "#FF6200",
  },
  cellText: {
    fontSize: 20,
    color: "#000",
    textAlign: "center",
  },
  verifyButton: {
    backgroundColor: "#FF6200",
    padding: 15,
    borderRadius: 10,
    width: "100%",
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
  countdownText: {
    color: "#666",
    marginTop: 5,
    fontWeight: "600",
  },
});

export default OTPConfirmation;
