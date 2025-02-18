import React from 'react';
import { SafeAreaView, StatusBar, useColorScheme, StyleSheet } from 'react-native';
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

const Stack = createStackNavigator();

function App() {
  const isDarkMode = useColorScheme() === 'dark';
  const backgroundStyle = {
    backgroundColor: isDarkMode ? '#000' : '#fff',
  };

  return (
    <AlertProvider>
      <NavigationContainer>
        <SafeAreaView style={[styles.safeArea, backgroundStyle]}>
          <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={backgroundStyle.backgroundColor} />
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Splash" component={SplashScreen} />
            <Stack.Screen name="Login" component={Login} />
            <Stack.Screen name="Signup" component={Signup} />
            <Stack.Screen name="Otp" component={OTPConfirmation} />
            <Stack.Screen name="Tabs" component={TabNavigator} />


            <Stack.Screen name="Profile" component={ProfileScreen} />
            <Stack.Screen name="EditProfile" component={EditProfileScreen} />
            <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
            <Stack.Screen name="FamilyProfile" component={FamilyProfileScreen} />
            <Stack.Screen name="FamilyList" component={FamilyListScreen} />
            <Stack.Screen name="Language" component={LanguageScreen} />
            <Stack.Screen name="AboutUs" component={AboutUsScreen} />
            <Stack.Screen name="HelpCenter" component={HelpCenterScreen} />
            <Stack.Screen name="DisasterRisk" component={DisasterRiskScreen} />
          </Stack.Navigator>
        </SafeAreaView>
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
