import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  useColorScheme,
  Image,
  FlatList,
  Animated,
  PanResponder,
  Dimensions,
  Modal,
  TextInput,
} from 'react-native';
import COLORS from '../config/COLORS';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {getData, postData} from '../services/apiServices';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Feather from 'react-native-vector-icons/Feather';
import {fetchLocation, getLocationDetails} from '../utils/locationUtils';
import MapboxGL, {Camera} from '@rnmapbox/maps';
import useAuthStore from '../hooks/auth';

export default function ManageLocationsScreen() {
  const MAPBOX_ACCESS_TOKEN =
    'sk.eyJ1Ijoid2hvaXNhcnZpYW4iLCJhIjoiY203YjJkajRtMDk3cDJtczlxMDRrOTExNiJ9.61sU5Z9qNoRfQ22qdcAMzQ';
  MapboxGL.setAccessToken(MAPBOX_ACCESS_TOKEN);
  const {profile, getProfile} = useAuthStore();
  const {width, height} = Dimensions.get('window');
  const colorScheme = useColorScheme();
  const colors = COLORS();

  // ---- State & Refs ----
  const [showAlert, setShowAlert] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState<'current' | number>(
    'current',
  );
  const [lokasiLabel, setLokasiLabel] = useState('');
  const [modalVisible, setModalVisible] = useState(true);
  const [modalSearch, setModalSearch] = useState(false);

  // ** Modal form “Tambah Lokasi” **
  const [modalAddLocation, setModalAddLocation] = useState(false);

  const [bottomSheetHeight, setBottomSheetHeight] = useState(300);
  const [listLokasi, setListLokasi] = useState([]);
  const [locateNow, setLocateNow] = useState('');
  const [myLocation, setMyLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [selectedPin, setSelectedPin] = useState<[number, number] | null>(null);

  // Untuk menampilkan di form
  const [mapLocationName, setMapLocationName] = useState('-');
  const [mapLocationAddress, setMapLocationAddress] = useState('-');

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  console.log('searchResults', searchResults);
  const mapRef = useRef<MapboxGL.MapView | null>(null);
  const cameraRef = useRef<MapboxGL.Camera | null>(null);

  // Ikon
  const iconMarker = require('../assets/images/marker.png');
  const iconLocate =
    colorScheme === 'dark'
      ? require('../assets/images/my-location-deactive-dark.png')
      : require('../assets/images/my-location-deactive-light.png');
  const iconLocateActive = require('../assets/images/my-location-active.png');
  const iconSave =
    colorScheme === 'dark'
      ? require('../assets/images/saved-deactive-dark.png')
      : require('../assets/images/saved-deactive-light.png');
  const iconSaveActive = require('../assets/images/saved-active.png');

  // ---- PanResponder untuk Bottom Sheet ----
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

  // ---- Fetch data awal ----
  const fetchData = async () => {
    try {
      const response = await getData('/items/manajemen_lokasi');
      if (!response) throw new Error('Gagal mengambil data');
      if (!Array.isArray(response.data)) {
        throw new Error('Format response tidak sesuai');
      }
      const userId = profile?.id;

      // Filter data agar hanya item dengan pemilik === userId
      const filtered = response?.data?.filter(item => item.pemilik === userId);

      // Simpan ke state
      setListLokasi(filtered);
    } catch (error) {
      console.error('Gagal mengambil data:', error);
      setListLokasi([]);
    }
  };

  const handleGetLocation = async () => {
    const location = await fetchLocation();
    if (location) {
      setMyLocation({
        latitude: location.latitude,
        longitude: location.longitude,
      });
      const address: any = await getLocationDetails(
        location.latitude,
        location.longitude,
      );
      setLocateNow(address);
    }
  };

  // Panggil di awal
  useEffect(() => {
    handleGetLocation();
    fetchData();
  }, []);

  const updateLocationInfo = async (latitude: number, longitude: number) => {
    try {
      const address: any = await getLocationDetails(latitude, longitude);
      console.log('address', address);
      const fullAddress = address || 'Detail alamat tidak tersedia';
      const firstPart =
        fullAddress.split(',')[0] || 'Nama jalan tidak tersedia';
      setMapLocationName(firstPart);
      setMapLocationAddress(fullAddress);
    } catch (err) {
      console.log('Error updateLocationInfo:', err);
    }
  };

  // ---- Fungsi untuk menyimpan lokasi (post data) ----
  const handleSaveLocation = async () => {
    if (!selectedPin) return; // pastikan ada koordinat
    const data = {
      nama_lokasi: lokasiLabel, // dari input
      alamat: mapLocationAddress, // dari state alamat
      geom: {
        type: 'Point',
        coordinates: selectedPin, // format [longitude, latitude]
      },
      pemilik: profile?.id, // ambil dari profile
    };

    try {
      const result = await postData('/items/manajemen_lokasi', data);
      console.log('Location saved:', result);
      // Setelah berhasil, tutup modal form,
      // hapus selectedPin agar tampilan map menghilang,
      // dan refresh data lokasi agar bottom sheet menampilkan data terbaru
      setModalAddLocation(false);
      setSelectedPin(null);
      fetchData();
    } catch (error) {
      console.error('Error saving location:', error);
    }
  };

  // ---- Data list lokasi (untuk bottom sheet) ----
  const modifiedSearchResults = [
    {
      id: 'use-current',
      name: 'Gunakan Lokasi Saya Saat Ini',
    },
    ...searchResults,
  ];

  const combinedData = [
    {
      id: 'current',
      nama_lokasi: 'Lokasi Saat Ini',
      alamat: locateNow || '-',
    },
    ...listLokasi,
  ];

  // ---- Render item di FlatList ----
  const renderItem = ({item}) => {
    const isCurrent = item.id === 'current';
    const isActive = selectedLocation === item.id;

    const activeIcon = isCurrent ? iconLocateActive : iconSaveActive;
    const deactiveIcon = isCurrent ? iconLocate : iconSave;
    const iconUsed = isActive ? activeIcon : deactiveIcon;

    return (
      <TouchableOpacity
        onPress={() => setSelectedLocation(item.id)}
        style={[
          styles.boxLocation,
          isActive
            ? {backgroundColor: colors.activeCard}
            : {backgroundColor: colors.bg},
        ]}>
        <View style={styles.rowBetween}>
          <View style={styles.iconContainer}>
            <Image source={iconUsed} style={styles.iconImage} />
          </View>
          <View style={styles.textContainer}>
            <Text
              style={[
                styles.label,
                isActive ? {color: '#F36A1D'} : {color: colors.text},
              ]}>
              {item.nama_lokasi}
            </Text>
            <Text style={[styles.detailLocation, {color: colors.info}]}>
              {item.alamat}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // ---- Search Lokasi (Modal Search) ----
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
            lat: place.center[1],
            lon: place.center[0],
          })),
        );
      }
    } catch (error) {
      console.error('Error fetching locations:', error);
    }
  };

  const handleSelectLocation = async (location: any) => {
    // Jika user memilih "Gunakan Lokasi Saya Saat Ini"
    if (location.id === 'use-current') {
      if (myLocation) {
        setSearchQuery('Gunakan Lokasi Saya Saat Ini');
        setModalSearch(false);

        // Pindah camera ke lokasi user
        cameraRef.current?.setCamera({
          centerCoordinate: [myLocation.longitude, myLocation.latitude],
          zoomLevel: 14,
          animationDuration: 1000,
        });

        // Set pin + update detail info
        setSelectedPin([myLocation.longitude, myLocation.latitude]);
        await updateLocationInfo(myLocation.latitude, myLocation.longitude);
      }
      return;
    }

    // Jika user memilih hasil pencarian
    setSearchQuery(location.name);
    setModalSearch(false);

    // Pindahkan camera
    cameraRef.current?.setCamera({
      centerCoordinate: [location.lon, location.lat],
      zoomLevel: 14,
      animationDuration: 1000,
    });

    // Set pin + update detail info
    setSelectedPin([location.lon, location.lat]);
    await updateLocationInfo(location.lat, location.lon);
  };

  // ---- Marker Draggable ----
  const handleMarkerDragEnd = async (e: any) => {
    const coords = e.geometry.coordinates; // [longitude, latitude]
    setSelectedPin([coords[0], coords[1]]);
    await updateLocationInfo(coords[1], coords[0]);
  };

  // ---- Tombol di Bottom Info (peta) ----
  const handleAddLocation = () => {
    // Tampilkan modal form “Tambah Lokasi”
    setModalAddLocation(true);
  };

  const handleManageSaved = () => {
    console.log('Kelola Lokasi Tersimpan');
  };

  // ---- Render ----
  return (
    <>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'}
      />

      {/* MAP VIEW (jika sudah ada selectedPin) */}
      {selectedPin && (
        <View style={{flex: 1}}>
          <MapboxGL.MapView ref={mapRef} style={{flex: 1}}>
            <Camera
              ref={cameraRef}
              centerCoordinate={selectedPin || [106.84513, -6.21462]}
              zoomLevel={selectedPin ? 14 : 10}
            />
            <MapboxGL.PointAnnotation
              id="selectedPin"
              coordinate={selectedPin}
              draggable={true}
              onDragEnd={handleMarkerDragEnd}>
              <View style={{width: 30, height: 30}}>
                <Ionicons name="location-sharp" size={30} color="#c55" />
              </View>
            </MapboxGL.PointAnnotation>
          </MapboxGL.MapView>

          {/* ALERT di atas peta */}
          {showAlert && (
            <View
              style={[
                styles.alertContainer,
                {
                  backgroundColor: '#E2E1DF',
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                },
              ]}>
              <View
                style={{
                  width: '10%',
                }}>
                <Image
                  source={require('../assets/images/info.png')}
                  style={[styles.iconImage, {width: 20, height: 20}]}
                />
              </View>

              <View
                style={{
                  width: '80%',
                }}>
                <Text style={[styles.alertText, {textAlign: 'left'}]}>
                  Sesuaikan peta dengan pin point sesuai dengan alamat yang anda
                  inginkan
                </Text>
              </View>
              <View
                style={{
                  width: '10%',
                }}>
                <TouchableOpacity onPress={() => setShowAlert(false)}>
                  <Text
                    style={[
                      styles.alertText,
                      {textAlign: 'right', alignItems: 'flex-start'},
                    ]}>
                    X
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Info box di bagian bawah peta */}
          <View style={[styles.bottomInfo, {backgroundColor: colors.bg}]}>
            <Text style={[styles.locationTitle, {color: colors.text}]}>
              {mapLocationName}
            </Text>
            <Text style={[styles.locationSub, {color: colors.info}]}>
              {mapLocationAddress}
            </Text>

            <TouchableOpacity
              style={styles.btnMapModalPrimary}
              onPress={handleAddLocation}>
              <Text style={styles.btnMapModalPrimaryText}>Tambah Lokasi</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.btnMapModalSecondary}
              onPress={() => {
                // “Cari Lokasi Lain” -> Kembali ke tampilan bottom sheet
                // (setSelectedPin(null) agar map hilang)
                setSelectedPin(null);
              }}>
              <Text style={styles.btnMapModalSecondaryText}>
                Cari Lokasi Lain
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Bottom Sheet (jika belum ada pin) */}
      {!selectedPin && modalVisible && (
        <Animated.View
          {...panResponder.panHandlers}
          style={[
            styles.bottomSheet,
            {height: bottomSheetHeight, backgroundColor: colors.bg},
          ]}>
          <View style={styles.dragIndicator} />
          <Text style={[styles.modalTitle, {color: colors.text}]}>
            Lokasi Notifikasi Bencana
          </Text>
          <Text style={[styles.modalSubtitle, {color: colors.info}]}>
            Kelola lokasi penting untuk menerima notifikasi langsung saat
            bencana terjadi
          </Text>

          <FlatList
            data={combinedData}
            keyExtractor={(item, index) => item.id.toString() + index}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
            style={{marginBottom: 10}}
          />

          <TouchableOpacity
            style={styles.btnPrimary}
            onPress={() => setModalSearch(true)}>
            <Text style={styles.btnPrimaryText}>Tambah Lokasi</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.btnSecondary}
            onPress={handleManageSaved}>
            <Text style={styles.btnSecondaryText}>Kelola Lokasi Tersimpan</Text>
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* Modal Search Lokasi */}
      <Modal
        animationType="slide"
        visible={modalSearch}
        onRequestClose={() => setModalSearch(false)}>
        <View style={[styles.modalContainer, {backgroundColor: colors.bg}]}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={[
                styles.headerBackButtonModal,
                {backgroundColor: colors.bg},
              ]}
              onPress={() => setModalSearch(false)}>
              <AntDesign name="arrowleft" size={24} color={colors.text} />
            </TouchableOpacity>
            <View
              style={[
                styles.headerSearchContainerModal,
                {backgroundColor: colors.bg},
              ]}>
              <Feather
                name="search"
                size={18}
                color="gray"
                style={styles.headerSearchIconModal}
              />
              <TextInput
                placeholder="Cari Lokasi"
                style={[styles.headerSearchInputModal, {color: colors.text}]}
                value={searchQuery}
                onChangeText={handleSearch}
              />
            </View>
          </View>

          <FlatList
            data={modifiedSearchResults}
            keyExtractor={(item: any) => item.id}
            ListHeaderComponent={() => (
              <Text style={[styles.resultHeader, {color: colors.text}]}>
                Hasil Pencarian
              </Text>
            )}
            renderItem={({item}) => {
              if (item.id === 'use-current') {
                return (
                  <TouchableOpacity
                    style={[styles.resultItem, {backgroundColor: colors.bg}]}
                    onPress={() => handleSelectLocation(item)}>
                    <View style={styles.resultIconContainer}>
                      <Ionicons
                        name="locate-outline"
                        size={24}
                        color={colors.text}
                      />
                    </View>
                    <View style={styles.resultTextContainer}>
                      <Text style={[styles.resultTitle, {color: colors.text}]}>
                        Gunakan Lokasi Saya Saat Ini
                      </Text>
                      <Text
                        style={[styles.resultSubtitle, {color: colors.info}]}>
                        {locateNow || 'Mencari...'}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              } else {
                return (
                  <TouchableOpacity
                    style={[styles.resultItem, {backgroundColor: colors.bg}]}
                    onPress={() => handleSelectLocation(item)}>
                    <View style={styles.resultIconContainer}>
                      <Feather name="map-pin" size={20} color="gray" />
                    </View>
                    <View style={styles.resultTextContainer}>
                      <Text style={[styles.resultTitle, {color: colors.text}]}>
                        {item?.name}
                      </Text>
                      <Text
                        style={[styles.resultSubtitle, {color: colors.info}]}>
                        {' '}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              }
            }}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        </View>
      </Modal>

      {/* Modal Form “Tambah Lokasi” */}
      <Modal
        visible={modalAddLocation}
        animationType="slide"
        onRequestClose={() => setModalAddLocation(false)}>
        <View
          style={[
            styles.addLocationModalContainer,
            {backgroundColor: colors.bg},
          ]}>
          {/* Header */}
          <View
            style={{
              width: '100%',
              flexDirection: 'row',
              alignItems: 'center',
            }}>
            <TouchableOpacity
              style={[
                styles.headerBackButtonModal,
                {backgroundColor: colors.bg},
              ]}
              onPress={() => setModalAddLocation(false)}>
              <AntDesign name="arrowleft" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={[styles.addLocationTitle, {color: colors.text}]}>
              Tambah Lokasi
            </Text>
          </View>

          <Text style={[styles.addLocationSubtitle, {color: colors.info}]}>
            Lengkapi data lokasi anda
          </Text>

          {/* Tampilkan nama jalan & alamat (hasil marker) */}
          <View style={styles.addressPreviewContainer}>
            <View
              style={{
                width: '100%',
                paddingHorizontal: '2%',
                paddingVertical: '2%',
                flexDirection: 'row',
                justifyContent: 'space-between',
                backgroundColor: colors.activeCard,
                borderRadius: 10,
              }}>
              <View
                style={{
                  width: '10%',
                }}>
                <Ionicons
                  name="locate-outline"
                  size={24}
                  color={'#F36A1D'}
                  // onPress={locateMe}
                />
              </View>
              <View
                style={{
                  width: '90%',
                }}>
                <Text style={[styles.addressPreviewTitle, {color: '#F36A1D'}]}>
                  {mapLocationName}
                </Text>
                <Text
                  style={[styles.addressPreviewSubtitle, {color: colors.info}]}>
                  {mapLocationAddress}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={[
                styles.btnSaveLocation,
                {
                  borderWidth: 1,
                  backgroundColor: colors.bg,
                  borderColor: '#F36A1D',
                },
              ]}
              onPress={() => setModalAddLocation(false)}>
              <Text style={[styles.btnSaveLocationText, {color: colors.text}]}>
                Ubah Pin Point
              </Text>
            </TouchableOpacity>
          </View>

          {/* Input Label Lokasi */}
          <View
            style={[
              styles.formGroup,
              {
                borderWidth: 1,
                paddingHorizontal: '2%',
                paddingVertical: '2%',
                borderRadius: 10,
                borderColor: colors.info,
              },
            ]}>
            <Text style={[styles.formLabel, {color: colors.info}]}>
              Label Lokasi
            </Text>
            <TextInput
              style={[styles.formInput, {color: colors.info}]}
              placeholder="Masukkan Label Lokasi"
              value={lokasiLabel}
              onChangeText={setLokasiLabel}
            />
          </View>

          {/* Alamat Lengkap */}
          <View
            style={[
              styles.formGroup,
              {
                borderWidth: 1,
                paddingHorizontal: '2%',
                paddingVertical: '2%',
                borderRadius: 10,
                borderColor: colors.info,
              },
            ]}>
            <Text style={[styles.formLabel, {color: colors.info}]}>
              Alamat Lengkap
            </Text>
            <TextInput
              style={[
                styles.formInput,
                {height: 80, textAlignVertical: 'top', color: colors.info},
              ]}
              multiline
              value={mapLocationAddress}
              onChangeText={() => {}}
            />
          </View>

          {/* Tombol Simpan Lokasi */}
          <TouchableOpacity
            style={styles.btnSaveLocation}
            onPress={handleSaveLocation}>
            <Text style={styles.btnSaveLocationText}>Simpan Lokasi</Text>
          </TouchableOpacity>

          {/* Tombol Close (jika mau) */}
          {/* <TouchableOpacity
            style={styles.btnCloseAddLocation}
            onPress={() => setModalAddLocation(false)}>
            <Text style={{color: '#333'}}>Batal</Text>
          </TouchableOpacity> */}
        </View>
      </Modal>
    </>
  );
}

// ----------------------------------------
// Style
// ----------------------------------------
const styles = StyleSheet.create({
  // ---- MAP ALERT & BOTTOM INFO ----
  alertContainer: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
    elevation: 3,
    zIndex: 999,
  },
  alertText: {
    color: '#333',
    fontSize: 14,
  },
  bottomInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    elevation: 5,
    zIndex: 999,
  },
  locationTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 4,
    color: '#333',
  },
  locationSub: {
    color: '#666',
    fontSize: 14,
    marginBottom: 10,
  },
  btnMapModalPrimary: {
    backgroundColor: '#F27405',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  btnMapModalPrimaryText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  btnMapModalSecondary: {
    borderWidth: 1,
    borderColor: '#F27405',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  btnMapModalSecondaryText: {
    fontSize: 16,
    color: '#F27405',
    fontWeight: '600',
  },

  // ---- BOTTOM SHEET ----
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
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
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  modalSubtitle: {
    fontSize: 14,
    marginBottom: 10,
  },
  boxLocation: {
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconContainer: {
    width: '15%',
    alignItems: 'center',
  },
  textContainer: {
    width: '80%',
    justifyContent: 'center',
  },
  iconImage: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  detailLocation: {
    fontSize: 14,
  },
  btnPrimary: {
    backgroundColor: '#F27405',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
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
    marginVertical: 12,
  },
  btnSecondaryText: {
    fontSize: 16,
    color: '#F27405',
    fontWeight: '600',
  },

  // ---- MODAL SEARCH ----
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgb(246,246,246)',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
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
    backgroundColor: '#fff',
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
    backgroundColor: '#EAEAEA',
    marginLeft: 16,
  },

  // ---- MODAL ADD LOCATION (Form) ----
  addLocationModalContainer: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  addLocationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#333',
  },
  addLocationSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  addressPreviewContainer: {
    marginBottom: 16,
  },
  addressPreviewTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  addressPreviewSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  formGroup: {
    marginBottom: 12,
  },
  formLabel: {
    fontSize: 14,
    color: '#333',
    marginBottom: 6,
  },
  formInput: {
    borderWidth: 0,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: '#333',
  },
  btnSaveLocation: {
    backgroundColor: '#F27405',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  btnSaveLocationText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  btnCloseAddLocation: {
    alignSelf: 'center',
    marginTop: 10,
    padding: 8,
  },
});
