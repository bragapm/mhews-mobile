import React, { useRef, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, useColorScheme, ImageBackground, Dimensions, Image, ScrollView, TextInput } from "react-native";
import { useAuth } from "../context/AuthContext";
import RiskIcon from "../../assets/icons/risk.svg";
import ReportIcon from "../../assets/icons/report.svg";
import ChartPieIcon from "../../assets/icons/chart-pie.svg";
import PhoneIcon from "../../assets/icons/phone.svg";
import WeatherIcon from "../../assets/icons/weather.svg";
import ConsultIcon from "../../assets/icons/consult.svg";
import EducationIcon from "../../assets/icons/education.svg";
import PersonsIcon from "../../assets/icons/persons.svg";
import { LinearGradient } from "expo-linear-gradient";
import Icon from "react-native-vector-icons/Feather";
import FloatingSOSButton from "@/components/FloatingSOSButton";
import Modal from 'react-native-modal';

const informasi = [
  {
    id: "1",
    title: "Data Kejadian & Dampak Bencana",
    description: "Tampilkan data terkini tentang kejadian bencana dan dampaknya",
    icon: <ChartPieIcon width={25} height={25} />,
  },
  {
    id: "2",
    title: "Lapor Bencana",
    description: "Laporkan Bencana yang Terjadi di Sekitar Anda",
    icon: <PhoneIcon width={25} height={25} />,
  },
  {
    id: "3",
    title: "Data Kejadian & Dampak Bencana",
    description: "Tampilkan data terkini tentang kejadian bencana dan dampaknya",
    icon: <ChartPieIcon width={25} height={25} />,
  },
];

const features = [
  { id: "1", title: "Resiko Bencana", subtitle: "Pantau Resiko Bencana yang Terjadi di Sekitar Anda", icon: <RiskIcon width={25} height={25} /> },
  { id: "2", title: "Lapor Bencana", subtitle: "Laporkan Bencana yang Terjadi di Sekitar Anda", icon: <ReportIcon width={25} height={25} /> },
  { id: "3", title: "Resiko Bencana", subtitle: "Pantau Resiko Bencana yang Terjadi di Sekitar Anda", icon: <RiskIcon width={25} height={25} /> },
  { id: "4", title: "Lapor Bencana", subtitle: "Laporkan Bencana yang Terjadi di Sekitar Anda", icon: <ReportIcon width={25} height={25} /> },
];

const supportFeatures = [
  { id: "3", title: "Laporan Cuaca", subtitle: "Update Laporan Cuaca Berdasarkan Lokasi", icon: <WeatherIcon width={25} height={25} /> },
  { id: "4", title: "Telekonsultasi", subtitle: "Konsultasi Kesehatan dengan Tenaga Kesehatan Terpercaya", icon: <ConsultIcon width={25} height={25} /> },
  { id: "5", title: "Edukasi", subtitle: "Panduan Edukasi tentang Kebencanaan", icon: <EducationIcon width={25} height={25} /> },
  { id: "6", title: "Pantau Kerabat", subtitle: "Ketahui Lokasi Kerabat Terdekat dari Resiko Bencana", icon: <PersonsIcon width={25} height={25} /> },
];

export default function HomeScreen() {
  const { logout } = useAuth();
  const carouselRef = useRef(null);
  const colorScheme = useColorScheme();
  const [modalVisible, setModalVisible] = useState(false);
  const [emergencyMessage, setEmergencyMessage] = useState('');

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

  const backgroundSource =
    colorScheme === "dark"
      ? require("../../assets/images/overlay-dark.png")
      : require("../../assets/images/overlay-light.png");

  const iconQuestion = require("../../assets/icons/questionCircle.png");

  return (
    <ImageBackground
      source={backgroundSource}
      style={styles.background}
      resizeMode="cover"
    >
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.overlay} />
        <View style={styles.container}>
          <View style={styles.header}>
            <View style={styles.headerTextContainer}>
              <Text style={styles.greeting}>Hi, Gunawan Wibisono!</Text>
              <View style={styles.locationContainer}>
                <Icon name="map-pin" size={16} color={colors.textPrimary} />
                <Text style={styles.locationText}>Cihapit, Bandung Wetan, Bandung</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.notificationIcon}>
              <Icon name="bell" size={22} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>

          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Siaga Bencana</Text>
          <FlatList
            data={features}
            horizontal
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.card} activeOpacity={0.8}>
                <LinearGradient colors={[colors.cardGradientStart, colors.cardGradientEnd]} style={styles.gradient}>
                  <View style={styles.iconContainer}>{item.icon}</View>
                  <Text style={[styles.cardTitle, { color: colors.textCardPrimary }]}>{item.title}</Text>
                  <Text style={[styles.cardSubtitle, { color: colors.textCardSecondary }]}>{item.subtitle}</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}
            keyExtractor={(item) => item.id}
          />

          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Informasi Terkait</Text>
          <FlatList
            data={informasi}
            horizontal
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.informasiCard, { backgroundColor: colors.supportCardBackground }]}
                activeOpacity={0.8}
              >
                <View style={styles.iconInfoContainer}>{item.icon}</View>
                <View style={styles.textContainer}>
                  <Text style={styles.cardTitleSec}>{item.title}</Text>
                  <Text style={styles.cardSubtitleSec}>{item.description}</Text>
                </View>
              </TouchableOpacity>

            )}
            keyExtractor={(item) => item.id}
          />

          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Fitur Pendukung</Text>
          <FlatList
            data={supportFeatures}
            numColumns={2}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <TouchableOpacity style={[styles.supportCard, { backgroundColor: colors.supportCardBackground }]}>
                {item.icon}
                <Text style={styles.cardTitleSec}>{item.title}</Text>
                <Text style={styles.cardSubtitleSec}>{item.subtitle}</Text>
              </TouchableOpacity>
            )}
            keyExtractor={(item) => item.id}
          />
        </View>
      </ScrollView>
      <FloatingSOSButton onPress={() => setModalVisible(true)} />

      {/* Modal SOS */}
      <Modal
        isVisible={modalVisible}
        onBackdropPress={() => setModalVisible(false)}
        style={stylesModal.modalContainer}
      >
        <View style={stylesModal.modalContent}>
          {/* Judul */}
          <Text style={stylesModal.modalTitle}>SOS</Text>
          <Text style={stylesModal.modalSubtitle}>
            Kirimkan Pesan Darurat untuk mendapatkan penanganan segera atas situasi darurat yang anda alami.
          </Text>

          {/* Input Pesan Darurat */}
          <TextInput
            style={stylesModal.input}
            placeholder="Masukkan Pesan Darurat beserta Lokasi dan Detail Bencana yang terjadi"
            multiline
            value={emergencyMessage}
            onChangeText={setEmergencyMessage}
          />

          {/* Info Koneksi */}
          <View style={stylesModal.infoContainer}>
            <Text style={stylesModal.infoText}>
              <Image source={iconQuestion} /> Pesan Darurat akan terkirim ketika anda memiliki koneksi internet
            </Text>
          </View>

          {/* Tombol Geser untuk Mengirim SOS */}
          <TouchableOpacity style={stylesModal.sosButton} onPress={() => console.log('SOS Dikirim:', emergencyMessage)}>
            <Text style={stylesModal.sosText}>Geser untuk Mengirim SOS</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  container: { flex: 1, padding: 16 },
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
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
    marginBottom: 10
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
    margin: 8,
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
    margin: 8,
    flex: 1,
    textAlign: "left"
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "right"
  },
  cardSubtitle: {
    fontSize: 14,
    marginTop: 4,
    color: "#4F4D4A",
    textAlign: "right"
  },
  infoContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  textContainer: {
    flex: 1,
    marginLeft: 10,
  },
  cardTitleSec: { fontSize: 18, fontWeight: "bold", marginTop: 5 },
  cardSubtitleSec: { fontSize: 14, marginTop: 4, color: "#4F4D4A" },
});

const stylesModal = StyleSheet.create({
  modalContainer: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    minHeight: '50%',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  infoText: {
    fontSize: 12,
    color: '#666',
    display: "flex"
  },
  sosButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E74C3C',
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
  },
  sosIcon: {
    width: 24,
    height: 24,
    marginRight: 10,
  },
  sosText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
