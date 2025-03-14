import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StatusBar,
  useColorScheme,
  ImageBackground,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import COLORS from '../../config/COLORS';
import { HeaderNav } from '../../components/Header';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/types';
import { getData, postData } from '../../services/apiServices';
import { useAlert } from '../../components/AlertContext';
import useAuthStore from '../../hooks/auth';

function getInitials(fullName: string) {
  return fullName
    .split(' ')
    .map(word => word[0]?.toUpperCase() || '')
    .join('');
}

export default function FindFamilyScreen() {
  const colorScheme = useColorScheme();
  const colors = COLORS();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const backgroundSource =
    colorScheme === 'dark'
      ? require('../../assets/images/bg-page-dark.png')
      : require('../../assets/images/bg-page-light.png');
  const { showAlert } = useAlert();
  const { profile, getProfile } = useAuthStore();

  // ========== Loading & error ==========
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // State pencarian
  const [email, setEmail] = useState('');
  const [searchResult, setSearchResult] = useState<any[]>([]);

  // State detail
  const [selectedUser, setSelectedUser] = useState<any | null>(null);

  // State untuk tombol tambah
  const [isAdding, setIsAdding] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  useEffect(() => {
    getProfile();
  }, []);

  // Kembali ke tab
  const backToProfile = () => {
    navigation.replace('FamilyProfile');
  };

  // Pencarian
  const handleSearch = async () => {
    setLoading(true);
    try {
      // Panggil API via getData
      const [findFriend] = await Promise.all([
        getData(`users?filter[email][_icontains]=${email}`),
      ]);

      // Simpan hasil ke state
      setSearchResult(findFriend?.data || []);
      // Reset detail
      setSelectedUser(null);
      setIsAdded(false);
      setIsAdding(false);
    } catch (err: any) {
      setError(err.message);
      console.error('Gagal mengambil data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Ketika user menekan salah satu hasil, tampilkan detail
  const handleSelectUser = (user: any) => {
    setSelectedUser(user);
    setIsAdded(false);
    setIsAdding(false);
  };

  // Tombol Tambah Kerabat
  const handleAddFriend = async (selectedUser: any) => {
    try {
      setIsAdding(true);
      try {
        const data = {
          "user": profile?.id,
          "friends": selectedUser?.id,
          "confirmation": false
        }
        const response = await postData('/items/friend_list', data);
        if (response?.data) {
          setIsAdding(false);
          setSelectedUser(null);
          showAlert("success", "Permintaan kerabat berhasil di kirim.");
          backToProfile();
        } else {
          setLoading(false);
          showAlert('error', 'Login Gagal!');
        }
      } catch (error: any) {
        showAlert('error', error.message);
      }
    } catch (error) {
      setIsAdding(false);
      showAlert('error', 'Gagal menambahkan kerabat.');
    }
  };

  // Tombol untuk kembali ke list (opsional)
  const handleBackToList = () => {
    setSelectedUser(null);
    setIsAdded(false);
    setIsAdding(false);
    backToProfile();
  };

  const kerabatIcon =
    colorScheme === 'dark'
      ? require('../../assets/images/kerabat-dark.png')
      : require('../../assets/images/kerabat-light.png');

  // Render daftar hasil pencarian
  const renderResultList = () => {
    if (searchResult.length === 0) {
      return (
        <View style={styles.noResultContainer}>
          <Image source={kerabatIcon} style={styles.iconImage} />
          <Text style={[styles.noResultTitle, { color: colors.info }]}>
            Tidak Ada Hasil Kerabat
          </Text>
          <Text style={[styles.noResultDesc, { color: colors.info }]}>
            Silahkan memasukkan alamat email yang benar pada kolom pencarian
            diatas
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.resultContainer}>
        {searchResult.map(item => (
          <TouchableOpacity
            key={item.id}
            style={[styles.userCard, { backgroundColor: colors.cardBackground }]}
            onPress={() => handleSelectUser(item)}>
            {/* Avatar Inisial */}
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarText}>{getInitials((item?.first_name + item?.last_name) || '-')}</Text>
            </View>

            {/* Info singkat */}
            <View style={styles.infoContainer}>
              <Text style={[styles.nameText, { color: colors.text }]}>
                {item.first_name} {item.last_name}
              </Text>
              <Text style={[styles.locationText, { color: colors.info }]}>
                {item.location}
              </Text>
              <Text style={[styles.emailText, { color: colors.text }]}>
                {item.email}
              </Text>
            </View>
            <View style={{ marginTop: 20 }}>
              {isAdded ? (
                // Sudah berhasil ditambahkan
                <View
                  style={[
                    styles.addButton,
                    { backgroundColor: colors.text },
                  ]}>
                  <Text
                    style={[
                      styles.addedButtonText,
                      { color: colors.background },
                    ]}>
                    ✓
                  </Text>
                </View>
              ) : (
                // Belum ditambahkan
                <TouchableOpacity
                  style={[
                    styles.addButton,
                    { backgroundColor: colors.cardBackground },
                  ]}
                  onPress={() => handleAddFriend(item)}>
                  {isAdding ? (
                    <ActivityIndicator color="#FF7A00" />
                  ) : (
                    <Text style={[styles.addButtonText, { color: colors.text }]}>
                      + Tambahkan
                    </Text>
                  )}
                </TouchableOpacity>
              )}
            </View>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  // Render tampilan detail user
  const renderDetail = () => {
    if (!selectedUser) return null; // kalau belum pilih, tidak render apa2

    return (
      <View
        style={[
          styles.detailCard,
          { backgroundColor: colors.cardBackground, borderColor: colors.border },
        ]}>
        {/* Avatar */}
        <View style={styles.detailHeader}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>{getInitials((selectedUser?.first_name + selectedUser?.last_name) || '-')}</Text>
          </View>

          {/* Info singkat */}
          <View style={styles.infoContainer}>
            <Text style={[styles.nameText, { color: colors.text }]}>
              {selectedUser.first_name} {selectedUser.last_name}
            </Text>
            <Text style={[styles.detailLocation, , { color: colors.info }]}>
              {selectedUser.location}
            </Text>
          </View>
        </View>

        {/* Info Lengkap */}
        <View style={{ marginTop: 10 }}>
          <Text style={[styles.detailLabel, , { color: colors.text }]}>NIK</Text>
          <Text style={[styles.detailValue, { color: colors.info }]}>
            {selectedUser.nik || '-'}
          </Text>

          <Text style={[styles.detailLabel, , { color: colors.text }]}>
            No. Handphone
          </Text>
          <Text style={[styles.detailValue, { color: colors.info }]}>
            {selectedUser.phone || '-'}
          </Text>

          <Text style={[styles.detailLabel, { color: colors.text }]}>Email</Text>
          <Text style={[styles.detailValue, { color: colors.info }]}>
            {selectedUser.email}
          </Text>
        </View>

        {/* Tombol Tambah Kerabat */}
        <View style={{ marginTop: 20 }}>
          {isAdded ? (
            // Sudah berhasil ditambahkan
            <View style={[styles.addedButton, { backgroundColor: colors.text }]}>
              <Text
                style={[styles.addedButtonText, { color: colors.background }]}>
                ✓ Kerabat Ditambahkan
              </Text>
            </View>
          ) : (
            // Belum ditambahkan
            <TouchableOpacity
              style={styles.addButtonDetail}
              onPress={() => handleAddFriend(selectedUser)}
              disabled={isAdding}>
              {isAdding ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.addButtonDetailText}>Tambah Kerabat</Text>
              )}
            </TouchableOpacity>
          )}
        </View>

        {/* Tombol back ke list (opsional) */}
        <TouchableOpacity style={styles.backButton} onPress={handleBackToList}>
          <Text style={styles.backButtonText}>Kembali ke daftar</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <>
      <StatusBar
        translucent={true}
        backgroundColor="transparent"
        barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'}
      />
      <ImageBackground
        source={backgroundSource}
        style={styles.background}
        resizeMode="cover">
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}>
          <View style={styles.container}>
            {/* Header */}
            <HeaderNav onPress={backToProfile} title="Cari Kerabat" />

            {/* Card Container */}
            <View
              style={[
                styles.contentOption,
                {
                  backgroundColor: colorScheme === 'dark' ? '#1c1c1c' : '#fff',
                  borderRadius: 12,
                  height: '95%',
                  marginTop: '5%',
                  paddingVertical: '4%',
                  paddingHorizontal: 16,
                },
              ]}>
              {/* Deskripsi pencarian */}
              {!selectedUser && (
                <Text style={[styles.desc, { color: colors.info }]}>
                  Temukan profil kerabat anda untuk ditambahkan dengan alamat
                  email yang terdaftar
                </Text>
              )}

              {/* Input (hanya tampil jika belum pilih user detail) */}
              {!selectedUser && (
                <>
                  <View style={styles.searchContainer}>
                    <TextInput
                      placeholder="Masukkan Alamat Email"
                      placeholderTextColor="#999"
                      style={styles.input}
                      value={email}
                      onChangeText={setEmail}
                    />
                  </View>

                  {/* Tombol Cari */}
                  <TouchableOpacity
                    style={styles.searchButton}
                    disabled={loading}
                    onPress={handleSearch}>
                    <Text style={styles.searchButtonText}>
                      {loading ? "Sedang diproses..." : "Cari"}
                    </Text>
                  </TouchableOpacity>

                  {/* Hasil Pencarian */}
                  <Text style={[styles.resultTitle, { color: colors.text }]}>
                    Hasil Pencarian
                  </Text>
                </>
              )}

              {/* Jika belum pilih user => tampilkan list, kalau sudah => detail */}
              {selectedUser ? renderDetail() : renderResultList()}
            </View>
          </View>
        </ScrollView>
      </ImageBackground>
    </>
  );
}

// ================== STYLING ==================
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
  container: {
    flex: 1,
    padding: 16,
    marginTop: '5%',
  },
  contentOption: {
    borderRadius: 12,
    width: '100%',
  },
  desc: {
    marginTop: 16,
    fontSize: 14,
    color: '#555',
    marginBottom: 12,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  input: {
    flex: 1,
    height: 40,
    backgroundColor: '#FFF',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#CCC',
  },
  searchButton: {
    backgroundColor: '#FF7A00',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '5%',
  },
  searchButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  noResultContainer: {
    alignItems: 'center',
    marginTop: 30,
  },
  noResultTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  noResultDesc: {
    marginTop: 6,
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  resultContainer: {
    marginTop: 12,
  },

  // ========== LIST CARD ==========
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    marginBottom: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E2E1DF',
  },
  avatarContainer: {
    width: 45,
    height: 45,
    borderRadius: 45 / 2,
    backgroundColor: '#FF7A00',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  infoContainer: {
    flex: 1,
  },
  nameText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  locationText: {
    fontSize: 12,
    color: '#666',
    marginVertical: 2,
  },
  emailText: {
    fontSize: 12,
    color: '#999',
  },

  // ========== DETAIL CARD ==========
  detailCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E1DF',
    padding: 16,
    marginTop: 12,
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainerBig: {
    width: 60,
    height: 60,
    borderRadius: 60 / 2,
    backgroundColor: '#FF7A00',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarTextBig: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: 'bold',
  },
  detailInfo: {
    flex: 1,
  },
  detailName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  detailLocation: {
    fontSize: 14,
    color: '#666',
  },
  detailLabel: {
    marginTop: 8,
    fontSize: 12,
    color: '#888',
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    marginTop: 2,
  },

  // Tombol "Tambah Kerabat"
  addButtonDetail: {
    backgroundColor: '#FF7A00',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonDetailText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 14,
  },

  // Saat sudah berhasil
  addedButton: {
    backgroundColor: '#333',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  addedButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 14,
  },

  // Tombol kembali ke list (opsional)
  backButton: {
    marginTop: 20,
    alignSelf: 'center',
  },
  backButtonText: {
    color: '#FF7A00',
    textDecorationLine: 'underline',
    fontWeight: '500',
  },
  addButton: {
    backgroundColor: '#FFF',
    borderColor: '#777674',
    borderWidth: 1,
    borderRadius: 4,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  addButtonText: {
    color: '#777674',
    fontWeight: 'bold',
    fontSize: 12,
  },
  iconImage: {
    width: 50,
    height: 30,
    resizeMode: 'contain',
  },
});
