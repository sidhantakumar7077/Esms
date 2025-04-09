/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import { Provider } from 'react-redux';
import Store from './App/Redux/store';
import messaging from '@react-native-firebase/messaging';


messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('Message handled in the background!', remoteMessage);
});

messaging().getInitialNotification(async remoteMessage => {
  console.log('Message handled in the Kill state!', remoteMessage);
});

const Main = () => (
    <Provider store={Store}>
      <App />
    </Provider>
  );

AppRegistry.registerComponent(appName, () => Main);
