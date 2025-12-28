/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import { Provider } from 'react-redux';
import Store from './App/Redux/store';
import messaging from '@react-native-firebase/messaging';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';


messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('Message handled in the background!', remoteMessage);
});

messaging().getInitialNotification(async remoteMessage => {
  console.log('Message handled in the Kill state!', remoteMessage);
});

const Main = () => (
  <SafeAreaProvider>
    <SafeAreaView
      style={{ flex: 1, backgroundColor: '#000000' }} // change bg if you want
      edges={['top', 'bottom']}                       // protect top & bottom
    >
      <Provider store={Store}>
        <App />
      </Provider>
    </SafeAreaView>
  </SafeAreaProvider>
);
AppRegistry.registerComponent(appName, () => Main);
