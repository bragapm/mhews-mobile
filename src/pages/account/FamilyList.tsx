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
} from 'react-native';
import React, { useEffect, useState } from 'react';
import useAuthStore from '../../hooks/auth';
import COLORS from '../../config/COLORS';
import { useAlert } from '../../components/AlertContext';
import ModalRemoveData from '../../components/ModalRemoveData';
import { HeaderNav } from '../../components/Header';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/types';
import { getData } from '../../services/apiServices';

const familyMembers = [
  { name: 'Dzaky Aditya', initials: 'DA', location: 'Bandung, Jawa Barat' },
  { name: 'Kemal Abdillah', initials: 'KA', location: 'Bandung, Jawa Barat' },
  { name: 'Puteri Tamada', initials: 'PT', location: 'Bandung, Jawa Barat' },
  { name: 'Angelica Aprilia', initials: 'AP', location: 'Bandung, Jawa Barat' },
];

export default function FamilyListScreen() {
  const reset = useAuthStore(state => state.reset);
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { showAlert } = useAlert();
  const { profile, getProfile } = useAuthStore();
  const colorScheme = useColorScheme();
  const colors = COLORS();
  const [isShowDetailFamily, setIsShowDetailFamily] = useState(false);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [friendLists, setFriendLists] = useState([]);
  const [error, setError] = useState(null);
  const backgroundSource =
    colorScheme === 'dark'
      ? require('../../assets/images/bg-page-dark.png')
      : require('../../assets/images/bg-page-light.png');

  useEffect(() => {
    getProfile();
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [friendlist] = await Promise.all([
        getData('items/friend_list?fields=*,friends.*'),
      ]);

      console.log(friendlist);

      setFriendLists(friendlist?.data || []);
    } catch (err: any) {
      setError(err.message);
      console.error('Gagal mengambil data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = (member: any) => {
    setSelectedMember(member);
    setModalVisible(true);
  };

  const confirmRemoveMember = () => {
    if (selectedMember) {
      showAlert('success', `Member ${selectedMember} removed successfully!`);
      setModalVisible(false);
    }
  };

  const backToProfile = () => {
    if (isShowDetailFamily) {
      setIsShowDetailFamily(false);
    } else {
      navigation.replace('FamilyProfile');
    }
  };

  const handleMemberDetail = (member: any) => {
    console.log(member);

    setSelectedMember(member);
    setIsShowDetailFamily(true);
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
          <>
            <View style={styles.container}>
              {/* Header */}
              <HeaderNav onPress={backToProfile} title="Daftar Kerabat" />

              {/* Content */}
              {!isShowDetailFamily ? (
                <View
                  style={[
                    styles.contentOption,
                    {
                      backgroundColor:
                        colorScheme === 'dark' ? '#1c1c1c' : '#fff',
                      borderRadius: 12,
                      height: '95%',
                      marginTop: '5%',
                      paddingVertical: '4%',
                      paddingHorizontal: 16,
                      paddingLeft: 5
                    },
                  ]}>
                  <Text style={[styles.subTitle, { color: colors.info }]}>
                    Daftar Kerabat yang anda tambahkan pada aplikasi MHEWS
                  </Text>

                  <Text style={[styles.textOption]}>Daftar Kerabat ({friendLists?.length})</Text>

                  {/* Family Members List */}
                  {friendLists.map((member: any, index: any) => (
                    <TouchableOpacity
                      key={index}
                      onPress={() => handleMemberDetail(member)}
                      style={styles.memberContainer}>
                      <View style={styles.memberInitials}>
                        <Text style={styles.initialsText}>
                          {`${member?.friends?.first_name?.charAt(0) ?? ''}${member?.friends?.last_name?.charAt(0) ?? ''}`}
                        </Text>
                      </View>
                      <View style={styles.memberInfo}>
                        <Text style={[styles.memberName, { color: colors.text }]}>
                          {member?.friends?.first_name} {member?.friends?.last_name}
                        </Text>
                        <Text
                          style={[styles.memberLocation, { color: colors.info }]}>
                          {member?.friends?.location ? member?.friends?.location : "-"}
                        </Text>
                      </View>
                      <TouchableOpacity
                        onPress={() => handleRemoveMember(member)}
                        style={styles.removeButton}>
                        <Text style={styles.removeText}>X Hapus</Text>
                      </TouchableOpacity>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : (
                <View
                  style={[
                    styles.contentOption,
                    {
                      backgroundColor:
                        colorScheme === 'dark' ? '#1c1c1c' : '#fff',
                      borderRadius: 12,
                      height: '95%',
                      marginTop: '5%',
                      paddingVertical: '4%',
                      paddingHorizontal: 16,
                    },
                  ]}>
                  <View style={styles.memberContainerDetailFamily}>
                    <View style={styles.headerMemberDetail}>
                      <View style={styles.memberInitials}>
                        <Text style={styles.initialsText}>
                          {`${selectedMember?.friends?.first_name?.charAt(0) ?? ''}${selectedMember?.friends?.last_name?.charAt(0) ?? ''}`}
                        </Text>
                      </View>
                      <View style={styles.memberInfo}>
                        <Text style={styles.memberName}>{selectedMember?.friends?.first_name} {selectedMember?.friends?.last_name}</Text>
                        <Text style={styles.memberLocation}>
                          {selectedMember?.friends?.location ? selectedMember?.friends?.location : "-"}
                        </Text>
                      </View>
                    </View>

                    {/* NIK section moved below memberInfo */}
                    <View style={styles.memberContainerDetail}>
                      <Text style={styles.memberName}>NIK</Text>
                      <Text style={styles.memberLocation}>
                        {selectedMember?.friends?.NIK ? selectedMember?.friends?.NIK : "-"}
                      </Text>
                    </View>
                    <View style={styles.memberContainerDetail}>
                      <Text style={styles.memberName}>No. Handphone</Text>
                      <Text style={styles.memberLocation}>{selectedMember?.friends?.phone ? selectedMember?.friends?.phone : "-"}</Text>
                    </View>
                    <View style={styles.memberContainerDetail}>
                      <Text style={styles.memberName}>Email</Text>
                      <Text style={styles.memberLocation}>{selectedMember?.friends?.email ? selectedMember?.friends?.email : "-"}</Text>
                    </View>

                    <TouchableOpacity
                      style={styles.outlineButton}
                      onPress={() => handleRemoveMember(selectedMember)}
                      disabled={loading}>
                      {loading ? (
                        <ActivityIndicator size="small" color="#fff" />
                      ) : (
                        <Text style={styles.outlineButtonText}>
                          Hapus Kerabat
                        </Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          </>
        </ScrollView>

        {/* Modal with dynamic title and message */}
        <ModalRemoveData
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          onConfirm={confirmRemoveMember}
          title={`Anda Yakin untuk Hapus Kerabat ${selectedMember}?`}
          message={`Dengan menghapus kerabat anda tidak dapat berbagi aktivitas dan memantau ${selectedMember}, apakah anda yakin?`}
        />
      </ImageBackground>
    </>
  );
}

const { width } = Dimensions.get('window');
const avatarSize = width * 0.12;

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  subTitle: {
    fontSize: 14,
    textAlign: 'left',
    color: '#666',
    marginBottom: 10,
    marginLeft: 10,
  },
  container: { flex: 1, padding: 16, marginTop: '5%' },
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  contentOption: {
    borderRadius: 12,
    width: '100%',
  },
  textOption: {
    marginLeft: 10,
    marginBottom: 5,
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'left',
  },
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
  headerMemberDetail: {
    flexDirection: 'row',
    alignItems: 'center',
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
    fontSize: avatarSize * 0.4, // Ukuran teks mengikuti ukuran avatar
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
});
