import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ImageBackground,
  Alert,
  ActivityIndicator,
  StatusBar,
  Pressable,
} from "react-native";
import Modal from "react-native-modal";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import Feather from "react-native-vector-icons/Feather";
import { z } from "zod";
import { postData } from "../services/apiServices";
import { useColorScheme } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useAlert } from "../components/AlertContext";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../navigation/types";
import COLORS from "../config/COLORS";

// Skema validasi dengan Zod
const signupSchema = z
  .object({
    NIK: z.string().min(16, "NIK harus 16 digit").max(16, "NIK harus 16 digit"),
    first_name: z.string().min(2, "Nama depan minimal 2 karakter"),
    last_name: z.string().min(2, "Nama belakang minimal 2 karakter"),
    phone: z.string().min(10, "Nomor HP minimal 10 digit"),
    email: z.string().email("Format email tidak valid"),
    password: z.string().min(6, "Password minimal 6 karakter"),
    confirm_password: z.string(),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Password tidak cocok",
    path: ["confirm_password"],
  });

const Signup = () => {
  const { showAlert } = useAlert();
  const colorScheme = useColorScheme();
  const colors = COLORS();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
    useState(false);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<"wa" | "email">("wa");
  const [savedData, setSavedData] = useState<any>({});

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(signupSchema),
  });

  const handleSignup = async (formData: any) => {
    setLoading(true);
    try {
      const { confirm_password, ...requestData } = formData;
      requestData.role = "16f26149-65b3-4de5-ba0d-cd7130887441";
      const response = await postData("/users", requestData);
      console.log(response);

      setTimeout(() => {
        setLoading(false);
        showAlert("success", "Akun berhasil dibuat!");
        setSavedData({
          email: formData.email,
          phone: formData.phone,
        });

        setIsModalVisible(true);
      }, 2000);
    } catch (error: any) {
      showAlert("error", error.message);
      setLoading(false);
    }
  };

  const handleSendOTP = async () => {
    setIsModalVisible(false);

    try {
      navigation.navigate("Otp", {
        email: savedData.email,
        phone: savedData.phone,
        sendTo: selectedMethod,
        from: "signup"
      });
    } catch (error: any) {
      showAlert("error", error.message);
    }
  };

  const backgroundSource =
    colorScheme === "dark"
      ? require("../assets/images/overlay-dark.png")
      : require("../assets/images/overlay-light.png");
  const logoSource =
    colorScheme === "dark"
      ? require("../assets/images/logo-dark.png")
      : require("../assets/images/braga-logo.png");

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
        <View style={styles.overlay} />
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <MaterialIcons name="arrow-back-ios" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={[styles.title, { color: colors.text }]}>
              Buat Akun
            </Text>
          </View>

          <View style={[styles.card, { backgroundColor: colors.background }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Silahkan lengkapi formulir dibawah ini sesuai dengan data diri
              anda untuk membuat akun
            </Text>

            <KeyboardAwareScrollView
              contentContainerStyle={{ flexGrow: 1 }}
              keyboardShouldPersistTaps="handled"
              enableOnAndroid={true}
              extraScrollHeight={20}
            >
              {/* Input NIK */}
              <Controller
                control={control}
                name="NIK"
                render={({ field: { onChange, value } }) => (
                  <View
                    style={[
                      styles.inputContainer,
                      {
                        borderColor: colors.border,
                        backgroundColor: colors.background,
                      },
                    ]}
                  >
                    <Feather
                      name="user"
                      size={24}
                      color={colors.text}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={[
                        styles.input,
                        {
                          color: colors.text,
                          backgroundColor: colors.background,
                        },
                      ]}
                      placeholder="NIK"
                      maxLength={16}
                      placeholderTextColor={colors.text}
                      keyboardType="number-pad"
                      value={value}
                      onChangeText={onChange}
                    />
                  </View>
                )}
              />
              {errors.NIK?.message && (
                <Text style={styles.errorText}>
                  {String(errors.NIK.message)}
                </Text>
              )}

              {/* Input Nama Depan */}
              <Controller
                control={control}
                name="first_name"
                render={({ field: { onChange, value } }) => (
                  <View
                    style={[
                      styles.inputContainer,
                      {
                        borderColor: colors.border,
                        backgroundColor: colors.background,
                      },
                    ]}
                  >
                    <Feather
                      name="user"
                      size={24}
                      color={colors.text}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={[
                        styles.input,
                        {
                          color: colors.text,
                          backgroundColor: colors.background,
                        },
                      ]}
                      placeholder="Nama Depan"
                      placeholderTextColor={colors.text}
                      value={value}
                      onChangeText={onChange}
                    />
                  </View>
                )}
              />
              {errors.first_name?.message && (
                <Text style={styles.errorText}>
                  {String(errors.first_name.message)}
                </Text>
              )}

              {/* Input Nama Belakang */}
              <Controller
                control={control}
                name="last_name"
                render={({ field: { onChange, value } }) => (
                  <View
                    style={[
                      styles.inputContainer,
                      {
                        borderColor: colors.border,
                        backgroundColor: colors.background,
                      },
                    ]}
                  >
                    <Feather
                      name="user"
                      size={24}
                      color={colors.text}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={[
                        styles.input,
                        {
                          color: colors.text,
                          backgroundColor: colors.background,
                        },
                      ]}
                      placeholder="Nama Belakang"
                      placeholderTextColor={colors.text}
                      value={value}
                      onChangeText={onChange}
                    />
                  </View>
                )}
              />
              {errors.last_name?.message && (
                <Text style={styles.errorText}>
                  {String(errors.last_name.message)}
                </Text>
              )}

              {/* Input Email */}
              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, value } }) => (
                  <View
                    style={[
                      styles.inputContainer,
                      {
                        borderColor: colors.border,
                        backgroundColor: colors.background,
                      },
                    ]}
                  >
                    <MaterialIcons
                      name="email"
                      size={24}
                      color={colors.text}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={[
                        styles.input,
                        {
                          color: colors.text,
                          backgroundColor: colors.background,
                        },
                      ]}
                      placeholder="Email"
                      placeholderTextColor={colors.text}
                      keyboardType="email-address"
                      value={value}
                      onChangeText={onChange}
                    />
                  </View>
                )}
              />
              {errors.email?.message && (
                <Text style={styles.errorText}>
                  {String(errors.email.message)}
                </Text>
              )}

              {/* Input Email */}
              <Controller
                control={control}
                name="phone"
                render={({ field: { onChange, value } }) => (
                  <View
                    style={[
                      styles.inputContainer,
                      {
                        borderColor: colors.border,
                        backgroundColor: colors.background,
                      },
                    ]}
                  >
                    <MaterialIcons
                      name="phone"
                      size={24}
                      color={colors.text}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={[
                        styles.input,
                        {
                          color: colors.text,
                          backgroundColor: colors.background,
                        },
                      ]}
                      placeholder="Nomor Handphone"
                      placeholderTextColor={colors.text}
                      keyboardType="phone-pad"
                      value={value}
                      onChangeText={onChange}
                    />
                  </View>
                )}
              />
              {errors.phone?.message && (
                <Text style={styles.errorText}>
                  {String(errors.phone.message)}
                </Text>
              )}

              {/* Input Password */}
              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, value } }) => (
                  <View
                    style={[
                      styles.inputContainer,
                      {
                        borderColor: colors.border,
                        backgroundColor: colors.background,
                      },
                    ]}
                  >
                    <MaterialIcons
                      name="lock"
                      size={24}
                      color={colors.text}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={[
                        styles.input,
                        {
                          color: colors.text,
                          backgroundColor: colors.background,
                        },
                      ]}
                      placeholder="Password"
                      placeholderTextColor={colors.text}
                      secureTextEntry={!isPasswordVisible}
                      value={value}
                      onChangeText={onChange}
                    />
                    <TouchableOpacity
                      onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                    >
                      <Feather
                        name={isPasswordVisible ? "eye" : "eye-off"}
                        size={24}
                        color={colors.text}
                      />
                    </TouchableOpacity>
                  </View>
                )}
              />
              {errors.password?.message && (
                <Text style={styles.errorText}>
                  {String(errors.password.message)}
                </Text>
              )}

              {/* Input Konfirmasi Password */}
              <Controller
                control={control}
                name="confirm_password"
                render={({ field: { onChange, value } }) => (
                  <View
                    style={[
                      styles.inputContainer,
                      {
                        borderColor: colors.border,
                        backgroundColor: colors.background,
                      },
                    ]}
                  >
                    <MaterialIcons
                      name="lock"
                      size={24}
                      color={colors.text}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={[
                        styles.input,
                        {
                          color: colors.text,
                          backgroundColor: colors.background,
                        },
                      ]}
                      placeholderTextColor={colors.text}
                      placeholder="Konfirmasi Password"
                      secureTextEntry={!isConfirmPasswordVisible}
                      value={value}
                      onChangeText={onChange}
                    />
                    <TouchableOpacity
                      onPress={() =>
                        setIsConfirmPasswordVisible(!isConfirmPasswordVisible)
                      }
                    >
                      <Feather
                        name={isConfirmPasswordVisible ? "eye" : "eye-off"}
                        size={24}
                        color={colors.text}
                      />
                    </TouchableOpacity>
                  </View>
                )}
              />
              {errors.confirm_password?.message && (
                <Text style={styles.errorText}>
                  {String(errors.confirm_password.message)}
                </Text>
              )}

              <TouchableOpacity
                style={styles.button}
                onPress={handleSubmit(handleSignup)}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.textButton}>Buat Akun</Text>
                )}
              </TouchableOpacity>
            </KeyboardAwareScrollView>
          </View>
        </View>
      </ImageBackground>
      {/* MODAL PILIHAN OTP */}
      <Modal
        isVisible={isModalVisible}
        onBackdropPress={() => setIsModalVisible(false)}
        swipeDirection="down"
        onSwipeComplete={() => setIsModalVisible(false)}
        style={styles.modal}
      >
        {/* Konten modal */}
        <View
          style={[styles.modalContent, { backgroundColor: colors.background }]}
        >
          <View style={styles.dragIndicator} />

          <Text style={[styles.modalTitle, { color: colors.text }]}>
            Kirim kode OTP
          </Text>
          <Text style={[styles.modalSubtitle, { color: colors.text }]}>
            Kode OTP (One-Time-Password) akan dikirimkan sebagai metode
            verifikasi akun. Pilih metode pengiriman kode OTP yang diinginkan.
          </Text>

          {/* Pilihan WhatsApp */}
          <Pressable
            style={[
              styles.methodOption,
              {
                backgroundColor:
                  selectedMethod === "wa" ? colors.darkOrange : "transparent",
              },
            ]}
            onPress={() => setSelectedMethod("wa")}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Feather
                name="whatsapp"
                size={20}
                color="#fff"
                style={{ marginRight: 8 }}
              />
              <Text style={styles.methodTitle}>WhatsApp</Text>
            </View>
            <Text style={styles.methodDesc}>
              Kode OTP akan dikirim ke WhatsApp ({savedData.phone})
            </Text>
          </Pressable>

          {/* Pilihan Email */}
          <Pressable
            style={[
              styles.methodOption,
              {
                backgroundColor:
                  selectedMethod === "email"
                    ? colors.darkOrange
                    : "transparent",
              },
            ]}
            onPress={() => setSelectedMethod("email")}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <MaterialIcons
                name="email"
                size={20}
                color="#fff"
                style={{ marginRight: 8 }}
              />
              <Text style={styles.methodTitle}>Email</Text>
            </View>
            <Text style={styles.methodDesc}>
              Kode OTP akan dikirim ke alamat email ({savedData.email})
            </Text>
          </Pressable>

          {/* Tombol Kirim OTP */}
          <TouchableOpacity
            style={[styles.sendButton, { backgroundColor: colors.button }]}
            onPress={handleSendOTP}
          >
            <Text style={styles.sendButtonText}>Kirim kode OTP</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </>
  );
};

export default Signup;

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 40,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginRight: 20,
    flex: 1,
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
    height: "100%",
    backgroundColor: "white",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "400",
    marginBottom: 10,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 10,
    marginBottom: 10,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
  },
  eyeIcon: {
    marginLeft: 10,
  },
  button: {
    backgroundColor: "#FF6200",
    paddingVertical: 15,
    borderRadius: 10,
    marginTop: 10,
  },
  textButton: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 18,
  },
  errorText: { color: "red", fontSize: 14, marginBottom: 10 },
  modal: {
    justifyContent: "flex-end",
    margin: 0, // Supaya modal full di bagian bawah
  },
  modalContent: {
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  dragIndicator: {
    width: 50,
    height: 5,
    backgroundColor: "#ccc",
    borderRadius: 10,
    alignSelf: "center",
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  modalSubtitle: {
    fontSize: 14,
    marginTop: 5,
    marginBottom: 15,
    textAlign: "center",
  },
  methodOption: {
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },
  sendButton: {
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  sendButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  cancelButton: {
    alignItems: "center",
    marginTop: 10,
  },
  methodTitle: {
    color: "#fff",
    fontWeight: "bold",
  },
  methodDesc: {
    color: "#fff",
    fontSize: 12,
    marginTop: 2,
  },
});
