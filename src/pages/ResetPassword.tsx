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
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '../navigation/types';
import {z} from 'zod';
import {useForm, Controller} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import Feather from 'react-native-vector-icons/Feather';
import {useAlert} from '../components/AlertContext';
import {patchData, postData} from '../services/apiServices';

type RootParamList = {
  ResetPasswordPage: {
    userID?: string;
  };
};

const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, 'Password minimal 8 karakter')
      .regex(/[A-Z]/, 'Harus mengandung huruf besar')
      .regex(/[0-9]/, 'Harus mengandung angka'),
    confirmPassword: z.string(),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'Password tidak cocok',
    path: ['confirmPassword'],
  });

const ResetPasswordPage = () => {
  const route = useRoute<RouteProp<RootParamList, 'ResetPasswordPage'>>();
  const {userID} = route.params || {};
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const colorScheme = useColorScheme();
  const colors = COLORS();
  const {showAlert} = useAlert();

  const iconInfo = require('../assets/images/resikoBahayaActive.png');
  const [loading, setLoading] = useState(false);
  const [isPasswordReset, setIsPasswordReset] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
    useState(false);
  const backgroundSource =
    colorScheme === 'dark'
      ? require('../assets/images/bg-page-dark.png')
      : require('../assets/images/bg-page-light.png');

  const {
    control,
    handleSubmit,
    watch,
    formState: {errors, isValid},
  } = useForm({
    resolver: zodResolver(resetPasswordSchema),
    mode: 'onChange',
  });

  const password = watch('password');
  const confirmPassword = watch('confirmPassword');

  const handleSendNewPassword = async (data: any) => {
    setLoading(true);
    try {
      if (!userID) {
        showAlert('error', 'User ID tidak ditemukan.');
        return;
      }
      const endpoint = `/users/${userID}`;
      console.log('endpoint', endpoint);
      const payload = {password: data.password};
      console.log('password', password);

      const response = await patchData(endpoint, payload, {returnStatus: true});
      console.log('resultya', response);

      if (response) {
        if (response.status === 200) {
          showAlert('success', 'Password Berhasil di Ubah');
          setTimeout(() => {
            setLoading(false);
            setIsPasswordReset(true);
          }, 2000);
        } else {
          showAlert('error', response.data.message || 'Gagal reset password');
        }
      } else {
        showAlert('error', 'Tidak ada respon dari server.');
      }
    } catch (error: any) {
      showAlert(
        'error',
        error.error || error.message || 'Terjadi kesalahan saat reset password',
      );
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigation.replace('Login');
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
            <HeaderNav
              onPress={() => navigation.replace('ForgotPassword')}
              title="Reset Password"
            />

            <Text style={[styles.subTitle, {color: colors.info}]}>
              {isPasswordReset
                ? 'Password baru berhasil disimpan. Silahkan kembali ke halaman login'
                : 'Masukkan password baru dan konfirmasi untuk melanjutkan.'}
            </Text>
            {!isPasswordReset && (
              <>
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
                        placeholder="Password Baru"
                        secureTextEntry={!isPasswordVisible}
                        value={value}
                        onChangeText={onChange}
                        placeholderTextColor={colors.text}
                      />
                      <TouchableOpacity
                        onPress={() =>
                          setIsPasswordVisible(!isPasswordVisible)
                        }>
                        <Feather
                          name={isPasswordVisible ? 'eye' : 'eye-off'}
                          size={24}
                          color={colors.text}
                        />
                      </TouchableOpacity>
                    </View>
                  )}
                />

                {errors.password && (
                  <Text style={styles.errorText}>
                    {errors.password.message}
                  </Text>
                )}

                <Controller
                  control={control}
                  name="confirmPassword"
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
                        placeholder="Konfirmasi Password Baru"
                        secureTextEntry={!isConfirmPasswordVisible}
                        value={value}
                        onChangeText={onChange}
                        placeholderTextColor={colors.text}
                      />
                      <TouchableOpacity
                        onPress={() =>
                          setIsConfirmPasswordVisible(!isConfirmPasswordVisible)
                        }>
                        <Feather
                          name={isConfirmPasswordVisible ? 'eye' : 'eye-off'}
                          size={24}
                          color={colors.text}
                        />
                      </TouchableOpacity>
                    </View>
                  )}
                />
                {errors.confirmPassword && (
                  <Text style={styles.errorText}>
                    {errors.confirmPassword.message}
                  </Text>
                )}
                <View style={styles.rulesContainer}>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}>
                    <Image source={iconInfo} style={styles.iconImage} />
                    <Text style={styles.ruleText}>
                      Password <Text style={styles.bold}>harus</Text> mengandung{' '}
                      <Text style={styles.highlight}>
                        kombinasi huruf besar dan kecil
                      </Text>
                    </Text>
                  </View>

                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}>
                    <Image source={iconInfo} style={styles.iconImage} />
                    <Text style={styles.ruleText}>
                      Password <Text style={styles.bold}>harus</Text> mengandung{' '}
                      <Text style={styles.highlight}>angka</Text>
                    </Text>
                  </View>

                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}>
                    <Image source={iconInfo} style={styles.iconImage} />
                    <Text style={styles.ruleText}>
                      Password <Text style={styles.bold}>harus</Text> mengandung{' '}
                      <Text style={styles.highlight}>minimal 8 karakter</Text>
                    </Text>
                  </View>
                </View>
              </>
            )}
          </View>

          <View style={{padding: 16}}>
            <TouchableOpacity
              style={[
                styles.button,
                !(password && confirmPassword && isValid) &&
                  styles.buttonDisabled,
              ]}
              onPress={
                isPasswordReset
                  ? handleBackToLogin
                  : handleSubmit(handleSendNewPassword)
              }
              disabled={
                loading ||
                (!isPasswordReset && !(password && confirmPassword && isValid))
              }>
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.textButton}>
                  {isPasswordReset ? 'Kembali ke Login' : 'Reset Password'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </ImageBackground>
    </>
  );
};

export default ResetPasswordPage;

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
    // flex: 1,
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
  rulesContainer: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff8f2',
    marginTop: 10,
  },
  ruleText: {
    color: '#F36A1D',
    fontSize: 13,
    marginBottom: 6,
  },
  highlight: {
    color: '#F36A1D',
    fontWeight: 'bold',
  },
  bold: {
    fontWeight: 'bold',
  },
  iconImage: {
    width: 20,
    height: 15,
    resizeMode: 'contain',
    marginRight: '2%',
  },
});
