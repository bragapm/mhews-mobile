import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ImageBackground,
  Image,
  Alert,
  ActivityIndicator,
  useColorScheme,
  StatusBar,
} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import React, {useState, useEffect} from 'react';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Feather from 'react-native-vector-icons/Feather';
import {useNavigation} from '@react-navigation/native';
import {useForm, Controller} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {z} from 'zod';
import {postData} from '../services/apiServices';
import COLORS from '../config/COLORS';
import useAuthStore from '../hooks/auth';
import {useAlert} from '../components/AlertContext';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '../navigation/types';
import {
  GoogleSignin,
  statusCodes,
} from '@react-native-google-signin/google-signin';

// Skema validasi dengan Zod
const signinSchema = z.object({
  email: z.string().email('Format email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
});

const Login = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const colorScheme = useColorScheme();
  const colors = COLORS();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const {setAuthData, getProfile} = useAuthStore();
  const {showAlert} = useAlert();

  useEffect(() => {
    GoogleSignin.configure({
      webClientId: 'ISI_DENGAN_WEB_CLIENT_ID_ANDA.apps.googleusercontent.com',
      // offlineAccess: true, // Jika butuh refresh token
    });
  }, []);

  const {
    control,
    handleSubmit,
    setError,
    formState: {errors},
  } = useForm({
    resolver: zodResolver(signinSchema),
  });

  const handleSignin = async (data: any) => {
    setLoading(true);
    try {
      const response = await postData('/auth/login', data);
      if (response?.data) {
        setAuthData(
          response?.data?.access_token,
          response?.data?.refresh_token,
        );
        setLoading(false);
        navigation.navigate('Otp', {
          email: data?.email,
          phone: null,
          sendTo: 'email',
          from: 'signin',
        });
      } else {
        setLoading(false);
        showAlert('error', 'Login Gagal, Email atau Password salah!');
      }
    } catch (error: any) {
      setLoading(false);
      showAlert('error', 'Login Gagal, Email atau Password salah!');
    }
  };

  const backgroundSource =
    colorScheme === 'dark'
      ? require('../assets/images/overlay-dark.png')
      : require('../assets/images/overlay-light.png');
  const logoSource =
    colorScheme === 'dark'
      ? require('../assets/images/logo-dark.png')
      : require('../assets/images/braga-logo.png');

  const handleGoogleSignIn = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      /**
       * Setelah berhasil sign in, biasanya Anda akan mendapatkan idToken/token.
       * Gunakan token itu untuk dikirim ke server backend agar server juga melakukan verifikasi
       * atau jika Anda butuh langsung simpan data user di state (contoh: Redux, Recoil, dsb).
       */
      console.log('User Info =>', userInfo);
      // Misal kita mengambil idToken untuk kirim ke server:
      // const { idToken } = userInfo;
      // const response = await postData('/auth/google-login', { token: idToken });
      // setAuthData(...), dsb. Sesuaikan dengan kebutuhan Anda.

      Alert.alert(
        'Sukses',
        `Berhasil login Google sebagai: ${userInfo?.user?.email}`,
      );
    } catch (error: any) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        // user membatalkan login
        Alert.alert('Info', 'Login dibatalkan.');
      } else if (error.code === statusCodes.IN_PROGRESS) {
        Alert.alert('Info', 'Sedang memproses login...');
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        Alert.alert('Error', 'Google Play Services tidak tersedia / usang!');
      } else {
        Alert.alert('Error', `Terjadi kesalahan: ${error?.message}`);
      }
    }
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
        <View style={styles.container}>
          <KeyboardAwareScrollView
            contentContainerStyle={{flexGrow: 1}}
            keyboardShouldPersistTaps="handled"
            enableOnAndroid={true}
            extraScrollHeight={20}>
            {/* Header */}
            <View style={{marginLeft: 15, marginTop: 25}}>
              <Image
                source={logoSource}
                style={{width: 150, height: 50, resizeMode: 'contain'}}
              />
            </View>

            {/* Title */}
            <View style={{marginBottom: 20}}>
              <Text style={[styles.title, {color: colors.text}]}>
                Selamat datang di
              </Text>
              <Text style={[styles.title, {color: colors.text}]}>
                Aplikasi MHEWS
              </Text>
            </View>

            {/* Form Login */}
            <View style={[styles.card, {backgroundColor: colors.background}]}>
              <Text style={[styles.sectionTitle, {color: colors.text}]}>
                Masuk
              </Text>

              {/* Input Email */}
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
                      placeholder="Email"
                      placeholderTextColor={colors.text}
                      keyboardType="email-address"
                      value={value}
                      onChangeText={onChange}
                    />
                  </View>
                )}
              />
              {errors.email?.message && (
                <Text style={styles.errorText}>
                  {String(errors.email.message)}
                </Text>
              )}

              {/* Input Password */}
              <Controller
                control={control}
                name="password"
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
                      name="lock"
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
                      placeholder="Password"
                      secureTextEntry={!isPasswordVisible}
                      value={value}
                      onChangeText={onChange}
                      placeholderTextColor={colors.text}
                    />
                    <TouchableOpacity
                      onPress={() => setIsPasswordVisible(!isPasswordVisible)}>
                      <Feather
                        name={isPasswordVisible ? 'eye' : 'eye-off'}
                        size={24}
                        color={colors.text}
                      />
                    </TouchableOpacity>
                  </View>
                )}
              />
              {errors.password?.message && (
                <Text style={styles.errorText}>
                  {String(errors.password.message)}
                </Text>
              )}

              <TouchableOpacity
                style={styles.button}
                onPress={handleSubmit(handleSignin)}
                disabled={loading}>
                {loading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.textButton}>Masuk</Text>
                )}
              </TouchableOpacity>

              {/* Additional Buttons */}
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginVertical: 10,
                }}>
                <View style={{flex: 1, height: 1, backgroundColor: '#ccc'}} />
                <Text
                  style={[
                    styles.orText,
                    {
                      marginHorizontal: 10,
                      textAlign: 'center',
                      color: colors.text,
                    },
                  ]}>
                  atau
                </Text>
                <View style={{flex: 1, height: 1, backgroundColor: '#ccc'}} />
              </View>

              {/* Tombol Masuk dengan Google */}
              <TouchableOpacity
                onPress={handleGoogleSignIn}
                style={[
                  styles.altButton,
                  {backgroundColor: colors.background},
                ]}>
                {/* <AntDesign name="google" size={24} color="#DB4437" /> */}
                <Image
                  source={require('../assets/images/google.png')}
                  style={styles.iconImage}
                />
                <Text style={styles.altText}>Masuk dengan Google</Text>
              </TouchableOpacity>

              {/* Tombol Masuk dengan SSO BNPB */}
              <TouchableOpacity
                style={[
                  styles.altButton,
                  {backgroundColor: colors.background},
                ]}>
                <Image
                  source={require('../assets/icons/bnpb-logo.png')}
                  style={styles.iconImage}
                />
                <Text style={styles.altText}>Masuk dengan SSO BNPB</Text>
              </TouchableOpacity>

              {/* Tombol Masuk sebagai Guest */}
              <TouchableOpacity
                style={[
                  styles.altButton,
                  {backgroundColor: colors.background},
                ]}>
                <Image
                  source={require('../assets/images/guest.png')}
                  style={styles.iconImage}
                />
                {/* <MaterialIcons name="person-outline" size={24} color="black" /> */}
                <Text style={styles.altText}>Masuk Sebagai Guest</Text>
              </TouchableOpacity>

              {/* Link Daftar */}
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'center',
                  marginTop: 20,
                }}>
                <Text style={{fontSize: 16, color: colors.text}}>
                  Belum punya akun?
                </Text>
                <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
                  <Text style={styles.registerText}> Daftar Disini</Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAwareScrollView>
        </View>
      </ImageBackground>
    </>
  );
};

export default Login;

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 15,
  },
  card: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    width: '100%',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
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
  orText: {
    textAlign: 'center',
    marginVertical: 10,
    fontSize: 16,
    fontWeight: 'bold',
  },
  altButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#F36A1D',
    marginTop: 10,
    paddingHorizontal: 10,
  },
  altText: {
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#F36A1D',
  },
  iconImage: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
    alignSelf: 'flex-start',
  },
  registerText: {
    fontSize: 16,
    color: '#F36A1D',
    fontWeight: 'bold',
  },
  errorText: {color: 'red', fontSize: 14, marginBottom: 10},
});
