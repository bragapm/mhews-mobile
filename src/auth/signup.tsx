import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ImageBackground,
  ActivityIndicator,
  StatusBar,
  Pressable,
  Animated,
  ScrollView,
} from 'react-native';
import Modal from 'react-native-modal';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Feather from 'react-native-vector-icons/Feather';
import { z } from 'zod';
import { postData } from '../services/apiServices';
import { useColorScheme } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useAlert } from '../components/AlertContext';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import COLORS from '../config/COLORS';
import { PanGestureHandler, State } from 'react-native-gesture-handler';

// Skema validasi dengan Zod
const signupSchema = z
  .object({
    NIK: z.string().min(16, 'NIK harus 16 digit').max(16, 'NIK harus 16 digit'),
    nama_lengkap: z.string().min(2, 'Nama lengkap minimal 2 karakter'),
    jenis_kelamin: z.string().min(1, 'Jenis kelamin harus diisi'),
    phone: z.string().min(10, 'Nomor HP minimal 10 digit'),
    email: z.string().email('Format email tidak valid'),
    password: z.string().min(6, 'Password minimal 6 karakter'),
    confirm_password: z.string(),
    provinsi: z.string().min(1, 'Provinsi harus diisi'),
    kabupaten_kota: z.string().min(1, 'Kabupaten/Kota harus diisi'),
    kecamatan: z.string().min(1, 'Kecamatan harus diisi'),
    kelurahan_desa: z.string().min(1, 'Kelurahan/Desa harus diisi'),
    alamat_lengkap: z.string().min(1, 'Alamat lengkap harus diisi'),
  })
  .refine(data => data.password === data.confirm_password, {
    message: 'Password tidak cocok',
    path: ['confirm_password'],
  });

const Signup = () => {
  const { showAlert } = useAlert();
  const colorScheme = useColorScheme();
  const colors = COLORS();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<'wa' | 'email'>('wa');
  const [savedData, setSavedData] = useState<any>({});
  const [currentStep, setCurrentStep] = useState(0);
  const [showForm, setShowForm] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(signupSchema),
  });

  const steps = [
    {
      title: '1',
      description: 'Email & Password',
      fields: ['email', 'password', 'confirm_password'],
    },
    {
      title: '2',
      description: 'Data Diri',
      fields: ['NIK', 'nama_lengkap', 'jenis_kelamin', 'phone'],
    },
    {
      title: '3',
      description: 'Alamat',
      fields: ['provinsi', 'kabupaten_kota', 'kecamatan', 'kelurahan_desa', 'alamat_lengkap'],
    },
  ];

  const handleSignup = async (formData: any) => {
    setLoading(true);
    try {
      const { confirm_password, ...requestData } = formData;
      requestData.role = '16f26149-65b3-4de5-ba0d-cd7130887441';
      const response = await postData('/users', requestData);
      console.log(response);

      setTimeout(() => {
        setLoading(false);
        showAlert('success', 'Akun berhasil dibuat!');
        setSavedData({
          email: formData.email,
          phone: formData.phone,
        });
        setIsModalVisible(true);
      }, 2000);
    } catch (error: any) {
      showAlert('error', error.message);
      console.log('error', error);
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit(handleSignup)();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const onHandlerStateChange = (event: any) => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      const { translationX } = event.nativeEvent;
      if (translationX < -50) {
        nextStep();
      } else if (translationX > 50) {
        prevStep();
      }
    }
  };

  const handleSendOTP = async () => {
    setIsModalVisible(false);

    try {
      navigation.navigate('Otp', {
        email: savedData.email,
        phone: savedData.phone,
        sendTo: selectedMethod,
        from: 'signup',
      });
    } catch (error: any) {
      showAlert('error', error.message);
    }
  };

  const backgroundSource =
    colorScheme === 'dark'
      ? require('../assets/images/overlay-dark.png')
      : require('../assets/images/overlay-light.png');

  const renderInfoScreen = () => (
    <View style={styles.infoContainer}>
      <Text style={[styles.infoText, { color: colors.info }]}>
        Sebelum membuat akun pada aplikasi MHEWS, pastikan anda telah mempersiapkan dokumen berikut:
      </Text>
      <View style={styles.infoList}>
        <Text style={[styles.infoText, { color: colors.text }]}>1. Nomor Induk Kependudukan (NIK) atau</Text>
        <Text style={[styles.infoText, { color: colors.text }]}>   Nomor KTP</Text>
        <Text style={[styles.infoText, { color: colors.text }]}>2. Nomor Handphone Aktif</Text>
        <Text style={[styles.infoText, { color: colors.text }]}>3. Alamat Email Aktif</Text>
      </View>
      <View style={styles.checkboxContainer}>
        <Text style={[styles.checkboxText, { color: colors.info }]}>
          Saya telah membaca dan setuju terhadap <TouchableOpacity><Text style={[{ color: colors.button }]}>Syarat dan Ketentuan</Text></TouchableOpacity>
        </Text>
      </View>
    </View>
  );

  const renderFormFields = () => {
    const currentFields = steps[currentStep].fields;

    return currentFields.map((fieldName) => {
      switch (fieldName) {
        case 'email':
          return (
            <Controller
              key={fieldName}
              control={control}
              name="email"
              render={({ field: { onChange, value } }) => (
                <View style={[styles.inputContainer, { borderColor: colors.border, backgroundColor: colors.background }]}>
                  <MaterialIcons name="email" size={24} color={colors.text} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, { color: colors.text, backgroundColor: colors.background }]}
                    placeholder="Email"
                    placeholderTextColor={colors.text}
                    keyboardType="email-address"
                    value={value}
                    onChangeText={onChange}
                  />
                </View>
              )}
            />
          );
        case 'password':
          return (
            <Controller
              key={fieldName}
              control={control}
              name="password"
              render={({ field: { onChange, value } }) => (
                <View style={[styles.inputContainer, { borderColor: colors.border, backgroundColor: colors.background }]}>
                  <MaterialIcons name="lock" size={24} color={colors.text} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, { color: colors.text, backgroundColor: colors.background }]}
                    placeholder="Password"
                    placeholderTextColor={colors.text}
                    secureTextEntry={!isPasswordVisible}
                    value={value}
                    onChangeText={onChange}
                  />
                  <TouchableOpacity onPress={() => setIsPasswordVisible(!isPasswordVisible)}>
                    <Feather name={isPasswordVisible ? 'eye' : 'eye-off'} size={24} color={colors.text} />
                  </TouchableOpacity>
                </View>
              )}
            />
          );
        case 'confirm_password':
          return (
            <Controller
              key={fieldName}
              control={control}
              name="confirm_password"
              render={({ field: { onChange, value } }) => (
                <View style={[styles.inputContainer, { borderColor: colors.border, backgroundColor: colors.background }]}>
                  <MaterialIcons name="lock" size={24} color={colors.text} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, { color: colors.text, backgroundColor: colors.background }]}
                    placeholder="Konfirmasi Password"
                    placeholderTextColor={colors.text}
                    secureTextEntry={!isConfirmPasswordVisible}
                    value={value}
                    onChangeText={onChange}
                  />
                  <TouchableOpacity onPress={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)}>
                    <Feather name={isConfirmPasswordVisible ? 'eye' : 'eye-off'} size={24} color={colors.text} />
                  </TouchableOpacity>
                </View>
              )}
            />
          );
        case 'NIK':
          return (
            <Controller
              key={fieldName}
              control={control}
              name="NIK"
              render={({ field: { onChange, value } }) => (
                <View style={[styles.inputContainer, { borderColor: colors.border, backgroundColor: colors.background }]}>
                  <Feather name="user" size={24} color={colors.text} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, { color: colors.text, backgroundColor: colors.background }]}
                    placeholder="NIK"
                    maxLength={16}
                    placeholderTextColor={colors.text}
                    keyboardType="number-pad"
                    value={value}
                    onChangeText={onChange}
                  />
                </View>
              )}
            />
          );
        case 'nama_lengkap':
          return (
            <Controller
              key={fieldName}
              control={control}
              name="nama_lengkap"
              render={({ field: { onChange, value } }) => (
                <View style={[styles.inputContainer, { borderColor: colors.border, backgroundColor: colors.background }]}>
                  <Feather name="user" size={24} color={colors.text} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, { color: colors.text, backgroundColor: colors.background }]}
                    placeholder="Nama Lengkap"
                    placeholderTextColor={colors.text}
                    value={value}
                    onChangeText={onChange}
                  />
                </View>
              )}
            />
          );
        case 'jenis_kelamin':
          return (
            <Controller
              key={fieldName}
              control={control}
              name="jenis_kelamin"
              render={({ field: { onChange, value } }) => (
                <View style={[styles.inputContainer, { borderColor: colors.border, backgroundColor: colors.background }]}>
                  <Feather name="user" size={24} color={colors.text} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, { color: colors.text, backgroundColor: colors.background }]}
                    placeholder="Jenis Kelamin (L/P)"
                    placeholderTextColor={colors.text}
                    value={value}
                    onChangeText={onChange}
                  />
                </View>
              )}
            />
          );
        case 'phone':
          return (
            <Controller
              key={fieldName}
              control={control}
              name="phone"
              render={({ field: { onChange, value } }) => (
                <View style={[styles.inputContainer, { borderColor: colors.border, backgroundColor: colors.background }]}>
                  <MaterialIcons name="phone" size={24} color={colors.text} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, { color: colors.text, backgroundColor: colors.background }]}
                    placeholder="Nomor Handphone"
                    placeholderTextColor={colors.text}
                    keyboardType="phone-pad"
                    value={value}
                    onChangeText={onChange}
                  />
                </View>
              )}
            />
          );
        case 'provinsi':
          return (
            <Controller
              key={fieldName}
              control={control}
              name="provinsi"
              render={({ field: { onChange, value } }) => (
                <View style={[styles.inputContainer, { borderColor: colors.border, backgroundColor: colors.background }]}>
                  <Feather name="map-pin" size={24} color={colors.text} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, { color: colors.text, backgroundColor: colors.background }]}
                    placeholder="Provinsi"
                    placeholderTextColor={colors.text}
                    value={value}
                    onChangeText={onChange}
                  />
                </View>
              )}
            />
          );
        case 'kabupaten_kota':
          return (
            <Controller
              key={fieldName}
              control={control}
              name="kabupaten_kota"
              render={({ field: { onChange, value } }) => (
                <View style={[styles.inputContainer, { borderColor: colors.border, backgroundColor: colors.background }]}>
                  <Feather name="map-pin" size={24} color={colors.text} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, { color: colors.text, backgroundColor: colors.background }]}
                    placeholder="Kabupaten/Kota"
                    placeholderTextColor={colors.text}
                    value={value}
                    onChangeText={onChange}
                  />
                </View>
              )}
            />
          );
        case 'kecamatan':
          return (
            <Controller
              key={fieldName}
              control={control}
              name="kecamatan"
              render={({ field: { onChange, value } }) => (
                <View style={[styles.inputContainer, { borderColor: colors.border, backgroundColor: colors.background }]}>
                  <Feather name="map-pin" size={24} color={colors.text} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, { color: colors.text, backgroundColor: colors.background }]}
                    placeholder="Kecamatan"
                    placeholderTextColor={colors.text}
                    value={value}
                    onChangeText={onChange}
                  />
                </View>
              )}
            />
          );
        case 'kelurahan_desa':
          return (
            <Controller
              key={fieldName}
              control={control}
              name="kelurahan_desa"
              render={({ field: { onChange, value } }) => (
                <View style={[styles.inputContainer, { borderColor: colors.border, backgroundColor: colors.background }]}>
                  <Feather name="map-pin" size={24} color={colors.text} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, { color: colors.text, backgroundColor: colors.background }]}
                    placeholder="Kelurahan/Desa"
                    placeholderTextColor={colors.text}
                    value={value}
                    onChangeText={onChange}
                  />
                </View>
              )}
            />
          );
        case 'alamat_lengkap':
          return (
            <Controller
              key={fieldName}
              control={control}
              name="alamat_lengkap"
              render={({ field: { onChange, value } }) => (
                <View style={[styles.inputContainer, { borderColor: colors.border, backgroundColor: colors.background }]}>
                  <Feather name="map-pin" size={24} color={colors.text} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, { color: colors.text, backgroundColor: colors.background }]}
                    placeholder="Alamat Lengkap"
                    placeholderTextColor={colors.text}
                    value={value}
                    onChangeText={onChange}
                  />
                </View>
              )}
            />
          );
        default:
          return null;
      }
    });
  };

  const renderForm = () => (
    <>
      <View style={[styles.cardSegment, { backgroundColor: colors.background }]}>
        <PanGestureHandler onHandlerStateChange={onHandlerStateChange}>
          <Animated.View>
            <View style={styles.headerSegment}>
              <View style={styles.stepLine}>
                {steps.map((step, index) => (
                  <View key={index} style={styles.stepContainer}>
                    <Text style={styles.onboardingTitle}>{step.title}</Text>
                    <Text style={styles.onboardingDescription}>{step.description}</Text>
                    <View
                      style={[
                        styles.stepLineSegment,
                        index === currentStep && styles.activeStepLineSegment,
                      ]}
                    />
                  </View>
                ))}
              </View>
            </View>
          </Animated.View>
        </PanGestureHandler>
      </View>

      {/* Card Form */}
      <View style={[styles.card, { backgroundColor: colors.background }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Silahkan lengkapi formulir dibawah ini sesuai dengan data diri anda untuk membuat akun
        </Text>

        {/* Form Fields */}
        <KeyboardAwareScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          enableOnAndroid={true}
          extraScrollHeight={20}>
          {renderFormFields()}
        </KeyboardAwareScrollView>
      </View>

      {/* Tombol di Bawah Card Form */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={nextStep}
          disabled={loading}>
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.textButton}>
              {currentStep === steps.length - 1 ? 'Buat Akun' : 'Selanjutnya'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </>
  );

  return (
    <ImageBackground
      source={backgroundSource}
      style={styles.background}
      resizeMode="cover">
      <View style={styles.overlay} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back-ios" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Buat Akun</Text>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        {showForm ? renderForm() : renderInfoScreen()}

        {!showForm && (
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.startButton} onPress={() => setShowForm(true)}>
              <Text style={styles.startButtonText}>Mulai</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  container: {
    flexGrow: 1,
  },
  infoContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 10,
    padding: 20,
    textAlign: "left",
    marginTop: 20,
    marginHorizontal: 10
  },
  infoText: {
    fontSize: 16,
    marginBottom: 10,
  },
  infoList: {
    marginLeft: 10,
    marginBottom: 20,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  checkboxText: {
    marginLeft: 0,
    fontSize: 14,
  },
  startButton: {
    backgroundColor: '#FF6200',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 10
  },
  startButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 40,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginRight: 20,
    flex: 1,
  },
  headerSegment: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  cardSegment: {
    position: 'absolute',
    left: 0,
    right: 0,
    padding: 20,
    marginTop: 20,
    marginHorizontal: 10,
    borderRadius: 10,
    backgroundColor: 'white',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    marginTop: 120,
    marginHorizontal: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '400',
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
  stepContainer: {
    alignItems: 'flex-start',
    marginHorizontal: 5,
    width: '35%',
  },
  onboardingTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  onboardingDescription: {
    fontSize: 12,
    color: 'gray',
    marginBottom: 5,
  },
  stepLine: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    width: '100%',
  },
  stepLineSegment: {
    width: '100%',
    flex: 1,
    height: 3,
    backgroundColor: '#ccc',
    marginHorizontal: 2,
  },
  activeStepLineSegment: {
    backgroundColor: '#FF6600',
  },
  buttonContainer: {
    marginTop: 20,
    marginBottom: 20,
    marginHorizontal: 10
  },
  button: {
    backgroundColor: '#FF6200',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  textButton: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 18,
  },
  errorText: {
    color: 'red',
    fontSize: 14,
    marginBottom: 10,
  },
  modal: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  modalContent: {
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  dragIndicator: {
    width: 50,
    height: 5,
    backgroundColor: '#ccc',
    borderRadius: 10,
    alignSelf: 'center',
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalSubtitle: {
    fontSize: 14,
    marginTop: 5,
    marginBottom: 15,
    textAlign: 'center',
  },
  methodOption: {
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },
  sendButton: {
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  methodTitle: {
    color: '#fff',
    fontWeight: 'bold',
  },
  methodDesc: {
    color: '#fff',
    fontSize: 12,
    marginTop: 2,
  },
});

export default Signup;