import {
    View,
    Text,
    ImageBackground,
    useColorScheme,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    StatusBar,
    TextInput,
    ActivityIndicator,
    Image,
} from "react-native";
import React, { useEffect, useState } from "react";
import useAuthStore from "../../hooks/auth";
import AntDesign from "react-native-vector-icons/AntDesign";
import Feather from "react-native-vector-icons/Feather";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import COLORS from "../../config/COLORS";
import { useAlert } from "../../components/AlertContext";
import { HeaderNav } from "../../components/Header";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../navigation/types";
import { patchData } from "../../services/apiServices";

const signupSchema = z
    .object({
        password: z.string().min(6, "Password minimal 6 karakter"),
        confirm_password: z.string(),
    })
    .refine((data) => data.password === data.confirm_password, {
        message: "Password tidak cocok",
        path: ["confirm_password"],
    });

export default function ChangePasswordScreen() {
    const reset = useAuthStore((state) => state.reset);
    const [showForm, setShowForm] = useState(false);
    const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
    const { showAlert } = useAlert();
    const { profile, getProfile } = useAuthStore();
    const colorScheme = useColorScheme();
    const colors = COLORS();
    const [loading, setLoading] = useState(false);
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [isOldPasswordVisible, setIsOldPasswordVisible] = useState(false);
    const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
        useState(false);
    const backgroundSource =
        colorScheme === "dark"
            ? require("../../assets/images/bg-page-dark.png")
            : require("../../assets/images/bg-page-light.png");

    useEffect(() => {
        getProfile();
    }, []);

    const showFormEdit = () => {
        setShowForm(true);
    };

    const {
        control,
        handleSubmit,
        setError,
        formState: { errors },
        setValue,
    } = useForm({
        resolver: zodResolver(signupSchema),
    });

    const handleUpdatePassword = async (formData: any) => {
        setLoading(true);
        try {
            const data = {
                password: formData?.password
            }
            const response = await patchData("/users/" + profile?.id, data);
            if (response?.data) {
                setLoading(false);
                showAlert("success", "Password berhasil diperbarui!");
                backToProfile();
            } else {
                setLoading(false);
                showAlert("error", "Password gagal diperbarui!");
            }
        } catch (error: any) {
            showAlert("error", error.message);
            setLoading(false);
        }
    };

    const backToProfile = () => {
        navigation.replace("Tabs");
    };

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
                <ScrollView
                    contentContainerStyle={styles.scrollContainer}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.container}>
                        {/* Header */}
                        <HeaderNav onPress={backToProfile} title="Ubah Password" />

                        {/* Content */}
                        <View
                            style={[
                                styles.contentOption,
                                {
                                    backgroundColor:
                                        colorScheme === "dark" ? "#1c1c1c" : "#fff",
                                    borderRadius: 12,
                                    marginTop: "5%",
                                    paddingVertical: "4%",
                                    paddingHorizontal: 16,
                                },
                            ]}
                        >
                            <Text style={styles.subTitle}>
                                Ubah Password Akun anda dan pastikan password memenuhi
                                ketentuan yang berlaku.
                            </Text>

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
                                            placeholder="Masukkan Password Baru"
                                            placeholderTextColor={colors.text}
                                            secureTextEntry={!isPasswordVisible}
                                            value={value}
                                            onChangeText={onChange}
                                        />
                                        <TouchableOpacity
                                            onPress={() =>
                                                setIsPasswordVisible(!isPasswordVisible)
                                            }
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
                                            placeholder="Konfirmasi Password Baru"
                                            secureTextEntry={!isConfirmPasswordVisible}
                                            value={value}
                                            onChangeText={onChange}
                                        />
                                        <TouchableOpacity
                                            onPress={() =>
                                                setIsConfirmPasswordVisible(
                                                    !isConfirmPasswordVisible
                                                )
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
                                onPress={handleSubmit(handleUpdatePassword)}
                                disabled={loading}
                            >
                                {loading ? (
                                    <ActivityIndicator size="small" color="#fff" />
                                ) : (
                                    <Text style={styles.textButton}>Simpan</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </ImageBackground>
        </>
    );
}

const styles = StyleSheet.create({
    scrollContainer: {
        flexGrow: 1,
        paddingBottom: 20,
    },
    subTitle: {
        fontSize: 14,
        textAlign: "left",
        color: "#666",
        marginBottom: 20,
        marginLeft: 10,
    },
    container: { flex: 1, padding: 16, marginTop: "5%" },
    background: {
        flex: 1,
        width: "100%",
        height: "100%",
    },
    contentOption: {
        borderRadius: 12,
        width: "100%",
    },
    button: {
        backgroundColor: "#E64040",
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: "center",
        marginTop: 20,
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
    errorText: { color: "red", fontSize: 14, marginBottom: 10 },
    textButton: {
        color: "white",
        fontWeight: "bold",
        textAlign: "center",
        fontSize: 18,
    },
});
