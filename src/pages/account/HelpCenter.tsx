import {
    View,
    Text,
    ImageBackground,
    useColorScheme,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    StatusBar,
    ActivityIndicator,
    Image,
} from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import useAuthStore from "../../hooks/auth";
import AntDesign from "react-native-vector-icons/AntDesign";
import COLORS from "../../config/COLORS";
import { useAlert } from "../../components/AlertContext";
import { useLanguageStore } from "../../hooks/languageStore";
import { HeaderNav } from "../../components/Header";
import { getData } from "../../services/apiServices";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../navigation/types";

export default function HelpCenterScreen() {
    const reset = useAuthStore((state) => state.reset);
    const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
    const { showAlert } = useAlert();
    const { profile, getProfile } = useAuthStore();
    const colorScheme = useColorScheme();
    const colors = COLORS();
    const [loading, setLoading] = useState(false);
    interface HelpItem {
        id: number;
        title: string;
        description: string; // atau "description" jika itu typo
    }
    const [data, setData] = useState<HelpItem[]>([]);
    //   console.log("dataIni", data);
    const [openAccordionId, setOpenAccordionId] = useState<number | null>(null);
    const { selectedLanguage, setSelectedLanguage, loadLanguage } =
        useLanguageStore();

    const backgroundSource =
        colorScheme === "dark"
            ? require("../../assets/images/bg-page-dark.png")
            : require("../../assets/images/bg-page-light.png");

    useEffect(() => {
        loadLanguage();
        getProfile();
    }, []);

    const backToProfile = () => {
        navigation.replace("Tabs");
    };

    const handleLanguageChange = (language: string) => {
        setSelectedLanguage(language);
    };

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const response = await getData("items/pusat_bantuan");
            setData(response?.data);
        } catch (err) {
            console.error("Gagal mengambil data:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        //   loadLanguage();
        //   getProfile();
        fetchData();
    }, [fetchData]);

    const AccordionItem = ({
        title = "",
        description = "",
        isOpen,
        onToggle,
    }: {
        title: string;
        description: string;
        isOpen: boolean;
        onToggle: () => void;
    }) => (
        <View
            style={[
                styles.accordionContainer,
                { backgroundColor: colors.subBackground },
            ]}
        >
            <TouchableOpacity style={styles.accordionHeader} onPress={onToggle}>
                <Text style={[styles.accordionTitle, { color: colors.subText }]}>
                    {title}
                </Text>
                <AntDesign
                    name={isOpen ? "up" : "down"}
                    size={18}
                    color={colors.text}
                />
            </TouchableOpacity>
            {isOpen && (
                <Text style={[styles.accordionContent, { color: colors.text }]}>
                    {description}
                </Text>
            )}
        </View>
    );

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
                        <HeaderNav onPress={backToProfile} title="Pusat Bantuan" />

                        <View
                            style={[
                                styles.contentOption,
                                {
                                    backgroundColor: colorScheme === "dark" ? "#1c1c1c" : "#fff",
                                    borderRadius: 12,
                                    height: "95%",
                                    marginTop: "5%",
                                    paddingVertical: "4%",
                                    paddingHorizontal: 16,
                                },
                            ]}
                        >
                            <Text style={[styles.subTitle, { color: colors.tabIconDefault }]}>
                                Cari bantuan terkait aplikasi MHEWS berdasarkan kategori yang
                                anda butuhkan
                            </Text>
                            {loading ? (
                                <Text style={styles.loadingText}>Memuat data...</Text>
                            ) : (
                                data.map((item) => (
                                    <AccordionItem
                                        key={item.id}
                                        title={item.title}
                                        description={item.description}
                                        isOpen={openAccordionId === item.id}
                                        onToggle={() => {
                                            // Jika item yang ditekan sudah terbuka, maka tutup (set null)
                                            // Jika tidak, set item tersebut sebagai yang terbuka
                                            setOpenAccordionId(
                                                openAccordionId === item.id ? null : item.id
                                            );
                                        }}
                                    />
                                ))
                            )}
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
        marginBottom: 10,
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
    accordionContainer: {
        backgroundColor: "#1c1c1c",
        borderRadius: 12,
        marginBottom: 10,
        padding: 10,
    },
    accordionHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 10,
    },
    accordionTitle: {
        fontSize: 16,
        color: "#fff",
        fontWeight: "bold",
    },
    accordionContent: {
        fontSize: 14,
        color: "#ddd",
        padding: 10,
    },
    loadingText: {
        fontSize: 16,
        color: "#ddd",
        textAlign: "center",
    },
});
