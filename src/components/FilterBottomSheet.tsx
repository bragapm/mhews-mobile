import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ScrollView,
  Animated,
  Platform,
  TouchableWithoutFeedback,
  PanResponder,
  Image,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Slider from '@react-native-community/slider';
import DateTimePicker from '@react-native-community/datetimepicker';

interface FilterBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  onApply: (filterData: any) => void;
}

const FilterBottomSheet: React.FC<FilterBottomSheetProps> = ({
  visible,
  onClose,
  onApply,
}) => {
  const [radius, setRadius] = useState(2);
  const [tempRadius, setTempRadius] = useState(radius);
  const [jenisBencana, setJenisBencana] = useState<string[]>([]);
  const [tipe, setTipe] = useState<string[]>([]);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [sliderPosition, setSliderPosition] = useState(new Animated.Value(0));

  const bottomSheetAnim = useRef(new Animated.Value(0)).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (evt, gestureState) => {
        if (gestureState.dy > 0) {
          bottomSheetAnim.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (gestureState.dy > 100) {
          onClose();
        } else {
          Animated.spring(bottomSheetAnim, {
            toValue: 0,
            useNativeDriver: false,
          }).start();
        }
      },
    }),
  ).current;
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const handleStartDateChange = (event: any, selectedDate?: Date) => {
    setShowStartPicker(Platform.OS === 'ios'); // Jika iOS, biarkan tetap muncul
    if (selectedDate) setStartDate(selectedDate);
  };

  const handleEndDateChange = (event: any, selectedDate?: Date) => {
    setShowEndPicker(Platform.OS === 'ios'); // Jika iOS, biarkan tetap muncul
    if (selectedDate) setEndDate(selectedDate);
  };

  const sliderMin = 2;
  const sliderMax = 10;
  const sliderWidth = Dimensions.get('window').width * 0.8; // Sesuaikan dengan lebar slider

  // Hitung posisi tooltip berdasarkan nilai slider
  const getTooltipPosition = (value: number) => {
    return ((value - sliderMin) / (sliderMax - sliderMin)) * (sliderWidth - 30);
  };

  const resetFilter = () => {
    setRadius(2);
    setJenisBencana([]);
    setTipe([]);
    setStartDate(new Date());
    setEndDate(new Date());
  };

  const applyFilter = () => {
    const filterData = {
      radius,
      jenisBencana,
      tipe,
      startDate,
      endDate,
    };
    onApply(filterData);
  };

  // Data opsi bencana
  const disasterOptions = [
    {
      value: 'semua',
      label: 'Semua Bencana',
      icon: 'earth',
      iconSelected: '',
      iconUnselected: '',
    },
    {
      value: 'gempa_bumi',
      label: 'Gempa Bumi',
      iconSelected: require('../assets/images/gempaActive.png'),
      iconUnselected: require('../assets/images/gempaDeactive.png'),
    },
    {
      value: 'tsunami',
      label: 'Tsunami',
      iconSelected: require('../assets/images/tsunamiActive.png'),
      iconUnselected: require('../assets/images/tsunamiDeactive.png'),
    },
    {
      value: 'banjir',
      label: 'Banjir',
      iconSelected: require('../assets/images/banjirActive.png'),
      iconUnselected: require('../assets/images/banjirDeactive.png'),
    },
    {
      value: 'longsor',
      label: 'Longsor',
      iconSelected: require('../assets/images/longsorActive.png'),
      iconUnselected: require('../assets/images/longsorDeactive.png'),
    },
    {
      value: 'gunung_berapi',
      label: 'Erupsi Gn. Berapi',
      iconSelected: require('../assets/images/erupsiActive.png'),
      iconUnselected: require('../assets/images/erupsiDeactive.png'),
    },
  ];

  const tipeOptions = [
    { value: 'semua', label: 'Semua Bencana' },
    {
      value: 'potensi_bahaya',
      label: 'Potensi Bahaya',
      iconSelected: require('../assets/images/potensiBahayaActive.png'),
      iconUnselected: require('../assets/images/potensiBahayaDeactive.png'),
    },
    {
      value: 'resiko_bencana',
      label: 'Resiko Bencana',
      iconSelected: require('../assets/images/resikoBahayaActive.png'),
      iconUnselected: require('../assets/images/resikoBahayaDeactive.png'),
    },
    {
      value: 'riwayat_bencana',
      label: 'Riwayat Bencana',
      iconSelected: require('../assets/images/riwayatBencanaActive.png'),
      iconUnselected: require('../assets/images/riwayatBencanaDeactive.png'),
    },
  ];

  // Fungsi toggle untuk Jenis Bencana
  const toggleJenisBencana = (value: string) => {
    setJenisBencana(prev => {
      if (value === 'semua') {
        return ['semua'];
      }

      if (prev.includes('semua')) {
        return [value];
      }

      const updatedFilters = prev.includes(value)
        ? prev.filter(item => item !== value)
        : [...prev, value];

      return updatedFilters.length > 0 ? updatedFilters : ['semua'];
    });
  };

  // Fungsi toggle untuk Tipe Bencana
  const toggleTipe = (value: string) => {
    setTipe(prev => {
      if (value === 'semua') {
        return ['semua'];
      }

      if (prev.includes('semua')) {
        return [value];
      }

      const updatedFiltersTipe = prev.includes(value)
        ? prev.filter(item => item !== value)
        : [...prev, value];

      return updatedFiltersTipe.length > 0 ? updatedFiltersTipe : ['semua'];
    });
  };

  return (
    <Modal
      animationType="slide"
      transparent
      visible={visible}
      onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalOverlay}>
          {/* <Animated.View
            style={[
              styles.bottomSheetContainer,
              {transform: [{translateY: bottomSheetAnim}]},
            ]}
            {...panResponder.panHandlers}> */}
          <View style={styles.bottomSheetContainer}>
            <TouchableOpacity style={styles.swipeIndicator} onPress={onClose} />
            <View style={styles.headerContainer}>
              <Text style={styles.title}>Filter</Text>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <Ionicons name="close" size={24} color="black" />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.scrollContainer}
              contentContainerStyle={styles.scrollContent}>
              {/* Radius */}
              <Text style={styles.sectionLabel}>Radius</Text>
              <View style={styles.sliderContainer}>
                {/* Tooltip */}
                <Animated.View
                  style={[styles.tooltip, { left: getTooltipPosition(radius) }]}>
                  <Text style={styles.tooltipText}>{radius} km</Text>
                </Animated.View>

                {/* Slider */}
                <Slider
                  style={styles.slider}
                  minimumValue={sliderMin}
                  maximumValue={sliderMax}
                  step={1}
                  value={radius}
                  onValueChange={value => setTempRadius(value)}
                  onSlidingComplete={value => setRadius(value)}
                  minimumTrackTintColor="#f36a1d"
                  maximumTrackTintColor="#ddd"
                  thumbTintColor="#f36a1d"
                />
              </View>
              <View style={styles.sliderLabelRow}>
                <Text style={styles.sliderLabel}>2 km</Text>
                <Text style={styles.sliderLabel}>10 km</Text>
              </View>

              {/* Jenis Bencana */}
              <Text style={styles.sectionLabel}>Jenis Bencana</Text>
              <View style={styles.chipContainer}>
                {disasterOptions.map(item => {
                  const isSelected = jenisBencana.includes(item.value);
                  const iconSource = item.iconSelected
                    ? isSelected
                      ? item.iconSelected
                      : item.iconUnselected
                    : item.iconUnselected;
                  return (
                    <TouchableOpacity
                      key={item.value}
                      style={[styles.chip, isSelected && styles.chipSelected]}
                      onPress={() => toggleJenisBencana(item.value)}>
                      {/* <Ionicons
                          name={item.icon}
                          size={14}
                          color={isSelected ? 'white' : 'black'}
                          style={{marginRight: 5}}
                        /> */}
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
                })}
              </View>

              {/* Tipe */}
              <Text style={styles.sectionLabel}>Tipe</Text>
              <View style={styles.chipContainer}>
                {tipeOptions.map(item => {
                  const isSelected = tipe.includes(item.value);
                  const iconSource = item.iconSelected
                    ? isSelected
                      ? item.iconSelected
                      : item.iconUnselected
                    : item.iconUnselected;
                  return (
                    <TouchableOpacity
                      key={item.value}
                      style={[styles.chip, isSelected && styles.chipSelected]}
                      onPress={() => toggleTipe(item.value)}>
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
                })}
              </View>
              {/* Tanggal */}
              <Text style={styles.sectionLabel}>Tanggal</Text>
              <View style={styles.dateRow}>
                {/* Tanggal Mulai */}
                <View style={{ width: '45%' }}>
                  <Text
                    style={{
                      fontSize: 12,
                    }}>
                    Tanggal Mulai
                  </Text>
                  <TouchableOpacity
                    style={styles.dateBox}
                    onPress={() => setShowStartPicker(true)}>
                    <Ionicons
                      name="calendar-outline"
                      size={16}
                      color="gray"
                      style={styles.dateIcon}
                    />
                    <Text>{formatDate(startDate)}</Text>
                  </TouchableOpacity>
                </View>

                {/* Tanggal Selesai */}
                <View style={{ width: '45%' }}>
                  <Text
                    style={{
                      fontSize: 12,
                    }}>
                    Tanggal Selesai
                  </Text>
                  <TouchableOpacity
                    style={styles.dateBox}
                    onPress={() => setShowEndPicker(true)}>
                    <Ionicons
                      name="calendar-outline"
                      size={16}
                      color="gray"
                      style={styles.dateIcon}
                    />
                    <Text>{formatDate(endDate)}</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {showStartPicker && (
                <DateTimePicker
                  value={startDate}
                  mode="date"
                  display="default"
                  onChange={handleStartDateChange}
                />
              )}

              {showEndPicker && (
                <DateTimePicker
                  value={endDate}
                  mode="date"
                  display="default"
                  onChange={handleEndDateChange}
                />
              )}
            </ScrollView>

            {/* Tombol Aksi */}
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={styles.resetButton}
                onPress={resetFilter}>
                <Text style={{ color: 'black' }}>Reset Filter</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.applyButton}
                onPress={applyFilter}>
                <Text style={{ color: '#FFFFFF' }}>Terapkan Filter</Text>
              </TouchableOpacity>
            </View>
          </View>
          {/* </Animated.View> */}
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default FilterBottomSheet;

const { width, height } = Dimensions.get('window');
const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-end',
  },
  bottomSheetContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '80%',
  },
  swipeIndicator: {
    width: '30%',
    height: 5,
    backgroundColor: '#ccc',
    borderRadius: 10,
    alignSelf: 'center',
    marginVertical: '2%',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  closeButton: { position: 'absolute', right: 16 },
  title: { fontSize: 18, fontWeight: 'bold' },
  scrollContainer: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 16 },
  sectionLabel: { fontWeight: 'bold', marginBottom: 6, marginTop: 10 },
  slider: { width: '100%', height: 40 },
  chipContainer: { flexDirection: 'row', flexWrap: 'wrap', marginVertical: 5 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF00',
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
  },
  chipSelected: { borderColor: '#f36a1d' },
  buttonRow: {
    flexDirection: 'column',
    justifyContent: 'center',
    paddingBottom: '2%',
    width: '100%',
    alignItems: 'center',
  },
  resetButton: {
    backgroundColor: '#FFFFFF00',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    width: '90%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyButton: {
    backgroundColor: '#F36A1D',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    width: '90%',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: '2%',
  },
  sliderLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 2,
  },
  sliderLabel: {
    fontSize: 12,
    color: 'gray',
  },
  sliderContainer: {
    position: 'relative',
    width: '100%',
    alignItems: 'center',
  },
  tooltip: {
    position: 'absolute',
    top: -30,
    backgroundColor: '#e5e5e5',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  tooltipText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: '3%',
  },
  dateBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 8,
    width: '100%',
    marginTop: '3%',
  },
  dateIcon: {
    marginRight: 5,
  },
  iconImage: {
    width: 20,
    height: 15,
    resizeMode: 'contain',
  },
});
