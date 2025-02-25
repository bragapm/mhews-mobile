import { Platform, PermissionsAndroid } from 'react-native';
import { request, check, PERMISSIONS, RESULTS } from 'react-native-permissions';
import GetLocation from 'react-native-get-location';

const MAPBOX_ACCESS_TOKEN =
  'sk.eyJ1Ijoid2hvaXNhcnZpYW4iLCJhIjoiY203YjJkajRtMDk3cDJtczlxMDRrOTExNiJ9.61sU5Z9qNoRfQ22qdcAMzQ';

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
      timeout: 60000,
    });

    console.log('location:', location);
    return { latitude: location.latitude, longitude: location.longitude };
  } catch (error: any) {
    console.warn('Error fetching location:', error.code, error.message);
    return null;
  }
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
