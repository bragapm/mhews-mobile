import { Platform, PermissionsAndroid } from 'react-native';
import { request, check, PERMISSIONS, RESULTS } from 'react-native-permissions';
import GetLocation from 'react-native-get-location';
import Geolocation from '@react-native-community/geolocation';
import { MAPBOX_ACCESS_TOKEN } from '../services/apiServices';

const requestLocationPermission = async (): Promise<boolean> => {
  try {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } else {
      // Periksa apakah izin sudah diberikan di iOS
      const permissionType = PERMISSIONS.IOS.LOCATION_WHEN_IN_USE; // Bisa diganti ke LOCATION_ALWAYS jika perlu
      const status = await check(permissionType);

      if (status === RESULTS.GRANTED) {
        return true;
      } else {
        // Minta izin jika belum diberikan
        const result = await request(permissionType);
        return result === RESULTS.GRANTED;
      }
    }
  } catch (error) {
    console.log('Permission Error:', error);
    return false;
  }
};

export const fetchLocation = async (): Promise<{
  latitude: number;
  longitude: number;
} | null> => {
  try {
    let hasPermission = false;

    if (Platform.OS === 'android') {
      hasPermission = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      );
    } else {
      const permissionType = PERMISSIONS.IOS.LOCATION_WHEN_IN_USE;
      const result = await check(permissionType);
      hasPermission = result === RESULTS.GRANTED;
    }

    if (!hasPermission) {
      const permissionGranted = await requestLocationPermission();
      if (!permissionGranted) {
        console.warn('Location permission denied');
        return null;
      }
    }

    const location = await GetLocation.getCurrentPosition({
      enableHighAccuracy: true,
      timeout: 30000,
    });

    if (location) {
      return { latitude: location.latitude, longitude: location.longitude };
    } else {
      console.warn('Error fetching location');
      return null;
    }
  } catch (error: any) {
    console.warn('Error fetching location:', error.code, error.message);
    return null;
  }
};

export const watchLocation = async (callback: (location: { latitude: number; longitude: number }) => void) => {
  const watchId = await Geolocation.watchPosition(
    (position) => {
      const location = { latitude: position.coords.latitude, longitude: position.coords.longitude };
      console.log("📍 New Location:", location);
      callback(location);
    },
    async (error) => {
      console.log("❌ Error watching location:", error);

      await Geolocation.getCurrentPosition(
        (position) => {
          const location = { latitude: position.coords.latitude, longitude: position.coords.longitude };
          console.log("📍 Fallback Location:", location);
          callback(location);
        },
        (err) => {
          console.log("❌ Error getting current position:", err);
        },
        {
          enableHighAccuracy: true,
        }
      );
    },
    {
      distanceFilter: 1,
      interval: 60000,
      fastestInterval: 30000,
      enableHighAccuracy: true,
      useSignificantChanges: false,
    }
  );

  return () => Geolocation.clearWatch(watchId);
};

export const getLocationDetails = async (
  latitude: number,
  longitude: number,
): Promise<string | null> => {
  try {
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${MAPBOX_ACCESS_TOKEN}`,
    );
    const data = await response.json();

    if (data.features && data.features.length > 0) {
      return data.features[0].place_name; // Mengambil alamat paling relevan
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error fetching location details:', error);
    return null;
  }
};
