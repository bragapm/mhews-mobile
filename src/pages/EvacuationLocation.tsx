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
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import MapboxGL, {Camera} from '@rnmapbox/maps';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Ionicons from 'react-native-vector-icons/Ionicons';
import GetLocation from 'react-native-get-location';
import COLORS from '../config/COLORS';
import {useNavigation, NavigationContainer} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '../navigation/types';
import useAuthStore from '../hooks/auth';
import {getData, MAPBOX_ACCESS_TOKEN} from '../services/apiServices';

// Ganti dengan token Mapbox Anda
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
  jenisTitikKumpul?: string;
}

interface TransportModeItem {
  mode: 'mobil' | 'motor' | 'umum' | 'jalan';
  label: string;
  iconDefault: any;
  iconActive: any;
}

interface MapboxStep {
  distance: number;
  name?: string;
  maneuver?: {
    instruction?: string;
    modifier?: string;
  };
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

  const [jenisTitikKumpulList, setJenisTitikKumpulList] = useState<string[]>(
    [],
  );
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);

  const isSemuaSelected =
    selectedFilters.length === jenisTitikKumpulList.length &&
    jenisTitikKumpulList.length > 0;
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  // Lokasi evakuasi yang dipilih => menampilkan modal detail
  const [selectedCenter, setSelectedCenter] =
    useState<EvacuationLocation | null>(null);
  const colorScheme = useColorScheme();
  const colors = COLORS();
  const [filterVisible, setFilterVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  // State untuk menampilkan panel rute
  const [showRoutePanel, setShowRoutePanel] = useState(false);
  // State untuk menyimpan data rute
  const [routeCoords, setRouteCoords] = useState<any>(null); // GeoJSON
  const [routeDistance, setRouteDistance] = useState<number>(0); // meter
  const [routeDuration, setRouteDuration] = useState<number>(0); // detik
  const [selectedMode, setSelectedMode] = useState<TransportMode>('mobil');
  // STEPS RUTE
  const [routeSteps, setRouteSteps] = useState<any[]>([]);
  const [isGuidanceActive, setIsGuidanceActive] = useState(false);

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
      const url = `https://api.mapbox.com/directions/v5/mapbox/${profile}/${start};${end}?geometries=geojson&overview=full&steps=true&language=id&access_token=${MAPBOX_ACCESS_TOKEN}`;

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

        if (route.legs && route.legs.length > 0) {
          setRouteSteps(route.legs[0].steps); // simpan steps ke state
        }
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

  const handleStartGuidance = () => {
    // Di sini kita menutup panel rute & membuka panel/overlay “arah jalan”
    setShowRoutePanel(false);
    setIsGuidanceActive(true);
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

  const chevLeft =
    colorScheme === 'dark'
      ? require('../assets/images/chevLeft-dark.png')
      : require('../assets/images/chevLeft.png');

  const iconMobilActive = require('../assets/images/mobile-active.png');
  const iconMotorActive = require('../assets/images/motor-active.png');
  const iconTransportUmumActive = require('../assets/images/transportUmum-active.png');
  const iconJalanKakiActive = require('../assets/images/jalanKaki-active.png');

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

  const updateDistancesForCenters = () => {
    if (!userLocation || evacuationCenters.length === 0) return;

    evacuationCenters.forEach(async center => {
      // Jika sudah memiliki nilai (tidak kosong), lewati update ulang
      if (center.distance !== '') return;

      const start = `${userLocation[0]},${userLocation[1]}`;
      const end = `${center.coordinate[0]},${center.coordinate[1]}`;
      const url = `https://api.mapbox.com/directions/v5/mapbox/driving-traffic/${start};${end}?geometries=geojson&overview=full&language=id&access_token=${MAPBOX_ACCESS_TOKEN}`;

      try {
        const response = await fetch(url);
        const json = await response.json();
        if (json.routes && json.routes.length > 0) {
          const route = json.routes[0];
          const newDistance = getDistanceText(route.distance); // misal "1.4 km"
          const newDuration = getDurationText(route.duration); // misal "10 Menit Perjalanan"

          // Update state untuk lokasi ini saja
          setEvacuationCenters(prev =>
            prev.map(item =>
              item.id === center.id
                ? {...item, distance: newDistance, duration: newDuration}
                : item,
            ),
          );
        }
      } catch (error) {
        console.log('Error fetching route for center', center.id, error);
      }
    });
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
        jenisTitikKumpul: item.jenis_titik_kumpul,
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

  useEffect(() => {
    if (evacuationCenters.length > 0) {
      const uniqueTypes = Array.from(
        new Set(
          evacuationCenters
            .map(ec => ec.jenisTitikKumpul)
            .filter((v): v is string => Boolean(v)),
        ),
      );
      setJenisTitikKumpulList(uniqueTypes);
    }
  }, [evacuationCenters]);

  const handleFilterPress = (filter: string) => {
    if (filter === 'semua') {
      if (isSemuaSelected) {
        setSelectedFilters([]);
      } else {
        setSelectedFilters([...jenisTitikKumpulList]);
      }
      return;
    }

    if (selectedFilters.includes(filter)) {
      const newFilters = selectedFilters.filter(f => f !== filter);
      setSelectedFilters(newFilters);
    } else {
      const newFilters = [...selectedFilters, filter];
      setSelectedFilters(newFilters);
    }
  };

  const deg2rad = (deg: number): number => deg * (Math.PI / 180);

  const getDistanceFromLatLonInKm = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number => {
    const R = 6371; // radius bumi dalam km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(deg2rad(lat1)) *
        Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const filteredEvacuationCenters = React.useMemo(() => {
    // Filter berdasarkan selectedFilters
    let centers = [];
    if (selectedFilters.length === 0 || isSemuaSelected) {
      centers = evacuationCenters;
    } else {
      centers = evacuationCenters.filter(center =>
        selectedFilters.includes(center.jenisTitikKumpul || ''),
      );
    }

    // Jika userLocation tersedia, urutkan berdasarkan jarak terdekat
    if (userLocation) {
      return centers
        .slice() // buat copy agar array original tidak termodifikasi
        .sort((a, b) => {
          const distanceA = getDistanceFromLatLonInKm(
            userLocation[1],
            userLocation[0],
            a.coordinate[1],
            a.coordinate[0],
          );
          const distanceB = getDistanceFromLatLonInKm(
            userLocation[1],
            userLocation[0],
            b.coordinate[1],
            b.coordinate[0],
          );
          return distanceA - distanceB;
        });
    }
    return centers;
  }, [evacuationCenters, selectedFilters, isSemuaSelected, userLocation]);

  const getCustomStepDescription = (step: any) => {
    if (!step) return '';

    // Ambil jarak (meter) => ubah jadi "xxx Meter" atau "x.x km"
    const distanceText =
      step.distance < 1000
        ? `${step.distance.toFixed(0)} Meter`
        : `${(step.distance / 1000).toFixed(1)} km`;

    // Ambil instruksi maneuver => "Belok kiri", "Lanjut lurus", dll
    // Mapbox sering beri "Turn left onto XXX", "Continue", dsb
    // Kita bisa pakai step.maneuver.modifier
    const modifier = step.maneuver?.modifier; // "left", "right", "straight", etc.
    let directionLabel = '';

    switch (modifier) {
      case 'left':
        directionLabel = 'Belok kiri';
        break;
      case 'right':
        directionLabel = 'Belok kanan';
        break;
      case 'straight':
        directionLabel = 'Jalan lurus';
        break;
      // dsb, silakan tambah logic
      default:
        directionLabel = step.maneuver?.instruction || 'Lanjut';
        break;
    }

    return `${directionLabel} ${distanceText}`;
  };
  function extractRoadName(instruction = '') {
    // Contoh: "Turn left onto Jl. Karang" => kita ambil "Jl. Karang"
    const match = instruction.match(/onto\s(.+)/i);
    if (match && match[1]) {
      return match[1].trim();
    }
    return instruction;
  }

  const arrowIcons = {
    left: require('../assets/images/left.png'),
    right: require('../assets/images/right.png'),
    uturn: require('../assets/images/uturn.png'),
    straight: require('../assets/images/up.png'),
  };

  const arrowIconsSm = {
    left: require('../assets/images/left-grey.png'),
    right: require('../assets/images/reight-grey.png'),
    uturn: require('../assets/images/uturn.png'),
    straight: require('../assets/images/up-grey.png'),
  };

  // Fungsi pilih ikon
  function getChevronIcon(modifier: string | undefined) {
    if (!modifier) return arrowIcons.straight;
    const mod = modifier.toLowerCase();
    if (mod.includes('left')) return arrowIcons.left;
    if (mod.includes('right')) return arrowIcons.right;
    if (mod.includes('uturn')) return arrowIcons.uturn;
    return arrowIcons.straight; // fallback
  }

  function getChevronIconSm(modifier: string | undefined) {
    if (!modifier) return arrowIconsSm.straight;
    const mod = modifier.toLowerCase();
    if (mod.includes('left')) return arrowIconsSm.left;
    if (mod.includes('right')) return arrowIconsSm.right;
    if (mod.includes('uturn')) return arrowIconsSm.uturn;
    return arrowIcons.straight; // fallback
  }

  const handleSearch = async (text: any) => {
    setSearchQuery(text);
    if (text.trim() === '') {
      setSearchResults([]);
      return;
    }

    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          text,
        )}.json?access_token=${MAPBOX_ACCESS_TOKEN}&limit=20&country=id`,
      );
      const data = await response.json();

      if (data.features) {
        setSearchResults(
          data.features.map((place: any) => ({
            id: place.id,
            name: place.place_name,
            lat: place.center[1], // Latitude
            lon: place.center[0], // Longitude
          })),
        );
      }
    } catch (error) {
      console.error('Error fetching locations:', error);
    }
  };

  const handleSelectLocation = (location: any) => {
    setSearchQuery(location.name);
    setModalVisible(false);
    if (cameraRef.current) {
      cameraRef.current.setCamera({
        centerCoordinate: [location.lon, location.lat],
        zoomLevel: 14,
        animationDuration: 1000,
      });
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" />

      {/* MAP SECTION */}
      <View style={styles.mapContainer}>
        <MapboxGL.MapView
          ref={mapRef}
          style={styles.map}
          styleURL={
            colorScheme === 'dark'
              ? MapboxGL.StyleURL.Dark
              : MapboxGL.StyleURL.Street
          }
          onDidFinishLoadingMap={() => console.log('Map Loaded')}>
          <Camera ref={cameraRef} minZoomLevel={4} />

          {/* Lingkaran radius user */}
          {userLocation && (
            <MapboxGL.ShapeSource
              id="userLocationCircleLarge"
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
                id="userLocationCircleSmall"
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
          {filteredEvacuationCenters?.map(item => (
            <React.Fragment key={item.id}>
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
            </React.Fragment>
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
      {!showRoutePanel && (
        <>
          <View style={styles.headerContainer}>
            <TouchableOpacity
              style={[styles.headerBackButton, {backgroundColor: colors.bg}]}
              onPress={goBack}>
              <AntDesign name="arrowleft" size={24} color={colors.text} />
            </TouchableOpacity>
            {/* Search Bar */}
            <View
              style={{
                width: '85%',
                alignItems: 'center',
                justifyContent: 'flex-end',
                marginLeft: '10%',
              }}>
              <TouchableOpacity
                style={[
                  styles.headerSearchContainer,
                  {backgroundColor: colors.bg},
                ]}
                onPress={() => setModalVisible(true)}>
                <Feather
                  name="search"
                  size={18}
                  color={colors.tabIconDefault}
                  style={styles.headerSearchIcon}
                />
                <View style={styles.headerSearchInput}>
                  <Text style={styles.searchText}>
                    {searchQuery || 'Cari Lokasi'}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* Tombol Filter */}
            {/* <TouchableOpacity
          style={[styles.headerFilterButton, {backgroundColor: colors.bg}]}
          onPress={() => setFilterVisible(true)}>
          <Ionicons name="options" size={24} color={colors.text} />
        </TouchableOpacity> */}

            {/* Filter Bencana */}
          </View>
          <FlatList
            data={['semua', ...jenisTitikKumpulList]}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item, index) => index.toString()}
            style={{position: 'absolute', top: 110}}
            contentContainerStyle={{paddingLeft: 10, paddingTop: '2%'}}
            renderItem={({item}) => {
              // Apakah chip ini sedang aktif?
              let isSelected = false;
              if (item === 'semua') {
                // "semua" aktif kalau isSemuaSelected = true
                isSelected = isSemuaSelected;
              } else {
                // Filter biasa
                isSelected = selectedFilters.includes(item);
              }

              return (
                <TouchableOpacity
                  style={[
                    styles.chip,
                    isSelected && styles.chipSelected,
                    {backgroundColor: colors.bg},
                  ]}
                  onPress={() => handleFilterPress(item)}>
                  <Text
                    style={{
                      color: isSelected ? '#F36A1D' : colors.text,
                      fontSize: 12,
                    }}>
                    {item === 'semua' ? 'Semua' : item}
                  </Text>
                </TouchableOpacity>
              );
            }}
          />
        </>
      )}

      {/* Tombol Locate Me */}
      <TouchableOpacity
        style={[
          styles.locateMeButton,
          {bottom: bottomSheetHeight + 10, backgroundColor: colors.bg},
        ]}
        onPress={locateMe}>
        <Ionicons name="locate-outline" size={24} color={colors.text} />
      </TouchableOpacity>

      {/* Bottom Sheet 
          - Hanya tampil jika TIDAK ada selectedCenter */}
      {!selectedCenter && !showRoutePanel && (
        <Animated.View
          {...panResponder.panHandlers}
          style={[
            styles.bottomSheet,
            {height: bottomSheetHeight, backgroundColor: colors.bg},
          ]}>
          <View style={styles.dragIndicator} />
          <View
            style={{
              width: '100%',
              flexDirection: 'row',
              alignItems: 'center',
            }}>
            <View
              style={{
                alignItems: 'flex-start',
                justifyContent: 'center',
                marginTop: '3%',
                marginBottom: '5%',
              }}>
              <Text
                style={[
                  styles.sheetTitle,
                  {
                    marginLeft: '0%',
                    alignItems: 'flex-start',
                    color: colors.text,
                  },
                ]}>
                Lokasi Evakuasi
              </Text>
              <Text style={[styles.evacDistance, {color: colors.info}]}>
                Daftar lokasi evakuasi yang dapat diakses ketika terjadi bencana
                berdasarkan lokasi anda
              </Text>
            </View>
          </View>

          <FlatList
            data={filteredEvacuationCenters}
            keyExtractor={item => item.id.toString()}
            // horizontal
            showsHorizontalScrollIndicator={false}
            renderItem={({item}) => (
              <View>
                <View
                  style={[
                    styles.evacCard,
                    {backgroundColor: colors.bg, borderColor: colors.info},
                  ]}>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                    }}>
                    <Text style={[styles.evacName, {color: colors.text}]}>
                      {item.name}
                    </Text>
                  </View>
                  <Text style={[styles.evacDistance, {color: colors.info}]}>
                    {item.distance || ''} (
                    {item.duration || 'Menghitung Jarak...'})
                  </Text>
                  <View
                    style={{
                      width: '100%',
                      alignItems: 'flex-start',
                      justifyContent: 'center',
                      marginTop: '2%',
                    }}>
                    <Text style={[styles.evacAddress, {color: colors.info}]}>
                      {item.address}
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={{
                      width: '100%',
                      backgroundColor: colors.bg,
                      borderWidth: 1,
                      borderColor: '#CD541B',
                      alignItems: 'center',
                      justifyContent: 'center',
                      paddingVertical: '3%',
                      paddingHorizontal: '2%',
                      borderRadius: 8,
                      marginTop: '5%',
                    }}
                    onPress={() => setSelectedCenter(item)}>
                    <Text
                      style={{
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#CD541B',
                      }}>
                      Simulasi Rute Evakuasi
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          />
        </Animated.View>
      )}

      {/* Modal Detail Evakuasi */}
      <Modal
        visible={!!selectedCenter && !showRoutePanel && !isGuidanceActive}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedCenter(null)}>
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              {height: 250, backgroundColor: colors.bg},
            ]}>
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
                borderRadius: 10,
                borderWidth: 1,
                borderColor: colors.info,
                paddingHorizontal: '3%',
                paddingVertical: '3%',
              }}>
              <View
                style={{
                  width: '100%',
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginTop: '3%',
                }}>
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
                        color: colors.text,
                      },
                    ]}>
                    {selectedCenter?.name}
                  </Text>
                  <Text style={[styles.modalDistance, {color: colors.info}]}>
                    {selectedCenter?.distance}({selectedCenter?.duration})
                  </Text>
                </View>
              </View>

              <Text style={[styles.modalAddress, {color: colors.info}]}>
                {selectedCenter?.address}
              </Text>

              {/* Tombol Rute */}
              <TouchableOpacity
                style={[
                  styles.routeButton,
                  {
                    width: '100%',
                    backgroundColor: colors.bg,
                    borderWidth: 1,
                    borderColor: '#CD541B',
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingVertical: '3%',
                    paddingHorizontal: '3%',
                    borderRadius: 8,
                    marginTop: '5%',
                  },
                ]}
                onPress={handleShowRoute}>
                <Text style={[styles.routeButtonText, {color: '#CD541B'}]}>
                  Simulasi Rute Evakuasi
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Panel Rute (memilih moda, menampilkan estimasi, dsb) */}
      {selectedCenter && showRoutePanel && (
        <View
          style={[
            styles.bottomSheet,
            {height: bottomSheetHeight, backgroundColor: colors.bg},
          ]}>
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
              onPress={() => setShowRoutePanel(false)}
              style={{
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Image
                source={chevLeft}
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
                    color: colors.text,
                  },
                ]}>
                {selectedCenter?.name}
              </Text>
              <Text style={[styles.modalDistance, {color: colors.info}]}>
                {routeDistance > 0 ? getDistanceText(routeDistance) : ''}
              </Text>
            </View>
          </View>

          {/* Estimasi */}

          <Text
            style={{
              fontSize: 14,
              color: colors.info,
              marginBottom: 10,
              fontWeight: '600',
            }}>
            {routeDuration > 0 ? getDurationText(routeDuration) : ''}
          </Text>

          {/* Pilihan Moda Transportasi */}
          <View
            style={{
              width: '100%',
              alignItems: 'center',
              justifyContent: 'center',
              paddingVertical: '3%',
            }}>
            <FlatList
              data={transportModesData}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={item => item.mode}
              contentContainerStyle={{
                paddingRight: '8%',
                // marginBottom: '5%',
              }}
              renderItem={({item}) => {
                const isSelected = selectedMode === item.mode;
                return (
                  <TouchableOpacity
                    style={[
                      styles.transportModeButton,
                      isSelected && styles.transportModeActive,
                      {backgroundColor: colors.bg},
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
                        styles.transportModeText && {color: colors.info},
                        isSelected && {color: '#f57c00'},
                      ]}>
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                );
              }}
            />
          </View>

          <Text
            style={{
              fontSize: 16,
              fontWeight: 'bold',
              marginBottom: 6,
              color: colors.text,
            }}>
            Rute
          </Text>
          <FlatList
            data={routeSteps}
            keyExtractor={(_, index) => index.toString()}
            contentContainerStyle={{
              marginTop: '2%',
              paddingBottom: '5%',
            }}
            renderItem={({item}) => (
              <View
                style={[styles.stepItemContainer, {borderColor: colors.text}]}>
                {/* Icon Arah (opsional) */}
                <Image
                  source={getChevronIcon(item.maneuver?.modifier)}
                  style={{width: 20, height: 20, marginRight: 8}}
                  resizeMode="contain"
                />
                {/* Teks Deskripsi Langkah */}
                <View style={{flex: 1}}>
                  <Text style={styles.stepInstruction}>
                    {getCustomStepDescription(item)}
                  </Text>
                  {/* Jika ingin menampilkan jarak step secara terpisah */}
                  <Text style={styles.stepDistance}>
                    {item.distance < 1000
                      ? `${item.distance.toFixed(0)} m`
                      : `${(item.distance / 1000).toFixed(1)} km`}
                  </Text>
                </View>
              </View>
            )}
          />
        </View>
      )}

      {isGuidanceActive && (
        <View style={styles.guidanceOverlay}>
          {/* BAGIAN ATAS: INFORMASI LANGKAH SAAT INI */}

          <View style={styles.customGuidanceContainer}>
            {/* Baris pertama: Nama Jalan + Ikon Transportasi */}
            <View style={styles.guidanceHeader}>
              <View
                style={{
                  width: '20%',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <Image
                  source={getChevronIcon(routeSteps[0]?.maneuver?.modifier)}
                  style={{width: 20, height: 20}}
                />
              </View>
              <View
                style={{
                  width: '60%',
                  alignItems: 'flex-start',
                  justifyContent: 'center',
                }}>
                <Text style={styles.currentRoad}>
                  {routeSteps[0]?.name && routeSteps[0].name.trim() !== ''
                    ? routeSteps[0].name
                    : extractRoadName(routeSteps[0]?.maneuver?.instruction) ||
                      'Jalan Tidak Diketahui'}
                </Text>
                <Text style={styles.currentInstruction}>
                  {getCustomStepDescription(routeSteps[0])}
                </Text>
              </View>
              <View
                style={{
                  width: '20%',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <Image
                  source={
                    selectedMode === 'mobil'
                      ? iconMobilActive
                      : selectedMode === 'motor'
                      ? iconMotorActive
                      : selectedMode === 'umum'
                      ? iconTransportUmumActive
                      : iconJalanKakiActive
                  }
                  style={styles.transportIcon}
                />
              </View>
            </View>
          </View>

          {/* BAGIAN “LANGKAH BERIKUTNYA” */}
          {routeSteps[1] && (
            <View style={styles.nextStepContainer}>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <Image
                  source={getChevronIconSm(routeSteps[1]?.maneuver?.modifier)}
                  style={{width: 15, height: 15, marginRight: '2%'}}
                />

                <Text style={styles.nextStepText}>
                  {routeSteps[1]?.maneuver?.instruction ||
                    'Langkah berikutnya...'}
                </Text>
              </View>
            </View>
          )}

          {/* BAGIAN BAWAH: Info tujuan akhir + tombol */}
          <View
            style={[styles.guidanceBottomCard, {backgroundColor: colors.bg}]}>
            <View style={styles.dragIndicator} />
            <View
              style={{
                width: '100%',
                justifyContent: 'center',
                alignItems: 'flex-start',
              }}>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: 'bold',
                  marginBottom: 4,
                  color: colors.text,
                  textAlign: 'left',
                }}>
                {selectedCenter?.name}
              </Text>
              <Text style={{fontSize: 14, marginBottom: 8, color: colors.info}}>
                {routeDistance > 0 ? getDistanceText(routeDistance) : ''}
              </Text>
            </View>

            <View
              style={{
                width: '100%',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '2%',
              }}>
              <TouchableOpacity
                style={styles.arrivedButton}
                onPress={() => {
                  // Jika ditekan "Saya Sudah Sampai"
                  setIsGuidanceActive(false);
                  setRouteSteps([]);
                  setSelectedCenter(null);
                  setRouteCoords(null);
                }}>
                <Text style={styles.arrivedButtonText}>Saya Sudah Sampai</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.sosButton,
                  {
                    backgroundColor: colors.bg,
                    borderWidth: 1,
                    borderColor: '#C4432C',
                  },
                ]}>
                <Text style={styles.sosButtonText}>S.O.S</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
      <Modal
        animationType="slide"
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalContainer}>
          {/* Header Modal */}
          <View style={styles.modalHeader}>
            {/* Tombol Back */}
            <TouchableOpacity
              style={styles.headerBackButtonModal}
              onPress={() => setModalVisible(false)}>
              <AntDesign name="arrowleft" size={24} color="black" />
            </TouchableOpacity>

            {/* Input Pencarian */}
            <View style={styles.headerSearchContainerModal}>
              <Feather
                name="search"
                size={18}
                color="gray"
                style={styles.headerSearchIconModal}
              />
              <TextInput
                placeholder="Cari Lokasi"
                style={styles.headerSearchInputModal}
                value={searchQuery}
                onChangeText={handleSearch}
              />
            </View>
          </View>

          {/* List hasil pencarian */}
          <FlatList
            data={searchResults}
            keyExtractor={(item: any) => item.id}
            ListHeaderComponent={() => (
              <Text style={styles.resultHeader}>Hasil Pencarian</Text>
            )}
            renderItem={({item}) => (
              <TouchableOpacity
                style={styles.resultItem}
                onPress={() => handleSelectLocation(item)}>
                <View style={styles.resultIconContainer}>
                  <Feather name="map-pin" size={20} color="gray" />
                </View>
                <View style={styles.resultTextContainer}>
                  <Text style={styles.resultTitle}>{item.name}</Text>
                  <Text style={styles.resultSubtitle}>{item.address}</Text>
                </View>
              </TouchableOpacity>
            )}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        </View>
      </Modal>
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
    width: '100%',
    backgroundColor: '#FAFAFA',
    borderRadius: 8,
    padding: 12,
    marginRight: 8, // ganti marginBottom jadi marginRight
    borderWidth: 1,
    borderColor: '#EEE',
    height: 150,
    marginBottom: '5%',
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
  guidanceOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    // Bisa pakai backgroundColor 'rgba(255,255,255,0.8)' jika mau semi-transparan
    justifyContent: 'flex-start',
  },
  guidanceTopCard: {
    backgroundColor: '#FFF',
    marginTop: 50,
    marginHorizontal: 16,
    padding: 12,
    borderRadius: 8,
    elevation: 2,
  },
  guidanceInstruction: {
    fontSize: 14,
    marginBottom: 4,
    color: '#333',
  },
  guidanceBottomCard: {
    backgroundColor: '#FFF',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    elevation: 3,
    alignItems: 'center',
  },
  arrivedButton: {
    backgroundColor: '#F36A1D',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginBottom: 10,
    width: '100%',
    alignItems: 'center',
  },
  arrivedButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  sosButton: {
    backgroundColor: '#ff5555',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    width: '100%',
    alignItems: 'center',
  },
  sosButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  customGuidanceContainer: {
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    marginTop: 50,
    padding: 12,
    borderRadius: 8,
    elevation: 2,
  },
  guidanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  currentRoad: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    maxWidth: '80%',
  },
  transportIcon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
  currentInstruction: {
    marginTop: 4,
    fontSize: 14,
    color: '#444',
  },
  nextStepContainer: {
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    marginTop: 10,
    borderRadius: 8,
    elevation: 2,
    width: 'auto',
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingHorizontal: '2%',
    paddingVertical: '2%',
    maxWidth: '80%',
  },
  nextStepText: {
    fontSize: 14,
    color: '#666',
  },
  headerContainer: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    padding: 10,
    zIndex: 999,
    flexDirection: 'column',
    alignItems: 'center',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
    width: '100%',
  },
  // headerFilterButton: {
  //   position: 'absolute',
  //   top: 20,
  //   right: 15,
  //   backgroundColor: 'rgb(255, 255, 255)',
  //   padding: 8,
  //   borderRadius: 10,
  // },
  headerSearchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgb(255, 255, 255)',
    borderRadius: 8,
    paddingHorizontal: 10,
    width: '100%',
    marginVertical: 10,
    // marginLeft: '10%',
  },
  headerSearchIcon: {
    marginRight: 5,
  },
  headerSearchInput: {
    flex: 1,
    height: 40,
    justifyContent: 'center',
  },
  searchText: {
    fontSize: 16,
    color: 'gray',
  },
  headerBackButton: {
    position: 'absolute',
    top: 20,
    left: 15,
    backgroundColor: 'rgb(255, 255, 255)',
    padding: 8,
    borderRadius: 10,
    width: '10%',
  },
  stepItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    paddingHorizontal: '2%',
    paddingVertical: '3%',
    justifyContent: 'center',
    borderRadius: 10,
  },
  stepInstruction: {
    fontSize: 14,
    color: '#444',
    marginBottom: 2,
  },
  stepDistance: {
    fontSize: 12,
    color: '#888',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgb(255, 255, 255)',
    borderRadius: 10,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginHorizontal: 5,
  },
  chipSelected: {borderColor: '#f36a1d'},
  headerAlertContainer: {
    flexDirection: 'row',
    backgroundColor: '#e74c3c',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    width: '90%',
    justifyContent: 'space-between',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(126, 126, 126, 0.3)',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  modalHeaderDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    justifyContent: 'space-between',
  },
  headerBackButtonModal: {
    marginRight: 10,
    backgroundColor: 'rgb(255, 255, 255)',
    padding: 8,
    borderRadius: 10,
  },
  headerSearchContainerModal: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgb(255, 255, 255)',
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 40,
  },
  headerSearchIconModal: {
    marginRight: 5,
  },
  headerSearchInputModal: {
    flex: 1,
    height: 40,
    justifyContent: 'center',
  },
  resultHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginVertical: 10,
    marginHorizontal: 16,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  resultIconContainer: {
    marginRight: 12,
  },
  resultTextContainer: {
    flex: 1,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  resultSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  separator: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 16,
  },
});
