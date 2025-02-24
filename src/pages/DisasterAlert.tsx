import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  PanResponder,
  Animated,
  Dimensions,
  Pressable,
  Image,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import {RootStackParamList} from '../navigation/types';

const {width, height} = Dimensions.get('window');

const DisasterAlertScreen = () => {
  const iconPhone = require('../assets/icons/phone.png');
  const iconMegaphone = require('../assets/icons/megaphone.png');

  const [bottomSheetHeight, setBottomSheetHeight] = useState(200);
  const pan = useRef(new Animated.ValueXY()).current;
  const [isShowServices, setIsShowServices] = useState(false);
  const [isDanger, setIsDanger] = useState(false);
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderMove: (event, gestureState) => {
      const delta = gestureState.dy;
      setBottomSheetHeight(prevHeight => {
        const newHeight = prevHeight - delta;
        if (newHeight > height * 0.7) {
          return height * 0.7;
        } else if (newHeight < 200) {
          return 200;
        } else {
          return newHeight;
        }
      });
    },
    onPanResponderRelease: () => {
      pan.flattenOffset();
    },
  });

  const actionStatus = (status: any) => {
    if (status == 'safe') {
      navigation.navigate('Tabs');
    } else {
      setBottomSheetHeight(300);
      setIsShowServices(true);
    }
  };

  useEffect(() => {
    if (isDanger) {
      setBottomSheetHeight(150);
    }
  }, [isDanger]);

  return (
    <View
      style={[
        styles.container,
        {backgroundColor: !isDanger ? '#F36A1D' : '#C4432C'},
      ]}>
      <View style={styles.backgroundContainer}>
        <View style={styles.circleLarge}>
          <View style={styles.circleSmall}>
            <Image
              source={require('../assets/images/vector-danger.png')}
              style={styles.warningImage}
            />
          </View>
        </View>
      </View>

      {isShowServices && <View style={styles.overlay} />}
      <View style={styles.header}>
        <Text style={styles.title}>
          {isDanger ? 'Peringatan Tsunami' : 'Peringatan Gempa!'}
        </Text>
        <Text style={styles.description}>
          {isDanger
            ? 'Jika anda menerima notifikasi ini, harap segera melakukan evakuasi ke zona aman dan mengiikuti petunjuk resmi'
            : 'Jika anda menerima notifikasi ini, anda berada pada zona tidak aman. Harap mempersiapkan evakuasi dan ikuti petunjuk dari kami.'}
        </Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.cardContainer}>
          {isDanger && (
            <Text style={styles.titleDanger}>Tsunami akan terjadi dalam :</Text>
          )}

          {!isDanger ? (
            <>
              <View style={styles.cardLocation}>
                <View style={styles.cardLokasi}>
                  <Text style={styles.cardTitle}>Lokasi Gempa</Text>
                  <Text style={styles.cardValue}>
                    -7.72145772, 109.00724549
                  </Text>
                </View>
                <TouchableOpacity style={styles.button}>
                  <Text style={styles.buttonTextLokasi}>
                    Peta Lokasi Bencana
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.cardFlex}>
                <View style={styles.card}>
                  <Text style={styles.cardTitle}>Kekuatan Gempa</Text>
                  <Text style={styles.cardValue}>7.4 Magnitudo</Text>
                </View>
                <View style={styles.card}>
                  <Text style={styles.cardTitle}>Kedalaman Gempa</Text>
                  <Text style={styles.cardValue}>5 Meter</Text>
                </View>
                <View style={styles.card}>
                  <Text style={styles.cardTitle}>Skala Gempa</Text>
                  <Text style={styles.cardValue}>IV MMI</Text>
                </View>
              </View>
            </>
          ) : (
            <>
              <View style={styles.cardFlex}>
                <View style={styles.card}>
                  <Text style={styles.cardTitle}>Jam</Text>
                  <Text style={styles.cardValue}>00</Text>
                </View>
                <View style={styles.card}>
                  <Text style={styles.cardTitle}>Menit</Text>
                  <Text style={styles.cardValue}>14</Text>
                </View>
                <View style={styles.card}>
                  <Text style={styles.cardTitle}>Detik</Text>
                  <Text style={styles.cardValue}>28</Text>
                </View>
              </View>
            </>
          )}
        </View>
      </ScrollView>

      <View
        {...panResponder.panHandlers}
        style={[styles.bottomSheet, {height: bottomSheetHeight}]}>
        <View style={styles.dragIndicator} />
        {!isShowServices ? (
          <>
            {isDanger ? (
              <>
                <TouchableOpacity
                  style={styles.buttonPrimary}
                  onPress={() => actionStatus('safe')}>
                  <Text style={styles.buttonText}>Saya Tidak Terdampak</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.buttonSecondary}
                  onPress={() => actionStatus('not_safe')}>
                  <Text style={styles.buttonTextSecondary}>
                    Saya Terdampak, Butuh Bantuan
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity
                style={styles.buttonDanger}
                // onPress={() => actionStatus("not_safe")}
                onPress={() => navigation.navigate('EvacuationLocation')}>
                <Text style={styles.buttonTextDanger}>Lihat Peta Evakuasi</Text>
              </TouchableOpacity>
            )}
          </>
        ) : (
          <>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
              <View style={{flexDirection: 'column'}}>
                <Text style={styles.modalTitle}>Pilih Layanan</Text>
                <Text style={styles.modalSubtitle}>
                  Silahkan pilih layanan yang anda butuhkan
                </Text>
              </View>
              <Pressable
                onPress={() => {
                  setBottomSheetHeight(200);
                  setIsShowServices(false);
                }}>
                <Feather
                  name="x"
                  size={24}
                  color="#000"
                  style={{padding: 8, marginBottom: 20}}
                />
              </Pressable>
            </View>

            <Pressable
              style={({pressed}) => [
                styles.methodOption,
                {
                  opacity: pressed ? 0.9 : 1,
                  transform: [{scale: pressed ? 0.98 : 1}],
                },
              ]}>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <Image
                  source={iconPhone}
                  style={{
                    width: 20,
                    height: 20,
                    resizeMode: 'contain',
                    marginRight: 8,
                  }}
                />
                <View style={{flexDirection: 'column', width: '90%'}}>
                  <Text style={styles.methodTitle}>
                    Nomor Kontak Center Bencana
                  </Text>
                  <Text style={styles.methodDesc}>
                    Hubungi kontak center bencana untuk bantuan cepat dalam
                    keadaan darurat
                  </Text>
                </View>
                <Feather
                  name="chevron-right"
                  size={20}
                  style={{marginRight: 8}}
                />
              </View>
            </Pressable>

            <Pressable
              style={({pressed}) => [
                styles.methodOption,
                {
                  opacity: pressed ? 0.9 : 1,
                  transform: [{scale: pressed ? 0.98 : 1}],
                },
              ]}>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <Image
                  source={iconMegaphone}
                  style={{
                    width: 20,
                    height: 20,
                    resizeMode: 'contain',
                    marginRight: 8,
                  }}
                />
                <View style={{flexDirection: 'column', width: '90%'}}>
                  <Text style={styles.methodTitle}>Lapor Bencana</Text>
                  <Text style={styles.methodDesc}>
                    Laporkan kejadian bencana atau situasi darurat yang anda
                    alami
                  </Text>
                </View>
                <Feather
                  name="chevron-right"
                  size={20}
                  style={{marginRight: 8}}
                />
              </View>
            </Pressable>
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  backgroundContainer: {
    position: 'absolute',
    top: -200,
    left: -30,
  },
  titleDanger: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  circleLarge: {
    position: 'absolute',
    width: 700,
    height: 700,
    borderRadius: 350,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleSmall: {
    width: 400,
    height: 400,
    borderRadius: 200,
    backgroundColor: 'rgba(255, 255, 255, 0.11)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  warningImage: {
    width: 150,
    height: 150,
    resizeMode: 'contain',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
  },
  header: {
    marginTop: 50,
  },
  title: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#fff',
    width: '70%',
  },
  description: {
    fontSize: 14,
    color: '#fff',
    marginTop: 10,
    width: '70%',
  },
  bottomSheet: {
    backgroundColor: '#fff',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 200,
  },
  dragIndicator: {
    width: 60,
    height: 5,
    backgroundColor: '#ccc',
    borderRadius: 5,
    alignSelf: 'center',
    marginBottom: 10,
  },
  buttonPrimary: {
    backgroundColor: '#F97316',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonDanger: {
    backgroundColor: '#C4432C',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonTextDanger: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonTextLokasi: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonSecondary: {
    borderWidth: 2,
    borderColor: '#C4432C',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonTextSecondary: {
    color: '#C4432C',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cardFlex: {
    display: 'flex',
    flexDirection: 'row',
  },
  cardContainer: {
    marginTop: 10,
  },
  cardLocation: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    marginHorizontal: 3,
  },
  button: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.62)',
    paddingVertical: 6,
    paddingHorizontal: 10,
    alignSelf: 'flex-end',
  },
  cardLokasi: {
    flex: 1,
    justifyContent: 'space-between',
  },
  card: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    marginHorizontal: 4,
    justifyContent: 'space-between',
  },
  cardTitle: {
    fontSize: 14,
    color: '#fff',
  },
  cardValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 10,
  },
  methodOption: {
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },
  modalTitle: {fontSize: 18, fontWeight: 'bold'},
  modalSubtitle: {
    fontSize: 14,
    marginTop: 5,
    marginBottom: 15,
  },
  methodTitle: {
    fontWeight: 'bold',
  },
  methodDesc: {
    fontSize: 12,
    marginTop: 2,
  },
});

export default DisasterAlertScreen;
