import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  Dimensions,
  TouchableOpacity,
  PanResponder,
  Animated,
} from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { useRouter } from "expo-router";
import { AntDesign } from "@expo/vector-icons";


const { width, height } = Dimensions.get("window");

const customMapStyle = [
  {
    featureType: "landscape",
    elementType: "geometry",
    stylers: [
      { color: "#FAD9C3" }, // Warna daratan pastel oranye
    ],
  },
  {
    featureType: "water",
    elementType: "geometry.fill",
    stylers: [
      { color: "#9AC7D4" }, // Warna laut biru kehijauan
    ],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [
      { color: "#F2B8A9" }, // Warna jalan pastel
    ],
  },
  {
    featureType: "road",
    elementType: "labels.text.fill",
    stylers: [
      { color: "#6B4A3A" }, // Warna teks jalan
    ],
  },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [{ color: "#845B47" }],
  },
  {
    featureType: "administrative",
    elementType: "labels.text.fill",
    stylers: [{ color: "#594536" }],
  },
];
const siagaBencana = [
  {
    id: "1",
    title: "Gempa Bumi",
    date: "14 Februari 2025 - 18:30:56 WIB",
    kekuatan: "4.5 Magnitudo",
    kedalaman: "5 Kilometer",
    type: "gempa_bumi",
    coordinates: { latitude: -7.7415727, longitude: 109.00724549 },
    icon: require("@/assets/icons/search.png"),
    status: "Potensi Bahaya",
  },
  {
    id: "2",
    title: "Tsunami",
    date: "14 Februari 2025 - 18:30:56 WIB",
    ketinggian_gelombang: "20 m",
    kecepatan_gelombang: "40 m/s",
    type: "tsunami",
    // Mengubah koordinat agar tidak sama
   coordinates: { latitude: -7.7615727, longitude: 109.02724549 },
    icon: require("@/assets/icons/search.png"),
    status: "Potensi Bahaya",
  },
  {
    id: "3",
    title: "Erupsi Gunung Berapi",
    date: "14 Februari 2025 - 18:30:56 WIB",
    ketinggian: "1320 Mdpl",
    type: "erupsi_gunung",
    // Mengubah koordinat agar tidak sama
     coordinates: { latitude: -7.7515727, longitude: 109.01724549 },
    
    icon: require("@/assets/icons/search.png"),
    status: "Resiko Bencana",
  },
];


export default function DisasterRiskScreen() {
  const router = useRouter();
  const [bottomSheetHeight, setBottomSheetHeight] = useState(300); // tinggi awal bottom sheet
  const pan = useRef(new Animated.ValueXY()).current;

  // PanResponder untuk menangani geser bottom sheet
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderMove: (event, gestureState) => {
      // delta dari pergerakan gesture
      const delta = gestureState.dy;
      setBottomSheetHeight((prevHeight) => {
        const newHeight = prevHeight + delta;
        if (newHeight > height * 0.8) {
          return height * 0.8; // batas atas: 80% tinggi layar
        } else if (newHeight < 150) {
          return 150; // batas bawah: 150
        } else {
          return newHeight;
        }
      });
    },
    onPanResponderRelease: () => {
      pan.flattenOffset();
    },
  });

  const iconGempa=require("../../assets/images/iconGempa.png")
  const iconTsunami=require("../../assets/images/iconTsunami.png")
  const iconErupsiGunung=require("../../assets/images/iconErupsi.png")

  return (
    <>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="dark-content"
      />
      <View style={styles.container}>
        {/* Peta */}
        <View style={styles.mapContainer}>
         <MapView
  provider={PROVIDER_GOOGLE}
  customMapStyle={customMapStyle}
  style={styles.map}
  initialRegion={{
    latitude: -7.7415727,
    longitude: 109.00724549,
    latitudeDelta: 0.2,
    longitudeDelta: 0.2,
  }}
>
  {siagaBencana.map((item) => {
    let markerIcon;
    if (item.type === "gempa_bumi") {
      markerIcon = iconGempa;
    } else if (item.type === "tsunami") {
      markerIcon = iconTsunami;
    } else if (item.type === "erupsi_gunung") {
      markerIcon = iconErupsiGunung;
    }

    return (
      <Marker
        key={item.id}
        coordinate={{
          latitude: item.coordinates.latitude,
          longitude: item.coordinates.longitude,
        }}
        title={item.title}
        description={item.date}
        image={markerIcon}
      />
    );
  })}
</MapView>
        </View>

        {/* Informasi Bencana */}
        <View
          {...panResponder.panHandlers}
          style={[styles.bottomSheet, { height: bottomSheetHeight }]}
        >
          {/* Drag Indicator */}
          <View style={styles.dragIndicator} />

          <Text style={styles.sectionTitle}>Resiko Bencana</Text>
          <Text style={{ marginBottom: 10 }}>
            Semua resiko bencana yang berupa potensi bencana yang akan datang
            dan riwayat bencana yang akan terjadi
          </Text>

          {/* List of Disaster Risk Cards */}
          {siagaBencana.map((item) => (
            <View style={styles.cardContainer} key={item.id}>
              <TouchableOpacity
                style={
                  item.status === "Potensi Bahaya"
                    ? styles.cardDanger
                    : styles.cardPotential
                }
                activeOpacity={0.8}
              >
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>{item.title}</Text>
                  <Text
                    style={[
                      styles.cardStatus,
                      item.status === "Potensi Bahaya"
                        ? styles.potensiBahaya
                        : styles.resikoBencana,
                    ]}
                  >
                    {item.status}
                  </Text>
                </View>
                <Text style={styles.cardDescription}>{item.date}</Text>
                <Text style={styles.cardLoc}>
                  {item.coordinates?.latitude}, {item.coordinates?.longitude}
                </Text>
                {/* Deskripsi berdasarkan tipe bencana */}
                {item.type === "gempa_bumi" && (
                  <>
                    <Text style={styles.cardTitleData}>Kekuatan Gempa</Text>
                    <Text style={styles.cardDescription}>{item.kekuatan}</Text>
                    <Text style={styles.cardTitleData}>Kedalaman</Text>
                    <Text style={styles.cardDetails}>{item.kedalaman}</Text>
                  </>
                )}
                {item.type === "tsunami" && (
                  <>
                    <Text style={styles.cardTitleData}>
                      Ketinggian Gelombang Air
                    </Text>
                    <Text style={styles.cardDescription}>
                      {item.ketinggian_gelombang}
                    </Text>
                    <Text style={styles.cardTitleData}>
                      Kecepatan Gelombang Air
                    </Text>
                    <Text style={styles.cardDetails}>
                      {item.kecepatan_gelombang}
                    </Text>
                  </>
                )}
                {item.type === "erupsi_gunung" && (
                  <>
                    <Text style={styles.cardTitleData}>Ketinggian</Text>
                    <Text style={styles.cardDescription}>
                      {item.ketinggian}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Tombol Back */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.push("/home")}
        >
          <AntDesign name="arrowleft" size={24} color="black" />
        </TouchableOpacity>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mapContainer: {
    flex: 1,
    width: "100%",
    height: "55%",
  },
  map: {
    flex: 1,
  },
  bottomSheet: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    position: "absolute",
    bottom: 0,
    width: "100%",
  },
  dragIndicator: {
    width: 40,
    height: 5,
    backgroundColor: "#ccc",
    borderRadius: 5,
    alignSelf: "center",
    marginVertical: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  cardContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  cardDanger: {
    backgroundColor: "#FEF4F0",
    padding: 12,
    borderRadius: 10,
    borderColor: "#E35131",
    borderWidth: 1,
    width: "100%",
    marginRight: 10,
    marginBottom: 10,
  },
  cardPotential: {
    padding: 12,
    borderRadius: 10,
    borderColor: "#C3C3BF",
    borderWidth: 1,
    width: "100%",
    marginRight: 10,
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  cardDescription: {
    fontSize: 12,
    color: "gray",
  },
  cardLoc: {
    fontSize: 12,
    color: "#CD541B",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardTitleData: {
    fontSize: 12,
    fontWeight: "bold",
    marginTop: 5,
  },
  cardDetails: {
    fontSize: 12,
    marginVertical: 5,
    color: "gray",
  },
  cardStatus: {
    paddingVertical: 5,
    paddingHorizontal: 5,
    textAlign: "center",
    fontWeight: "bold",
    borderRadius: 5,
    color: "white",
  },
  potensiBahaya: {
    backgroundColor: "#FF7043",
  },
  resikoBencana: {
    backgroundColor: "#F59047",
  },
  backButton: {
    position: "absolute",
    top: 50,
    left: 16,
    backgroundColor: "rgba(255,255,255,0.8)",
    padding: 10,
    borderRadius: 20,
  },
});
