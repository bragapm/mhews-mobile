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
import { CodeField, Cursor, useBlurOnFulfill, useClearByFocusCell } from "react-native-confirmation-code-field";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { postData } from "../services/apiServices";
import { useAlert } from "../components/AlertContext";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../navigation/types";

const CELL_COUNT = 6;
type RootParamList = {
  OTPConfirmation: {
    email?: string;
    phone?: string;
    sendTo?: string;
    from?: string;
  };
};

const OTPConfirmation = () => {
  const [otp, setOtp] = useState("");
  const { showAlert } = useAlert();
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(300);
  const colorScheme = useColorScheme();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootParamList, 'OTPConfirmation'>>();

  const { email, phone, sendTo, from } = route.params || {};
  const [secretKey, setSecretKey] = useState(null);

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

    return () => clearInterval(interval);
  }, [countdown]);

  useEffect(() => {
    if (email) {
      handleSendOTP();
    }
  }, [email]);

  const formatTime = (secs: number) => {
    const minutes = Math.floor(secs / 60);
    const seconds = secs % 60;
    const sMinutes = minutes < 10 ? `0${minutes}` : minutes;
    const sSeconds = seconds < 10 ? `0${seconds}` : seconds;
    return `${sMinutes}:${sSeconds}`;
  };

  const ref = useBlurOnFulfill({ value: otp, cellCount: CELL_COUNT });
  const [propsCell, getCellOnLayoutHandler] = useClearByFocusCell({
    value: otp,
    setValue: setOtp,
  });

  const handleVerifyOTP = async () => {
    setLoading(true);
    try {
      if (from == "signin") {
        const data = {
          email: email,
          phone: "",
          otp: otp,
        };
        const response = await postData("/signin-otp/verify", data);
        if (response) {
          if (response?.status == "ok") {
            navigation.replace("Tabs"); // Updated navigation
            showAlert("success", "OTP Berhasil diverifikasi.");
          } else {
            showAlert("error", response?.message);
          }
        }
      } else {
        const data = {
          email: sendTo == "email" ? email : "",
          phone: sendTo == "wa" ? phone : "",
          otp: otp,
          secret_key: secretKey,
        };
        const response = await postData("/signup-otp/verify", data);
        if (response) {
          if (response?.status == "ok") {
            navigation.replace("Tabs"); // Updated navigation
            showAlert("success", "OTP Berhasil diverifikasi.");
          } else {
            showAlert("error", response?.message);
          }
        }
      }
    } catch (error: any) {
      showAlert("error", error.error || error.message);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  const handleSendOTP = async () => {
    try {
      let sendOtp;

      if (from === "signin") {
        sendOtp = await postData("/signin-otp/email", { email });
      } else {
        if (sendTo === "wa") {
          sendOtp = await postData("/signup-otp/phone", { phone });
        } else {
          sendOtp = await postData("/signup-otp/email", { email });
        }
      }

      if (!sendOtp || sendOtp.error) {
        throw new Error(sendOtp?.message || "Gagal mengirim OTP. Silakan coba lagi.");
      }

      if (sendOtp?.secretKey) {
        setSecretKey(sendOtp?.secretKey);
      }
      showAlert("success", "OTP Berhasil dikirim.");
      setCountdown(300);
    } catch (error: any) {
      console.error("Error mengirim OTP:", error);
      showAlert("error", error.message || "Terjadi kesalahan, silakan coba lagi.");
    }
  };

  const handleResendOTP = () => {
    handleSendOTP();
  };

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
          <TouchableOpacity onPress={() => navigation.goBack()}> {/* Use navigation.goBack() */}
            <MaterialIcons name="arrow-back-ios" size={24} color="black" />
          </TouchableOpacity>
          <Text style={styles.title}>Konfirmasi Kode OTP</Text>
        </View>

        {/* Card Content */}
        <View style={styles.card}>
          <Text style={styles.description}>
            {from === "signin" ? (
              <>
                Kode OTP (One-Time Password) telah dikirimkan ke email{" "}
                <Text style={{ fontWeight: "bold" }}>{email}</Text>. Harap periksa email Anda secara berkala.
              </>
            ) : sendTo === "wa" ? (
              <>
                Kode OTP (One-Time Password) telah dikirimkan ke nomor WhatsApp (+
                <Text style={{ fontWeight: "bold" }}>{phone}</Text>). Harap periksa WhatsApp Anda secara berkala.
              </>
            ) : (
              <>
                Kode OTP (One-Time Password) telah dikirimkan ke email{" "}
                <Text style={{ fontWeight: "bold" }}>{email}</Text>. Harap periksa email Anda secara berkala.
              </>
            )}
          </Text>

          {from === "signup" && (
            <TouchableOpacity
              style={{
                width: "100%",
              }}
            >
              <Text style={styles.changeMethod}>Ganti Metode?</Text>
            </TouchableOpacity>
          )}

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
                  {symbol || (isFocused ? <Cursor /> : "*")}
                </Text>
              </View>
            )}
          />

          {/* Tombol verifikasi OTP -> disabled kalau belum 6 digit */}
          <TouchableOpacity
            style={[styles.verifyButton, !isOtpComplete && { backgroundColor: "#ccc" }]}
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
            <Text style={styles.countdownText}>
              Kirim Ulang ({formatTime(countdown)})
            </Text>
          ) : (
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
