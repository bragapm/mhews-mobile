import messaging from '@react-native-firebase/messaging';
import notifee, { AndroidImportance } from '@notifee/react-native';

/**
 * Meminta izin untuk menerima notifikasi push
 */
export async function requestUserPermissionFCM() {
    try {
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
    const channelId = await notifee.createChannel({
        id: "MHEWS",
        name: "MHEWS NOTIFICATIONS",
        vibration: true,
        importance: AndroidImportance.HIGH,
        vibrationPattern: [300, 500],
        sound: "notif_sound",
    });

    await notifee.displayNotification({
        title: remoteMessage.notification?.title,
        body: remoteMessage.notification?.body,
        android: {
            channelId: channelId,
            importance: AndroidImportance.HIGH,
            smallIcon: 'ic_stat_notification',
            sound: "notif_sound",
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
    return messaging().onMessage(async remoteMessage => {
        console.log('Notifikasi diterima di foreground:', remoteMessage);
        await displayNotification(remoteMessage);
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
    messaging().setBackgroundMessageHandler(async remoteMessage => {
        console.log('Notifikasi diterima di background:', remoteMessage);
        await displayNotification(remoteMessage);
    });
}