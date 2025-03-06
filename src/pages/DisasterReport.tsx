import React, {useRef, useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Animated,
  PanResponder,
  StatusBar,
  Modal,
  FlatList,
  Image,
  useColorScheme,
  TextInput,
  ScrollView,
  ImageBackground,
  Platform,
} from 'react-native';
import COLORS from '../config/COLORS';
import {HeaderNav} from '../components/Header';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '../navigation/types';
import LinearGradient from 'react-native-linear-gradient';

const {width, height} = Dimensions.get('window');

const DisasterReportScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const colorScheme = useColorScheme();
  const colors = COLORS();
  const backgroundSource =
    colorScheme === 'dark'
      ? require('../assets/images/bg-page-dark.png')
      : require('../assets/images/bg-page-light.png');
  const handleBack = () => {
    navigation.replace('Tabs');
  };
  const arrowLeft =
    colorScheme === 'dark'
      ? require('../assets/images/left-dark.png')
      : require('../assets/images/left-light.png');
  const historyReport = require('../assets/images/history-report.png');
  const banjir = require('../assets/images/banjir-ReportDisaster.png');
  const erupsi = require('../assets/images/erupsi-ReportDisaster.png');
  const gempa = require('../assets/images/gempa-ReportDisaster.png');
  const kebakaranHutan = require('../assets/images/KebakaranHutan-ReportDisaster.png');
  const kabutAsap = require('../assets/images/KabutAsap-ReportDisaster.png');
  const anginKencang = require('../assets/images/AnginKencang-ReportDisaster.png');
  const longsor = require('../assets/images/Longsor-ReportDisaster.png');
  const tsunami = require('../assets/images/Tsunami-ReportDisaster.png');
  const call = require('../assets/images/phone.png');
  const [showHistory, setShowHistory] = useState(false);

  const HISTORY_DATA = [
    {
      id: '1',
      title: 'Kebakaran Hutan Cilacap',
      dateTime: '14 Februari 2025 - 18:30:56 WIB',
      location: 'Kabupaten Cilacap, Jawa Tengah',
      status: 'Menunggu Verifikasi',
    },
    {
      id: '2',
      title: 'Gempa Bumi Cilacap',
      dateTime: '14 Februari 2025 - 18:30:56 WIB',
      location: 'Kabupaten Cilacap, Jawa Tengah',
      status: 'Menunggu Verifikasi',
    },
    {
      id: '3',
      title: 'Erupsi Gunung Berapi Cilacap',
      dateTime: '14 Februari 2025 - 18:30:56 WIB',
      location: 'Kabupaten Cilacap, Jawa Tengah',
      status: 'Menunggu Verifikasi',
    },
    {
      id: '4',
      title: 'Banjir Cilacap',
      dateTime: '14 Februari 2025 - 18:30:56 WIB',
      location: 'Kabupaten Cilacap, Jawa Tengah',
      status: 'Menunggu Verifikasi',
    },
  ];
  // Daftar bencana
  const DISASTERS = [
    {
      id: '1',
      title: 'Bencana Banjir',
      image: banjir,
    },
    {
      id: '2',
      title: 'Erupsi Gunung Berapi',
      image: erupsi,
    },
    {
      id: '3',
      title: 'Gempa Bumi',
      image: gempa,
    },
    {
      id: '4',
      title: 'Kebakaran Hutan',
      image: kebakaranHutan,
    },
    {
      id: '5',
      title: 'Kabut Asap',
      image: kabutAsap,
    },
    {
      id: '6',
      title: 'Angin Kencang',
      image: anginKencang,
    },
    {
      id: '7',
      title: 'Tanah Longsor',
      image: longsor,
    },
    {
      id: '8',
      title: 'Gelombang Tsunami',
      image: tsunami,
    },
  ];

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
          <View style={styles.container}>
            <View
              style={{
                width: '100%',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexDirection: 'row',
              }}>
              <View
                style={{
                  width: '50%',
                  alignItems: 'center',
                  flexDirection: 'row',
                  justifyContent: 'center',
                }}>
                <TouchableOpacity
                  onPress={handleBack}
                  style={{
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                  <Image
                    source={arrowLeft}
                    style={{
                      width: 15,
                      height: 16,
                      resizeMode: 'contain',
                    }}
                  />
                </TouchableOpacity>
                <View
                  style={{
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginVertical: '2%',
                  }}>
                  <Text
                    style={{
                      fontSize: 22,
                      color: colors.text,
                      marginBottom: 10,
                      fontWeight: '800',
                      marginLeft: '8%',
                      alignItems: 'center',
                    }}>
                    Lapor Bencana
                  </Text>
                </View>
              </View>

              <View
                style={{
                  width: '50%',
                  alignItems: 'flex-end',
                }}>
                <TouchableOpacity
                  onPress={() => setShowHistory(true)}
                  style={{
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                  <Image
                    source={historyReport}
                    style={{
                      width: 50,
                      height: 40,
                      resizeMode: 'contain',
                    }}
                  />
                </TouchableOpacity>
              </View>
            </View>
            <View
              style={{
                alignItems: 'flex-start',
                justifyContent: 'center',
                marginVertical: '2%',
                width: '100%',
              }}>
              <Text
                style={{
                  fontSize: 14,
                  color: colors.info,
                  marginBottom: 10,
                  fontWeight: '500',
                  //   marginLeft: '8%',
                  alignItems: 'center',
                  textAlign: 'left',
                }}>
                Pilih berdasarkan jenis bencana yang terjadi yang ingin anda
                laporkan
              </Text>
            </View>
            <FlatList
              data={DISASTERS}
              keyExtractor={item => item.id}
              numColumns={2}
              columnWrapperStyle={{justifyContent: 'space-between'}}
              renderItem={({item}) => (
                <TouchableOpacity style={styles.card} activeOpacity={0.8}>
                  <LinearGradient
                    colors={[colors.gradientCardStart, colors.gradientCardEnd]}
                    style={[
                      styles.gradient,
                      {
                        /* Hapus height dinamis di sini */
                      },
                    ]}>
                    <View style={styles.cardContent}>
                      <Image source={item.image} style={styles.cardImage} />
                      <View style={{width: '80%'}}>
                        <Text
                          style={styles.cardTitle}
                          numberOfLines={2}
                          ellipsizeMode="tail">
                          {item.title}
                        </Text>
                      </View>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              )}
            />
          </View>
        </ScrollView>
      </ImageBackground>

      {/* Modal Daftar Laporan */}
      <Modal
        visible={showHistory}
        animationType="slide"
        onRequestClose={() => setShowHistory(false)}>
        <ImageBackground
          source={backgroundSource}
          style={styles.background}
          resizeMode="cover">
          <View
            style={[styles.modalContainer, {backgroundColor: 'transparent'}]}>
            <View
              style={{
                width: '100%',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexDirection: 'row',
              }}>
              <View
                style={{
                  width: '90%',
                  alignItems: 'center',
                  flexDirection: 'row',
                  justifyContent: 'center',
                }}>
                <View
                  style={{
                    alignSelf: 'center',
                    width: '10%',
                  }}>
                  <TouchableOpacity
                    onPress={() => setShowHistory(false)}
                    style={{
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                    <Image
                      source={arrowLeft}
                      style={{
                        width: 15,
                        height: 16,
                        resizeMode: 'contain',
                      }}
                    />
                  </TouchableOpacity>
                </View>

                <View
                  style={{
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginVertical: '2%',
                    width: '90%',
                  }}>
                  <Text
                    style={{
                      fontSize: 22,
                      color: colors.text,
                      marginBottom: 10,
                      fontWeight: '800',
                      marginLeft: '8%',
                      alignItems: 'center',
                    }}>
                    Daftar Laporan
                  </Text>
                </View>
              </View>
            </View>
            <View
              style={{
                backgroundColor: colors.bg,
                width: '95%',
                borderRadius: 10,
                paddingHorizontal: '2%',
                paddingVertical: '5%',
                alignItems: 'center',
                alignSelf: 'center',
                marginTop: '5%',
              }}>
              {/* Sub-judul & Search Bar */}
              <View
                style={{
                  width: '100%',
                }}>
                <Text style={[styles.modalSubTitle, {color: colors.info}]}>
                  Daftar lengkap laporan bencana yang anda laporkan
                </Text>
              </View>
              <View
                style={{
                  width: '90%',
                  paddingVertical: '3%',
                }}>
                <TextInput
                  style={styles.searchInput}
                  placeholder="Cari Laporan"
                  placeholderTextColor="#999"
                />
              </View>

              {/* Daftar isi laporan */}
              <FlatList
                data={HISTORY_DATA}
                keyExtractor={item => item.id}
                contentContainerStyle={{
                  paddingBottom: 20,
                  width: '100%',
                }}
                style={{
                  width: '90%',
                }}
                renderItem={({item}) => (
                  <View
                    style={[
                      styles.reportItem,
                      {
                        borderWidth: 1,
                        borderColor: colors.info,
                        backgroundColor: colors.bg,
                        width: '100%',
                        paddingHorizontal: '3%',
                        paddingVertical: '5%',
                      },
                    ]}>
                    <View
                      style={{
                        width: '100%',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexDirection: 'row',
                      }}>
                      <Text style={[styles.reportTitle, {color: colors.text}]}>
                        {item.title}
                      </Text>
                      <View
                        style={{
                          borderWidth: 1,
                          borderColor: colors.info,
                          borderRadius: 10,
                          paddingHorizontal: '2%',
                          paddingVertical: '2%',
                        }}>
                        <Text
                          style={[styles.reportStatus, {color: colors.text}]}>
                          {item.status}
                        </Text>
                      </View>
                    </View>

                    <Text style={styles.reportDate}>{item.dateTime}</Text>
                    <Text style={styles.reportLocation}>{item.location}</Text>

                    <View style={styles.reportFooter}>
                      <TouchableOpacity style={styles.helpButton}>
                        <Image
                          source={call}
                          style={{
                            width: 15,
                            height: 16,
                            resizeMode: 'contain',
                          }}
                        />
                        <Text
                          style={[styles.helpButtonText, {color: '#F36A1D'}]}>
                          Hubungi Bantuan
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              />
            </View>
          </View>
        </ImageBackground>
      </Modal>
    </>
  );
};

export default DisasterReportScreen;

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  container: {flex: 1, padding: 16, marginTop: '5%'},
  card: {
    borderRadius: 12,
    width: 180,
    height: 200, // Pastikan semua card punya tinggi yang sama
    marginBottom: 10,
    overflow: 'hidden', // Supaya gradient tidak keluar batas sudut card
  },
  gradient: {
    flex: 1, // Isi ruang card sepenuhnya
    borderRadius: 12,
    paddingHorizontal: '5%',
    paddingVertical: 16, // Atur padding sesuai selera
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  cardContent: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  cardImage: {
    width: 50,
    height: 40,
    resizeMode: 'contain',
  },
  cardTitle: {
    fontSize: 18,
    color: 'white', // atau colors.text
    marginBottom: 10,
    fontWeight: '500',
    marginLeft: '8%',
    textAlign: 'left',
    lineHeight: 20,
    minHeight: 40,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 50, // Sesuaikan agar tidak bertabrakan dengan status bar
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  closeButtonText: {
    fontSize: 16,
    color: 'red',
  },
  modalSubTitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
    marginHorizontal: 16,
    width: '70%',
  },
  searchWrapper: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  searchInput: {
    height: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    paddingHorizontal: 10,
  },

  // Item Laporan
  reportItem: {
    backgroundColor: '#F8F8F8',
    borderRadius: 10,

    marginBottom: 10,
  },
  reportTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
  },
  reportDate: {
    fontSize: 12,
    color: '#999',
    marginBottom: 2,
  },
  reportLocation: {
    fontSize: 12,
    color: '#F59047',
    marginBottom: 8,
  },
  reportFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reportStatus: {
    fontSize: 10,
    color: '#FF9900', // contoh warna "Menunggu Verifikasi"
    fontWeight: '600',
  },
  helpButton: {
    backgroundColor: 'transparent',
    borderRadius: 0,
    paddingVertical: 6,
    paddingHorizontal: 10,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  helpButtonText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
    marginLeft: '3%',
  },
});
