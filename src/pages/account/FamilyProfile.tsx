import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ImageBackground,
  useColorScheme,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  TextInput,
  ActivityIndicator,
  Image,
  Dimensions,
  Alert,
  FlatList, // <- pastikan import FlatList
} from 'react-native';

import useAuthStore from '../../hooks/auth';
import COLORS from '../../config/COLORS';
import { useAlert } from '../../components/AlertContext';
import { HeaderNav } from '../../components/Header';
import ModalRemoveData from '../../components/ModalRemoveData';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/types';
import { useNavigation } from '@react-navigation/native';
import { getData } from '../../services/apiServices';

// Data dummy hanya untuk TAB "Cari Kerabat"
const DUMMY_USERS = [
  {
    id: 1,
    name: 'Fakhry Hasan',
    location: 'Kebumen, Jawa Tengah',
    nik: '3202842211880004',
    phone: '+6281234567893',
    email: 'userhasan@email.com',
  },
  {
    id: 2,
    name: 'Rama Dhea Yudhistira',
    location: 'Bandung, Jawa Barat',
    nik: '3202842211880001',
    phone: '+6281234567880',
    email: 'kerabat@example.com',
  },
  {
    id: 3,
    name: 'Budi Santoso',
    location: 'Jakarta',
    nik: '3202842211880002',
    phone: '+6281234567892',
    email: 'budi@example.com',
  },
];

// Helper untuk mengambil inisial nama
function getInitials(fullName: string) {
  return fullName
    .split(' ')
    .map(word => word[0]?.toUpperCase() || '')
    .join('');
}

export default function FamilyProfileScreen() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const colorScheme = useColorScheme();
  const colors = COLORS();
  const { showAlert } = useAlert();
  const infoIcon = require('../../assets/images/resikoBahayaActive.png');

  // ========== State & store dari Auth ==========
  const { profile, getProfile } = useAuthStore();
  const reset = useAuthStore(state => state.reset);

  // ========== Loading & error ==========
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ========== Tab management ==========
  // Mengatur tab mana yang aktif: "DaftarKerabat" atau "CariKerabat"
  const [activeTab, setActiveTab] = useState<'DaftarKerabat' | 'CariKerabat'>(
    'DaftarKerabat',
  );

  // ========== State untuk Daftar Kerabat ==========
  const [friendLists, setFriendLists] = useState<any[]>([]);
  const [isShowDetailFamily, setIsShowDetailFamily] = useState(false);
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState<boolean>(false);

  // ========== State untuk Cari Kerabat ==========
  const [email, setEmail] = useState('');
  const [searchResult, setSearchResult] = useState<any[]>([]);
  const [selectedSearchUser, setSelectedSearchUser] = useState<any | null>(
    null,
  );
  const [isAdding, setIsAdding] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  // Background
  const backgroundSource =
    colorScheme === 'dark'
      ? require('../../assets/images/bg-page-dark.png')
      : require('../../assets/images/bg-page-light.png');

  useEffect(() => {
    getProfile();
    fetchDataFriends();
  }, []);

  // Ambil data friendList dari API
  const fetchDataFriends = async () => {
    setLoading(true);
    try {
      // Panggil API via getData
      const [friendlist] = await Promise.all([
        getData('items/friend_list?fields=*,friends.*'),
      ]);
      console.log('friendlist:', friendlist);

      // Simpan hasil ke state
      setFriendLists(friendlist?.data || []);
    } catch (err: any) {
      setError(err.message);
      console.error('Gagal mengambil data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Tombol kembali ke halaman utama (Tabs)
  const backToProfile = () => {
    if (isShowDetailFamily) {
      setIsShowDetailFamily(false);
    } else {
      navigation.replace('Tabs');
    }
  };

  // =======================
  // =     DAFTAR KERABAT  =
  // =======================
  const handleMemberDetail = (member: any) => {
    if (!member.confirmation) {
      return;
    }
    setSelectedMember(member);
    setIsShowDetailFamily(true);
  };

  const handleRemoveMember = (member: any) => {
    setSelectedMember(member);
    setModalVisible(true);
  };

  const confirmRemoveMember = () => {
    if (selectedMember) {
      showAlert(
        'success',
        `Member ${selectedMember?.friends?.first_name} dihapus!`,
      );
      setModalVisible(false);
      // Lakukan aksi hapus di API jika perlu
    }
  };

  const renderDaftarKerabat = () => {
    if (!isShowDetailFamily) {
      // ========== Tampilan LIST Kerabat ==========
      return (
        <View style={[styles.cardContainer, { backgroundColor: colors.bg }]}>
          <Text style={[styles.subTitle, { color: colors.text }]}>
            Tambahkan daftar kerabat anda dan dapatkan notifikasi ketika terjadi
            bencana
          </Text>
          <View
            style={{
              width: '100%',
              flexDirection: 'row',
              justifyContent: 'space-between',
              borderRadius: 10,
              backgroundColor: colors.gradientStartProfile,
              borderColor: '#CD541B',
              borderWidth: 1,
              paddingHorizontal: '2%',
              paddingVertical: '2%',
              marginBottom: '5%',
            }}>
            <View>
              <Image source={infoIcon} style={styles.iconInfo} />
            </View>
            <View>
              <Text style={[styles.textOption, { color: colors.info }]}>
                Anda bisa mendapatkan notifikasi jika kerabat anda telah
                menginstall aplikasi MHEWS
              </Text>
            </View>
          </View>

          {loading ? (
            <ActivityIndicator style={{ marginTop: 20 }} />
          ) : (
            <FlatList
              data={[{ id: 'add-kerabat' }, ...friendLists]}
              keyExtractor={(item, index) => item.id.toString()}
              numColumns={2}
              columnWrapperStyle={{ justifyContent: 'flex-start', gap: 12 }}
              ListEmptyComponent={() =>
                !loading && (
                  <Text style={{ textAlign: 'center', marginTop: 10 }}>
                    Tidak ada kerabat
                  </Text>
                )
              }
              renderItem={({ item }) => {
                if (item.id === 'add-kerabat') {
                  return (
                    <TouchableOpacity
                      onPress={() => navigation.navigate('FindFamily')}
                      style={{
                        backgroundColor: 'transparent',
                        borderWidth: 1,
                        borderColor: '#FF7A00',
                        borderStyle: 'dashed',
                        borderRadius: 10,
                        width: '47%',
                        aspectRatio: 1,
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: 16,
                        marginBottom: 12,
                      }}>
                      <Text
                        style={{
                          fontSize: 30,
                          color: '#FF7A00',
                          fontWeight: 'bold',
                        }}>
                        +
                      </Text>
                      <Text style={{ color: '#FF7A00', marginTop: 4 }}>
                        Tambah Kerabat
                      </Text>
                    </TouchableOpacity>
                  );
                }

                return (
                  <TouchableOpacity
                    onPress={() => handleMemberDetail(item)}
                    style={{
                      backgroundColor: colors.cardBackground,
                      borderRadius: 10,
                      width: '47%',
                      aspectRatio: 1,
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: 16,
                      marginBottom: 12,
                      borderWidth: item.confirmation === false ? 2 : 0,
                      borderColor: item.confirmation === false ? 'red' : 'transparent',
                    }}>
                    <View style={{ alignItems: 'center' }}>
                      <View
                        style={{
                          width: 45,
                          height: 45,
                          borderRadius: 22.5,
                          backgroundColor: '#FF7A00',
                          justifyContent: 'center',
                          alignItems: 'center',
                          marginBottom: 8,
                        }}>
                        <Text style={{ color: '#FFF', fontWeight: 'bold' }}>
                          {`${item?.friends?.first_name?.charAt(0) ?? ''}${item?.friends?.last_name?.charAt(0) ?? ''
                            }`}
                        </Text>
                      </View>
                      <Text
                        style={{
                          fontSize: 14,
                          fontWeight: '500',
                          color: colors.text,
                          textAlign: 'center',
                        }}
                        numberOfLines={1}>
                        {item?.friends?.first_name} {item?.friends?.last_name}
                      </Text>
                      <Text
                        style={{
                          fontSize: 12,
                          color: colors.info,
                          marginTop: 4,
                          textAlign: 'center',
                        }}>
                        {item?.relation ?? '-'}
                      </Text>
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          marginTop: 6,
                        }}>
                        <View
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: 4,
                            backgroundColor: item?.isOnline
                              ? '#34C759'
                              : '#aaa',
                            marginRight: 4,
                          }}
                        />
                        <Text style={{ fontSize: 12, color: colors.info }}>
                          {item?.isOnline ? 'Online' : 'Offline'}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              }}
            />
          )}
        </View>
      );
    } else {
      // ========== Tampilan DETAIL Kerabat ==========
      return (
        <View style={styles.cardContainer}>
          <View style={styles.memberContainerDetailFamily}>
            <View style={styles.headerMemberDetail}>
              <View style={styles.memberInitials}>
                <Text style={styles.initialsText}>
                  {`${selectedMember?.friends?.first_name?.charAt(0) ?? ''}${selectedMember?.friends?.last_name?.charAt(0) ?? ''
                    }`}
                </Text>
              </View>
              <View style={styles.memberInfo}>
                <Text style={styles.memberName}>
                  {selectedMember?.friends?.first_name}{' '}
                  {selectedMember?.friends?.last_name}
                </Text>
                <Text style={styles.memberLocation}>
                  {selectedMember?.friends?.location
                    ? selectedMember?.friends?.location
                    : '-'}
                </Text>
              </View>
            </View>

            {/* Info lainnya */}
            <View style={styles.memberContainerDetail}>
              <Text style={styles.memberName}>NIK</Text>
              <Text style={styles.memberLocation}>
                {selectedMember?.friends?.NIK
                  ? selectedMember?.friends?.NIK
                  : '-'}
              </Text>
            </View>
            <View style={styles.memberContainerDetail}>
              <Text style={styles.memberName}>No. Handphone</Text>
              <Text style={styles.memberLocation}>
                {selectedMember?.friends?.phone
                  ? selectedMember?.friends?.phone
                  : '-'}
              </Text>
            </View>
            <View style={styles.memberContainerDetail}>
              <Text style={styles.memberName}>Email</Text>
              <Text style={styles.memberLocation}>
                {selectedMember?.friends?.email
                  ? selectedMember?.friends?.email
                  : '-'}
              </Text>
            </View>

            {/* Tombol Hapus Kerabat */}
            <TouchableOpacity
              style={styles.outlineButton}
              onPress={() => handleRemoveMember(selectedMember)}
              disabled={loading}>
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.outlineButtonText}>Hapus Kerabat</Text>
              )}
            </TouchableOpacity>

            {/* Tombol kembali ke list */}
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => {
                setIsShowDetailFamily(false);
                setSelectedMember(null);
              }}>
              <Text style={styles.backButtonText}>Kembali ke daftar</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }
  };

  // =======================
  // =     CARI KERABAT    =
  // =======================
  const handleSearch = () => {
    const filtered = DUMMY_USERS.filter(user =>
      user.email.toLowerCase().includes(email.trim().toLowerCase()),
    );
    setSearchResult(filtered);
    // Reset detail
    setSelectedSearchUser(null);
    setIsAdded(false);
    setIsAdding(false);
  };

  const handleSelectUser = (user: any) => {
    setSelectedSearchUser(user);
    setIsAdded(false);
    setIsAdding(false);
  };

  const handleAddFriend = async () => {
    try {
      setIsAdding(true);
      // Simulasi panggil API 2 detik
      setTimeout(() => {
        setIsAdding(false);
        setIsAdded(true);
      }, 2000);
    } catch (error) {
      setIsAdding(false);
      Alert.alert('Error', 'Gagal menambahkan kerabat.');
    }
  };

  const handleBackToList = () => {
    setSelectedSearchUser(null);
    setIsAdded(false);
    setIsAdding(false);
  };

  const kerabatIcon =
    colorScheme === 'dark'
      ? require('../../assets/images/kerabat-dark.png')
      : require('../../assets/images/kerabat-light.png');

  const renderCariKerabat = () => {
    // Jika sudah pilih user, tampilkan DETAIL
    if (selectedSearchUser) {
      return (
        <View
          style={[
            styles.detailCard,
            {
              backgroundColor: colors.cardBackground,
              borderColor: colors.border,
            },
          ]}>
          <View style={styles.detailHeader}>
            <View style={styles.avatarContainerBig}>
              <Text style={styles.avatarTextBig}>
                {getInitials(selectedSearchUser.name)}
              </Text>
            </View>
            <View style={styles.detailInfo}>
              <Text style={[styles.detailName, { color: colors.text }]}>
                {selectedSearchUser.name}
              </Text>
              <Text style={[styles.detailLocation, { color: colors.info }]}>
                {selectedSearchUser.location}
              </Text>
            </View>
          </View>

          {/* Info lengkap */}
          <View style={{ marginTop: 10 }}>
            <Text style={[styles.detailLabel, { color: colors.text }]}>NIK</Text>
            <Text style={[styles.detailValue, { color: colors.info }]}>
              {selectedSearchUser.nik || '-'}
            </Text>

            <Text style={[styles.detailLabel, { color: colors.text }]}>
              No. Handphone
            </Text>
            <Text style={[styles.detailValue, { color: colors.info }]}>
              {selectedSearchUser.phone || '-'}
            </Text>

            <Text style={[styles.detailLabel, { color: colors.text }]}>
              Email
            </Text>
            <Text style={[styles.detailValue, { color: colors.info }]}>
              {selectedSearchUser.email}
            </Text>
          </View>

          {/* Tombol Tambah Kerabat */}
          <View style={{ marginTop: 20 }}>
            {isAdded ? (
              <View
                style={[styles.addedButton, { backgroundColor: colors.text }]}>
                <Text
                  style={[styles.addedButtonText, { color: colors.background }]}>
                  ✓ Kerabat Ditambahkan
                </Text>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.addButtonDetail}
                onPress={handleAddFriend}
                disabled={isAdding}>
                {isAdding ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.addButtonDetailText}>Tambah Kerabat</Text>
                )}
              </TouchableOpacity>
            )}
          </View>

          {/* Tombol kembali ke daftar */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBackToList}>
            <Text style={styles.backButtonText}>Kembali ke daftar</Text>
          </TouchableOpacity>
        </View>
      );
    }

    // Jika belum pilih user => tampilkan form pencarian & hasil
    return (
      <View style={styles.cardContainer}>
        <Text style={[styles.desc, { color: colors.info }]}>
          Temukan profil kerabat anda untuk ditambahkan dengan alamat email yang
          terdaftar
        </Text>

        {/* Input pencarian */}
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
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Text style={styles.searchButtonText}>Cari</Text>
        </TouchableOpacity>

        <Text style={[styles.resultTitle, { color: colors.text }]}>
          Hasil Pencarian
        </Text>

        {/* Jika belum ada hasil */}
        {searchResult.length === 0 ? (
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
        ) : (
          // Jika ada hasil
          <View style={styles.resultContainer}>
            {searchResult.map(item => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.userCard,
                  { backgroundColor: colors.cardBackground },
                ]}
                onPress={() => handleSelectUser(item)}>
                {/* Avatar Inisial */}
                <View style={styles.avatarContainer}>
                  <Text style={styles.avatarText}>
                    {getInitials(item.name)}
                  </Text>
                </View>

                {/* Info singkat */}
                <View style={styles.infoContainer}>
                  <Text style={[styles.nameText, { color: colors.text }]}>
                    {item.name}
                  </Text>
                  <Text style={[styles.locationText, { color: colors.info }]}>
                    {item.location}
                  </Text>
                  <Text style={[styles.emailText, { color: colors.text }]}>
                    {item.email}
                  </Text>
                </View>

                {/* Tombol Tambah */}
                <View style={{ marginTop: 20 }}>
                  {isAdded ? (
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
                    <TouchableOpacity
                      style={[
                        styles.addButton,
                        { backgroundColor: colors.cardBackground },
                      ]}
                      onPress={handleAddFriend}>
                      {isAdding ? (
                        <ActivityIndicator color="#FF7A00" />
                      ) : (
                        <Text
                          style={[styles.addButtonText, { color: colors.text }]}>
                          + Tambahkan
                        </Text>
                      )}
                    </TouchableOpacity>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    );
  };

  // ========== Render utama ==========
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
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.container}>
            {/* Header */}
            <HeaderNav onPress={backToProfile} title="Pantau Kerabat" />

            {/* TAB BAR Sederhana */}
            <View style={styles.tabContainer}>
              <TouchableOpacity
                style={[
                  styles.tabButton,
                  activeTab === 'DaftarKerabat' && styles.tabButtonActive,
                ]}
                onPress={() => setActiveTab('DaftarKerabat')}>
                <Text
                  style={[
                    styles.tabText,
                    activeTab === 'DaftarKerabat' && styles.tabTextActive,
                  ]}>
                  Daftar Kerabat
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.tabButton,
                  activeTab === 'CariKerabat' && styles.tabButtonActive,
                ]}
                onPress={() => setActiveTab('CariKerabat')}>
                <Text
                  style={[
                    styles.tabText,
                    activeTab === 'CariKerabat' && styles.tabTextActive,
                  ]}>
                  Permintaan
                </Text>
              </TouchableOpacity>
            </View>

            {/* Konten per tab */}
            {activeTab === 'DaftarKerabat'
              ? renderDaftarKerabat()
              : renderCariKerabat()}
          </View>
        </ScrollView>

        {/* Modal Hapus */}
        <ModalRemoveData
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          onConfirm={confirmRemoveMember}
          title={`Anda yakin untuk hapus kerabat ${selectedMember?.friends?.first_name ?? ''
            }?`}
          message={`Dengan menghapus kerabat, anda tidak dapat berbagi aktivitas dan memantau kerabat ini. Apakah anda yakin?`}
        />
      </ImageBackground>
    </>
  );
}

// ========== STYLING ==========
const { width } = Dimensions.get('window');
const avatarSize = width * 0.12;

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  container: {
    flex: 1,
    padding: 16,
    marginTop: '5%',
  },
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },

  // Header
  subTitle: {
    fontSize: 14,
    textAlign: 'left',
    color: '#666',
    marginBottom: 10,
    marginLeft: 10,
  },

  // TAB
  tabContainer: {
    flexDirection: 'row',
    marginTop: 8,
    marginBottom: 16,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: '#EEE',
    marginRight: 4,
    borderRadius: 8,
    alignItems: 'center',
  },
  tabButtonActive: {
    backgroundColor: '#FF7A00',
  },
  tabText: {
    color: '#777',
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#FFF',
  },

  // Card container
  cardContainer: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    minHeight: 400,
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  textOption: {
    marginLeft: 10,
    marginBottom: 5,
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'left',
  },

  // ========== DAFTAR KERABAT STYLE ==========
  memberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    marginLeft: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
  },
  memberContainerDetailFamily: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
  },
  headerMemberDetail: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberContainerDetail: {
    marginTop: 8,
  },
  memberInitials: {
    backgroundColor: '#FFA500',
    width: avatarSize,
    height: avatarSize,
    borderRadius: avatarSize / 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  initialsText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: avatarSize * 0.4,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  memberLocation: {
    fontSize: 14,
    color: '#666',
  },
  removeButton: {
    borderWidth: 1,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderColor: '#E64040',
    borderRadius: 12,
  },
  removeText: {
    color: '#E64040',
    fontSize: 14,
    fontWeight: '500',
  },
  outlineButton: {
    borderWidth: 2,
    borderColor: '#E64040',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    width: '100%',
    marginTop: 20,
  },
  outlineButtonText: {
    color: '#E64040',
    fontSize: 16,
    fontWeight: '600',
  },

  // Tombol "kembali ke daftar" di detail
  backButton: {
    marginTop: 20,
    alignSelf: 'center',
  },
  backButtonText: {
    color: '#FF7A00',
    textDecorationLine: 'underline',
    fontWeight: '500',
  },

  // ========== CARI KERABAT STYLE ==========
  desc: {
    marginTop: 16,
    fontSize: 14,
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

  // Detail di Cari Kerabat
  detailCard: {
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

  // Tambahan style untuk teks di tombol + (cari kerabat)
  addButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
  },

  // Tombol + di list pencarian
  addButton: {
    backgroundColor: '#FFF',
    borderColor: '#777674',
    borderWidth: 1,
    borderRadius: 4,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  addedButtonTextList: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 12,
  },
  iconImage: {
    width: 50,
    height: 30,
    resizeMode: 'contain',
  },
  iconInfo: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
  },
});
