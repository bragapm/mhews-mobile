import React, {useState, useRef, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  Dimensions,
  TouchableOpacity,
  PanResponder,
  Animated,
  Platform,
  PermissionsAndroid,
  TextInput,
  ScrollView,
  FlatList,
  Image,
  Modal,
  useColorScheme,
  Switch,
} from 'react-native';
// import MapView, { Circle, Marker, PROVIDER_GOOGLE, UrlTile } from "react-native-maps";
import MapboxGL, {Camera} from '@rnmapbox/maps';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '../navigation/types';
import GetLocation from 'react-native-get-location';
import {useAlert} from '../components/AlertContext';
import {check, request, PERMISSIONS, RESULTS} from 'react-native-permissions';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Feather from 'react-native-vector-icons/Feather';
import {
  BASE_URL,
  getData,
  MAPBOX_ACCESS_TOKEN,
  postData,
} from '../services/apiServices';
import haversine from 'haversine';
import useAuthStore from '../hooks/auth';
import FilterBottomSheet from '../components/FilterBottomSheet';
import {filterDisasterData} from '../utils/filterDisaster';
import COLORS from '../config/COLORS';
import {fetchLocation} from '../utils/locationUtils';

const {width, height} = Dimensions.get('window');

const customMapStyle = [
  {
    featureType: 'landscape',
    elementType: 'geometry',
    stylers: [
      {color: '#FAD9C3'}, // Warna daratan pastel oranye
    ],
  },
  {
    featureType: 'water',
    elementType: 'geometry.fill',
    stylers: [
      {color: '#9AC7D4'}, // Warna laut biru kehijauan
    ],
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [
      {color: '#F2B8A9'}, // Warna jalan pastel
    ],
  },
  {
    featureType: 'road',
    elementType: 'labels.text.fill',
    stylers: [
      {color: '#6B4A3A'}, // Warna teks jalan
    ],
  },
  {
    featureType: 'poi',
    elementType: 'labels.text.fill',
    stylers: [{color: '#845B47'}],
  },
  {
    featureType: 'administrative',
    elementType: 'labels.text.fill',
    stylers: [{color: '#594536'}],
  },
];

MapboxGL.setAccessToken(MAPBOX_ACCESS_TOKEN);

export default function PotentialDangersScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [filterVisible, setFilterVisible] = useState(false);
  const [bottomSheetHeight, setBottomSheetHeight] = useState(300);
  const pan = useRef(new Animated.ValueXY()).current;
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const {showAlert} = useAlert();
  const [alertVisible, setAlertVisible] = useState(false);
  const [nearbyDisasters, setNearbyDisasters] = useState([]);
  const mapRef = useRef<MapboxGL.MapView | null>(null);
  const cameraRef = useRef<MapboxGL.Camera | null>(null);
  const [iconBencana, setIconBencana] = useState([]);
  const [dataBencana, setDataBencana] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const {token} = useAuthStore();
  const [selectedBencana, setSelectedBencana] = useState<any>(null);
  const [isMapReady, setIsMapReady] = useState(false);
  const [selectedFilterJenisBencana, setSelectedFilterJenisBencana] = useState<
    string[]
  >(['semua']);
  const [filterData, setFilterData] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const colors = COLORS();

  const [potensiBahaya, setPotensiBahaya] = useState([
    {
      id: 1,
      nama: 'Gempa Bumi',
      tingkat: 'Tinggi',
      layerActive: false,
      color: '#EF4444',
    },
    {
      id: 2,
      nama: 'Banjir',
      tingkat: 'Sedang',
      layerActive: false,
      color: '#F59E0B',
    },
    {
      id: 3,
      nama: 'Tsunami',
      tingkat: 'Rendah',
      layerActive: false,
      color: '#10B981',
    },
    {
      id: 4,
      nama: 'Tanah Longsor',
      tingkat: 'Tinggi',
      layerActive: false,
      color: '#EF4444',
    },
    {
      id: 5,
      nama: 'Kebakaran Hutan',
      tingkat: 'Sedang',
      layerActive: false,
      color: '#F59E0B',
    },
    {
      id: 6,
      nama: 'Gunung Meletus',
      tingkat: 'Tinggi',
      layerActive: false,
      color: '#EF4444',
    },
  ]);

  const toggleLayer = (id: any) => {
    setPotensiBahaya(
      potensiBahaya.map(item =>
        item.id === id ? {...item, layerActive: !item.layerActive} : item,
      ),
    );
  };

  const lihatEdukasi = (id: any) => {
    console.log(`Lihat edukasi untuk ${id}`);
  };

  // const urlMvt = `${BASE_URL}/mvt/bencana_alam/?z={z}&x={x}&y={y}&access_token=${token}`;
  const urlMvt = `${BASE_URL}mvt/bencana_alam/?z={z}&x={x}&y={y}`;

  const handleFilterPress = (jenis_bencana: string) => {
    setSelectedFilterJenisBencana(prev => {
      if (jenis_bencana === 'semua') {
        return ['semua'];
      }

      if (prev.includes('semua')) {
        return [jenis_bencana];
      }

      const updatedFilters = prev.includes(jenis_bencana)
        ? prev.filter(item => item !== jenis_bencana)
        : [...prev, jenis_bencana];

      return updatedFilters.length > 0 ? updatedFilters : ['semua'];
    });
  };

  const handleApplyFilter = (filterData: any) => {
    setFilterData(filterData);
    setFilterVisible(false);
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderMove: (event, gestureState) => {
      const delta = gestureState.dy;
      setBottomSheetHeight(prevHeight => {
        const newHeight = prevHeight - delta;
        if (newHeight > height * 0.63) {
          return height * 0.63;
        } else if (newHeight < 150) {
          return 150;
        } else {
          return newHeight;
        }
      });
    },
    onPanResponderRelease: () => {
      pan.flattenOffset();
    },
  });

  const iconGempa = require('../assets/images/iconGempa.png');
  const iconTsunami = require('../assets/images/iconTsunami.png');
  const iconBanjir = require('../assets/images/iconBanjir.png');
  const iconLongsor = require('../assets/images/iconLongsor.png');
  const iconErupsiGunung = require('../assets/images/iconErupsi.png');

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

  const handleGetLocation = async () => {
    const location = await fetchLocation();
    if (location?.latitude) {
      setLocation(location);
      if (cameraRef.current) {
        cameraRef.current.setCamera({
          centerCoordinate: [location.longitude, location.latitude],
          zoomLevel: 14,
          animationDuration: 1000,
        });
      } else {
        console.log('mapRef.current is null');
      }
    }
  };

  useEffect(() => {
    if (
      !filterData ||
      filterData?.jenisBencana?.length == 0 ||
      filterData?.tipe?.length == 0
    ) {
      setSelectedFilterJenisBencana(['semua']);
      fetchData();
    } else {
      fetchDataBuffer();
    }
  }, [filterData]);

  useEffect(() => {
    if (location && cameraRef.current) {
      cameraRef.current.setCamera({
        centerCoordinate: [location.longitude, location.latitude],
        zoomLevel: 14,
        animationDuration: 1000,
      });
    }
  }, [location]);

  const fetchData = async () => {
    setLoading(true);
    try {
      let filterQuery = '';

      if (!selectedFilterJenisBencana.includes('semua')) {
        filterQuery = `?filter[jenis_bencana][_in]=${selectedFilterJenisBencana.join(
          ',',
        )}&field=*`;
      }

      const [iconBencana, dataBencana] = await Promise.all([
        getData('items/icon_bencana'),
        getData(`items/bencana_alam${filterQuery}`),
      ]);

      setIconBencana(iconBencana?.data || []);
      setDataBencana(dataBencana?.data || []);
    } catch (err: any) {
      setError(err.message);
      console.error('Gagal mengambil data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDataBuffer = async () => {
    setLoading(true);
    try {
      const data = {
        layers: ['bencana_alam'],
        points: [[location?.longitude, location?.latitude]],
        radius: (filterData?.radius || 0) * 1000,
        type: 'simple',
      };

      const [dataBuffer] = await Promise.all([postData('buffer', data)]);

      if (dataBuffer) {
        const tipeBencanaMap: Record<string, string> = {
          'resiko bencana': 'resiko_bencana',
          'potensi bahaya': 'potensi_bahaya',
        };

        const processedData = dataBuffer.filter((item: any) => {
          const normalizedTipeBencana =
            item.tipe_bencana?.trim().toLowerCase() || '';
          const itemDate = new Date(item.waktu).toISOString().split('T')[0];
          const startDate = new Date(filterData.startDate)
            .toISOString()
            .split('T')[0];
          const endDate = new Date(filterData.endDate)
            .toISOString()
            .split('T')[0];

          return (
            filterData?.jenisBencana.includes(item.jenis_bencana) &&
            filterData?.tipe.includes(
              tipeBencanaMap[normalizedTipeBencana] || '',
            ) &&
            itemDate >= startDate &&
            itemDate <= endDate
          );
        });

        setDataBencana(processedData || []);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setTimeout(() => {
      locateMe();
    }, 2000);
  }, []);

  useEffect(() => {
    fetchData();
  }, [selectedFilterJenisBencana]);

  useEffect(() => {
    if (location && dataBencana) {
      const nearbyDisaster = dataBencana.filter((disaster: any) => {
        const {coordinates} = disaster.geom;
        const disasterLocation = {
          latitude: coordinates[1],
          longitude: coordinates[0],
        };
        const distance = haversine(location, disasterLocation, {unit: 'meter'});

        return distance <= 500; //meter
      });

      if (nearbyDisaster.length > 0) {
        setAlertVisible(true);
      } else {
        setAlertVisible(false);
      }

      setNearbyDisasters(nearbyDisaster);
    }
  }, [location, dataBencana]);

  const locateMe = () => {
    showAlert('success', 'Mengambil lokasi anda...');
    handleGetLocation();
  };

  useEffect(() => {
    const pulseLoop = () => {
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]).start(() => pulseLoop());
    };
    pulseLoop();
  }, []);

  const renderItem = ({item}: {item: any}) => (
    <View
      style={[
        styles.dangerCard,
        {
          backgroundColor: colors.bg,
          borderWidth: 1,
          borderColor: item.color,
          marginBottom: 16,
        },
      ]}>
      <View style={styles.dangerHeader}>
        <Text style={[styles.dangerTitle, {color: colors.text}]}>
          {item.nama}
        </Text>
        <View style={[styles.riskBadge, {backgroundColor: item.color}]}>
          <Text style={styles.riskText}>Potensi {item.tingkat}</Text>
        </View>
      </View>

      <View style={[styles.divider, {backgroundColor: colors.border}]} />

      <View style={styles.optionItem}>
        <Switch
          value={item.layerActive}
          onValueChange={() => toggleLayer(item.id)}
          trackColor={{false: colors.text, true: colors.tint}}
          thumbColor={item.layerActive ? colors.text : colors.text}
        />
        <Text style={[styles.optionText, {color: colors.text}]}>
          Aktifkan Layer Potensi Bencana
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.edukasiButton, {backgroundColor: colors.tint}]}
        onPress={() => lihatEdukasi(item.nama)}>
        <Text
          style={[styles.edukasiButtonText, {color: colors.cardBackground}]}>
          Lihat Edukasi Mitigasi
        </Text>
      </TouchableOpacity>
    </View>
  );

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
          <MapboxGL.MapView
            ref={mapRef}
            style={styles.map}
            styleURL={MapboxGL.StyleURL.Street}
            onDidFinishLoadingMap={() => setIsMapReady(true)}>
            <Camera ref={cameraRef} minZoomLevel={4} />

            {dataBencana && (
              <>
                {dataBencana.map((item: any) => {
                  let markerIcon;
                  switch (item.jenis_bencana) {
                    case 'gempa_bumi':
                      markerIcon = iconGempa;
                      break;
                    case 'tsunami':
                      markerIcon = iconTsunami;
                      break;
                    case 'gunung_berapi':
                      markerIcon = iconErupsiGunung;
                      break;
                    case 'tanah_longsor':
                      markerIcon = iconLongsor;
                      break;
                    case 'banjir':
                      markerIcon = iconBanjir;
                      break;
                    default:
                      markerIcon = iconBanjir;
                  }

                  return (
                    <MapboxGL.PointAnnotation
                      key={item.id.toString()}
                      id={item.id.toString()}
                      coordinate={[
                        item.geom.coordinates[0],
                        item.geom.coordinates[1],
                      ]}
                      onSelected={() => setSelectedBencana(item)}>
                      <View style={styles.markerContainer}>
                        <Image source={markerIcon} style={styles.markerIcon} />
                      </View>
                    </MapboxGL.PointAnnotation>
                  );
                })}
              </>
            )}

            {location && (
              <>
                <MapboxGL.ShapeSource
                  id="userLocationCircle"
                  shape={{
                    type: 'Feature',
                    geometry: {
                      type: 'Point',
                      coordinates: [location.longitude, location.latitude],
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
                  coordinate={[location.longitude, location.latitude]}>
                  <View style={styles.marker} />
                </MapboxGL.PointAnnotation>
              </>
            )}

            {/* <MapboxGL.VectorSource
              id="bencanaSource"
              tileUrlTemplates={[
                urlMvt
              ]}
            >
              <MapboxGL.FillLayer
                id="bencanaLayer"
                sourceID="bencanaSource"
                sourceLayerID="vector_tiles"
                style={{
                  fillColor: "rgba(255, 0, 0, 0.5)",
                  fillOutlineColor: "rgba(255, 0, 0, 1)",
                }}
              />
            </MapboxGL.VectorSource> */}
          </MapboxGL.MapView>
        </View>

        {/* Tools Header */}
        <View style={styles.headerContainer}>
          {/* Tombol Back */}
          <TouchableOpacity
            style={[styles.headerBackButton, {backgroundColor: colors.bg}]}
            onPress={() => navigation.navigate('Tabs')}>
            <AntDesign name="arrowleft" size={24} color={colors.text} />
          </TouchableOpacity>

          {/* Search Bar */}
          <TouchableOpacity
            style={[styles.headerSearchContainer, {backgroundColor: colors.bg}]}
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

          {/* Map Tools - Right Side */}
          <View style={styles.mapToolsContainer}>
            <TouchableOpacity
              style={[
                styles.mapToolButton,
                {backgroundColor: colors.bg},
                styles.mapToolButtonTop,
              ]}
              onPress={locateMe}>
              <Ionicons name="locate-outline" size={24} color={colors.text} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.mapToolButton,
                {backgroundColor: colors.bg},
                styles.mapToolButtonBottom,
              ]}>
              <Ionicons name="layers-outline" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          {/* Notifikasi Bahaya */}
          {alertVisible && (
            <View style={styles.headerAlertContainer}>
              <MaterialIcons name="error-outline" size={18} color="white" />
              <Text style={styles.headerAlertText}>
                Terdapat {nearbyDisasters.length} Potensi Bahaya di Sekitar
                Anda!
              </Text>
              <TouchableOpacity onPress={() => setAlertVisible(false)}>
                <MaterialIcons name="close" size={18} color="white" />
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Informasi Bencana */}
        {selectedBencana == null && (
          <View style={styles.containerContent}>
            {/* Tombol Locate Me */}
            <TouchableOpacity
              style={[
                styles.locateMeButton,
                {bottom: bottomSheetHeight + 60, backgroundColor: colors.bg},
              ]}>
              <Ionicons
                name="locate-outline"
                size={24}
                color={colors.text}
                onPress={locateMe}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.historyButton,
                {bottom: bottomSheetHeight + 10, backgroundColor: colors.bg},
              ]}>
              <Ionicons name="reader-outline" size={24} color={colors.text} />
              <Text
                style={{
                  color: colors.text,
                  fontSize: 12,
                }}>
                Riwayat Bencana
              </Text>
            </TouchableOpacity>

            <View
              {...panResponder.panHandlers}
              style={[
                styles.bottomSheet,
                {height: bottomSheetHeight, backgroundColor: colors.bg},
              ]}>
              {/* Drag Indicator */}
              <View style={styles.dragIndicator} />
              <ScrollView
                showsVerticalScrollIndicator={false}
                style={styles.container}>
                <Text style={[styles.sectionTitle, {color: colors.text}]}>
                  Potensi Bahaya
                </Text>
                <Text style={[styles.sectionSubtitle, {color: colors.info}]}>
                  Daftar potensi bahaya yang memiliki kemungkinan terjadi di
                  sekitar anda
                </Text>

                {/* List Potensi Bahaya */}

                <FlatList
                  data={potensiBahaya}
                  renderItem={renderItem}
                  keyExtractor={item => item.id.toString()}
                  contentContainerStyle={styles.listContent}
                  style={styles.listContainer}
                  showsVerticalScrollIndicator={false}
                />
              </ScrollView>
            </View>
          </View>
        )}

        <FilterBottomSheet
          visible={filterVisible}
          onClose={() => setFilterVisible(false)}
          onApply={handleApplyFilter}
        />

        {/* Modal Detail Bencana */}
        <Modal visible={!!selectedBencana} transparent animationType="slide">
          <View style={styles.modalContainer}>
            <View style={[styles.modalContent, {backgroundColor: colors.bg}]}>
              {/* Garis Tarik untuk Swipe */}
              <View style={styles.swipeIndicator} />

              {/* Header Modal */}
              <View style={styles.modalHeaderDetail}>
                <Text style={[styles.modalTitle, {color: colors.text}]}>
                  {selectedBencana?.jenis_bencana
                    .replace(/_/g, ' ')
                    .replace(/\b\w/g, (c: any) => c.toUpperCase())}
                </Text>
                <TouchableOpacity onPress={() => setSelectedBencana(null)}>
                  <AntDesign name="close" size={24} color={colors.text} />
                </TouchableOpacity>
              </View>

              {/* 3 Kotak Info Sesuai Jenis Bencana */}
              <View style={styles.infoContainer}>
                {selectedBencana?.jenis_bencana === 'tsunami' && (
                  <>
                    <View style={styles.infoBox}>
                      <Text style={styles.infoTitle}>
                        Kecepatan Gelombang Air
                      </Text>
                      <Text style={styles.infoValue}>
                        {selectedBencana?.cepat_gel_air || 0} m/s
                      </Text>
                    </View>
                    <View style={styles.infoBox}>
                      <Text style={styles.infoTitle}>
                        Ketinggian Gelombang Air
                      </Text>
                      <Text style={styles.infoValue}>
                        {selectedBencana?.tinggi_gel_air || 0} Meter
                      </Text>
                    </View>
                    <View style={styles.infoBox}>
                      <Text style={styles.infoTitle}>Waktu</Text>
                      <Text style={styles.infoValue}>
                        {new Intl.DateTimeFormat('id-ID', {
                          dateStyle: 'full',
                          timeStyle: 'medium',
                        }).format(new Date(selectedBencana?.date_created))}
                      </Text>
                    </View>
                  </>
                )}

                {selectedBencana?.jenis_bencana === 'gempa_bumi' && (
                  <>
                    <View style={styles.infoBox}>
                      <Text style={styles.infoTitle}>Magnitudo</Text>
                      <Text style={styles.infoValue}>
                        {selectedBencana?.kekuatan_gempa || 0} M
                      </Text>
                    </View>
                    <View style={styles.infoBox}>
                      <Text style={styles.infoTitle}>Kedalaman</Text>
                      <Text style={styles.infoValue}>
                        {selectedBencana?.kedalaman_gempa || 0} km
                      </Text>
                    </View>
                    <View style={styles.infoBox}>
                      <Text style={styles.infoTitle}>Waktu</Text>
                      <Text style={styles.infoValue}>
                        {new Intl.DateTimeFormat('id-ID', {
                          dateStyle: 'full',
                          timeStyle: 'medium',
                        }).format(new Date(selectedBencana?.date_created))}
                      </Text>
                    </View>
                  </>
                )}

                {selectedBencana?.jenis_bencana === 'gunung_berapi' && (
                  <>
                    <View style={styles.infoBox}>
                      <Text style={styles.infoTitle}>Gunung Berapi</Text>
                      <Text style={styles.infoValue}>
                        {selectedBencana?.nama_gunung || '-'}
                      </Text>
                    </View>
                    <View style={styles.infoBox}>
                      <Text style={styles.infoTitle}>Ketinggian Kolom Abu</Text>
                      <Text style={styles.infoValue}>
                        {selectedBencana?.tinggi_col_abu || '-'} m
                      </Text>
                    </View>
                    <View style={styles.infoBox}>
                      <Text style={styles.infoTitle}>Status Aktivitas</Text>
                      <Text style={styles.infoValue}>
                        {selectedBencana?.status_aktifitas || '-'}
                      </Text>
                    </View>
                  </>
                )}

                {selectedBencana?.jenis_bencana === 'tanah_longsor' && (
                  <>
                    <View style={styles.infoBox}>
                      <Text style={[styles.infoTitle, {color: colors.text}]}>
                        Volume Material Longsor
                      </Text>
                      <Text style={[styles.infoValue, {color: colors.info}]}>
                        {selectedBencana?.vol_mat_longsor || 0} m³
                      </Text>
                    </View>
                    <View style={styles.infoBox}>
                      <Text style={[styles.infoTitle, {color: colors.text}]}>
                        Kemiringan Lereng
                      </Text>
                      <Text style={[styles.infoValue, {color: colors.info}]}>
                        {selectedBencana?.sudut_mir_longsor || 0}°
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
                        }).format(new Date(selectedBencana?.date_created))}
                      </Text>
                    </View>
                  </>
                )}

                {selectedBencana?.jenis_bencana === 'banjir' && (
                  <>
                    <View style={styles.infoBox}>
                      <Text style={styles.infoTitle}>Ketinggian Air</Text>
                      <Text style={styles.infoValue}>
                        {selectedBencana?.ketinggian_banjir || 0} cm
                      </Text>
                    </View>
                    <View style={styles.infoBox}>
                      <Text style={styles.infoTitle}>Kecepatan Arus</Text>
                      <Text style={styles.infoValue}>
                        {selectedBencana?.kecepatan_banjir || 0} m/s
                      </Text>
                    </View>
                    <View style={styles.infoBox}>
                      <Text style={styles.infoTitle}>Waktu</Text>
                      <Text style={styles.infoValue}>
                        {new Intl.DateTimeFormat('id-ID', {
                          dateStyle: 'full',
                          timeStyle: 'medium',
                        }).format(new Date(selectedBencana?.date_created))}
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
                  {selectedBencana?.geom?.coordinates?.[1]},{' '}
                  {selectedBencana?.geom?.coordinates?.[0]}
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
                  {selectedBencana?.wilayah || '-'}
                </Text>

                {/* Saran & Arahan */}
                <Text style={[styles.cardTitleData, {color: colors.text}]}>
                  Rekomendasi BMKG
                </Text>
                <Text style={[styles.cardDetails, {color: colors.info}]}>
                  {selectedBencana?.saran_bmkg || '-'}
                </Text>

                <Text style={[styles.cardTitleData, {color: colors.text}]}>
                  Arahan Evakuasi
                </Text>
                <Text style={[styles.cardDetails, {color: colors.info}]}>
                  {selectedBencana?.arahan || '-'}
                </Text>
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* List hasil pencarian */}
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
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mapContainer: {
    flex: 1,
    width: '100%',
    height: '55%',
  },
  map: {
    flex: 1,
  },
  containerContent: {
    flexDirection: 'row',
  },
  bottomSheet: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    position: 'absolute',
    bottom: 0,
    width: '100%',
  },
  dragIndicator: {
    width: 40,
    height: 5,
    backgroundColor: '#ccc',
    borderRadius: 5,
    alignSelf: 'center',
    marginVertical: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  cardContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cardDanger: {
    backgroundColor: '#FEF4F0',
    padding: 12,
    borderRadius: 10,
    borderColor: '#E35131',
    borderWidth: 1,
    width: '100%',
    marginRight: 10,
    marginBottom: 10,
  },
  cardPotential: {
    padding: 12,
    borderRadius: 10,
    borderColor: '#C3C3BF',
    borderWidth: 1,
    width: '100%',
    marginRight: 10,
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  cardDescription: {
    fontSize: 12,
    color: 'gray',
  },
  cardLoc: {
    fontSize: 12,
    color: '#F36A1D',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  cardStatus: {
    paddingVertical: 5,
    paddingHorizontal: 5,
    textAlign: 'center',
    fontWeight: 'bold',
    borderRadius: 5,
    color: 'white',
  },
  potensiBahaya: {
    backgroundColor: '#FF7043',
  },
  resikoBencana: {
    backgroundColor: '#F59047',
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
  },
  headerBackButton: {
    position: 'absolute',
    top: 20,
    left: 15,
    backgroundColor: 'rgb(255, 255, 255)',
    padding: 8,
    borderRadius: 10,
  },
  headerFilterButton: {
    position: 'absolute',
    top: 20,
    right: 15,
    backgroundColor: 'rgb(255, 255, 255)',
    padding: 8,
    borderRadius: 10,
  },
  locateMeButton: {
    position: 'absolute',
    right: 10,
    bottom: 100,
    zIndex: 999,
    backgroundColor: 'rgb(255, 255, 255)',
    padding: 8,
    borderRadius: 10,
  },
  historyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    right: 10,
    bottom: 100,
    zIndex: 999,
    backgroundColor: 'rgb(255, 255, 255)',
    padding: 8,
    borderRadius: 10,
    gap: 5,
  },
  headerSearchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgb(255, 255, 255)',
    borderRadius: 8,
    paddingHorizontal: 10,
    width: '85%',
    marginLeft: 50,
    marginVertical: 10,
  },
  headerSearchIcon: {
    marginRight: 5,
  },
  mapToolsContainer: {
    position: 'absolute',
    right: 10,
    top: '50%',
    marginTop: 40,
    alignItems: 'flex-end',
  },
  mapToolButton: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 44,
    height: 44,
    backgroundColor: 'white',
    borderRadius: 15,
    marginBottom: 10,
    opacity: 0.8,
    elevation: 5,
  },
  mapToolButtonTop: {
    marginBottom: 5,
  },
  mapToolButtonBottom: {
    marginBottom: 0,
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
  chipSelected: {borderColor: '#F36A1D'},
  headerAlertContainer: {
    flexDirection: 'row',
    backgroundColor: '#e74c3c',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    width: '90%',
    justifyContent: 'space-between',
  },
  headerAlertText: {
    color: 'white',
    marginLeft: 5,
    flex: 1,
  },
  marker: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#A84118',
    borderWidth: 2,
    borderColor: 'white',
    top: '40%',
    left: '40%',
  },
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerIcon: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(126, 126, 126, 0.3)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '80%',
  },
  swipeIndicator: {
    width: 50,
    height: 5,
    backgroundColor: '#ccc',
    borderRadius: 10,
    alignSelf: 'center',
    marginBottom: 10,
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
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
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
  iconImage: {
    width: 20,
    height: 15,
    resizeMode: 'contain',
  },
  headerSearchInput: {
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
  searchText: {
    fontSize: 16,
    color: 'gray',
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
  listContainer: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 20,
  },
  separator: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 16,
  },
  headerBackButtonModal: {
    marginRight: 10,
    backgroundColor: 'rgb(255, 255, 255)',
    padding: 8,
    borderRadius: 10,
  },
  sectionSubtitle: {
    fontSize: 14,
    marginBottom: 20,
  },
  dangerCard: {
    borderRadius: 8,
    padding: 16,
  },
  dangerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  dangerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  riskBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  riskText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    marginBottom: 12,
  },
  optionText: {
    marginLeft: 12,
    fontSize: 15,
    flex: 1,
  },
  edukasiButton: {
    borderRadius: 6,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  edukasiButtonText: {
    fontSize: 15,
    fontWeight: '500',
  },
});
