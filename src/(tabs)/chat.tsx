import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  ImageBackground,
  Dimensions,
  Image,
  ScrollView,
  TextInput,
  StatusBar,
} from 'react-native';
import COLORS from '../config/COLORS';
import FloatingSOSButton from '../components/FloatingSOSButton';

export default function ChatScreen() {
  const colorScheme = useColorScheme();
  const colors = COLORS();

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

  // Update indeks secara berkala untuk animasi looping
  useEffect(() => {
    const interval = setInterval(() => {
      setChatIconIndex(prevIndex => (prevIndex + 1) % chatIcons.length);
    }, 1000); // delay diubah menjadi 1000ms (1 detik)
    return () => clearInterval(interval);
  }, []);

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
              <Text style={[styles.greeting, {color: colors.text}]}>
                Selamat
              </Text>
              <Text style={[styles.greeting, {color: colors.text}]}>
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
                  {color: colors.subText, textAlign: 'left'},
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
                paddingVertical: '13%',
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
              <TouchableOpacity style={styles.btnSecondary}>
                <Text style={styles.btnSecondaryText}>Kembali</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnPrimary}>
                <Text style={styles.btnPrimaryText}>Selanjutnya</Text>
              </TouchableOpacity>
            </View>
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
});
