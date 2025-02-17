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
import { useRouter } from "expo-router";
import { AntDesign, MaterialIcons } from "@expo/vector-icons";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import COLORS from "../../config/COLORS";
import { useAlert } from "@/components/AlertContext";
import { HeaderNav } from "@/components/Header";

const signupSchema = z.object({
    NIK: z.string().min(16, "NIK harus 16 digit").max(16, "NIK harus 16 digit"),
    first_name: z.string().min(2, "Nama depan minimal 2 karakter"),
    last_name: z.string().min(2, "Nama belakang minimal 2 karakter"),
    phone: z.string().min(10, "Nomor HP minimal 10 digit"),
    email: z.string().email("Format email tidak valid"),
});

export default function EditProfileScreen() {
    const reset = useAuthStore((state) => state.reset);
    const [showForm, setShowForm] = useState(false);
    const router = useRouter();
    const { showAlert } = useAlert();
    const { profile, getProfile } = useAuthStore();
    const colorScheme = useColorScheme();
    const colors = COLORS();
    const [loading, setLoading] = useState(false);
    const backgroundSource =
        colorScheme === "dark"
            ? require("@/assets/images/bg-page-dark.png")
            : require("@/assets/images/bg-page-light.png");

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

    useEffect(() => {
        if (profile) {
            setValue("NIK", profile.NIK);
            setValue("first_name", profile.first_name);
            setValue("last_name", profile.last_name);
            setValue("email", profile.email);
            setValue("phone", profile.phone);
        }
    }, [profile, setValue]);

    const handleUpdateData = async (formData: any) => {
        setLoading(true);
        try {
            console.log(formData);
            //   // Contoh postData ke server
            //   const response = await postData("/users", requestData);

            // Bypass: asumsikan response sukses
            setTimeout(() => {
                setLoading(false);
                showAlert("success", "Data profile berhasil diperbarui!");
                setShowForm(false);
            }, 2000);
        } catch (error: any) {
            showAlert("error", error.message);
            setLoading(false);
        }
    };

    const backToProfile = () => {
        router.push("/profile");
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
                    <>
                        <View style={styles.container}>
                            {/* Header */}
                            <HeaderNav onPress={backToProfile} title="Edit Profil" />

                            {/* Content */}
                            {!showForm ? (
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
                                        Kelola Data Diri dan Detail Informasi Profil Pengguna
                                    </Text>

                                    {/* NIK */}
                                    <View style={styles.infoContainer}>
                                        <Text style={styles.textLabel}>NIK</Text>
                                        <Text style={styles.textValue}>{profile?.NIK}</Text>
                                    </View>

                                    {/* Nama */}
                                    <View style={styles.infoContainer}>
                                        <Text style={styles.textLabel}>Nama</Text>
                                        <Text style={styles.textValue}>
                                            {profile?.first_name} {profile?.last_name}
                                        </Text>
                                    </View>

                                    {/* No. Handphone */}
                                    <View style={styles.infoContainer}>
                                        <Text style={styles.textLabel}>No. Handphone</Text>
                                        <Text style={styles.textValue}>{profile?.phone}</Text>
                                    </View>

                                    {/* Email */}
                                    <View style={styles.infoContainer}>
                                        <Text style={styles.textLabel}>Email</Text>
                                        <Text style={styles.textValue}>{profile?.email}</Text>
                                    </View>

                                    <TouchableOpacity
                                        style={styles.outlineButton}
                                        onPress={showFormEdit}
                                    >
                                        <Text style={styles.outlineButtonText}>Edit Profil</Text>
                                    </TouchableOpacity>
                                </View>
                            ) : (
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
                                        Ubah Informasi Profil Pengguna yang anda inginkan. Pastikan
                                        informasi yang anda ubah seusai.
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

                                    {/* Input phone */}
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

                                    {/* Input Email */}
                                    <Controller
                                        control={control}
                                        name="email"
                                        render={({ field: { onChange, value } }) => (
                                            <>
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
                                                <View style={styles.infoEmail}>
                                                    <Image
                                                        source={require("../../../assets/icons/questionCircle.png")}
                                                        style={styles.infoIcon}
                                                    />
                                                    <Text>
                                                        Pastikan alamat email yang anda masukkan aktif
                                                    </Text>
                                                </View>
                                            </>
                                        )}
                                    />
                                    {errors.email?.message && (
                                        <Text style={styles.errorText}>
                                            {String(errors.email.message)}
                                        </Text>
                                    )}

                                    <TouchableOpacity
                                        style={styles.button}
                                        onPress={handleSubmit(handleUpdateData)}
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <ActivityIndicator size="small" color="#fff" />
                                        ) : (
                                            <Text style={styles.textButton}>Simpan</Text>
                                        )}
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>
                    </>
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
    infoContainer: {
        flexDirection: "column",
        paddingVertical: 8,
    },
    textLabel: {
        fontSize: 14,
        fontWeight: "bold",
        color: "#232221",
    },
    textValue: {
        fontSize: 16,
        color: "#4F4D4A",
    },
    button: {
        backgroundColor: "#E64040",
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: "center",
        marginTop: 20,
    },
    outlineButton: {
        borderWidth: 2,
        borderColor: "#E64040",
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: "center",
        marginTop: 20,
    },
    outlineButtonText: {
        color: "#E64040",
        fontSize: 16,
        fontWeight: "600",
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
    infoIcon: {
        width: 20,
        height: 20,
        marginRight: 5,
    },
    infoEmail: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 10,
        marginLeft: 5,
        marginRight: 5,
    },
});
