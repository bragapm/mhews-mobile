import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Image,
  useColorScheme,
} from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import { getData } from '../services/apiServices';
import useAuthStore from '../hooks/auth';
import { filterDisasterData } from '../utils/filterDisaster';
import COLORS from '../config/COLORS';

export default function NotificationsScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [notificationsData, setNotificationsData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { token } = useAuthStore();
  const [selectedFilterJenisBencana, setSelectedFilterJenisBencana] = useState<
    string[]
  >(['semua']);
  const [filterData, setFilterData] = useState<any>(null);
  const colors = COLORS();
  const [selectedNotif, setSelectedNotification] = useState<any>(null);
  const [isShowDetail, setIsShowDetail] = useState(false);

  const DisasterCard = ({ item }: { item: any }) => (
    <TouchableOpacity
      onPress={() => {
        setSelectedNotification(item);
        setIsShowDetail(true);
      }}>
      <View style={styles.card}>
        <Text style={styles.title}>{item.type}</Text>
        <Text style={styles.date}>{item.date}</Text>
        <Text style={styles.location}>{item.location}</Text>
        <View style={styles.detailContainer}>
          {item.details.map((detail: any, index: number) => (
            <View key={index} style={styles.detailBox}>
              <Text style={styles.detailLabel}>{detail.label}</Text>
              <Text style={styles.detailValue}>{detail.value}</Text>
            </View>
          ))}
        </View>
      </View>
    </TouchableOpacity>
  );

  const disasters = [
    {
      type: 'Gempa Bumi',
      date: '14 Februari 2025 - 18:30:56 WIB',
      location: 'Kabupaten Cilacap, Jawa Tengah',
      details: [
        { label: 'Kekuatan Gempa', value: '4.5 Magnitudo' },
        { label: 'Kedalaman', value: '5 Kilometer' },
      ],
    },
    {
      type: 'Tsunami',
      date: '14 Februari 2025 - 18:30:56 WIB',
      location: 'Kabupaten Cilacap, Jawa Tengah',
      details: [
        { label: 'Kecepatan Gelombang Air', value: '40 m/s' },
        { label: 'Ketinggian Gelombang Air', value: '20 Meter' },
      ],
    },
    {
      type: 'Banjir',
      date: '14 Februari 2025 - 18:30:56 WIB',
      location: 'Kabupaten Cilacap, Jawa Tengah',
      details: [
        { label: 'Kecepatan Air', value: '70 m/s' },
        { label: 'Ketinggian Muka Air', value: '1.2 Meter' },
      ],
    },
    {
      type: 'Tanah Longsor',
      date: '14 Februari 2025 - 18:30:56 WIB',
      location: 'Kabupaten Cilacap, Jawa Tengah',
      details: [
        { label: 'Volume Material Longsor', value: '1.930 m³' },
        { label: 'Sudut Kemiringan', value: '10° (14%)' },
      ],
    },
  ];

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

  useEffect(() => {
    fetchData();
  }, [filterData]);

  const fetchData = async () => {
    setLoading(true);
    try {
      let filterQuery = '';

      if (!selectedFilterJenisBencana.includes('semua')) {
        filterQuery = `?filter[jenis_bencana][_in]=${selectedFilterJenisBencana.join(
          ',',
        )}&field=*`;
      }

      const [dataBencana] = await Promise.all([
        getData(`items/bencana_alam${filterQuery}`),
      ]);

      setNotificationsData(dataBencana?.data || []);
    } catch (err: any) {
      setError(err.message);
      console.error('Gagal mengambil data:', err);
    } finally {
      setLoading(false);
    }
  };

  const backToProfile = () => {
    if (isShowDetail) {
      setIsShowDetail(false);
    } else {
      navigation.replace('Tabs');
    }
  };

  return (
    <>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="dark-content"
      />
      <View style={styles.container}>
        {/* Tools Header */}
        <View style={styles.headerContainer}>
          {/* Tombol Back */}
          <TouchableOpacity
            style={[styles.headerBackButton, { backgroundColor: colors.bg }]}
            onPress={backToProfile}>
            <AntDesign name="arrowleft" size={24} color={colors.text} />
          </TouchableOpacity>

          {/* Search Bar */}
          <View style={styles.header}>
            <Text style={styles.titleText}>
              {isShowDetail ? "Bagikan Info Bencana" : "Notifikasi"}
            </Text>
          </View>

          {/* Filter Bencana */}
          {!isShowDetail && (
            <FlatList
              data={[
                {
                  jenis_bencana: 'semua',
                  label: 'Semua Bencana',
                  iconSelected: null,
                  iconUnselected: null,
                },
                ...filterDisasterData,
              ]}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={item => item.jenis_bencana}
              renderItem={({ item }) => {
                const isSelected = selectedFilterJenisBencana.includes(
                  item.jenis_bencana,
                );
                const iconSource = item.iconSelected
                  ? isSelected
                    ? item.iconSelected
                    : item?.iconUnselected && colorScheme
                      ? item.iconUnselected[colorScheme]
                      : null
                  : null;

                return (
                  <TouchableOpacity
                    style={[
                      styles.chip,
                      isSelected && styles.chipSelected,
                      { backgroundColor: colors.bg }, // Override backgroundColor
                    ]}
                    onPress={() => handleFilterPress(item.jenis_bencana)}>
                    {iconSource && (
                      <Image source={iconSource} style={styles.iconImage} />
                    )}
                    <Text
                      style={{
                        color: isSelected ? '#F36A1D' : colors.text,
                        fontSize: 12,
                      }}>
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                );
              }}
            />
          )}
        </View>

        {!isShowDetail ? (
          <>
            <ScrollView style={styles.listContainer}>
              <FlatList
                data={disasters}
                keyExtractor={(item) => item.type}
                renderItem={({ item }) => <DisasterCard item={item} />}
              />
            </ScrollView>
          </>
        ) : (
          <ScrollView style={styles.detailNotifContainer}>
            <View style={styles.card}>
              <Text style={styles.title}>{selectedNotif.type}</Text>
              <Text style={styles.date}>{selectedNotif.date}</Text>
              <Text style={styles.location}>{selectedNotif.location}</Text>
              <View style={styles.detailContainer}>
                {selectedNotif.details.map((detail: any, index: number) => (
                  <View key={index} style={styles.detailBox}>
                    <Text style={styles.detailLabel}>{detail.label}</Text>
                    <Text style={styles.detailValue}>{detail.value}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.contentNotif}>
                {/* Lokasi */}
                <Text style={[styles.cardTitleData, { color: colors.text }]}>
                  Lokasi
                </Text>
                <Text style={[styles.cardDescription, , { color: colors.info }]}>
                  {selectedNotif?.geom?.coordinates?.[1]},{' '}
                  {selectedNotif?.geom?.coordinates?.[0]}
                </Text>

                {/* Tipe Bencana */}
                <Text style={[styles.cardTitleData, { color: colors.text }]}>
                  Tipe Bencana
                </Text>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>Resiko Bencana</Text>
                </View>

                {/* Wilayah Terdampak */}
                <Text style={[styles.cardTitleData, { color: colors.text }]}>
                  Wilayah Terdampak
                </Text>
                <Text style={[styles.cardDescription, { color: colors.info }]}>
                  {selectedNotif?.wilayah || '-'}
                </Text>

                {/* Saran & Arahan */}
                <Text style={[styles.cardTitleData, { color: colors.text }]}>
                  Rekomendasi BMKG
                </Text>
                <Text style={[styles.cardDetails, { color: colors.info }]}>
                  {selectedNotif?.saran_bmkg || '-'}
                </Text>

                <Text style={[styles.cardTitleData, { color: colors.text }]}>
                  Arahan Evakuasi
                </Text>
                <Text style={[styles.cardDetails, { color: colors.info }]}>
                  {selectedNotif?.arahan || '-'}
                </Text>
              </View>
            </View>
          </ScrollView>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  card: { backgroundColor: '#fff', padding: 15, borderRadius: 8, marginBottom: 10 },
  title: { fontSize: 16, fontWeight: 'bold' },
  date: { fontSize: 12, color: '#888' },
  location: { fontSize: 14, color: '#E74C3C', marginBottom: 10 },
  detailContainer: { flexDirection: 'row', flexWrap: 'wrap', width: '100%' },
  detailBox: { flex: 1, backgroundColor: '#EEE', padding: 10, borderRadius: 5, minWidth: '48%', margin: 2 },
  detailLabel: { fontSize: 12, color: '#555' },
  detailValue: { fontSize: 14, fontWeight: 'bold', color: '#F36A1D' },
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
  listContainer: {
    marginTop: "45%",
    paddingHorizontal: 15,
  },
  detailNotifContainer: {
    marginTop: "30%",
    paddingHorizontal: 10,
  },
  headerBackButton: {
    position: 'absolute',
    top: 20,
    left: 15,
    backgroundColor: 'rgb(255, 255, 255)',
    borderRadius: 10,
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
  chipSelected: { borderColor: '#F36A1D' },
  iconImage: {
    width: 20,
    height: 15,
    resizeMode: 'contain',
  },
  header: {
    flex: 1,
    height: 40,
    justifyContent: 'center',
    marginBottom: 20
  },
  titleText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  contentNotif: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: 'grey',
    borderRadius: 10,
    padding: 10,
  },
  cardTitleData: {
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 5,
  },
  cardDetails: {
    fontSize: 12,
    marginVertical: 5,
    color: 'grey',
  },
  cardDescription: {
    fontSize: 12,
    color: 'grey',
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
});
