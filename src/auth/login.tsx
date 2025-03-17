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
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import React, { useState, useEffect } from 'react';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Feather from 'react-native-vector-icons/Feather';
import { useNavigation } from '@react-navigation/native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { postData } from '../services/apiServices';
import COLORS from '../config/COLORS';
import useAuthStore from '../hooks/auth';
import { useAlert } from '../components/AlertContext';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
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
  const [invalidCredential, setInvalidCredential] = useState(false);
  const [messageInvalid, setMessageInvalid] = useState("");
  const { setAuthData, getProfile } = useAuthStore();
  const { showAlert } = useAlert();

  useEffect(() => {
    GoogleSignin.configure({
      webClientId: '205553627601-bm6o39g55pepepv1r57cs4mhuladrtrf.apps.googleusercontent.com',
      offlineAccess: true, // Jika butuh refresh token
    });
  }, []);

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
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
        // showAlert('error', 'Email atau password yang anda tidak valid');
        setMessageInvalid("Email atau password tidak valid");
        setInvalidCredential(true);
        setTimeout(() => {
          setMessageInvalid("");
          setInvalidCredential(false);
        }, 3000);
      }
    } catch (error: any) {
      setLoading(false);
      if (error?.message) {
        const errorMessage = error.status == 401 ? 'Email atau password tidak valid' : error.message;
        // showAlert('error', errorMessage);
        setMessageInvalid(errorMessage);
        setInvalidCredential(true);
        setTimeout(() => {
          setMessageInvalid("");
          setInvalidCredential(false);
        }, 3000);
      } else {
        showAlert('error', 'Login Gagal, Terjadi kesalahan pada server.');
      }
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
    setLoading(true);
    try {
      await GoogleSignin.hasPlayServices();

      const userInfo = await GoogleSignin.signIn();

      const googleEmail = userInfo?.data?.user?.email || '';
      setAuthData('dummyAccessToken', 'dummyRefreshToken');

      navigation.navigate('Otp', {
        email: googleEmail,
        phone: null,
        sendTo: 'email',
        from: 'google-signin',
      });

      setLoading(false);
    } catch (error: any) {
      setLoading(false);
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        showAlert('error', `Login dibatalkan.`);
      } else if (error.code === statusCodes.IN_PROGRESS) {
        Alert.alert('Info', 'Sedang memproses login...');
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        showAlert('error', 'Google Play Services tidak tersedia / usang!');
      } else {
        showAlert('error', `Login Gagal: ${error?.message}`);
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
            contentContainerStyle={{ flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
            enableOnAndroid={true}
            extraScrollHeight={20}>
            {/* Header */}
            <View style={{ marginLeft: 15, marginTop: 25 }}>
              <Image
                source={logoSource}
                style={{ width: 150, height: 50, resizeMode: 'contain' }}
              />
            </View>

            {/* Title */}
            <View style={{ marginBottom: 20 }}>
              <Text style={[styles.title, { color: colors.text }]}>
                Selamat datang di
              </Text>
              <Text style={[styles.title, { color: colors.text }]}>
                Aplikasi MHEWS
              </Text>
            </View>

            {/* Form Login */}
            <View style={[styles.card, { backgroundColor: colors.background }]}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Masuk
              </Text>

              {/* Input Email */}
              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, value } }) => (
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

              {/* Input Password */}
              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, value } }) => (
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
              {errors.password?.message && (
                <Text style={styles.errorText}>
                  {String(errors.password.message)}
                </Text>
              )}

              <TouchableOpacity>
                <Text style={styles.forgotText}>Lupa Password ?</Text>
              </TouchableOpacity>

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
                <View style={{ flex: 1, height: 1, backgroundColor: '#ccc' }} />
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
                <View style={{ flex: 1, height: 1, backgroundColor: '#ccc' }} />
              </View>

              {/* Tombol Masuk dengan Google */}
              <TouchableOpacity
                onPress={handleGoogleSignIn}
                style={[
                  styles.altButton,
                  { backgroundColor: colors.background },
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
                  { backgroundColor: colors.background },
                ]}>
                <Image
                  source={require('../assets/icons/bnpb-logo.png')}
                  style={styles.iconImage}
                />
                <Text style={styles.altText}>Masuk dengan SSO BNPB</Text>
              </TouchableOpacity>

              {/* Tombol Masuk sebagai Guest */}
              {/* <TouchableOpacity
                style={[
                  styles.altButton,
                  { backgroundColor: colors.background },
                ]}>
                <Image
                  source={require('../assets/images/guest.png')}
                  style={styles.iconImage}
                />
                <Text style={styles.altText}>Masuk Sebagai Guest</Text>
              </TouchableOpacity> */}

              {/* Link Daftar */}
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'center',
                  marginTop: 20,
                }}>
                <Text style={{ fontSize: 16, color: colors.text }}>
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
  forgotText: {
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#F36A1D',
    paddingVertical: 5,
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
  // errorText: { color: 'red', fontSize: 14, marginBottom: 10 },
  errorContainer: {
    flexDirection: "row",
  },
  icon: {
    marginRight: 8,
  },
  errorText: {
    fontSize: 14,
    color: "red",
    flex: 1,
    marginBottom: 10
  },
});
