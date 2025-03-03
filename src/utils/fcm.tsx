import messaging from '@react-native-firebase/messaging';
import notifee, { AndroidImportance } from '@notifee/react-native';
import { AppState, PermissionsAndroid, Platform } from 'react-native';
import { navigate } from '../navigation/RootNavigation';
import BackgroundFetch from 'react-native-background-fetch';
import { fetchLocation, getLocationDetails, watchLocation } from './locationUtils';
import BackgroundService from 'react-native-background-actions';
import BackgroundGeolocation from 'react-native-background-geolocation';
import { patchData } from '../services/apiServices';
import useAuthStore from '../hooks/auth';

/**
 * Meminta izin untuk menerima notifikasi push
 */
export async function requestUserPermissionFCM() {
    try {
        if (Platform.OS === "android" && Platform.Version >= 33) {
            await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
            );
        }

        await notifee.requestPermission();
        const authStatus = await messaging().requestPermission();
        const enabled =
            authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
            authStatus === messaging.AuthorizationStatus.PROVISIONAL;

        if (enabled) {
            console.log('Izin notifikasi diberikan');
            await getFcmToken(); // Ambil token setelah izin diberikan
        } else {
            console.log('Izin notifikasi ditolak');
        }
    } catch (error) {
        console.error('Gagal meminta izin notifikasi:', error);
    }
}

/**
 * Mengambil FCM Token untuk perangkat
 * @returns {Promise<string | null>} FCM Token atau null jika gagal
 */
export async function getFcmToken() {
    try {
        const token = await messaging().getToken();
        console.log('FCM Token:', token);
        return token;
    } catch (error) {
        console.error('Gagal mendapatkan FCM Token:', error);
        return null;
    }
}

/**
 * Mendengarkan perubahan FCM Token
 */
export function listenForTokenRefresh() {
    messaging().onTokenRefresh(token => {
        console.log('FCM Token diperbarui:', token);
    });
}

/**
 * Menampilkan notifikasi menggunakan Notifee
 * @param {Object} remoteMessage Notifikasi yang diterima
 */
async function displayNotification(remoteMessage: any) {
    const selectSound = remoteMessage.notification.title.includes("Warning:") ? "notif_sound_danger" : "notif_sound";
    const channelId = await notifee.createChannel({
        id: "MHEWS",
        name: "MHEWS NOTIFICATIONS",
        vibration: true,
        importance: AndroidImportance.HIGH,
        vibrationPattern: [300, 500],
        sound: selectSound,
    });

    await notifee.displayNotification({
        title: remoteMessage.notification?.title,
        body: remoteMessage.notification?.body,
        android: {
            channelId: channelId,
            importance: AndroidImportance.HIGH,
            vibrationPattern: [300, 500],
            sound: selectSound,
            pressAction: {
                id: 'default',
            },
        },
    });
}

/**
 * Mendengarkan notifikasi saat aplikasi sedang berjalan (foreground)
 * @param {Function} onMessage Callback ketika ada notifikasi masuk
 * @returns {Function} Fungsi unsubscribe untuk berhenti mendengarkan
 */
export function listenForForegroundNotifications(onMessage: any) {
    return messaging().onMessage(async (remoteMessage: any) => {
        console.log('Notifikasi diterima di foreground:', remoteMessage);
        if (remoteMessage.notification) {
            await displayNotification(remoteMessage);
            if (remoteMessage.notification?.title.includes("Warning:")) {
                navigate('DisasterAlert');
            }
        }
        if (onMessage) onMessage(remoteMessage);
    });
}

/**
 * Mendapatkan notifikasi saat aplikasi dibuka dari background
 * @param {Function} onNotification Callback ketika aplikasi dibuka dari notifikasi
 */
export function checkInitialNotification(onNotification: any) {
    messaging()
        .getInitialNotification()
        .then((remoteMessage) => {
            if (remoteMessage) {
                console.log('Notifikasi dari background:', remoteMessage);
                if (onNotification) onNotification(remoteMessage);
            }
        })
        .catch(error => console.error('Gagal mendapatkan notifikasi awal:', error));
}

/**
 * Handler untuk notifikasi yang diterima saat aplikasi di background/terminated
 */
export function setupBackgroundMessageHandler() {
    messaging().setBackgroundMessageHandler(async (remoteMessage: any) => {
        console.log('Notifikasi diterima di background:', remoteMessage);
        if (remoteMessage.notification) {
            console.log(remoteMessage.notification?.title.includes("Warning:"));

            if (remoteMessage.notification?.title.includes("Warning:")) {
                navigate('DisasterAlert');
            }
            await displayNotification(remoteMessage);
        }
    });
}

/**
 * Kebutuhan running background
 */
export async function initBackgroundFetch() {
    try {
        console.log("🔹 Initializing Background Fetch...");
        await BackgroundFetch.configure(
            {
                minimumFetchInterval: 15,
                stopOnTerminate: false,
                startOnBoot: true,
                enableHeadless: true,
                requiredNetworkType: BackgroundFetch.NETWORK_TYPE_ANY,
            },
            async (taskId) => {
                console.log(`🔹 Background task executed: ${taskId}`);
                await fetchDataInBackground();
                BackgroundFetch.finish(taskId);
            },
            (error) => {
                console.error("❌ Background Fetch failed to start:", error);
            }
        );

        console.log("✅ Background Fetch started!");
        await BackgroundFetch.start();
        await createBackgroundTask();
    } catch (error) {
        console.error("❌ Error initializing background fetch:", error);
    }
}

export const stopBackgroundTask = async () => {
    try {
        await BackgroundFetch.stop();
        console.log("Background Fetch stopped");
    } catch (error) {
        console.error("Error stopping background fetch:", error);
    }
};

export async function createBackgroundTask() {
    try {
        console.log("📝 Creating Background Task...");
        await BackgroundFetch.scheduleTask({
            taskId: "com.mhews.braga.id.fetchinbackground",
            delay: 60000,
            periodic: true,
            stopOnTerminate: false,
            startOnBoot: true,
            requiredNetworkType: BackgroundFetch.NETWORK_TYPE_ANY,
        });

        console.log("✅ Background Task Scheduled!");
    } catch (error) {
        console.error("❌ Error creating background task:", error);
    }
}

export async function fetchDataInBackground() {
    try {
        console.log("📡 Fetching data in background...");
        await showSyncNotification();

        const location = await BackgroundGeolocation.getCurrentPosition({
            samples: 3,
            extras: {
                "event": "getCurrentPosition"
            }
        });
        if (location) {
            console.log("📍 Location fetched:", location);
            const address = await getLocationDetails(location?.coords?.latitude, location?.coords?.longitude);
            console.log("🏠 Address fetched:", address);
            await notifee.stopForegroundService();
            console.log("📢 Notifikasi sinkronisasi dihapus.");
            handleData(location);
        }
        console.log('[getCurrentPosition]', location);
    } catch (error) {
        console.error("❌ Error fetching background data:", error);
        await notifee.stopForegroundService();
    }
}

const handleData = async (data: any) => {
    const { profile, getProfile } = useAuthStore();
    let fcm_token = await getFcmToken();
    try {
        const { latitude, longitude } = data.coords;

        const dataPayload = {
            location: `${latitude}, ${longitude}`,
            "geom": {
                "type": "Point",
                "coordinates": [
                    data?.coords?.longitude,
                    data?.coords?.latitude
                ]
            },
            fcm_token: fcm_token
        }
        const response = await patchData('/users/' + profile?.id, dataPayload);
        if (response?.data) {
            console.log(response);
        }
    } catch (error: any) {
    }
};

export async function showSyncNotification() {
    const channelId = await notifee.createChannel({
        id: "sync-channel",
        name: "Sync Notifications",
        importance: AndroidImportance.HIGH,
    });

    await notifee.displayNotification({
        title: "Sedang Mensinkronkan Data...",
        body: "Mohon tunggu, sedang mengambil lokasi...",
        android: {
            channelId,
            importance: AndroidImportance.HIGH,
            asForegroundService: true,
            autoCancel: false,
            progress: {
                indeterminate: true,
            },
            ticker: "Sedang memperbarui data...",
        },
    });
}