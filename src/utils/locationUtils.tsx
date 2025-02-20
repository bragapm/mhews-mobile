import { Platform, PermissionsAndroid } from 'react-native';
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import GetLocation from 'react-native-get-location';

const MAPBOX_ACCESS_TOKEN = 'sk.eyJ1Ijoid2hvaXNhcnZpYW4iLCJhIjoiY203YjJkajRtMDk3cDJtczlxMDRrOTExNiJ9.61sU5Z9qNoRfQ22qdcAMzQ';

const requestLocationPermission = async (): Promise<boolean> => {
    try {
        if (Platform.OS === 'android') {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
            );
            return granted === PermissionsAndroid.RESULTS.GRANTED;
        }
        const result = await request(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);
        return result === RESULTS.GRANTED;
    } catch (error) {
        console.log('Permission Error:', error);
        return false;
    }
};

export const fetchLocation = async (): Promise<{ latitude: number; longitude: number } | null> => {
    try {
        const hasPermission = await PermissionsAndroid.check(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );

        if (!hasPermission) {
            const permissionGranted = await requestLocationPermission();
            if (!permissionGranted) {
                return null;
            }
        }

        const location = await GetLocation.getCurrentPosition({
            enableHighAccuracy: true,
            timeout: 60000,
        });

        return { latitude: location.latitude, longitude: location.longitude };
    } catch (error: any) {
        console.warn(error.code, error.message);
        return null;
    }
};

export const getLocationDetails = async (
    latitude: number,
    longitude: number
): Promise<string | null> => {
    try {
        const response = await fetch(
            `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${MAPBOX_ACCESS_TOKEN}`
        );
        const data = await response.json();

        if (data.features.length > 0) {
            return data.features[0].place_name; // Mengambil alamat paling relevan
        } else {
            return null;
        }
    } catch (error) {
        console.error('Error fetching location details:', error);
        return null;
    }
};
