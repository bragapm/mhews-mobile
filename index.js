/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import { setupBackgroundMessageHandler } from './src/utils/fcm';
import { fetchDataInBackground } from "./src/utils/fcm";
import BackgroundFetch from 'react-native-background-fetch';
import notifee, { EventType } from '@notifee/react-native';

setupBackgroundMessageHandler();

notifee.onBackgroundEvent(async ({ type, detail }) => {
    if (type === EventType.DISMISSED || type === EventType.PRESS) {
        console.log("📢 Notifikasi diinteraksi dalam background");
    }
});

const headlessTask = async (event) => {
    const { taskId } = event;
    console.log(`🔹 Headless task executed: ${taskId}`);

    await fetchDataInBackground();

    BackgroundFetch.finish(taskId);
};

// 🔹 Daftarkan Headless Task
BackgroundFetch.registerHeadlessTask(headlessTask);

AppRegistry.registerComponent(appName, () => App);
