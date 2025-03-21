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
  ScrollView,
  ImageBackground,
  Platform,
  ActivityIndicator,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import COLORS from '../config/COLORS';
import {HeaderNav} from '../components/Header';
import MapboxGL, {Camera} from '@rnmapbox/maps';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '../navigation/types';
import {z} from 'zod';
import {useForm, Controller} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {useAlert} from '../components/AlertContext';
import {postData} from '../services/apiServices';

const forgotEmail = z.object({
  email: z.string().email('Format email tidak valid'),
});

const {width, height} = Dimensions.get('window');

const ForgotPasswordPage = () => {
  const {showAlert} = useAlert();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const colorScheme = useColorScheme();
  const colors = COLORS();
  const [invalidCredential, setInvalidCredential] = useState(false);
  const [messageInvalid, setMessageInvalid] = useState('');
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const backgroundSource =
    colorScheme === 'dark'
      ? require('../assets/images/bg-page-dark.png')
      : require('../assets/images/bg-page-light.png');
  const handleBack = () => {
    navigation.replace('Tabs');
  };
  const arrowLeft =
    colorScheme === 'dark'
      ? require('../assets/images/left-dark.png')
      : require('../assets/images/left-light.png');

  const backToProfile = () => {
    navigation.replace('Login');
  };

  const {
    control,
    handleSubmit,
    setError,
    watch,
    formState: {errors},
  } = useForm({
    resolver: zodResolver(forgotEmail),
    mode: 'onChange',
  });

  const emailValue = watch('email');

  const handleSendOTP = async (data: {email: string}) => {
    setLoading(true);
    try {
      // Panggil API
      const response = await postData(
        '/forgotpass-otp/email',
        {email: data.email},
        {returnStatus: true},
      );
      console.log('response', response);

      // Jika berhasil, status = 200/201 => Tampilkan success alert
      showAlert('success', 'Kode OTP berhasil dikirim.');
      navigation.navigate('Otp', {
        email: data.email,
        phone: '',
        sendTo: 'email',
        from: 'forgotPassword',
      });
    } catch (error: any) {
      // Karena status 400/401/500 dilempar ke sini oleh interceptor
      console.error(error);

      // Pastikan modal tertutup kalau perlu
      setModalVisible(false);

      const errorMsg =
        error?.message || // => "email does not exist..."
        error?.data?.error ||
        'Terjadi kesalahan.';

      let messageError = errorMsg;
      if (
        error?.data?.error ===
        'email does not exist, you need to register it first'
      ) {
        messageError =
          'Email tidak ditemukan. Pastikan anda telah memasukkan email yang benar.';
      }

      // Agar tampil di bawah TextInput
      setError('email', {type: 'custom', message: messageError});
      showAlert('error', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="dark-content"
      />
      <ImageBackground
        source={backgroundSource}
        style={styles.background}
        resizeMode="cover">
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}>
          <View style={styles.container}>
            <HeaderNav onPress={backToProfile} title="Lupa Password" />

            <Text style={[styles.subTitle, {color: colors.info}]}>
              Masukkan alamat email anda yang terdaftar untuk mengirimkan kode
              OTP untuk reset password.
            </Text>

            <Controller
              control={control}
              name="email"
              render={({field: {onChange, value}}) => (
                <View
                  style={[
                    styles.inputContainer,
                    {
                      borderColor: colors.border,
                      backgroundColor: colors.background,
                    },
                  ]}>
                  <MaterialIcons
                    name="email"
                    size={24}
                    color={colors.text}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={[
                      styles.input,
                      {
                        color: colors.text,
                        backgroundColor: colors.background,
                      },
                    ]}
                    placeholder="Masukkan Email Anda"
                    placeholderTextColor={colors.text}
                    keyboardType="email-address"
                    value={value}
                    onChangeText={onChange}
                  />
                </View>
              )}
            />
            {invalidCredential && (
              <View style={styles.errorContainer}>
                <MaterialIcons
                  name="error-outline"
                  size={20}
                  color="red"
                  style={styles.icon}
                />
                {/* Pesan error */}
                <Text style={styles.errorText}>{messageInvalid}</Text>
              </View>
            )}
            {errors.email?.message && (
              <Text style={styles.errorText}>
                {String(errors.email.message)}
              </Text>
            )}
          </View>
          <View
            style={{
              padding: 16,
            }}>
            <TouchableOpacity
              style={[
                styles.button,
                (!emailValue || !!errors.email || loading) &&
                  styles.buttonDisabled,
              ]}
              onPress={() => setModalVisible(true)}
              disabled={!emailValue || !!errors.email || loading}>
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.textButton}>Kirim Kode OTP</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </ImageBackground>
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}>
        {/* Latar belakang gelap (semi-transparan) */}
        <View style={styles.modalOverlay}>
          {/* Konten bottom sheet */}
          <View
            style={[styles.bottomSheetContainer, {backgroundColor: colors.bg}]}>
            <Text style={[styles.bottomSheetTitle, {color: colors.text}]}>
              Kirim kode OTP
            </Text>
            <Text style={[styles.bottomSheetDesc, {color: colors.info}]}>
              Kode OTP (One-Time-Password) akan dikirimkan sebagai metode
              verifikasi akun pada alamat email{' '}
              <Text style={{fontWeight: 'bold'}}>{emailValue}</Text>. Pastikan
              alamat email yang anda masukkan sudah benar.
            </Text>

            {/* Tombol "Kirim kode OTP" di dalam bottom sheet */}
            <TouchableOpacity
              onPress={handleSubmit(handleSendOTP)}
              // onPress={() => navigation.navigate('ResetPassword')}
              style={styles.bottomSheetButton}>
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.bottomSheetButtonText}>Kirim Kode OTP</Text>
              )}
            </TouchableOpacity>

            {/* Tombol "Batalkan" untuk menutup bottom sheet */}
            <TouchableOpacity
              style={[
                styles.bottomSheetButton,
                {
                  backgroundColor: colors.bg,
                  borderWidth: 1,
                  borderColor: '#F36A1D',
                },
              ]}
              onPress={() => setModalVisible(false)}>
              <Text style={[styles.bottomSheetButtonText, {color: '#F36A1D'}]}>
                Batalkan
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
};

export default ForgotPasswordPage;

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
  container: {flex: 1, padding: 16, marginTop: '5%'},
  subTitle: {
    fontSize: 14,
    textAlign: 'left',
    color: '#666',
    marginBottom: '3%',
    marginLeft: '3%',
    marginTop: '5%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 10,
    marginBottom: 10,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
  },
  errorContainer: {
    flexDirection: 'row',
  },
  icon: {
    marginRight: 8,
  },
  errorText: {
    fontSize: 14,
    color: 'red',
    flex: 1,
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#F36A1D',
    paddingVertical: 15,
    borderRadius: 10,
    marginTop: 10,
  },
  textButton: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 18,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  } /* ---- Styling Modal Bottom Sheet ---- */,
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end', // Menempel ke bagian bawah layar
    backgroundColor: 'rgba(0,0,0,0.5)', // Latar belakang hitam transparan
  },
  bottomSheetContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    // Atur minimal tinggi bottom sheet di sini
    minHeight: 200,
  },
  bottomSheetTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'left',
  },
  bottomSheetDesc: {
    fontSize: 14,
    marginBottom: 20,
    textAlign: 'left',
  },
  bottomSheetButton: {
    width: '100%',
    paddingVertical: 15,
    borderRadius: 10,
    backgroundColor: '#F36A1D',
    marginBottom: 10,
  },
  bottomSheetButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
