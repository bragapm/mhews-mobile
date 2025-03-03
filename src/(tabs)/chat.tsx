import React, { useEffect, useRef, useState } from 'react';
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
} from 'react-native';
import COLORS from '../config/COLORS';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import { HeaderNav } from '../components/Header';
import { fetchLocation, getLocationDetails } from '../utils/locationUtils';
import useAuthStore from '../hooks/auth';
import { getData } from '../services/apiServices';

export default function ChatScreen() {
  const colorScheme = useColorScheme();
  const { profile, getProfile } = useAuthStore();
  const colors = COLORS();
  const [isShowChatBot, setIsShowChatBot] = useState(false);
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  const backgroundSource =
    colorScheme === 'dark'
      ? require('../assets/images/bg-page-dark.png')
      : require('../assets/images/bg-page-light.png');

  // Daftar source gambar untuk animasi chat
  const iconChat =
    colorScheme === 'dark'
      ? require('../assets/images/welcome-chat-dark.png')
      : require('../assets/images/welcome-chat-light.png');
  const iconChatDua =
    colorScheme === 'dark'
      ? require('../assets/images/dua-welcome-chat-dark.png')
      : require('../assets/images/dua-welcome-chat-light.png');
  const iconChatTiga =
    colorScheme === 'dark'
      ? require('../assets/images/tiga-welcome-chat-dark.png')
      : require('../assets/images/tiga-welcome-chat-light.png');
  const iconChatEmpat =
    colorScheme === 'dark'
      ? require('../assets/images/empat-welcome-chat-dark.png')
      : require('../assets/images/empat-welcome-chat-light.png');
  const iconChatLima =
    colorScheme === 'dark'
      ? require('../assets/images/limat-welcome-chat-dark.png')
      : require('../assets/images/limat-welcome-chat-light.png');
  const iconChatEnam =
    colorScheme === 'dark'
      ? require('../assets/images/enam-welcome-chat-dark.png')
      : require('../assets/images/enam-welcome-chat-light.png');
  const iconChatTujuh =
    colorScheme === 'dark'
      ? require('../assets/images/tujuh-welcome-chat-dark.png')
      : require('../assets/images/tujuh-welcome-chat-light.png');

  // Simpan gambar-gambar ke dalam array
  const chatIcons = [
    iconChat,
    iconChatDua,
    iconChatTiga,
    iconChatEmpat,
    iconChatLima,
    iconChatEnam,
    iconChatTujuh,
  ];

  // State untuk mengontrol indeks animasi
  const [chatIconIndex, setChatIconIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  // Update indeks secara berkala untuk animasi looping
  useEffect(() => {
    const interval = setInterval(() => {
      setChatIconIndex(prevIndex => (prevIndex + 1) % chatIcons.length);
    }, 1000); // delay diubah menjadi 1000ms (1 detik)
    return () => clearInterval(interval);
  }, []);

  const [messages, setMessages] = useState([
    { id: "1", text: "Halo! Saya SafeBot, ada yang bisa saya bantu?", role: "safebot" },
    {
      id: "2",
      text: "Silahkan pilih topik yang ingin Anda ketahui:",
      role: "safebot",
      options: [
        { id: "informasi_bencana", label: "Informasi Bencana" },
        { id: "lapor_bencana", label: "Lapor Bencana" },
        { id: "hubungi_call_center", label: "Hubungi Call Center" },
        { id: "kontak_darurat", label: "Kontak Darurat" },
        { id: "edukasi_bencana", label: "Edukasi Bencana" }
      ],
    },
  ]);

  useEffect(() => {
    if (messages.length > 0) {
      flatListRef.current?.scrollToEnd({ animated: true });
    }
  }, [messages]);

  const formatDate = (isoDate: string | null) => {
    if (!isoDate) return "Waktu tidak tersedia";
    const date = new Date(isoDate);
    return new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      timeZone: "Asia/Jakarta",
    }).format(date) + " WIB";
  };

  const disasterMessages = {
    gempa_bumi: (data: any) =>
      `Pusat gempa berada di darat 19 km Barat laut ${data.wilayah || "Wilayah tidak diketahui"}, Kekuatan gempa ${parseFloat(data.kekuatan_gempa).toFixed(1)} SR. Kedalaman ${parseFloat(data.kedalaman_gempa).toFixed(1)} km. Waktu ${formatDate(data.waktu)}.`,

    tsunami: (data: any) =>
      `Peringatan tsunami di ${data.wilayah || "wilayah terdampak"}. Tinggi gelombang ${data.tinggi_gel_air ? `${data.tinggi_gel_air} meter` : "tidak tersedia"}. Kecepatan ${data.cepat_gel_air ? `${data.cepat_gel_air} km/jam` : "tidak tersedia"}. Waktu ${formatDate(data.waktu)}.`,

    banjir: (data: any) =>
      `Terjadi banjir di ${data.wilayah || "wilayah terdampak"}. Ketinggian air ${data.ketinggian_banjir ? `${data.ketinggian_banjir} cm` : "tidak tersedia"}. Kecepatan aliran ${data.kecepatan_banjir ? `${data.kecepatan_banjir} km/jam` : "tidak tersedia"}. Waktu ${formatDate(data.waktu)}.`,

    longsor: (data: any) =>
      `Terjadi tanah longsor di ${data.wilayah || "wilayah terdampak"}. Volume material ${data.vol_mat_longsor ? `${data.vol_mat_longsor} m³` : "tidak tersedia"}. Sudut kemiringan ${data.sudut_mir_longsor ? `${data.sudut_mir_longsor}°` : "tidak tersedia"}. Waktu ${formatDate(data.waktu)}.`,

    gunung_berapi: (data: any) =>
      `Gunung ${data.nama_gunung || "berapi"} mengalami erupsi. Tinggi kolom abu ${data.tinggi_col_abu ? `${data.tinggi_col_abu} meter` : "tidak tersedia"}. Status aktivitas: ${data.status_aktifitas || "tidak tersedia"}. Waktu ${formatDate(data.waktu)}.`,
  };

  const handleOptionPress = async (option: any) => {
    if (option?.id == "resiko_bencana") {
      navigation.navigate('DisasterRisk');
    }

    const timestamp = Date.now();
    setMessages((prevMessages) => [
      ...prevMessages,
      { id: `user_${option.id}_${timestamp}`, text: option.label, role: "user" },
    ]);

    if (option?.id == "informasi_bencana") {
      const location = await fetchLocation();
      if (location) {
        const address: any = await getLocationDetails(
          location.latitude,
          location.longitude,
        );

        setMessages((prevMessages) => [
          ...prevMessages,
          { id: `bot_response_${option.id}_auto_${timestamp}`, text: `Berikut beberapa informasi bencana yang terjadi di lokasi anda di ${address}, radius 20 kilometer`, role: "safebot" }
        ]);
      }

      try {
        const [dataBencana] = await Promise.all([
          getData(`disaster/${profile?.id}?radius=20000`),
        ]);

        const bencana = dataBencana?.data;
        if (!bencana) return;

        const generateMessage = disasterMessages[bencana.jenis_bencana as keyof typeof disasterMessages];

        if (generateMessage) {
          const infoBencana = generateMessage(bencana);
          setMessages((prevMessages) => [
            ...prevMessages,
            { id: `bot_response_${option.id}_autores_${timestamp}`, text: infoBencana, role: "safebot" }
          ]);

          setMessages((prevMessages) => [
            ...prevMessages,
            {
              id: `bot_response_${option.id}_suggest_${timestamp}`,
              text: "Jika ingin mengetahui lebih detail tentang resiko bencana yang terjadi silahkan akses menu Resiko Bencana",
              role: "safebot",
              options: [
                { id: "resiko_bencana", label: "Resiko Bencana" },
              ],
            }
          ]);
        }
      } catch (err: any) {
      }
    }

  };

  const goHome = () => {
    navigation.replace("Tabs");
  };

  const renderMessage = ({ item }: { item: any }) => (
    <View style={[styles.messageWrapper, item.role === "safebot" ? styles.botWrapper : styles.userWrapper]}>
      {item.role === "safebot" && <View style={styles.triangle} />}
      <View style={[styles.messageContainer, item.role === "safebot" ? styles.botMessage : styles.userMessage]}>
        <Text style={styles.messageText}>{item.text}</Text>

        {item.options && (
          <View style={styles.optionsContainer}>
            {item.options.map((option: any) => (
              <TouchableOpacity
                key={option.id}
                style={styles.optionButton}
                onPress={() => handleOptionPress(option)}
              >
                <Text style={styles.optionText}>{option.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
      {item.role === "user" && <View style={styles.triangleUser} />}
    </View>
  );

  return (
    <>
      {!isShowChatBot ? (
        <>
          <StatusBar
            translucent
            backgroundColor="transparent"
            barStyle="dark-content"
          />
          <ImageBackground
            source={backgroundSource}
            style={styles.background}
            resizeMode="cover">
            <ScrollView
              contentContainerStyle={styles.scrollContainer}
              showsVerticalScrollIndicator={false}>
              <View style={styles.overlay} />
              <View
                style={{
                  flex: 1,
                  paddingHorizontal: '5%',
                }}>
                <View
                  style={{
                    alignItems: 'flex-start',
                    justifyContent: 'flex-start',
                    paddingTop: '20%',
                  }}>
                  <Text style={[styles.greeting, { color: colors.text }]}>
                    Selamat
                  </Text>
                  <Text style={[styles.greeting, { color: colors.text }]}>
                    Datang
                  </Text>
                </View>

                <View
                  style={{
                    width: '92%',
                    paddingTop: '5%',
                  }}>
                  <Text
                    style={[
                      styles.locationText,
                      { color: colors.subText, textAlign: 'left' },
                    ]}>
                    Selamat datang di safeBot yang menyediakan banyak informasi
                    tentang penanggulangan bencana, informasi risiko bahaya sekitar,
                    edukasi bencana, telekonsultasi, dan lainnya.
                  </Text>
                </View>

                <View
                  style={{
                    width: '100%',
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingVertical: '15%',
                  }}>
                  {/* Ganti icon chat dengan animasi looping */}
                  <Image
                    source={chatIcons[chatIconIndex]}
                    style={styles.iconImage}
                  />
                </View>

                <View
                  style={{
                    width: '100%',
                    justifyContent: 'space-between',
                    flexDirection: 'row',
                    marginTop: '3%',
                  }}>
                  <TouchableOpacity style={styles.btnSecondary} onPress={goHome}>
                    <Text style={styles.btnSecondaryText}>Kembali</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.btnPrimary} onPress={() => setIsShowChatBot(true)}>
                    <Text style={styles.btnPrimaryText}>Selanjutnya</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </ImageBackground>
        </>
      ) : (
        <>
          <HeaderNav onPress={() => setIsShowChatBot(false)} title="SafeBot" icon="bnpb" />
          <FlatList
            data={messages}
            ref={flatListRef}
            keyExtractor={(item) => item.id}
            renderItem={renderMessage}
            contentContainerStyle={[
              styles.scrollContainer,
              { backgroundColor: colorScheme === "dark" ? "#1c1c1c" : "#fff", padding: 15 }
            ]}
            ListFooterComponent={<View style={{ height: 20 }} />}
            showsVerticalScrollIndicator={false}
          />
        </>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  greeting: {
    fontSize: 48,
    fontWeight: 'bold',
    textAlign: 'left',
  },
  locationText: {
    fontSize: 14,
    marginLeft: 6,
  },
  iconImage: {
    width: 300,
    height: 300,
    resizeMode: 'contain',
  },
  btnPrimary: {
    backgroundColor: '#F27405',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    width: '45%',
  },
  btnPrimaryText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  btnSecondary: {
    borderWidth: 1,
    borderColor: '#F27405',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    width: '45%',
  },
  btnSecondaryText: {
    fontSize: 16,
    color: '#F27405',
    fontWeight: '600',
  },
  messageWrapper: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 4,
  },
  botWrapper: {
    alignSelf: "flex-start",
  },
  userWrapper: {
    alignSelf: "flex-end",
  },
  messageContainer: {
    padding: 10,
    borderRadius: 10,
    maxWidth: "80%",
  },
  optionsContainer: {
    marginTop: 10,
  },
  optionButton: {
    padding: 5,
    marginVertical: 5,
    borderRadius: 5,
  },
  optionText: {
    color: "#F59047",
    fontWeight: "bold",
  },
  botMessage: {
    backgroundColor: "#E2E1DF",
  },
  userMessage: {
    backgroundColor: "#F59047",
  },
  messageText: {
    fontSize: 16,
    color: "#333",
  },
  triangle: {
    width: 0,
    height: 0,
    borderTopWidth: 8,
    borderBottomWidth: 8,
    borderRightWidth: 12,
    borderStyle: "solid",
    borderTopColor: "transparent",
    borderBottomColor: "transparent",
    borderRightColor: "#E2E1DF",
  },
  triangleUser: {
    width: 0,
    height: 0,
    borderTopWidth: 8,
    borderBottomWidth: 8,
    borderLeftWidth: 12,
    borderStyle: "solid",
    borderTopColor: "transparent",
    borderBottomColor: "transparent",
    borderLeftColor: "#F59047",
  },
});
