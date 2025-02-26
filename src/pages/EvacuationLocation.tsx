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
} from 'react-native';
import MapboxGL, {Camera} from '@rnmapbox/maps';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Ionicons from 'react-native-vector-icons/Ionicons';
import GetLocation from 'react-native-get-location';
import COLORS from '../config/COLORS';
import {useNavigation, NavigationContainer} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '../navigation/types';
import useAuthStore from '../hooks/auth';
import {getData} from '../services/apiServices';

// Ganti dengan token Mapbox Anda
const MAPBOX_ACCESS_TOKEN =
  'sk.eyJ1Ijoid2hvaXNhcnZpYW4iLCJhIjoiY203YjJkajRtMDk3cDJtczlxMDRrOTExNiJ9.61sU5Z9qNoRfQ22qdcAMzQ';
MapboxGL.setAccessToken(MAPBOX_ACCESS_TOKEN);

const {width, height} = Dimensions.get('window');

interface EvacuationLocation {
  id: number;
  name: string;
  distance: string; // misalnya "1.4 km"
  duration?: string; // misalnya "10 Menit"
  status: 'Tersedia' | 'Penuh';
  address: string;
  coordinate: [number, number];
  type: string;
}

interface TransportModeItem {
  mode: 'mobil' | 'motor' | 'umum' | 'jalan';
  label: string;
  iconDefault: any;
  iconActive: any;
}

type TransportMode = 'mobil' | 'motor' | 'umum' | 'jalan';

const EvacuationLocationScreen = () => {
  const token = useAuthStore(state => state.token);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(
    null,
  );
  const backIcon = '<';
  // Data lokasi evakuasi
  const [evacuationCenters, setEvacuationCenters] = useState<
    EvacuationLocation[]
  >([]);

  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  // Lokasi evakuasi yang dipilih => menampilkan modal detail
  const [selectedCenter, setSelectedCenter] =
    useState<EvacuationLocation | null>(null);
  const colorScheme = useColorScheme();
  const colors = COLORS();
  // State untuk menampilkan panel rute
  const [showRoutePanel, setShowRoutePanel] = useState(false);
  // State untuk menyimpan data rute
  const [routeCoords, setRouteCoords] = useState<any>(null); // GeoJSON
  const [routeDistance, setRouteDistance] = useState<number>(0); // meter
  const [routeDuration, setRouteDuration] = useState<number>(0); // detik
  const [selectedMode, setSelectedMode] = useState<TransportMode>('mobil');

  // Map & Camera
  const mapRef = useRef<MapboxGL.MapView | null>(null);
  const cameraRef = useRef<MapboxGL.Camera | null>(null);

  // Bottom sheet logic
  const [bottomSheetHeight, setBottomSheetHeight] = useState(250);
  const pan = useRef(new Animated.ValueXY()).current;

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderMove: (evt, gestureState) => {
      const delta = gestureState.dy;
      setBottomSheetHeight(prev => {
        const newHeight = prev - delta;
        if (newHeight > height * 0.8) {
          return height * 0.8;
        } else if (newHeight < 100) {
          return 100;
        } else {
          return newHeight;
        }
      });
    },
    onPanResponderRelease: () => {
      pan.flattenOffset();
    },
  });

  // Ambil lokasi user (contoh statis)
  const getUserLocation = useCallback(async () => {
    try {
      const location = await GetLocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 15000,
      });
      const userLonLat: [number, number] = [
        location.longitude,
        location.latitude,
      ];
      setUserLocation(userLonLat);

      // Arahkan kamera ke lokasi pengguna
      cameraRef.current?.setCamera({
        centerCoordinate: userLonLat,
        zoomLevel: 13,
        animationDuration: 1000,
      });
    } catch (error) {
      console.log('Error getUserLocation:', error);
    }
  }, []);

  useEffect(() => {
    getUserLocation();
  }, [getUserLocation]);

  // Tombol Locate Me
  const locateMe = () => {
    getUserLocation();
  };

  // ================== FUNGSI AMBIL RUTE ==================
  const fetchRoute = async (mode: TransportMode) => {
    if (!userLocation || !selectedCenter) return;

    // Map transport mode -> Mapbox profile
    let profile = 'driving-traffic'; // default mobil
    if (mode === 'motor') {
      // Belum ada mode motor resmi, kita pakai driving
      profile = 'driving';
    } else if (mode === 'umum') {
      // Mapbox tak dukung public transport, kita "samakan" dgn driving
      profile = 'driving';
    } else if (mode === 'jalan') {
      profile = 'walking';
    } else if (mode === 'mobil') {
      profile = 'driving-traffic';
    }

    try {
      const start = `${userLocation[0]},${userLocation[1]}`;
      const end = `${selectedCenter.coordinate[0]},${selectedCenter.coordinate[1]}`;
      const url = `https://api.mapbox.com/directions/v5/mapbox/${profile}/${start};${end}?geometries=geojson&overview=full&language=id&access_token=${MAPBOX_ACCESS_TOKEN}`;

      const response = await fetch(url);
      const json = await response.json();

      if (json.routes && json.routes.length > 0) {
        const route = json.routes[0];
        setRouteCoords({
          type: 'Feature',
          geometry: route.geometry,
        });
        setRouteDistance(route.distance); // meter
        setRouteDuration(route.duration); // detik

        // Zoom map agar keseluruhan rute terlihat
        cameraRef.current?.fitBounds(
          [userLocation[0], userLocation[1]],
          [selectedCenter.coordinate[0], selectedCenter.coordinate[1]],
          50, // padding
          1000, // animationDuration
        );
      } else {
        console.log('Tidak ada rute ditemukan:', json);
      }
    } catch (error) {
      console.log('fetchRoute error:', error);
    }
  };

  // Saat user menekan "Lihat Rute Evakuasi"
  const handleShowRoute = () => {
    setShowRoutePanel(true);
    // Default mode: mobil
    setSelectedMode('mobil');
    // Langsung fetch rute mobil
    fetchRoute('mobil');
  };

  // Jika user ganti mode => fetch rute baru
  const handleChangeMode = (mode: TransportMode) => {
    setSelectedMode(mode);
    fetchRoute(mode);
  };

  // Konversi detik -> "XX Menit"
  const getDistanceText = (meters: number) => {
    if (meters < 1000) return `${meters.toFixed(0)} m`;
    const km = meters / 1000;
    return `${km.toFixed(1)} km`;
  };

  const getDurationText = (seconds: number) => {
    if (seconds >= 3600) {
      const hours = Math.floor(seconds / 3600);
      const remainingSeconds = seconds % 3600;
      const minutes = Math.floor(remainingSeconds / 60);
      return minutes > 0
        ? `${hours} Jam ${minutes} Menit Perjalanan`
        : `${hours} Jam Perjalanan`;
    } else if (seconds >= 60) {
      const minutes = Math.floor(seconds / 60);
      return `${minutes} Menit Perjalanan`;
    } else {
      return `${seconds} Detik Perjalanan`;
    }
  };

  // Fungsi render marker sesuai type
  const renderMarker = (item: EvacuationLocation) => {
    // Tentukan warna dan teks berdasarkan type
    let bgColor = '#999'; // default abu-abu
    let label = item.type.toUpperCase();

    if (item.type === 'kp') {
      bgColor = '#189E59'; // hijau
      label = 'KP';
    } else if (item.type === 'rs') {
      bgColor = '#FF5C5C'; // merah
      label = 'RS';
    }

    const markerSize = 30;

    return (
      <View
        style={{
          width: markerSize,
          height: markerSize,
          borderRadius: markerSize / 2,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#189E59',
          zIndex: 2,
        }}>
        <Text
          style={{color: '#FFF', fontWeight: 'bold', fontSize: 12, zIndex: -2}}>
          {label}
        </Text>
      </View>
    );
  };

  const iconMobil =
    colorScheme === 'dark'
      ? require('../assets/images/mobil-dark.png')
      : require('../assets/images/mobil-light.png');
  const iconMotor =
    colorScheme === 'dark'
      ? require('../assets/images/motor-dark.png')
      : require('../assets/images/motor-light.png');
  const iconTransportUmum =
    colorScheme === 'dark'
      ? require('../assets/images/transportUmum-dark.png')
      : require('../assets/images/transportUmum-light.png');
  const iconJalanKaki =
    colorScheme === 'dark'
      ? require('../assets/images/jalanKaki-dark.png')
      : require('../assets/images/jalanKaki-light.png');

  const transportModesData: TransportModeItem[] = [
    {
      mode: 'mobil',
      label: 'Mobil',
      iconDefault: iconMobil,
      iconActive: require('../assets/images/mobile-active.png'),
    },
    {
      mode: 'motor',
      label: 'Motor',
      iconDefault: iconMotor,
      iconActive: require('../assets/images/motor-active.png'),
    },
    {
      mode: 'umum',
      label: 'Transportasi Umum',
      iconDefault: iconTransportUmum,
      iconActive: require('../assets/images/transportUmum-active.png'),
    },
    {
      mode: 'jalan',
      label: 'Jalan Kaki',
      iconDefault: iconTransportUmum,
      iconActive: require('../assets/images/jalanKaki-active.png'),
    },
  ];

  const goBack = () => {
    navigation.goBack();
  };

  const updateDistancesForCenters = async () => {
    if (!userLocation || evacuationCenters.length === 0) return;

    // Hanya update jika masih terdapat data jarak kosong agar tidak terjadi loop update
    if (!evacuationCenters.some(center => center.distance === '')) return;

    const updatedCenters = await Promise.all(
      evacuationCenters.map(async center => {
        const start = `${userLocation[0]},${userLocation[1]}`;
        const end = `${center.coordinate[0]},${center.coordinate[1]}`;
        const url = `https://api.mapbox.com/directions/v5/mapbox/driving-traffic/${start};${end}?geometries=geojson&overview=full&language=id&access_token=${MAPBOX_ACCESS_TOKEN}`;
        try {
          const response = await fetch(url);
          const json = await response.json();
          if (json.routes && json.routes.length > 0) {
            const route = json.routes[0];
            return {
              ...center,
              distance: getDistanceText(route.distance), // misal "1.4 km"
              duration: getDurationText(route.duration), // misal "10 Menit"
            };
          }
          return center;
        } catch (error) {
          console.log('Error fetching route for center', center.id, error);
          return center;
        }
      }),
    );
    setEvacuationCenters(updatedCenters);
  };

  const getAbbreviation = (jenis: string | null): string => {
    if (!jenis) return 'OT'; // OT = Other (default) jika tidak ada nilai
    const words = jenis.trim().split(/\s+/); // Hilangkan spasi ekstra dan pisahkan berdasarkan spasi
    if (words.length >= 2) {
      return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase();
    } else {
      return words[0].slice(0, 2).toUpperCase();
    }
  };

  const [data, setData] = useState('');
  // console.log('DATTA', JSON.stringify(data?.data));

  const fetchData = async () => {
    try {
      const response = await getData(`items/titik_evakuasi`, {
        headers: {Authorization: `Bearer ${token}`},
      });
      if (!response) throw new Error('Gagal mengambil data');

      // Asumsikan response adalah array data
      const transformedData = response?.data.map((item: any) => ({
        id: item.id,
        name: item.nama,
        distance: '', // nanti akan dihitung
        duration: '', // nanti akan dihitung
        status: 'Tersedia', // Default status, sesuaikan jika perlu
        address: item.alamat,
        coordinate: item.geom.coordinates, // Pastikan format [longitude, latitude]
        type: getAbbreviation(item.jenis_titik_kumpul),
      }));
      setEvacuationCenters(transformedData);
    } catch (error) {
      console.error('Gagal mengambil data:', error);
      setEvacuationCenters([]);
    }
  };

  useEffect(() => {
    if (userLocation && evacuationCenters.length > 0) {
      updateDistancesForCenters();
    }
  }, [userLocation, evacuationCenters]);

  useEffect(() => {
    fetchData();
  }, [userLocation]);

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" />

      {/* MAP SECTION */}
      <View style={styles.mapContainer}>
        <MapboxGL.MapView
          ref={mapRef}
          style={styles.map}
          styleURL={MapboxGL.StyleURL.Street}
          onDidFinishLoadingMap={() => console.log('Map Loaded')}>
          <Camera ref={cameraRef} minZoomLevel={4} />

          {/* Lingkaran radius user */}
          {userLocation && (
            <MapboxGL.ShapeSource
              id="userLocationCircle"
              shape={{
                type: 'Feature',
                geometry: {
                  type: 'Point',
                  coordinates: userLocation,
                },
                properties: {},
              }}>
              <MapboxGL.CircleLayer
                id="userCircle"
                style={{
                  circleRadius: 2000,
                  circleColor: 'rgba(205, 83, 27, 0.2)',
                  circleOpacity: 0.6,
                }}
              />
            </MapboxGL.ShapeSource>
          )}

          {/* Marker user */}
          {userLocation && (
            <>
              <MapboxGL.ShapeSource
                id="userLocationCircle"
                shape={{
                  type: 'Feature',
                  geometry: {
                    type: 'Point',
                    coordinates: [userLocation[0], userLocation[1]],
                  },
                  properties: {},
                }}>
                <MapboxGL.CircleLayer
                  id="userCircle"
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
                id="userLocation"
                coordinate={userLocation}>
                <View style={styles.userMarker} />
              </MapboxGL.PointAnnotation>
            </>
          )}

          {/* Marker evakuasi */}
          {evacuationCenters.map(item => (
            <>
              <MapboxGL.ShapeSource
                id={`markerEvacuate-${item.id}`}
                shape={{
                  type: 'Feature',
                  geometry: {
                    type: 'Point',
                    coordinates: [item.coordinate[0], item.coordinate[1]],
                  },
                  properties: {},
                }}>
                <MapboxGL.CircleLayer
                  id={`circleEvacuate-${item.id}`}
                  style={{
                    circleRadius: [
                      'interpolate',
                      ['exponential', 10],
                      ['zoom'],
                      0,
                      2, // pada zoom 0 => radius 2
                      10,
                      10, // pada zoom 10 => radius 10
                      16,
                      250, // pada zoom 16 => radius 250
                      22,
                      500, // pada zoom 22 => radius 500
                    ],
                    circleColor: '#4ED682',
                    circleOpacity: 0.3,
                  }}
                />
              </MapboxGL.ShapeSource>

              {/* PointAnnotation untuk menampilkan marker custom (renderMarker) */}
              <MapboxGL.PointAnnotation
                id={`annotation-${item.id}`}
                coordinate={item.coordinate}
                onSelected={() => {
                  // Jika ingin setSelectedCenter(item), silakan
                }}>
                {renderMarker(item)}
              </MapboxGL.PointAnnotation>
            </>
          ))}
          {/* GARIS RUTE */}
          {routeCoords && (
            <MapboxGL.ShapeSource id="routeSource" shape={routeCoords}>
              <MapboxGL.LineLayer
                id="routeLayer"
                style={{
                  lineColor: '#189E59',
                  lineWidth: 5,
                  lineOpacity: 1,
                }}
              />
            </MapboxGL.ShapeSource>
          )}
        </MapboxGL.MapView>
      </View>

      {/* Tombol Back */}
      {/* <TouchableOpacity
        style={styles.backButton}
        onPress={() => console.log('Back')}>
        <AntDesign name="arrowleft" size={24} color="#000" />
      </TouchableOpacity> */}

      {/* Tombol Locate Me */}
      <TouchableOpacity
        style={[styles.locateMeButton, {bottom: bottomSheetHeight + 10}]}
        onPress={locateMe}>
        <Ionicons name="locate-outline" size={24} color="#000" />
      </TouchableOpacity>

      {/* Bottom Sheet 
          - Hanya tampil jika TIDAK ada selectedCenter */}
      {!selectedCenter && !showRoutePanel && (
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
              onPress={goBack}>
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
                Daftar Lokasi Evakuasi
              </Text>
            </View>
          </View>

          <FlatList
            data={evacuationCenters}
            keyExtractor={item => item.id.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            renderItem={({item}) => (
              <TouchableOpacity onPress={() => setSelectedCenter(item)}>
                <View style={styles.evacCard}>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                    }}>
                    <Text style={styles.evacName}>{item.name}</Text>
                    <View
                      style={{
                        backgroundColor:
                          item.status === 'Tersedia' ? '#7ADC98' : '#DC7A7C',
                        borderRadius: 10,
                        padding: '1%',
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: 30,
                        borderColor:
                          item.status === 'Tersedia' ? '#189E59' : '#c0392b',
                        borderWidth: 1,
                      }}>
                      <Text style={[styles.evacStatus, {color: '#000'}]}>
                        {item.status}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.evacDistance}>
                    {item.distance} ({item.duration})
                  </Text>
                  <Text style={styles.evacAddress}>{item.address}</Text>
                </View>
              </TouchableOpacity>
            )}
          />
        </Animated.View>
      )}

      {/* Modal Detail Evakuasi */}
      <Modal
        visible={!!selectedCenter && !showRoutePanel}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedCenter(null)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, {height: 250}]}>
            <View style={styles.dragIndicator} />
            {/* Tombol Tutup Modal */}
            {/* <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setSelectedCenter(null)}>
              <AntDesign name="close" size={24} color="#000" />
            </TouchableOpacity> */}

            {/* Detail Lokasi */}

            <View
              style={{
                width: '100%',
                flexDirection: 'row',
                alignItems: 'center',
                marginTop: '3%',
              }}>
              <TouchableOpacity
                onPress={() => setSelectedCenter(null)}
                style={{
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <Image
                  source={require('../assets/images/chevLeft.png')}
                  style={{width: 25, height: 40, resizeMode: 'contain'}}
                />
              </TouchableOpacity>
              <View
                style={{
                  alignItems: 'flex-start',
                  justifyContent: 'center',
                  marginLeft: '2%',
                }}>
                <Text
                  style={[
                    styles.modalTitle,
                    {
                      marginLeft: '0%',
                      alignItems: 'center',
                      fontSize: 16,
                      marginTop: 0,
                    },
                  ]}>
                  {selectedCenter?.name}
                </Text>
                <Text style={styles.modalDistance}>
                  {selectedCenter?.distance}({selectedCenter?.duration})
                </Text>
              </View>
            </View>

            <Text style={styles.modalAddress}>{selectedCenter?.address}</Text>

            {/* Tombol Rute */}
            <TouchableOpacity
              style={styles.routeButton}
              onPress={handleShowRoute}>
              <Text style={styles.routeButtonText}>Lihat Rute Evakuasi</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Panel Rute (memilih moda, menampilkan estimasi, dsb) */}
      {selectedCenter && showRoutePanel && (
        <View style={styles.routePanel}>
          {/* Tombol Tutup Panel */}
          {/* <TouchableOpacity
            style={styles.closeRouteButton}
            onPress={() => {
              setShowRoutePanel(false);
              setSelectedCenter(null);
              setRouteCoords(null);
            }}>
            <AntDesign name="close" size={24} color="#000" />
          </TouchableOpacity> */}
          <View style={styles.dragIndicator} />
          <View
            style={{
              width: '100%',
              flexDirection: 'row',
              alignItems: 'center',
              marginTop: '3%',
            }}>
            <TouchableOpacity
              onPress={() => setSelectedCenter(null)}
              style={{
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Image
                source={require('../assets/images/chevLeft.png')}
                style={{width: 25, height: 40, resizeMode: 'contain'}}
              />
            </TouchableOpacity>
            <View
              style={{
                alignItems: 'flex-start',
                justifyContent: 'center',
                marginLeft: '2%',
              }}>
              <Text
                style={[
                  styles.modalTitle,
                  {
                    marginLeft: '0%',
                    alignItems: 'center',
                    fontSize: 16,
                    marginTop: 0,
                  },
                ]}>
                {selectedCenter?.name}
              </Text>
              <Text style={styles.modalDistance}>
                {routeDistance > 0 ? getDistanceText(routeDistance) : ''}
              </Text>
            </View>
          </View>

          {/* Estimasi */}

          <Text
            style={{
              fontSize: 14,
              color: '#000',
              marginBottom: 10,
              fontWeight: '600',
            }}>
            {routeDuration > 0 ? getDurationText(routeDuration) : ''}
          </Text>

          {/* Pilihan Moda Transportasi */}
          <FlatList
            data={transportModesData}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={item => item.mode}
            contentContainerStyle={{
              paddingRight: '5%',
            }}
            renderItem={({item}) => {
              const isSelected = selectedMode === item.mode;
              return (
                <TouchableOpacity
                  style={[
                    styles.transportModeButton,
                    isSelected && styles.transportModeActive,
                  ]}
                  onPress={() => handleChangeMode(item.mode)}>
                  <Image
                    source={isSelected ? item.iconActive : item.iconDefault}
                    style={{
                      width: 20,
                      height: 15,
                      resizeMode: 'contain',
                      marginRight: '2%',
                    }}
                  />
                  <Text
                    style={[
                      styles.transportModeText,
                      isSelected && {color: '#f57c00'},
                    ]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            }}
          />

          {/* Tombol Mulai Arahan */}
          <TouchableOpacity
            style={[styles.routeButton, {marginTop: 10}]}
            onPress={() => console.log('Mulai Arahan ke Lokasi Evakuasi')}>
            <Text style={styles.routeButtonText}>
              Mulai Arahan ke Lokasi Evakuasi
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default EvacuationLocationScreen;

const styles = StyleSheet.create({
  container: {flex: 1},
  mapContainer: {flex: 1},
  map: {flex: 1},
  backButton: {
    position: 'absolute',
    top: 50,
    left: 15,
    backgroundColor: '#fff',
    padding: 8,
    borderRadius: 10,
    zIndex: 999,
  },
  locateMeButton: {
    position: 'absolute',
    right: 20,
    zIndex: 999,
    backgroundColor: '#fff',
    padding: 8,
    borderRadius: 10,
  },
  userMarker: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#CD531B',
    borderWidth: 2,
    borderColor: '#fff',
  },

  // Bottom Sheet
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: '#FFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  dragIndicator: {
    width: 40,
    height: 5,
    backgroundColor: '#CCC',
    borderRadius: 5,
    alignSelf: 'center',
    marginVertical: 8,
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  evacCard: {
    width: 250,
    backgroundColor: '#FAFAFA',
    borderRadius: 8,
    padding: 12,
    marginRight: 8, // ganti marginBottom jadi marginRight
    borderWidth: 1,
    borderColor: '#EEE',
    height: 150,
  },

  evacName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    maxWidth: '70%',
  },
  evacDistance: {
    fontSize: 12,
    color: '#888',
    marginVertical: 4,
  },
  evacAddress: {
    fontSize: 12,
    color: '#666',
  },
  evacStatus: {
    fontSize: 11,
    fontWeight: '600',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    color: '#fff',
    overflow: 'hidden',
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 30,
    color: '#333',
  },
  modalDistance: {
    fontSize: 14,
    color: '#999',
    marginVertical: 4,
  },
  modalAddress: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  routeButton: {
    backgroundColor: '#f57c00',
    borderRadius: 8,
    paddingVertical: 12,
    marginTop: 10,
    alignItems: 'center',
  },
  routeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },

  // Panel Rute
  routePanel: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: '#FFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    zIndex: 999,
  },
  transportModeButton: {
    backgroundColor: '#FFFF',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginRight: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderColor: '#777674',
    borderWidth: 1,
  },
  transportModeActive: {
    borderColor: '#f57c00',
    borderWidth: 1,
    backgroundColor: '#FFF',
  },
  transportModeText: {
    fontSize: 12,
    color: '#333',
  },
});
