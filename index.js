/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import { setupBackgroundMessageHandler } from './src/utils/fcm';
// import { setupBackgroundMessageHandler } from './src/utils/fcm';

setupBackgroundMessageHandler();

AppRegistry.registerComponent(appName, () => App);
