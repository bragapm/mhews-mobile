import React, { useEffect } from 'react';
import {
  SafeAreaView,
  StatusBar,
  useColorScheme,
  StyleSheet,
  Alert,
  Platform,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import SplashScreen from './src/splash';
import AlertProvider from './src/components/AlertContext';
import TabNavigator from './src/(tabs)/_layout';
import Login from './src/auth/login';
import Signup from './src/auth/signup';
import OTPConfirmation from './src/auth/otp';
import EditProfileScreen from './src/pages/account/EditProfile';
import DisasterRiskScreen from './src/pages/DisasterRisk';
import ProfileScreen from './src/(tabs)/profile';
import ChangePasswordScreen from './src/pages/account/ChangePassword';
import FamilyProfileScreen from './src/pages/account/FamilyProfile';
import LanguageScreen from './src/pages/account/Language';
import AboutUsScreen from './src/pages/account/AboutUs';
import HelpCenterScreen from './src/pages/account/HelpCenter';
import FamilyListScreen from './src/pages/account/FamilyList';
import FindFamilyScreen from './src/pages/account/FindFamily';
import DisasterAlertScreen from './src/pages/DisasterAlert';
import EvacuationLocationScreen from './src/pages/EvacuationLocation';
import ManageLocationsScreen from './src/pages/ManageLocations';
import { initBackgroundFetch, requestUserPermissionFCM } from './src/utils/fcm';
import NotifEvacuateLocationScreen from './src/pages/NotifEvacuateLocation';
import { check, PERMISSIONS, RESULTS } from 'react-native-permissions';
import { SOSModalProvider } from './src/components/GlobalSOSModal';
import ChatScreen from './src/(tabs)/chat';
import DisasterReportScreen from './src/pages/DisasterReport';
import NotificationsScreen from './src/pages/Notifications';
import ForgotPasswordPage from './src/pages/forgotPassword';
import ResetPasswordPage from './src/pages/ResetPassword';
import TwoFactorAuthScreen from './src/pages/account/TwoFactorAuth';
const Stack = createStackNavigator();

function App() {
  const isDarkMode = useColorScheme() === 'dark';
  const backgroundStyle = {
    backgroundColor: isDarkMode ? '#000' : '#fff',
  };

  useEffect(() => {
    requestUserPermissionFCM();
    const requestLocationPermission = async () => {
      const permission = Platform.select({
        ios: PERMISSIONS.IOS.LOCATION_WHEN_IN_USE,
        android: PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
      });

      if (!permission) return;

      const result = await check(permission);

      if (result === RESULTS.GRANTED) {
        console.log('✅ Izin lokasi sudah diberikan.');
        await initBackgroundFetch();
      } else {
        console.warn('⚠ Izin lokasi belum diberikan.');
      }
    };

    requestLocationPermission();
  }, []);

  return (
    <AlertProvider>
      <NavigationContainer>
        <SOSModalProvider>
          <SafeAreaView style={[styles.safeArea, backgroundStyle]}>
            <StatusBar
              barStyle={isDarkMode ? 'light-content' : 'dark-content'}
              backgroundColor={backgroundStyle.backgroundColor}
            />
            <Stack.Navigator screenOptions={{ headerShown: false }}>
              <Stack.Screen name="Splash" component={SplashScreen} />
              <Stack.Screen name="Login" component={Login} />
              <Stack.Screen name="Signup" component={Signup} />
              <Stack.Screen name="Otp" component={OTPConfirmation} />
              <Stack.Screen name="Tabs" component={TabNavigator} />
              <Stack.Screen name="Profile" component={ProfileScreen} />
              <Stack.Screen name="EditProfile" component={EditProfileScreen} />
              <Stack.Screen name="TwoFactorAuth" component={TwoFactorAuthScreen} />
              <Stack.Screen name="ChatScreen" component={ChatScreen} />
              <Stack.Screen
                name="ChangePassword"
                component={ChangePasswordScreen}
              />
              <Stack.Screen
                name="FamilyProfile"
                component={FamilyProfileScreen}
              />
              <Stack.Screen name="FamilyList" component={FamilyListScreen} />
              <Stack.Screen name="FindFamily" component={FindFamilyScreen} />
              <Stack.Screen name="Language" component={LanguageScreen} />
              <Stack.Screen name="AboutUs" component={AboutUsScreen} />
              <Stack.Screen name="HelpCenter" component={HelpCenterScreen} />
              <Stack.Screen
                name="DisasterRisk"
                component={DisasterRiskScreen}
              />
              <Stack.Screen
                name="ManageLocations"
                component={ManageLocationsScreen}
              />
              {/* Full screen notif */}
              <Stack.Screen
                name="DisasterAlert"
                component={DisasterAlertScreen}
              />
              <Stack.Screen
                name="EvacuationLocation"
                component={EvacuationLocationScreen}
              />
              <Stack.Screen
                name="DisasterReport"
                component={DisasterReportScreen}
              />
              <Stack.Screen
                name="ForgotPassword"
                component={ForgotPasswordPage}
              />
              <Stack.Screen
                name="ResetPassword"
                component={ResetPasswordPage}
              />
              <Stack.Screen
                name="NotifEvacuateLocationScreen"
                component={NotifEvacuateLocationScreen}
              />
              <Stack.Screen
                name="Notifications"
                component={NotificationsScreen}
              />
            </Stack.Navigator>
          </SafeAreaView>
        </SOSModalProvider>
      </NavigationContainer>
    </AlertProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
});

export default App;
