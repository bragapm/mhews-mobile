import React, { useState, useRef, useEffect } from 'react';
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
} from 'react-native';
// import MapView, { Circle, Marker, PROVIDER_GOOGLE, UrlTile } from "react-native-maps";
import MapboxGL, { Camera } from '@rnmapbox/maps';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import GetLocation from 'react-native-get-location';
import { useAlert } from '../components/AlertContext';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Feather from 'react-native-vector-icons/Feather';
import { BASE_URL, getData } from '../services/apiServices';
import haversine from 'haversine';
import useAuthStore from '../hooks/auth';
import FilterBottomSheet from '../components/FilterBottomSheet';
import { filterDisasterData } from '../utils/filterDisaster';

const { width, height } = Dimensions.get('window');

const customMapStyle = [
  {
    featureType: 'landscape',
    elementType: 'geometry',
    stylers: [
      { color: '#FAD9C3' }, // Warna daratan pastel oranye
    ],
  },
  {
    featureType: 'water',
    elementType: 'geometry.fill',
    stylers: [
      { color: '#9AC7D4' }, // Warna laut biru kehijauan
    ],
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [
      { color: '#F2B8A9' }, // Warna jalan pastel
    ],
  },
  {
    featureType: 'road',
    elementType: 'labels.text.fill',
    stylers: [
      { color: '#6B4A3A' }, // Warna teks jalan
    ],
  },
  {
    featureType: 'poi',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#845B47' }],
  },
  {
    featureType: 'administrative',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#594536' }],
  },
];

const MAPBOX_ACCESS_TOKEN = 'sk.eyJ1Ijoid2hvaXNhcnZpYW4iLCJhIjoiY203YjJkajRtMDk3cDJtczlxMDRrOTExNiJ9.61sU5Z9qNoRfQ22qdcAMzQ';
MapboxGL.setAccessToken(MAPBOX_ACCESS_TOKEN);

export default function DisasterRiskScreen() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [filterVisible, setFilterVisible] = useState(false);
  const [bottomSheetHeight, setBottomSheetHeight] = useState(300);
  const pan = useRef(new Animated.ValueXY()).current;
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const { showAlert } = useAlert();
  const [alertVisible, setAlertVisible] = useState(false);
  const [nearbyDisasters, setNearbyDisasters] = useState([]);
  const mapRef = useRef<MapboxGL.MapView | null>(null);
  const cameraRef = useRef<MapboxGL.Camera | null>(null);
  const [iconBencana, setIconBencana] = useState([]);
  const [dataBencana, setDataBencana] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { token } = useAuthStore();
  const [selectedBencana, setSelectedBencana] = useState<any>(null);
  const [isMapReady, setIsMapReady] = useState(false);
  const [selectedFilterJenisBencana, setSelectedFilterJenisBencana] = useState<string[]>(['semua']);
  const [filterData, setFilterData] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);

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
    console.log('Filter diterapkan:', filterData);
    setFilterData(filterData);
    setSelectedFilterJenisBencana(filterData?.jenisBencana);
    setFilterVisible(false);
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderMove: (event, gestureState) => {
      const delta = gestureState.dy;
      setBottomSheetHeight(prevHeight => {
        const newHeight = prevHeight - delta;
        if (newHeight > height * 0.7) {
          return height * 0.7;
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
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(text)}.json?access_token=${MAPBOX_ACCESS_TOKEN}&limit=20&country=id`
      );
      const data = await response.json();

      if (data.features) {
        setSearchResults(
          data.features.map((place: any) => ({
            id: place.id,
            name: place.place_name,
            lat: place.center[1], // Latitude
            lon: place.center[0], // Longitude
          }))
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

  const requestLocationPermission = async () => {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      }
      const result = await request(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);
      return result === RESULTS.GRANTED;
    } catch (error) {
      console.log('Permission Error:', error);
      return false;
    }
  };

  const fetchLocation = async () => {
    try {
      const result = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      );
      if (result == true) {
        getLocation();
      } else if (result == false) {
        const hasPermission = await requestLocationPermission();
        if (!hasPermission) {
          showAlert('error', 'Izin lokasi diperlukan untuk mengirim SOS.');
          return;
        }

        getLocation();
      }
    } catch (error) {
      showAlert('error', 'Gagal mengambil lokasi. Pastikan GPS aktif.');
    }
  };

  const getLocation = async () => {
    GetLocation.getCurrentPosition({
      enableHighAccuracy: true,
      timeout: 60000,
    })
      .then(location => {
        const { latitude, longitude } = location;
        setLocation({ latitude, longitude });
        if (cameraRef.current) {
          cameraRef.current.setCamera({
            centerCoordinate: [longitude, latitude],
            zoomLevel: 14,
            animationDuration: 1000,
          });
        } else {
          console.log('mapRef.current is null');
        }
      })
      .catch(error => {
        const { code, message } = error;
        console.warn(code, message);
      });
  };

  useEffect(() => {
    fetchLocation();
  }, []);

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

  useEffect(() => {
    fetchData();
  }, [selectedFilterJenisBencana]);

  useEffect(() => {
    if (location && dataBencana) {
      const nearbyDisaster = dataBencana.filter((disaster: any) => {
        const { coordinates } = disaster.geom;
        const disasterLocation = {
          latitude: coordinates[1],
          longitude: coordinates[0],
        };
        const distance = haversine(location, disasterLocation, { unit: 'meter' });

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
    fetchLocation();
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
            style={styles.headerBackButton}
            onPress={() => navigation.navigate('Tabs')}>
            <AntDesign name="arrowleft" size={24} color="black" />
          </TouchableOpacity>

          {/* Search Bar */}
          <TouchableOpacity style={styles.headerSearchContainer} onPress={() => setModalVisible(true)}>
            <Feather name="search" size={18} color="gray" style={styles.headerSearchIcon} />
            <View style={styles.headerSearchInput}>
              <Text style={styles.searchText}>
                {searchQuery || 'Cari Lokasi'}
              </Text>
            </View>
          </TouchableOpacity>

          {/* Tombol Filter */}
          <TouchableOpacity
            style={styles.headerFilterButton}
            onPress={() => setFilterVisible(true)}>
            <Ionicons name="options" size={24} color="black" />
          </TouchableOpacity>

          {/* Filter Bencana */}
          <FlatList
            data={[
              { jenis_bencana: 'semua', label: 'Semua Bencana', iconSelected: null, iconUnselected: null },
              ...filterDisasterData,
            ]}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={item => item.jenis_bencana}
            renderItem={({ item }) => {
              const isSelected = selectedFilterJenisBencana.includes(item.jenis_bencana);
              const iconSource = item.iconSelected
                ? isSelected
                  ? item.iconSelected
                  : item.iconUnselected
                : item.iconUnselected;

              return (
                <TouchableOpacity
                  style={[styles.chip, isSelected && styles.chipSelected]}
                  onPress={() => handleFilterPress(item.jenis_bencana)}
                >
                  {iconSource && (
                    <Image source={iconSource} style={styles.iconImage} />
                  )}
                  <Text
                    style={{
                      color: isSelected ? '#F36A1D' : '#232221',
                      fontSize: 12,
                    }}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            }}
          />

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
              style={[styles.locateMeButton, { bottom: bottomSheetHeight + 10 }]}>
              <Ionicons
                name="locate-outline"
                size={24}
                color="black"
                onPress={locateMe}
              />
            </TouchableOpacity>

            <View
              {...panResponder.panHandlers}
              style={[styles.bottomSheet, { height: bottomSheetHeight }]}>
              {/* Drag Indicator */}
              <View style={styles.dragIndicator} />

              <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={styles.sectionTitle}>Resiko Bencana</Text>
                <Text style={{ marginBottom: 10 }}>
                  Semua resiko bencana yang berupa potensi bencana yang akan
                  datang dan riwayat bencana yang akan terjadi
                </Text>

                {/* List of Disaster Risk Cards */}
                {dataBencana.map((item: any) => (
                  <View style={styles.cardContainer} key={item.id}>
                    <TouchableOpacity
                      style={
                        item.status === 'Potensi Bahaya'
                          ? styles.cardDanger
                          : styles.cardPotential
                      }
                      activeOpacity={0.8}
                      onPress={() => setSelectedBencana(item)}>
                      <View style={styles.cardHeader}>
                        <Text style={styles.cardTitle}>
                          {item.jenis_bencana
                            .replace(/_/g, ' ')
                            .replace(/\b\w/g, (c: any) => c.toUpperCase())}
                        </Text>
                        <Text
                          style={[
                            styles.cardStatus,
                            item.status === 'Potensi Bahaya'
                              ? styles.potensiBahaya
                              : styles.resikoBencana,
                          ]}>
                          {item.status || 'Resiko Bencana'}
                        </Text>
                      </View>
                      <Text style={styles.cardDescription}>
                        {new Intl.DateTimeFormat('id-ID', {
                          dateStyle: 'full',
                          timeStyle: 'medium',
                        }).format(new Date(item.date_created))}
                      </Text>
                      <Text style={styles.cardLoc}>
                        {item.geom?.coordinates?.[1]},{' '}
                        {item.geom?.coordinates?.[0]}
                      </Text>
                      {/* Deskripsi berdasarkan tipe bencana */}
                      {item.jenis_bencana === 'gempa_bumi' && (
                        <>
                          <Text style={styles.cardTitleData}>
                            Wilayah Terdampak
                          </Text>
                          <Text style={styles.cardDescription}>
                            {item.wilayah || '-'}
                          </Text>

                          <Text style={styles.cardTitleData}>
                            Magnitudo Gempa
                          </Text>
                          <Text style={styles.cardDescription}>
                            {item.kekuatan_gempa || 0} M
                          </Text>

                          <Text style={styles.cardTitleData}>
                            Kedalaman (km)
                          </Text>
                          <Text style={styles.cardDescription}>
                            {item.kedalaman_gempa || 0}
                          </Text>
                        </>
                      )}

                      {item.jenis_bencana === 'gunung_berapi' && (
                        <>
                          <Text style={styles.cardTitleData}>
                            Wilayah Terdampak
                          </Text>
                          <Text style={styles.cardDescription}>
                            {item.wilayah || '-'}
                          </Text>

                          <Text style={styles.cardTitleData}>
                            Gunung Berapi
                          </Text>
                          <Text style={styles.cardDescription}>
                            {item.nama_gunung || '-'}
                          </Text>

                          <Text style={styles.cardTitleData}>
                            Ketinggian Kolom Abu (m)
                          </Text>
                          <Text style={styles.cardDescription}>
                            {item.tinggi_col_abu || '-'}
                          </Text>

                          <Text style={styles.cardTitleData}>
                            Status Aktivitas
                          </Text>
                          <Text style={styles.cardDescription}>
                            {item.status_aktifitas || '-'}
                          </Text>
                        </>
                      )}

                      {item.jenis_bencana === 'tanah_longsor' && (
                        <>
                          <Text style={styles.cardTitleData}>
                            Wilayah Terdampak
                          </Text>
                          <Text style={styles.cardDescription}>
                            {item.wilayah || '-'}
                          </Text>

                          <Text style={styles.cardTitleData}>
                            Volume Material Longsor (m³)
                          </Text>
                          <Text style={styles.cardDescription}>
                            {item.vol_mat_longsor || 0}
                          </Text>

                          <Text style={styles.cardTitleData}>
                            Kemiringan Lereng (°)
                          </Text>
                          <Text style={styles.cardDescription}>
                            {item.sudut_mir_longsor || 0}
                          </Text>
                        </>
                      )}

                      {item.jenis_bencana === 'tsunami' && (
                        <>
                          <Text style={styles.cardTitleData}>
                            Wilayah Terdampak
                          </Text>
                          <Text style={styles.cardDescription}>
                            {item.wilayah || '-'}
                          </Text>

                          <Text style={styles.cardTitleData}>
                            Ketinggian Gelombang (m)
                          </Text>
                          <Text style={styles.cardDescription}>
                            {item.tinggi_gel_air || 0}
                          </Text>

                          <Text style={styles.cardTitleData}>
                            Kecepatan Gelombang (m/s)
                          </Text>
                          <Text style={styles.cardDescription}>
                            {item.cepat_gel_air || 0}
                          </Text>
                        </>
                      )}

                      {item.jenis_bencana === 'banjir' && (
                        <>
                          <Text style={styles.cardTitleData}>
                            Wilayah Terdampak
                          </Text>
                          <Text style={styles.cardDescription}>
                            {item.wilayah || '-'}
                          </Text>

                          <Text style={styles.cardTitleData}>
                            Ketinggian Air (cm)
                          </Text>
                          <Text style={styles.cardDescription}>
                            {item.ketinggian_banjir || 0}
                          </Text>

                          <Text style={styles.cardTitleData}>
                            Kecepatan Arus (m/s)
                          </Text>
                          <Text style={styles.cardDescription}>
                            {item.kecepatan_banjir || 0}
                          </Text>
                        </>
                      )}

                      {/* Saran & Arahan */}
                      <Text style={styles.cardTitleData}>Rekomendasi BMKG</Text>
                      <Text style={styles.cardDetails}>
                        {item.saran_bmkg || '-'}
                      </Text>

                      <Text style={styles.cardTitleData}>Arahan Evakuasi</Text>
                      <Text style={styles.cardDetails}>
                        {item.arahan || '-'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                ))}
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
            <View style={styles.modalContent}>
              {/* Garis Tarik untuk Swipe */}
              <View style={styles.swipeIndicator} />

              {/* Header Modal */}
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {selectedBencana?.jenis_bencana
                    .replace(/_/g, ' ')
                    .replace(/\b\w/g, (c: any) => c.toUpperCase())}
                </Text>
                <TouchableOpacity onPress={() => setSelectedBencana(null)}>
                  <AntDesign name="close" size={24} color="black" />
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
                      <Text style={styles.infoTitle}>
                        Volume Material Longsor
                      </Text>
                      <Text style={styles.infoValue}>
                        {selectedBencana?.vol_mat_longsor || 0} m³
                      </Text>
                    </View>
                    <View style={styles.infoBox}>
                      <Text style={styles.infoTitle}>Kemiringan Lereng</Text>
                      <Text style={styles.infoValue}>
                        {selectedBencana?.sudut_mir_longsor || 0}°
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
                <Text style={styles.cardTitleData}>Lokasi</Text>
                <Text style={styles.cardDescription}>
                  {selectedBencana?.geom?.coordinates?.[1]},{' '}
                  {selectedBencana?.geom?.coordinates?.[0]}
                </Text>

                {/* Tipe Bencana */}
                <Text style={styles.cardTitleData}>Tipe Bencana</Text>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>Resiko Bencana</Text>
                </View>

                {/* Wilayah Terdampak */}
                <Text style={styles.cardTitleData}>Wilayah Terdampak</Text>
                <Text style={styles.cardDescription}>
                  {selectedBencana?.wilayah || '-'}
                </Text>

                {/* Saran & Arahan */}
                <Text style={styles.cardTitleData}>Rekomendasi BMKG</Text>
                <Text style={styles.cardDetails}>
                  {selectedBencana?.saran_bmkg || '-'}
                </Text>

                <Text style={styles.cardTitleData}>Arahan Evakuasi</Text>
                <Text style={styles.cardDetails}>
                  {selectedBencana?.arahan || '-'}
                </Text>
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* List hasil pencarian */}
        <Modal animationType="slide" visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
          <View style={styles.modalContainer}>
            {/* Header Modal */}
            <View style={styles.modalHeader}>
              {/* Tombol Back */}
              <TouchableOpacity style={styles.headerBackButtonModal} onPress={() => setModalVisible(false)}>
                <AntDesign name="arrowleft" size={24} color="black" />
              </TouchableOpacity>

              {/* Input Pencarian */}
              <View style={styles.headerSearchContainerModal}>
                <Feather name="search" size={18} color="gray" style={styles.headerSearchIconModal} />
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
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.resultItem} onPress={() => handleSelectLocation(item)}>
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
    color: '#CD541B',
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
    shadowOffset: { width: 0, height: 2 },
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
    right: 20,
    bottom: 100,
    zIndex: 999,
    backgroundColor: 'rgb(255, 255, 255)',
    padding: 8,
    borderRadius: 10,
  },
  headerSearchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgb(255, 255, 255)',
    borderRadius: 8,
    paddingHorizontal: 10,
    width: '70%',
    marginVertical: 10,
  },
  headerSearchIcon: {
    marginRight: 5,
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
  chipSelected: { borderColor: '#f36a1d' },
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
    padding: 10
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
});
