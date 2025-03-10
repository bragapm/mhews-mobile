import React, { useRef, useState, useEffect, useCallback } from 'react';
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
  ActivityIndicator,
} from 'react-native';
import COLORS from '../config/COLORS';
import { HeaderNav } from '../components/Header';
import MapboxGL, { Camera } from '@rnmapbox/maps';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import LinearGradient from 'react-native-linear-gradient';
import { getData, MAPBOX_ACCESS_TOKEN, postData } from '../services/apiServices';
import useAuthStore from '../hooks/auth';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Checkbox, RadioButton } from 'react-native-paper';
import { getLocationDetails } from '../utils/locationUtils';
import { useAlert } from '../components/AlertContext';

// Ganti dengan token Mapbox Anda
MapboxGL.setAccessToken(MAPBOX_ACCESS_TOKEN);

const { width, height } = Dimensions.get('window');

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
  const [selectedDisaster, setSelectedDisaster] = useState<string | null>(null);
  const [laporanBencana, setLaporanBencana] = useState([]);
  const { profile, getProfile } = useAuthStore();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const mapRef = useRef<MapboxGL.MapView | null>(null);
  const { showAlert } = useAlert();

  const [volcanoSigns, setVolcanoSigns] = useState({
    temperatureRise: false,
    plantDeath: false,
    animalBehavior: false,
    toxicGas: false,
    frequentRumbling: false,
    loudNoises: false,
  });

  const [reportDamage, setReportDamage] = useState('');
  const [roadDamageLevel, setRoadDamageLevel] = useState('');
  const [needHelp, setNeedHelp] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<[number, number] | null>(null);
  const [kedalamanBanjir, setKedalamanBanjir] = useState('');
  const [jumlahOrang, setJumlahOrang] = useState('');
  const [luasJalan, setLuasJalan] = useState('');
  const [deskripsiKejadian, setDeskripsiKejadian] = useState('');
  const [deskripsiKerusakan, setDeskripsiKerusakan] = useState('');

  // Daftar bencana
  const DISASTERS = [
    {
      id: '1',
      title: 'Bencana Banjir',
      jenis_laporan_bencana: 'banjir',
      image: banjir,
    },
    {
      id: '2',
      title: 'Erupsi Gunung Berapi',
      jenis_laporan_bencana: 'gunung berapi',
      image: erupsi,
    },
    {
      id: '3',
      title: 'Gempa Bumi',
      jenis_laporan_bencana: 'gempa bumi',
      image: gempa,
    },
    {
      id: '4',
      title: 'Kebakaran Hutan',
      jenis_laporan_bencana: 'Kebakaran Hutan',
      image: kebakaranHutan,
    },
    {
      id: '5',
      title: 'Kabut Asap',
      jenis_laporan_bencana: 'Kabut Asap',
      image: kabutAsap,
    },
    {
      id: '6',
      title: 'Angin Kencang',
      jenis_laporan_bencana: 'Angin Kencang',
      image: anginKencang,
    },
    {
      id: '7',
      title: 'Tanah Longsor',
      jenis_laporan_bencana: 'tanah longsor',
      image: longsor,
    },
    {
      id: '8',
      title: 'Gelombang Tsunami',
      jenis_laporan_bencana: 'tsunami',
      image: tsunami,
    },
  ];

  useEffect(() => {
    getProfile();
    fetchData();
  }, []);

  const handleMapPress = async (event: any) => {
    const { geometry } = event;
    if (geometry && geometry.coordinates) {
      setSelectedLocation(geometry.coordinates);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [laporan_bencana] = await Promise.all([
        getData('items/laporan_bencana'),
      ]);

      console.log(laporan_bencana?.data);

      setLaporanBencana(laporan_bencana?.data || []);
    } catch (err: any) {
      setError(err.message);
      console.error('Gagal mengambil data:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleCheckbox = (key: keyof typeof volcanoSigns) => {
    setVolcanoSigns(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const submitLaporan = async () => {
    if (!selectedLocation) {
      showAlert('error', 'Lokasi belum dipilih!');
      return;
    }

    const disaster = DISASTERS.find(d => d.id === selectedDisaster);
    let address;
    if (selectedLocation) {
      address = await getLocationDetails(
        selectedLocation[1],
        selectedLocation[0],
      );
    }

    const data = {
      "jenis_laporan_bencana": disaster ? disaster.jenis_laporan_bencana : "Tidak Diketahui",
      "nama_bencana": disaster ? disaster.title : "Tidak Diketahui",
      "status_laporan": "Menunggu Verifikasi",
      "pelapor": "ae819633-a26d-4a3d-91b8-ba5e58da3bd1",
      "image": "1e3e1ea7-7567-4d57-ba63-516e9b927be5",
      "alamat_banjir": address,
      "geom": {
        "type": "Point",
        "coordinates": [
          selectedLocation ? selectedLocation[1] : 0,
          selectedLocation ? selectedLocation[0] : 0
        ]
      },
      "kedalaman_banjir": kedalamanBanjir ? parseFloat(kedalamanBanjir) : 0,
      "jumlah_orang_sekitar": jumlahOrang ? parseInt(jumlahOrang) : 0,
      "luas_jalan": luasJalan ? parseFloat(luasJalan) : 0,
      "deskripsi_kejadian": deskripsiKejadian,
      "deskripsi_kerusakan": deskripsiKerusakan,
    };

    setLoading(true);
    try {
      const response = await postData('/items/laporan_bencana', data);
      console.log(response);
      if (response?.data) {
        showAlert('success', 'Laporan Berhasil Dikirim.');
        setLoading(false);
        setSelectedDisaster(null);
        fetchData();
      } else {
        setLoading(false);
        showAlert('error', 'Login Gagal!');
      }
    } catch (error: any) {
      showAlert('error', error.message);
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
        resizeMode="cover">

        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}>

          <View style={styles.container}>
            <View
              style={{
                width: '100%',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                paddingVertical: 15,
                position: 'relative',
              }}>

              <TouchableOpacity
                onPress={handleBack}
                style={{
                  position: 'absolute',
                  left: 1,
                  zIndex: 1,
                }}>
                <Image
                  source={arrowLeft}
                  style={{
                    width: 20,
                    height: 20,
                    resizeMode: 'contain',
                  }}
                />
              </TouchableOpacity>

              <Text
                style={{
                  fontSize: 22,
                  color: colors.text,
                  fontWeight: '800',
                }}>
                Lapor Bencana
              </Text>

              <TouchableOpacity
                onPress={() => setShowHistory(true)}
                style={{
                  position: 'absolute',
                  right: 1,
                  zIndex: 1,
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
              keyExtractor={(item) => item.id}
              numColumns={2}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.card, { width: '48%' }]}
                  onPress={() => setSelectedDisaster(item.id)}
                  activeOpacity={0.8}>

                  <LinearGradient
                    colors={[colors.gradientCardStart, colors.gradientCardEnd]}
                    style={styles.gradient}>

                    <View style={styles.cardContent}>
                      <Image source={item.image} style={styles.cardImage} />
                      <View style={{ width: '100%' }}>
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
              contentContainerStyle={{ paddingHorizontal: 1, paddingBottom: 1 }}
              columnWrapperStyle={DISASTERS.length > 1 ? { justifyContent: 'space-between' } : null}
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

          <View style={[styles.modalContainer, { backgroundColor: 'transparent' }]}>
            {/* Header dengan ikon back dan judul di tengah */}
            <View
              style={{
                width: '100%',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center', // Memusatkan judul
                position: 'relative', // Untuk menjaga posisi ikon back
              }}>

              {/* Ikon Back */}
              <TouchableOpacity
                onPress={() => setShowHistory(false)}
                style={{
                  position: 'absolute',
                  left: 20, // Menempatkan ikon back di kiri
                  zIndex: 1, // Pastikan di atas elemen lain
                }}>
                <Image
                  source={arrowLeft}
                  style={{
                    width: 20,
                    height: 20,
                    resizeMode: 'contain',
                  }}
                />
              </TouchableOpacity>

              {/* Judul */}
              <Text
                style={{
                  fontSize: 22,
                  color: colors.text,
                  fontWeight: '800',
                }}>
                Daftar Laporan
              </Text>
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
                <Text style={[styles.modalSubTitle, { color: colors.info }]}>
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
                data={laporanBencana}
                keyExtractor={(item: any) => item.id}
                contentContainerStyle={{
                  paddingBottom: 20,
                  width: '100%',
                }}
                style={{
                  width: '90%',
                }}
                renderItem={({ item }) => (
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
                      <Text style={[styles.reportTitle, { color: colors.text }]}>
                        {item?.jenis_laporan_bencana
                          .replace(/_/g, ' ')
                          .replace(/\b\w/g, (c: any) => c.toUpperCase())}
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
                          style={[styles.reportStatus, { color: colors.text }]}>
                          {item.status_laporan}
                        </Text>
                      </View>
                    </View>

                    <Text style={styles.reportDate}>
                      {new Intl.DateTimeFormat('id-ID', {
                        dateStyle: 'full',
                        timeStyle: 'medium',
                      }).format(new Date(item?.date_created))}
                    </Text>
                    <Text style={styles.reportLocation}>{item.alamat_banjir}</Text>

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
                          style={[styles.helpButtonText, { color: '#F36A1D' }]}>
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

      {/*  */}
      <Modal
        visible={selectedDisaster !== null}
        animationType="slide"
        onRequestClose={() => setSelectedDisaster(null)}>
        <ImageBackground
          source={backgroundSource}
          style={styles.background}
          resizeMode="cover">
          <ScrollView
            contentContainerStyle={{ paddingBottom: 20 }}
            keyboardShouldPersistTaps="handled"
          >
            {/* Header modal form */}
            {/*  */}
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
                    onPress={() => setSelectedDisaster(null)}
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
                    marginVertical: '5%',
                    width: '90%',
                  }}>
                  <Text
                    style={{
                      fontSize: 22,
                      color: colors.text,
                      marginBottom: 10,
                      fontWeight: '800',
                      alignItems: 'center',
                    }}>
                    {selectedDisaster === '1' && 'Lapor Banjir'}
                    {selectedDisaster === '2' && 'Lapor Erupsi Gunung Berapi'}
                    {selectedDisaster === '3' && 'Lapor Gempa Bumi'}
                    {selectedDisaster === '4' && 'Lapor Kebakaran Hutan'}
                    {selectedDisaster === '5' && 'Lapor Kabut Asap'}
                    {selectedDisaster === '6' && 'Lapor Angin Kencang'}
                    {selectedDisaster === '7' && 'Lapor Tanah Longsor'}
                    {selectedDisaster === '8' && 'Lapor Tsunami'}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.formContainer}>
              <Text style={[styles.formSubtitle, { color: colors.info }]}>
                Lengkapi laporan dibawah ini untuk lapor bencana{' '}
                {selectedDisaster === '1' && 'banjir'}
                {selectedDisaster === '2' && 'erupsi gunung berapi'}
                {selectedDisaster === '3' && 'gempa bumi'}
                {selectedDisaster === '4' && 'kebakaran hutan'}
                {selectedDisaster === '5' && 'kabut asap'}
                {selectedDisaster === '6' && 'angin kencang'}
                {selectedDisaster === '7' && 'tanah longsor'}
                {selectedDisaster === '8' && 'tsunami'}
              </Text>

              {/* Lokasi Bencana & Map */}
              <Text style={[styles.label, { color: colors.text }]}>Lokasi Bencana</Text>
              <View style={styles.mapPlaceholder}>
                <MapboxGL.MapView
                  ref={mapRef}
                  style={{ flex: 1 }}
                  styleURL={MapboxGL.StyleURL.Street}
                  onPress={handleMapPress}
                  pointerEvents="box-none"
                >
                  {/* Kamera Awal */}
                  <MapboxGL.Camera
                    zoomLevel={12}
                    centerCoordinate={selectedLocation || [106.84513, -6.21462]}
                    animationMode={'flyTo'}
                    animationDuration={1000}
                  />

                  {/* Pin Lokasi (Jika ada) */}
                  {selectedLocation && (
                    <MapboxGL.PointAnnotation
                      id="selectedPin"
                      coordinate={selectedLocation}>
                      <View style={{ width: 30, height: 30 }}>
                        <Ionicons name="location-sharp" size={30} color="#c55" />
                      </View>
                    </MapboxGL.PointAnnotation>
                  )}
                </MapboxGL.MapView>
              </View>

              {/* Banjir */}
              {selectedDisaster === '1' && (
                <>
                  <Text style={styles.label}>Kedalaman Banjir</Text>
                  <TextInput
                    style={styles.inputText}
                    placeholder="0 cm"
                    keyboardType="numeric"
                    value={kedalamanBanjir}
                    onChangeText={setKedalamanBanjir}
                  />

                  <View style={[styles.infoBox]}>
                    <View style={styles.infoContainer}>
                      <Ionicons name="information-circle-outline" size={18} style={{ color: '#F36A1D' }} />
                      <Text style={styles.infoText}>
                        Rata-rata tinggi <Text style={styles.boldText}>mata kaki</Text> orang dewasa <Text style={styles.boldText}>+/- 10 cm</Text>
                      </Text>
                    </View>

                    <View style={styles.infoContainer}>
                      <Ionicons name="information-circle-outline" size={18} style={{ color: '#F36A1D' }} />
                      <Text style={styles.infoText}>
                        Rata-rata tinggi <Text style={styles.boldText}>betis</Text> orang dewasa <Text style={styles.boldText}>+/- 40 cm</Text>
                      </Text>
                    </View>

                    <View style={styles.infoContainer}>
                      <Ionicons name="information-circle-outline" size={18} style={{ color: '#F36A1D' }} />
                      <Text style={styles.infoText}>
                        Rata-rata tinggi <Text style={styles.boldText}>dada</Text> orang dewasa <Text style={styles.boldText}>+/- 140 cm</Text>
                      </Text>
                    </View>
                  </View>
                </>
              )}

              {/* Erupsi Gunung Berapi */}
              {selectedDisaster === '2' && (
                <>
                  <Text style={styles.label}>Tanda-Tanda Gunung Berapi</Text>

                  <View style={{ marginBottom: 10 }}>
                    {Object.entries(volcanoSigns).map(([key, value]) => (
                      <View key={key} style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Checkbox
                          status={value ? 'checked' : 'unchecked'}
                          onPress={() => toggleCheckbox(key as keyof typeof volcanoSigns)}
                          color="#F36A1D"
                        />
                        <Text style={styles.infoTextGrey}>
                          {key === 'temperatureRise' && 'Kenaikan suhu signifikan'}
                          {key === 'plantDeath' && 'Kekeringan/kematian tumbuhan'}
                          {key === 'animalBehavior' && 'Perilaku hewan liar tidak biasa'}
                          {key === 'toxicGas' && 'Sumber gas beracun'}
                          {key === 'frequentRumbling' && 'Gemuruh yang sering'}
                          {key === 'loudNoises' && 'Suara gemuruh yang sering'}
                        </Text>
                      </View>
                    ))}
                  </View>

                  <Text style={styles.label}>Jumlah Orang di Sekitar</Text>
                  <TextInput
                    style={styles.inputText}
                    placeholder="0 orang"
                    keyboardType="numeric"
                    value={jumlahOrang}
                    onChangeText={setJumlahOrang}
                  />

                  <View style={styles.infoContainer}>
                    <Ionicons name="information-circle-outline" size={18} style={{ color: '#232221' }} />
                    <Text style={styles.infoTextGrey}>
                      Masukkan perkiraan jumlah orang di sekitar anda
                    </Text>
                  </View>
                </>
              )}

              {/* Gempa Bumi */}
              {selectedDisaster === '3' && (
                <>
                  <Text style={styles.label}>
                    Apakah anda ingin melaporkan kerusakan jalan?
                  </Text>

                  {/* Radio Button */}
                  <RadioButton.Group
                    onValueChange={value => setReportDamage(value)}
                    value={reportDamage}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 5 }}>
                      <RadioButton value="yes" color="#F36A1D" />
                      <Text style={styles.infoTextGrey}>Ya</Text>

                      <RadioButton value="no" color="#F36A1D" />
                      <Text style={styles.infoTextGrey}>Tidak</Text>
                    </View>
                  </RadioButton.Group>

                  <Text style={styles.label}>Luas Jalan</Text>
                  <TextInput
                    style={styles.inputText}
                    placeholder="0 m²"
                    keyboardType="numeric"
                    value={luasJalan}
                    onChangeText={setLuasJalan}
                  />

                  {/* Informasi dengan Border */}
                  <View style={[styles.infoBox]}>
                    <View style={styles.infoContainer}>
                      <Ionicons name="information-circle-outline" size={18} style={{ color: '#F36A1D' }} />
                      <Text style={styles.infoText}>
                        Rata-rata lebar jalan muat <Text style={styles.boldText}>2 lajur pejalan kaki atau 1 lajur  kendaraan roda 2 +/- 1.5 meter</Text>
                      </Text>
                    </View>

                    <View style={styles.infoContainer}>
                      <Ionicons name="information-circle-outline" size={18} style={{ color: '#F36A1D' }} />
                      <Text style={styles.infoText}>
                        Rata-rata lebar jalan <Text style={styles.boldText}>2  lajur kendaraan roda 2 atau 1 lajur kendaraan roda 4 +/- 3 meter</Text>
                      </Text>
                    </View>

                    <View style={styles.infoContainer}>
                      <Ionicons name="information-circle-outline" size={18} style={{ color: '#F36A1D' }} />
                      <Text style={styles.infoText}>
                        Rata-rata lebar jalan <Text style={styles.boldText}>2  lajur kendaraan roda 4 atau 1 lajur kendaraan berat (truk/bus) +/- 4 meter</Text>
                      </Text>
                    </View>

                    <View style={styles.infoContainer}>
                      <Ionicons name="information-circle-outline" size={18} style={{ color: '#F36A1D' }} />
                      <Text style={styles.infoText}>
                        Rata-rata lebar jalan <Text style={styles.boldText}>2 lajur kendaraan berat (truk/bus) +/- 6 meter</Text>
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.label}>Tingkat Kerusakan Jalan</Text>

                  {/* Radio Button untuk Tingkat Kerusakan */}
                  <RadioButton.Group
                    onValueChange={value => setRoadDamageLevel(value)}
                    value={roadDamageLevel}
                  >
                    {[
                      { label: "Rusak Ringan", desc: "Jalan rusak halus berupa retakan atau lubang kecil" },
                      { label: "Rusak Sedang", desc: "Jalan rusak berupa retakan dan lubang menengah namun dapat dilewati" },
                      { label: "Rusak Berat", desc: "Jalan rusak berupa retakan dan lubang besar hingga terputus atau tidak bisa dilewati" }
                    ].map((item, index) => (
                      <View key={index} style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 5, paddingRight: 45 }}>
                        <RadioButton value={item.label} color="#F36A1D" />
                        <View>
                          <Text style={styles.infoTextBold}>{item.label}</Text>
                          <Text style={styles.infoTextGrey}>{item.desc}</Text>
                        </View>
                      </View>
                    ))}
                  </RadioButton.Group>
                </>
              )}

              {/* FORM GENERIK (Kebakaran Hutan, Kabut Asap, Angin Kencang, Tanah Longsor, Tsunami) */}
              {(selectedDisaster === '4' ||
                selectedDisaster === '5' ||
                selectedDisaster === '6' ||
                selectedDisaster === '7' ||
                selectedDisaster === '8') && (
                  <>
                    <Text style={styles.label}>Unggah Foto Kejadian</Text>
                    <TouchableOpacity style={styles.uploadButton}>
                      <Text style={{ color: '#666' }}>
                        Unggah Foto Kejadian Disini
                      </Text>
                    </TouchableOpacity>

                    <Text style={styles.label}>Deskripsi Kejadian</Text>
                    <TextInput
                      style={styles.inputArea}
                      placeholder="Masukkan Deskripsi Kejadian Bencana"
                      multiline
                      value={deskripsiKejadian}
                      onChangeText={setDeskripsiKejadian}
                    />

                    {/* Butuh Bantuan */}
                    <Text style={styles.label}>Apakah anda membutuhkan bantuan?</Text>
                    <RadioButton.Group onValueChange={value => setNeedHelp(value)} value={needHelp}>
                      <View style={{ flexDirection: 'row', marginVertical: 5, alignItems: 'center' }}>
                        <RadioButton value="yes" color="#F36A1D" />
                        <Text style={styles.infoTextGrey}>Ya</Text>

                        <RadioButton value="no" color="#F36A1D" />
                        <Text style={styles.infoTextGrey}>Tidak</Text>
                      </View>
                    </RadioButton.Group>

                    {/* Laporkan Kerusakan */}
                    <Text style={styles.label}>Apakah anda ingin melaporkan kerusakan?</Text>
                    <RadioButton.Group onValueChange={value => setReportDamage(value)} value={reportDamage}>
                      <View style={{ flexDirection: 'row', marginVertical: 5, alignItems: 'center' }}>
                        <RadioButton value="yes" color="#F36A1D" />
                        <Text style={styles.infoTextGrey}>Ya</Text>

                        <RadioButton value="no" color="#F36A1D" />
                        <Text style={styles.infoTextGrey}>Tidak</Text>
                      </View>
                    </RadioButton.Group>

                    <Text style={styles.label}>Deskripsi Kerusakan</Text>
                    <TextInput
                      style={styles.inputArea}
                      placeholder="Masukkan Deskripsi Kerusakan yang Terjadi"
                      multiline
                      value={deskripsiKerusakan}
                      onChangeText={setDeskripsiKerusakan}
                    />
                  </>
                )}

              {/* Unggah foto & tombol submit (Banjir, Erupsi, Gempa juga butuh ini) */}
              {selectedDisaster === '1' ||
                selectedDisaster === '2' ||
                selectedDisaster === '3' ? (
                <>
                  <Text style={styles.label}>Unggah Foto Kejadian</Text>
                  <TouchableOpacity style={styles.uploadButton}>
                    <Text style={{ color: '#666' }}>
                      Unggah Foto Kejadian Disini
                    </Text>
                  </TouchableOpacity>
                </>
              ) : null}

              {/* Tombol Kirim Laporan */}
              <TouchableOpacity
                style={styles.submitButton}
                onPress={submitLaporan}
                disabled={loading}>
                {loading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.submitButtonText}>Kirim Laporan</Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
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
  container: { flex: 1, padding: 16, marginTop: '5%' },
  card: {
    borderRadius: 12,
    width: 180,
    height: 200, // Pastikan semua card punya tinggi yang sama
    marginBottom: 10,
    overflow: 'hidden', // Supaya gradient tidak keluar batas sudut card
  },
  gradient: {
    flex: 1,
    borderRadius: 12,
    paddingHorizontal: '5%',
    paddingVertical: 16,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  infoBox: {
    marginVertical: 10,
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#C3C3BF',
    paddingRight: 20
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 5,
  },
  boldText: {
    fontWeight: 'bold',
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
    marginBottom: 10
  },
  cardTitle: {
    fontSize: 18,
    color: 'white', // atau colors.text
    marginBottom: 10,
    fontWeight: '500',
    marginLeft: '3%',
    textAlign: 'left',
    lineHeight: 20,
    minHeight: 40,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 20,
  },
  modalSubTitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
    marginHorizontal: 16,
    width: '70%',
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
  formContainer: {
    marginHorizontal: 20,
    marginTop: 20,
    paddingBottom: 30,
  },
  formSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  mapPlaceholder: {
    width: '100%',
    height: 300,
    borderRadius: 10,
    marginBottom: 16,
  },
  inputText: {
    height: 40,
    borderColor: '#CCC',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 5,
  },
  inputArea: {
    height: 80,
    borderColor: '#CCC',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingTop: 10,
    marginBottom: 10,
    textAlignVertical: 'top',
  },
  infoText: {
    fontSize: 13,
    color: '#F36A1D',
    marginBottom: 4,
  },
  infoTextBold: {
    fontSize: 13,
    color: '#232221',
    marginBottom: 4,
    fontWeight: 'bold',
  },
  infoTextGrey: {
    fontSize: 13,
    color: '#232221',
    marginBottom: 4,
  },
  uploadButton: {
    height: 50,
    borderColor: '#CCC',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButton: {
    backgroundColor: '#F36A1D',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10,
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
