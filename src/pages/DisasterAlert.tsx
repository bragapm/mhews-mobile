import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  PanResponder,
  Animated,
  Dimensions,
  Pressable,
  Image,
  StatusBar,
  FlatList,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { RootStackParamList } from '../navigation/types';
import MapboxGL, { Camera } from '@rnmapbox/maps';
import COLORS from '../config/COLORS';

const { width, height } = Dimensions.get('window');

const MAPBOX_ACCESS_TOKEN =
  'sk.eyJ1Ijoid2hvaXNhcnZpYW4iLCJhIjoiY203YjJkajRtMDk3cDJtczlxMDRrOTExNiJ9.61sU5Z9qNoRfQ22qdcAMzQ';
MapboxGL.setAccessToken(MAPBOX_ACCESS_TOKEN);

const DisasterAlertScreen = () => {
  const colors = COLORS();
  const iconPhone = require('../assets/icons/phone.png');
  const iconMegaphone = require('../assets/icons/megaphone.png');

  const [bottomSheetHeight, setBottomSheetHeight] = useState(200);
  const pan = useRef(new Animated.ValueXY()).current;
  const [isShowServices, setIsShowServices] = useState(false);
  const [isShowDisasterMaps, setIsShowDisasterMaps] = useState(false);
  const [isDanger, setIsDanger] = useState(false);
  const [detailBencana, setSelectedDetailBencana] = useState<any>(null);
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  // Map & Camera
  const mapRef = useRef<MapboxGL.MapView | null>(null);
  const cameraRef = useRef<MapboxGL.Camera | null>(null);
  const [disasterLocation, setDisasterLocation] = useState<[number, number] | null>(
    null,
  );

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderMove: (event, gestureState) => {
      const delta = gestureState.dy;
      setBottomSheetHeight(prevHeight => {
        const newHeight = prevHeight - delta;
        if (newHeight > height * 0.7) {
          return height * 0.7;
        } else if (newHeight < 200) {
          return 200;
        } else {
          return newHeight;
        }
      });
    },
    onPanResponderRelease: () => {
      pan.flattenOffset();
    },
  });

  const actionStatus = (status: any) => {
    if (status == 'safe') {
      navigation.navigate('Tabs');
    } else {
      setBottomSheetHeight(300);
      setIsShowServices(true);
    }
  };

  useEffect(() => {
    setDisasterLocation([-8.209701, 114.372671]);
  }, []);

  useEffect(() => {
    if (isDanger) {
      setBottomSheetHeight(200);
    }
  }, [isDanger]);

  const showDisasterDetailMaps = () => {
    setIsShowDisasterMaps(true);
  };

  const goHome = () => {
    navigation.replace("Tabs");
  };

  return (
    <>
      {!isShowDisasterMaps ? (
        <View
          style={[
            styles.container,
            {backgroundColor: !isDanger ? '#F36A1D' : '#C4432C'},
          ]}>
          <View style={styles.backgroundContainer}>
            <View style={styles.circleLarge}>
              <View style={styles.circleSmall}>
                <Image
                  source={require('../assets/images/vector-danger.png')}
                  style={styles.warningImage}
                />
              </View>
            </View>
          </View>

          {isShowServices && <View style={styles.overlay} />}
          <View style={styles.header}>
            <Text style={styles.title}>
              {isDanger ? 'Peringatan Tsunami' : 'Peringatan Gempa!'}
            </Text>
            <Text style={styles.description}>
              {isDanger
                ? 'Jika anda menerima notifikasi ini, harap segera melakukan evakuasi ke zona aman dan mengiikuti petunjuk resmi'
                : 'Jika anda menerima notifikasi ini, anda berada pada zona tidak aman. Harap mempersiapkan evakuasi dan ikuti petunjuk dari kami.'}
            </Text>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.cardContainer}>
              {isDanger && (
                <Text style={styles.titleDanger}>
                  Tsunami akan terjadi dalam :
                </Text>
              )}

              {!isDanger ? (
                <>
                  <View style={styles.cardLocation}>
                    <View style={styles.cardLokasi}>
                      <Text style={styles.cardTitle}>Lokasi Gempa</Text>
                      <Text style={styles.cardValue}>
                        -7.72145772, 109.00724549
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={styles.button}
                      onPress={showDisasterDetailMaps}>
                      <Text style={styles.buttonTextLokasi}>
                        Peta Lokasi Bencana
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.cardFlex}>
                    <View style={styles.card}>
                      <Text style={styles.cardTitle}>Kekuatan Gempa</Text>
                      <Text style={styles.cardValue}>7.4 Magnitudo</Text>
                    </View>
                    <View style={styles.card}>
                      <Text style={styles.cardTitle}>Kedalaman Gempa</Text>
                      <Text style={styles.cardValue}>5 Meter</Text>
                    </View>
                    <View style={styles.card}>
                      <Text style={styles.cardTitle}>Skala Gempa</Text>
                      <Text style={styles.cardValue}>IV MMI</Text>
                    </View>
                  </View>
                </>
              ) : (
                <>
                  <View style={styles.cardFlex}>
                    <View style={styles.card}>
                      <Text style={styles.cardTitle}>Jam</Text>
                      <Text style={styles.cardValue}>00</Text>
                    </View>
                    <View style={styles.card}>
                      <Text style={styles.cardTitle}>Menit</Text>
                      <Text style={styles.cardValue}>14</Text>
                    </View>
                    <View style={styles.card}>
                      <Text style={styles.cardTitle}>Detik</Text>
                      <Text style={styles.cardValue}>28</Text>
                    </View>
                  </View>
                </>
              )}
            </View>
          </ScrollView>

          <View
            {...panResponder.panHandlers}
            style={[styles.bottomSheet, {height: bottomSheetHeight}]}>
            <View style={styles.dragIndicator} />
            {!isShowServices ? (
              <>
                {!isDanger ? (
                  <>
                    <TouchableOpacity
                      style={styles.buttonPrimary}
                      onPress={() => actionStatus('safe')}>
                      <Text style={styles.buttonText}>
                        Saya Tidak Terdampak
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.buttonSecondary}
                      onPress={() => actionStatus('not_safe')}>
                      <Text style={styles.buttonTextSecondary}>
                        Saya Terdampak, Butuh Bantuan
                      </Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <>
                    <TouchableOpacity
                      style={styles.buttonDanger}
                      onPress={() =>
                        navigation.navigate('NotifEvacuateLocationScreen')
                      }>
                      <Text style={styles.buttonTextDanger}>
                        Lihat Peta Evakuasi
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.buttonSecondary}
                      onPress={goHome}>
                      <Text style={styles.buttonTextSecondary}>
                        Kembali ke Beranda
                      </Text>
                    </TouchableOpacity>
                  </>
                )}
              </>
            ) : (
              <>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}>
                  <View style={{flexDirection: 'column'}}>
                    <Text style={styles.modalTitle}>Pilih Layanan</Text>
                    <Text style={styles.modalSubtitle}>
                      Silahkan pilih layanan yang anda butuhkan
                    </Text>
                  </View>
                  <Pressable
                    onPress={() => {
                      setBottomSheetHeight(200);
                      setIsShowServices(false);
                    }}>
                    <Feather
                      name="x"
                      size={24}
                      color="#000"
                      style={{padding: 8, marginBottom: 20}}
                    />
                  </Pressable>
                </View>

                <Pressable
                  style={({pressed}) => [
                    styles.methodOption,
                    {
                      opacity: pressed ? 0.9 : 1,
                      transform: [{scale: pressed ? 0.98 : 1}],
                    },
                  ]}>
                  <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    <Image
                      source={iconPhone}
                      style={{
                        width: 20,
                        height: 20,
                        resizeMode: 'contain',
                        marginRight: 8,
                      }}
                    />
                    <View style={{flexDirection: 'column', width: '90%'}}>
                      <Text style={styles.methodTitle}>
                        Nomor Kontak Center Bencana
                      </Text>
                      <Text style={styles.methodDesc}>
                        Hubungi kontak center bencana untuk bantuan cepat dalam
                        keadaan darurat
                      </Text>
                    </View>
                    <Feather
                      name="chevron-right"
                      size={20}
                      style={{marginRight: 8}}
                    />
                  </View>
                </Pressable>

                <Pressable
                  style={({pressed}) => [
                    styles.methodOption,
                    {
                      opacity: pressed ? 0.9 : 1,
                      transform: [{scale: pressed ? 0.98 : 1}],
                    },
                  ]}>
                  <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    <Image
                      source={iconMegaphone}
                      style={{
                        width: 20,
                        height: 20,
                        resizeMode: 'contain',
                        marginRight: 8,
                      }}
                    />
                    <View style={{flexDirection: 'column', width: '90%'}}>
                      <Text style={styles.methodTitle}>Lapor Bencana</Text>
                      <Text style={styles.methodDesc}>
                        Laporkan kejadian bencana atau situasi darurat yang anda
                        alami
                      </Text>
                    </View>
                    <Feather
                      name="chevron-right"
                      size={20}
                      style={{marginRight: 8}}
                    />
                  </View>
                </Pressable>
              </>
            )}
          </View>
        </View>
      ) : (
        <View style={styles.containerMap}>
          <StatusBar translucent backgroundColor="transparent" />
          <View style={styles.mapContainer}>
            <MapboxGL.MapView
              ref={mapRef}
              style={styles.map}
              styleURL={MapboxGL.StyleURL.Street}
              onDidFinishLoadingMap={() => console.log('Map Loaded')}>
              <Camera ref={cameraRef} minZoomLevel={4} />

              {/* Lingkaran radius user */}
              {disasterLocation && (
                <MapboxGL.ShapeSource
                  id="disasterLocationCircle"
                  shape={{
                    type: 'Feature',
                    geometry: {
                      type: 'Point',
                      coordinates: disasterLocation,
                    },
                    properties: {},
                  }}>
                  <MapboxGL.CircleLayer
                    id="disasterCircle"
                    style={{
                      circleRadius: 2000,
                      circleColor: 'rgba(205, 83, 27, 0.2)',
                      circleOpacity: 0.6,
                    }}
                  />
                </MapboxGL.ShapeSource>
              )}

              {/* Marker user */}
              {disasterLocation && (
                <>
                  <MapboxGL.ShapeSource
                    id="disasterLocationCircle"
                    shape={{
                      type: 'Feature',
                      geometry: {
                        type: 'Point',
                        coordinates: [disasterLocation[0], disasterLocation[1]],
                      },
                      properties: {},
                    }}>
                    <MapboxGL.CircleLayer
                      id="disasterCircle"
                      style={{
                        circleRadius: [
                          'interpolate',
                          ['exponential', 2],
                          ['zoom'],
                          0,
                          2,
                          10,
                          10,
                          16,
                          250,
                          22,
                          500,
                        ],
                        circleColor: 'rgba(205, 83, 27, 0.29)',
                        circleOpacity: 0.6,
                      }}
                    />
                  </MapboxGL.ShapeSource>
                  <MapboxGL.PointAnnotation
                    id="disasterLocation"
                    coordinate={disasterLocation}>
                    <View style={styles.disasterMarker} />
                  </MapboxGL.PointAnnotation>
                </>
              )}
            </MapboxGL.MapView>
          </View>

          <Animated.View
            {...panResponder.panHandlers}
            style={[styles.bottomSheet, {height: bottomSheetHeight}]}>
            <View style={styles.dragIndicator} />
            <View
              style={{
                width: '100%',
                flexDirection: 'row',
                alignItems: 'center',
              }}>
              <TouchableOpacity
                style={{
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                onPress={() => setIsShowDisasterMaps(false)}>
                <Image
                  source={require('../assets/images/chevLeft.png')}
                  style={{width: 25, height: 40, resizeMode: 'contain'}}
                />
              </TouchableOpacity>
              <View
                style={{
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginTop: '3%',
                }}>
                <Text
                  style={[
                    styles.sheetTitle,
                    {marginLeft: '2%', alignItems: 'center'},
                  ]}>
                  {detailBencana?.jenis_bencana
                    .replace(/_/g, ' ')
                    .replace(/\b\w/g, (c: any) => c.toUpperCase()) || '-'}
                </Text>
              </View>
            </View>

            {/* 3 Kotak Info Sesuai Jenis Bencana */}
            <View style={styles.infoContainer}>
              {detailBencana?.jenis_bencana === 'tsunami' && (
                <>
                  <View style={styles.infoBox}>
                    <Text style={styles.infoTitle}>
                      Kecepatan Gelombang Air
                    </Text>
                    <Text style={styles.infoValue}>
                      {detailBencana?.cepat_gel_air || 0} m/s
                    </Text>
                  </View>
                  <View style={styles.infoBox}>
                    <Text style={styles.infoTitle}>
                      Ketinggian Gelombang Air
                    </Text>
                    <Text style={styles.infoValue}>
                      {detailBencana?.tinggi_gel_air || 0} Meter
                    </Text>
                  </View>
                  <View style={styles.infoBox}>
                    <Text style={styles.infoTitle}>Waktu</Text>
                    <Text style={styles.infoValue}>
                      {new Intl.DateTimeFormat('id-ID', {
                        dateStyle: 'full',
                        timeStyle: 'medium',
                      }).format(new Date(detailBencana?.date_created))}
                    </Text>
                  </View>
                </>
              )}

              {detailBencana?.jenis_bencana === 'gempa_bumi' && (
                <>
                  <View style={styles.infoBox}>
                    <Text style={styles.infoTitle}>Magnitudo</Text>
                    <Text style={styles.infoValue}>
                      {detailBencana?.kekuatan_gempa || 0} M
                    </Text>
                  </View>
                  <View style={styles.infoBox}>
                    <Text style={styles.infoTitle}>Kedalaman</Text>
                    <Text style={styles.infoValue}>
                      {detailBencana?.kedalaman_gempa || 0} km
                    </Text>
                  </View>
                  <View style={styles.infoBox}>
                    <Text style={styles.infoTitle}>Waktu</Text>
                    <Text style={styles.infoValue}>
                      {new Intl.DateTimeFormat('id-ID', {
                        dateStyle: 'full',
                        timeStyle: 'medium',
                      }).format(new Date(detailBencana?.date_created))}
                    </Text>
                  </View>
                </>
              )}

              {detailBencana?.jenis_bencana === 'gunung_berapi' && (
                <>
                  <View style={styles.infoBox}>
                    <Text style={styles.infoTitle}>Gunung Berapi</Text>
                    <Text style={styles.infoValue}>
                      {detailBencana?.nama_gunung || '-'}
                    </Text>
                  </View>
                  <View style={styles.infoBox}>
                    <Text style={styles.infoTitle}>Ketinggian Kolom Abu</Text>
                    <Text style={styles.infoValue}>
                      {detailBencana?.tinggi_col_abu || '-'} m
                    </Text>
                  </View>
                  <View style={styles.infoBox}>
                    <Text style={styles.infoTitle}>Status Aktivitas</Text>
                    <Text style={styles.infoValue}>
                      {detailBencana?.status_aktifitas || '-'}
                    </Text>
                  </View>
                </>
              )}

              {detailBencana?.jenis_bencana === 'tanah_longsor' && (
                <>
                  <View style={styles.infoBox}>
                    <Text style={[styles.infoTitle, {color: colors.text}]}>
                      Volume Material Longsor
                    </Text>
                    <Text style={[styles.infoValue, {color: colors.info}]}>
                      {detailBencana?.vol_mat_longsor || 0} m³
                    </Text>
                  </View>
                  <View style={styles.infoBox}>
                    <Text style={[styles.infoTitle, {color: colors.text}]}>
                      Kemiringan Lereng
                    </Text>
                    <Text style={[styles.infoValue, {color: colors.info}]}>
                      {detailBencana?.sudut_mir_longsor || 0}°
                    </Text>
                  </View>
                  <View style={styles.infoBox}>
                    <Text style={[styles.infoTitle, {color: colors.text}]}>
                      Waktu
                    </Text>
                    <Text style={[styles.infoValue, {color: colors.info}]}>
                      {new Intl.DateTimeFormat('id-ID', {
                        dateStyle: 'full',
                        timeStyle: 'medium',
                      }).format(new Date(detailBencana?.date_created))}
                    </Text>
                  </View>
                </>
              )}

              {detailBencana?.jenis_bencana === 'banjir' && (
                <>
                  <View style={styles.infoBox}>
                    <Text style={styles.infoTitle}>Ketinggian Air</Text>
                    <Text style={styles.infoValue}>
                      {detailBencana?.ketinggian_banjir || 0} cm
                    </Text>
                  </View>
                  <View style={styles.infoBox}>
                    <Text style={styles.infoTitle}>Kecepatan Arus</Text>
                    <Text style={styles.infoValue}>
                      {detailBencana?.kecepatan_banjir || 0} m/s
                    </Text>
                  </View>
                  <View style={styles.infoBox}>
                    <Text style={styles.infoTitle}>Waktu</Text>
                    <Text style={styles.infoValue}>
                      {new Intl.DateTimeFormat('id-ID', {
                        dateStyle: 'full',
                        timeStyle: 'medium',
                      }).format(new Date(detailBencana?.date_created))}
                    </Text>
                  </View>
                </>
              )}
            </View>

            {/* Scrollable Content */}
            <ScrollView style={styles.detailContainer}>
              {/* Lokasi */}
              <Text style={[styles.cardTitleData, {color: colors.text}]}>
                Lokasi
              </Text>
              <Text style={[styles.cardDescription, , {color: colors.info}]}>
                {detailBencana?.geom?.coordinates?.[1]},{' '}
                {detailBencana?.geom?.coordinates?.[0]}
              </Text>

              {/* Tipe Bencana */}
              <Text style={[styles.cardTitleData, {color: colors.text}]}>
                Tipe Bencana
              </Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>Resiko Bencana</Text>
              </View>

              {/* Wilayah Terdampak */}
              <Text style={[styles.cardTitleData, {color: colors.text}]}>
                Wilayah Terdampak
              </Text>
              <Text style={[styles.cardDescription, {color: colors.info}]}>
                {detailBencana?.wilayah || '-'}
              </Text>

              {/* Saran & Arahan */}
              <Text style={[styles.cardTitleData, {color: colors.text}]}>
                Rekomendasi BMKG
              </Text>
              <Text style={[styles.cardDetails, {color: colors.info}]}>
                {detailBencana?.saran_bmkg || '-'}
              </Text>

              <Text style={[styles.cardTitleData, {color: colors.text}]}>
                Arahan Evakuasi
              </Text>
              <Text style={[styles.cardDetails, {color: colors.info}]}>
                {detailBencana?.arahan || '-'}
              </Text>
            </ScrollView>
          </Animated.View>
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  containerMap: {
    flex: 1,
  },
  backgroundContainer: {
    position: 'absolute',
    top: -200,
    left: -30,
  },
  titleDanger: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  circleLarge: {
    position: 'absolute',
    width: 700,
    height: 700,
    borderRadius: 350,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleSmall: {
    width: 400,
    height: 400,
    borderRadius: 200,
    backgroundColor: 'rgba(255, 255, 255, 0.11)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  warningImage: {
    width: 150,
    height: 150,
    resizeMode: 'contain',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
  },
  header: {
    marginTop: 50,
  },
  title: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#fff',
    width: '70%',
  },
  description: {
    fontSize: 14,
    color: '#fff',
    marginTop: 10,
    width: '70%',
  },
  bottomSheet: {
    backgroundColor: '#fff',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 200,
  },
  dragIndicator: {
    width: 60,
    height: 5,
    backgroundColor: '#ccc',
    borderRadius: 5,
    alignSelf: 'center',
    marginBottom: 10,
  },
  buttonPrimary: {
    backgroundColor: '#F97316',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonDanger: {
    backgroundColor: '#C4432C',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonTextDanger: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonTextLokasi: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonSecondary: {
    borderWidth: 2,
    borderColor: '#C4432C',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonTextSecondary: {
    color: '#C4432C',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cardFlex: {
    display: 'flex',
    flexDirection: 'row',
  },
  cardContainer: {
    marginTop: 10,
  },
  cardLocation: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    marginHorizontal: 3,
  },
  button: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.62)',
    paddingVertical: 6,
    paddingHorizontal: 10,
    alignSelf: 'flex-end',
  },
  cardLokasi: {
    flex: 1,
    justifyContent: 'space-between',
  },
  card: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    marginHorizontal: 4,
    justifyContent: 'space-between',
  },
  cardTitle: {
    fontSize: 14,
    color: '#fff',
  },
  cardValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 10,
  },
  methodOption: {
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },
  modalTitle: { fontSize: 18, fontWeight: 'bold' },
  modalSubtitle: {
    fontSize: 14,
    marginTop: 5,
    marginBottom: 15,
  },
  methodTitle: {
    fontWeight: 'bold',
  },
  methodDesc: {
    fontSize: 12,
    marginTop: 2,
  },
  mapContainer: { flex: 1 },
  map: { flex: 1 },
  disasterMarker: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#CD531B',
    borderWidth: 2,
    borderColor: '#fff',
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  infoBox: {
    backgroundColor: '#f57c00',
    padding: 10,
    borderRadius: 8,
    width: '30%',
    height: 80,
    justifyContent: 'space-between',
  },
  infoTitle: {
    color: 'white',
    fontSize: 12,
  },
  infoValue: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
    alignSelf: 'flex-start',
  },
  detailContainer: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 10,
    padding: 10,
  },
  badge: {
    backgroundColor: '#f57c00',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
    alignSelf: 'flex-start',
    marginVertical: 5,
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  cardTitleData: {
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 5,
  },
  cardDetails: {
    fontSize: 12,
    marginVertical: 5,
    color: 'gray',
  },
  cardDescription: {
    fontSize: 12,
    color: 'gray',
  },
});

export default DisasterAlertScreen;
