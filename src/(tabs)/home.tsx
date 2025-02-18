import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  ImageBackground,
  Image,
  ScrollView,
  StatusBar,
  Platform
} from "react-native";
import Icon from "react-native-vector-icons/Feather";
import { useNavigation } from '@react-navigation/native'; // Update here
import Modal from "react-native-modal";
import { ASSET_URL, getData } from "../services/apiServices";
import useAuthStore from "../hooks/auth";
import COLORS from "../config/COLORS";
import { useAlert } from "../components/AlertContext";
import FloatingSOSButton from "../components/FloatingSOSButton";
import LinearGradient from "react-native-linear-gradient";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../navigation/types";
import { request, PERMISSIONS, RESULTS, openSettings } from 'react-native-permissions';
import DeviceInfo from 'react-native-device-info';

export default function HomeScreen() {
  const { showAlert } = useAlert();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const colorScheme = useColorScheme();
  const [modalVisible, setModalVisible] = useState(false);
  const { profile, getProfile } = useAuthStore();
  const [emergencyMessage, setEmergencyMessage] = useState("");
  const [siagaBencana, setSiagaBencana] = useState([]);
  const [fiturPendukung, setFiturPendukung] = useState([]);
  const [infoTerkait, setInfoTerkait] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const isDarkMode = colorScheme === "dark";
  const colors = {
    background: isDarkMode ? "#121212" : "#E2E1DF",
    textPrimary: isDarkMode ? "#FFFFFF" : "#161414",
    textSecondary: isDarkMode ? "#CCCCCC" : "#777674",
    cardGradientStart: isDarkMode ? "#1E1E1E" : "#F36A1D",
    cardGradientEnd: isDarkMode ? "#333333" : "#D95B12",
    supportCardBackground: isDarkMode ? "#2A2A2A" : "#FFFFFF",
    textCardPrimary: "#FFFFFF",
    textCardSecondary: "#EAEAEA",
  };
  const color = COLORS();
  async function requestAllPermissions() {
    const permissions = Platform.select({
      android: [
        PERMISSIONS.ANDROID.CAMERA,
        PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
        PERMISSIONS.ANDROID.ACCESS_COARSE_LOCATION,
        PERMISSIONS.ANDROID.ACCESS_BACKGROUND_LOCATION,
        PERMISSIONS.ANDROID.READ_MEDIA_AUDIO,
        PERMISSIONS.ANDROID.READ_MEDIA_IMAGES,
        PERMISSIONS.ANDROID.READ_MEDIA_VIDEO,
        PERMISSIONS.ANDROID.RECORD_AUDIO,
      ],
      ios: [
        PERMISSIONS.IOS.CAMERA,
        PERMISSIONS.IOS.LOCATION_ALWAYS,
        PERMISSIONS.IOS.LOCATION_WHEN_IN_USE,
        PERMISSIONS.IOS.MEDIA_LIBRARY,
        PERMISSIONS.IOS.MICROPHONE,
      ],
    });

    if (!permissions) return;

    for (const perm of permissions) {
      const result = await request(perm);
    }
  }

  const checkGPS = async () => {
    const enabled = await DeviceInfo.isLocationEnabled();
    if (!enabled) {
      showAlert('error', 'GPS tidak aktif. Aktifkan GPS di pengaturan.');
      openSettings();
    }
  };

  const backgroundSource =
    colorScheme === "dark"
      ? require("../assets/images/bg-home-dark.png")
      : require("../assets/images/bg-home.png");

  const fetchData = async () => {
    setLoading(true);
    try {
      const [siaga, fitur, info] = await Promise.all([
        getData("items/siaga_bencana"),
        getData("items/fitur_pendukung"),
        getData("items/info_terkait"),
      ]);

      setSiagaBencana(siaga?.data || []);
      setFiturPendukung(fitur?.data || []);
      setInfoTerkait(info?.data || []);
    } catch (err: any) {
      setError(err.message);
      console.error("Gagal mengambil data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkGPS();
    requestAllPermissions();
    fetchData();
  }, []);

  const handleClickDisaster = (item: any) => {
    if (item?.title == "Resiko Bencana") {
      navigation.navigate("DisasterRisk"); // Use navigation.navigate
    }
  };

  return (
    <>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="dark-content"
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
          <View style={styles.overlay} />
          <View style={styles.container}>
            <View style={styles.header}>
              <View style={styles.headerTextContainer}>
                <Text style={[styles.greeting, { color: color.text }]}>
                  Hi, {profile?.first_name} {profile?.last_name}
                </Text>
                <View style={styles.locationContainer}>
                  <Icon name="map-pin" size={16} color={color.subText} />
                  <Text style={[styles.locationText, { color: color.subText }]}>
                    Cihapit, Bandung Wetan, Bandung
                  </Text>
                </View>
              </View>
              <TouchableOpacity style={styles.notificationIcon}>
                <Icon name="bell" size={22} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              Siaga Bencana
            </Text>
            <FlatList
              data={siagaBencana}
              horizontal
              showsHorizontalScrollIndicator={false}
              renderItem={({ item }: { item: any }) => (
                <TouchableOpacity
                  style={styles.card}
                  activeOpacity={0.8}
                  onPress={() => handleClickDisaster(item)}
                >
                  <LinearGradient
                    colors={[color.gradientCardStart, color.gradientCardEnd]}
                    style={styles.gradient}
                  >
                    <View style={styles.iconContainer}>
                      {(() => {
                        const iconUri = `${ASSET_URL}${item.icon}`;
                        return (
                          <Image
                            source={{
                              uri: iconUri
                            }}
                            style={{ width: 20, height: 20, resizeMode: "contain" }}
                          />
                        );
                      })()}
                    </View>

                    <Text
                      style={[styles.cardTitle, { color: colors.textCardPrimary }]}
                    >
                      {item.title}
                    </Text>
                    <Text
                      style={[styles.cardSubtitle, { color: colors.textCardSecondary }]}
                    >
                      {item.description}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              )}
              keyExtractor={(item: any) => item.id}
            />

            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              Informasi Terkait
            </Text>
            <FlatList
              data={infoTerkait}
              horizontal
              showsHorizontalScrollIndicator={false}
              renderItem={({ item }: { item: any }) => (
                <TouchableOpacity
                  style={[
                    styles.informasiCard,
                    { backgroundColor: color.background },
                  ]}
                  activeOpacity={0.8}
                >
                  <View style={styles.iconContainer}>
                    {(() => {
                      const iconUri = `${ASSET_URL}${item.icon}`;
                      return (
                        <Image
                          source={{
                            uri: iconUri
                          }}
                          style={{ width: 20, height: 20, resizeMode: "contain" }}
                        />
                      );
                    })()}
                  </View>
                  <View style={styles.textContainer}>
                    <Text style={[styles.cardTitleSec, { color: color.text }]}>
                      {item.title}
                    </Text>
                    <Text
                      style={[styles.cardSubtitleSec, { color: color.tabIconDefault }]}
                    >
                      {item.description}
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
              keyExtractor={(item) => item.id}
            />

            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              Fitur Pendukung
            </Text>
            <FlatList
              data={fiturPendukung}
              numColumns={2}
              scrollEnabled={false}
              renderItem={({ item }: { item: any }) => (
                <TouchableOpacity
                  style={[
                    styles.supportCard,
                    { backgroundColor: colors.supportCardBackground },
                  ]}
                >
                  {(() => {
                    const iconUri = `${ASSET_URL}${item.icon}`;
                    return (
                      <Image
                        source={{
                          uri: iconUri
                        }}
                        style={{ width: 20, height: 20, resizeMode: "contain" }}
                      />
                    );
                  })()}
                  <Text style={[styles.cardTitleSec, { color: color.text }]}>
                    {item.title}
                  </Text>
                  <Text style={[styles.cardSubtitleSec, { color: color.tabIconDefault }]}>
                    {item.description}
                  </Text>
                </TouchableOpacity>
              )}
              keyExtractor={(item) => item.id}
            />
          </View>
        </ScrollView>
        <FloatingSOSButton />
      </ImageBackground>
    </>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  container: { flex: 1, padding: 16, marginTop: "5%" },
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  headerTextContainer: {
    flex: 1,
  },
  greeting: {
    fontSize: 22,
    fontWeight: "bold",
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  locationText: {
    fontSize: 14,
    marginLeft: 6,
  },
  notificationIcon: {
    padding: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginVertical: 10,
  },
  card: {
    borderRadius: 12,
    marginRight: 14,
    width: 220,
    height: 150,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  gradient: {
    borderRadius: 12,
    padding: 16,
    width: "100%",
    alignItems: "flex-end",
    justifyContent: "center",
  },
  iconContainer: {
    marginBottom: 12,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    padding: 10,
    borderRadius: 10,
    alignSelf: "flex-end",
  },
  iconInfoContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  informasiCard: {
    borderRadius: 10,
    padding: 16,
    margin: 5,
    maxWidth: 300,
    width: "100%",
    textAlign: "left",
    flexDirection: "row",
    alignItems: "center",
    overflow: "hidden",
  },
  supportCard: {
    borderRadius: 10,
    padding: 16,
    margin: 5,
    flex: 1,
    textAlign: "left",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "right",
  },
  cardSubtitle: {
    fontSize: 14,
    marginTop: 4,
    color: "#4F4D4A",
    textAlign: "right",
  },
  textContainer: {
    flex: 1,
    marginLeft: 10,
  },
  cardTitleSec: { fontSize: 18, fontWeight: "bold", marginTop: 5 },
  cardSubtitleSec: { fontSize: 14, marginTop: 4, color: "#4F4D4A" },
});
