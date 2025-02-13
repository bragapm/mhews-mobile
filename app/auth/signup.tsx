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
} from "react-native";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import AntDesign from "@expo/vector-icons/AntDesign";
import Feather from "@expo/vector-icons/Feather";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router } from "expo-router";
import colors from "../constants/colors";
import { postData } from "../services/apiServices";
import { useColorScheme } from "react-native";
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
  const colorScheme = useColorScheme();
  const colors = COLORS();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
    useState(false);
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(signupSchema),
  });

  const handleSignup = async (data: any) => {
    setLoading(true);
    try {
      const { confirm_password, ...formData } = data;
      const requestData = {
        ...formData,
        role: "16f26149-65b3-4de5-ba0d-cd7130887441", // Set default role
      };

      const response = await postData("/users", requestData);
      //bypass langsung soalnya gak ada response kalo berhasil
      setTimeout(() => {
        setLoading(false);
        Alert.alert("Sukses", "Akun berhasil dibuat!");
        router.push("/auth/login");
      }, 2000);
    } catch (error: any) {
      Alert.alert("Error", error.message);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  const backgroundSource =
    colorScheme === "dark"
      ? require("../../assets/images/overlay-dark.png")
      : require("../../assets/images/overlay-light.png");
  const logoSource =
    colorScheme === "dark"
      ? require("../../assets/images/logo-dark.png")
      : require("../../assets/images/braga-logo.png");

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
            <TouchableOpacity onPress={() => router.back()}>
              <AntDesign name="arrowleft" size={24} color={colors.text} />
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
                  <AntDesign
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
                    placeholderTextColor={colors.text}
                    keyboardType="number-pad"
                    value={value}
                    onChangeText={onChange}
                  />
                </View>
              )}
            />
            {errors.NIK?.message && (
              <Text style={styles.errorText}>{String(errors.NIK.message)}</Text>
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
                  <AntDesign
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
                  <AntDesign
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
                  <Feather
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
                  <Feather
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
          </View>
        </View>
      </ImageBackground>
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
    height: "80%",
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
    backgroundColor: colors.primary,
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
});
