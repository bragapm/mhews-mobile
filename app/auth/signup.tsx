import React, { useState } from "react";
import {
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    ImageBackground,
    Alert,
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

// Skema validasi dengan Zod
const signupSchema = z.object({
    NIK: z.string().min(16, "NIK harus 16 digit").max(16, "NIK harus 16 digit"),
    first_name: z.string().min(2, "Nama depan minimal 2 karakter"),
    last_name: z.string().min(2, "Nama belakang minimal 2 karakter"),
    phone: z.string().min(10, "Nomor HP minimal 10 digit"),
    email: z.string().email("Format email tidak valid"),
    password: z.string().min(6, "Password minimal 6 karakter"),
    confirm_password: z.string(),
}).refine((data) => data.password === data.confirm_password, {
    message: "Password tidak cocok",
    path: ["confirm_password"],
});

const Signup = () => {
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);

    const {
        control,
        handleSubmit,
        setError,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(signupSchema),
    });

    const handleSignup = async (data: any) => {
        try {
            // Hapus confirm_password sebelum dikirim ke server
            const { confirm_password, ...formData } = data;

            const response = await postData("/signup", formData);
            console.log(response);

            Alert.alert("Sukses", "Akun berhasil dibuat!");
            router.push("/auth/login");
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
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()}>
                        <AntDesign name="arrowleft" size={24} color="black" />
                    </TouchableOpacity>
                    <Text style={styles.title}>Buat Akun</Text>
                </View>

                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>
                        Silahkan lengkapi formulir dibawah ini sesuai dengan data diri anda untuk membuat akun
                    </Text>

                    {/* Input NIK */}
                    <Controller
                        control={control}
                        name="NIK"
                        render={({ field: { onChange, value } }) => (
                            <View style={styles.inputContainer}>
                                <AntDesign name="user" size={24} color="black" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="NIK"
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
                            <View style={styles.inputContainer}>
                                <AntDesign name="user" size={24} color="black" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Nama Depan"
                                    value={value}
                                    onChangeText={onChange}
                                />
                            </View>
                        )}
                    />
                    {errors.first_name?.message && (
                        <Text style={styles.errorText}>{String(errors.first_name.message)}</Text>
                    )}

                    {/* Input Nama Belakang */}
                    <Controller
                        control={control}
                        name="last_name"
                        render={({ field: { onChange, value } }) => (
                            <View style={styles.inputContainer}>
                                <AntDesign name="user" size={24} color="black" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Nama Belakang"
                                    value={value}
                                    onChangeText={onChange}
                                />
                            </View>
                        )}
                    />
                    {errors.last_name?.message && (
                        <Text style={styles.errorText}>{String(errors.last_name.message)}</Text>
                    )}

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

                    {/* Input Konfirmasi Password */}
                    <Controller
                        control={control}
                        name="confirm_password"
                        render={({ field: { onChange, value } }) => (
                            <View style={styles.inputContainer}>
                                <Feather name="lock" size={24} color="black" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Konfirmasi Password"
                                    secureTextEntry={!isConfirmPasswordVisible}
                                    value={value}
                                    onChangeText={onChange}
                                />
                                <TouchableOpacity onPress={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)}>
                                    <Feather name={isConfirmPasswordVisible ? "eye" : "eye-off"} size={24} color="black" />
                                </TouchableOpacity>
                            </View>
                        )}
                    />
                    {errors.confirm_password?.message && (
                        <Text style={styles.errorText}>{String(errors.confirm_password.message)}</Text>
                    )}

                    <TouchableOpacity style={styles.button} onPress={handleSubmit(handleSignup)}>
                        <Text style={styles.textButton}>Buat Akun</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ImageBackground>
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
        backgroundColor: "rgba(255, 255, 255, 0.8)",
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
