import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ImageBackground,
  Image,
  Alert,
} from "react-native";
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

// Skema validasi dengan Zod
const signinSchema = z.object({
  email: z.string().email("Format email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
});

const Login = () => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(signinSchema),
  });

  const handleSignin = async (data: any) => {
    try {
      const response = await postData("/signin", data);
      console.log(response);

      Alert.alert("Sukses", "Akun berhasil dibuat!");
      router.push("/(tabs)/home");
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

  return (
    <ImageBackground
      source={require("../../assets/images/splashscreen.png")}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.overlay} />
      <View style={styles.container}>
        {/* Header */}
        <View style={{ marginLeft: 15, marginTop: 25 }}>
          <Image
            source={require("../../assets/images/braga-logo.png")}
            style={{ width: 150, height: 50, resizeMode: "contain" }}
          />
        </View>

        {/* Title */}
        <View style={{ marginBottom: 20 }}>
          <Text style={styles.title}>Selamat datang di</Text>
          <Text style={styles.title}>Aplikasi MHEWS</Text>
        </View>

        {/* Form Login */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Masuk</Text>


          {/* Input Email */}
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, value } }) => (
              <View style={styles.inputContainer}>
                <MaterialIcons name="email" size={24} color="black" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  keyboardType="email-address"
                  value={value}
                  onChangeText={onChange}
                />
              </View>
            )}
          />
          {errors.email?.message && (
            <Text style={styles.errorText}>{String(errors.email.message)}</Text>
          )}

          {/* Input Password */}
          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, value } }) => (
              <View style={styles.inputContainer}>
                <Feather name="lock" size={24} color="black" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  secureTextEntry={!isPasswordVisible}
                  value={value}
                  onChangeText={onChange}
                />
                <TouchableOpacity onPress={() => setIsPasswordVisible(!isPasswordVisible)}>
                  <Feather name={isPasswordVisible ? "eye" : "eye-off"} size={24} color="black" />
                </TouchableOpacity>
              </View>
            )}
          />
          {errors.password?.message && (
            <Text style={styles.errorText}>{String(errors.password.message)}</Text>
          )}

          <TouchableOpacity style={styles.button} onPress={handleSubmit(handleSignin)}>
            <Text style={styles.textButton}>Masuk</Text>
          </TouchableOpacity>

          <Text style={styles.orText}>atau</Text>

          {/* Tombol Masuk dengan Google */}
          <TouchableOpacity style={styles.altButton}>
            <AntDesign name="google" size={24} color="#DB4437" />
            <Text style={styles.altText}>Masuk dengan Google</Text>
          </TouchableOpacity>

          {/* Tombol Masuk dengan SSO BNPB */}
          <TouchableOpacity style={styles.altButton}>
            <Image source={require("../../assets/icons/bnpb.svg")} style={styles.iconImage} />
            <Text style={styles.altText}>Masuk dengan SSO BNPB</Text>
          </TouchableOpacity>

          {/* Tombol Masuk sebagai Guest */}
          <TouchableOpacity style={styles.altButton}>
            <MaterialIcons name="person-outline" size={24} color="black" />
            <Text style={styles.altText}>Masuk Sebagai Guest</Text>
          </TouchableOpacity>

          {/* Link Daftar */}
          <View style={{ flexDirection: "row", justifyContent: "center", marginTop: 20 }}>
            <Text style={{ fontSize: 16 }}>Belum punya akun?</Text>
            <TouchableOpacity onPress={() => router.push("/auth/signup")}>
              <Text style={styles.registerText}> Daftar Disini</Text>
            </TouchableOpacity>
          </View>
        </View>
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
    marginLeft: 15
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
    justifyContent: "center",
  },
  altText: {
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 10,
    color: "#F36A1D"
  },
  iconImage: {
    width: 24,
    height: 24,
    resizeMode: "contain",
  },
  registerText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: "bold",
  },
  errorText: { color: "red", fontSize: 14, marginBottom: 10 },
});
