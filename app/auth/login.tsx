import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ImageBackground,
  Image,
  Alert,
  ActivityIndicator,
  useColorScheme,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import React, { useState } from "react";
import AntDesign from "@expo/vector-icons/AntDesign";
import Feather from "@expo/vector-icons/Feather";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router } from "expo-router";
import colors from "../constants/colors";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { postData } from "../services/apiServices";
import COLORS from "../config/COLORS";

// Skema validasi dengan Zod
const signinSchema = z.object({
  email: z.string().email("Format email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
});

const Login = () => {
  const colorScheme = useColorScheme();
  const colors = COLORS();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(signinSchema),
  });

  const handleSignin = async (data: any) => {
    setLoading(true);
    try {
      const response = await postData("/signin", data);
      console.log(response);
      setTimeout(() => {
        setLoading(false);
        Alert.alert("Sukses", "Login berhasil!");
        router.push("/auth/otp");
      }, 2000);
    } catch (error: any) {
      console.log(error);
      Alert.alert("Error", error.message);
      router.push("/auth/otp");
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
    <ImageBackground
      source={backgroundSource}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.container}>
        <KeyboardAwareScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          enableOnAndroid={true}
          extraScrollHeight={20} // Sesuaikan nilai ini jika perlu
        >
          {/* Header */}
          <View style={{ marginLeft: 15, marginTop: 25 }}>
            <Image
              source={logoSource}
              style={{ width: 150, height: 50, resizeMode: "contain" }}
            />
          </View>

          {/* Title */}
          <View style={{ marginBottom: 20 }}>
            <Text style={[styles.title, { color: colors.text }]}>
              Selamat datang di
            </Text>
            <Text style={[styles.title, { color: colors.text }]}>
              Aplikasi MHEWS
            </Text>
          </View>

          {/* Form Login */}
          <View style={[styles.card, { backgroundColor: colors.background }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Masuk
            </Text>

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
                    secureTextEntry={!isPasswordVisible}
                    value={value}
                    onChangeText={onChange}
                    placeholderTextColor={colors.text}
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

            <TouchableOpacity
              style={styles.button}
              onPress={() => router.push("/(tabs)/home")}
              // onPress={handleSubmit(handleSignin)}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.textButton}>Masuk</Text>
              )}
            </TouchableOpacity>

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginVertical: 10,
              }}
            >
              <View style={{ flex: 1, height: 1, backgroundColor: "#ccc" }} />
              <Text
                style={[
                  styles.orText,
                  {
                    marginHorizontal: 10,
                    textAlign: "center",
                    color: colors.text,
                  },
                ]}
              >
                atau
              </Text>
              <View style={{ flex: 1, height: 1, backgroundColor: "#ccc" }} />
            </View>

            {/* Tombol Masuk dengan Google */}
            <TouchableOpacity
              style={[styles.altButton, { backgroundColor: colors.background }]}
            >
              {/* <AntDesign name="google" size={24} color="#DB4437" /> */}
              <Image
                source={require("../../assets/images/google.png")}
                style={styles.iconImage}
              />
              <Text style={styles.altText}>Masuk dengan Google</Text>
            </TouchableOpacity>

            {/* Tombol Masuk dengan SSO BNPB */}
            <TouchableOpacity
              style={[styles.altButton, { backgroundColor: colors.background }]}
            >
              <Image
                source={require("../../assets/icons/bnpb-logo.png")}
                style={styles.iconImage}
              />
              <Text style={styles.altText}>Masuk dengan SSO BNPB</Text>
            </TouchableOpacity>

            {/* Tombol Masuk sebagai Guest */}
            <TouchableOpacity
              style={[styles.altButton, { backgroundColor: colors.background }]}
            >
              <Image
                source={require("../../assets/images/guest.png")}
                style={styles.iconImage}
              />
              {/* <MaterialIcons name="person-outline" size={24} color="black" /> */}
              <Text style={styles.altText}>Masuk Sebagai Guest</Text>
            </TouchableOpacity>

            {/* Link Daftar */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "center",
                marginTop: 20,
              }}
            >
              <Text style={{ fontSize: 16, color: colors.text }}>
                Belum punya akun?
              </Text>
              <TouchableOpacity onPress={() => router.push("/auth/signup")}>
                <Text style={styles.registerText}> Daftar Disini</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAwareScrollView>
      </View>
    </ImageBackground>
  );
};

export default Login;

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
  },
  container: {
    flex: 1,
  },
  logo: {
    fontSize: 20,
    fontWeight: "bold",
    color: "black",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginLeft: 15,
  },
  card: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    width: "100%",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
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
  orText: {
    textAlign: "center",
    marginVertical: 10,
    fontSize: 16,
    fontWeight: "bold",
  },
  altButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#F36A1D",
    marginTop: 10,
    paddingHorizontal: 10,
  },
  altText: {
    flex: 1,
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    color: "#F36A1D",
  },
  iconImage: {
    width: 24,
    height: 24,
    resizeMode: "contain",
    alignSelf: "flex-start",
  },
  registerText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: "bold",
  },
  errorText: { color: "red", fontSize: 14, marginBottom: 10 },
});
