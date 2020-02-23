import { AppLoading } from 'expo';
import { Asset } from 'expo-asset';
import * as Font from 'expo-font';
import React, { useState } from 'react';
import { Platform, StatusBar, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ApplicationProvider, Layout,Text } from '@ui-kitten/components';
import { mapping, light as darkTheme } from '@eva-design/eva';
import * as FileSystem from 'expo-file-system';
import { AppearanceProvider } from 'react-native-appearance';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// 检查数据库是否存在，不存在则下载
FileSystem.downloadAsync(
  'http://192.168.2.211:8080/wordfeq.db',
  FileSystem.documentDirectory + 'SQLite/dict.db'
)
.then(({ uri }) => {
  console.log('Finished downloading to ', uri)
})
.catch(error => {
  console.error(error);
})



// import AppNavigator from './navigation/AppNavigator';
import {AppNavigator} from './navigation/NewNavigator';

export default function App(props) {
  const [isLoadingComplete, setLoadingComplete] = useState(false);

  if (!isLoadingComplete && !props.skipLoadingScreen) {
    return (
      <AppLoading
        startAsync={loadResourcesAsync}
        onError={handleLoadingError}
        onFinish={() => handleFinishLoading(setLoadingComplete)}
      />
    );
  } else {
    return (
      <React.Fragment>
        <AppearanceProvider>
          <ApplicationProvider mapping={mapping} theme={darkTheme}>
            <SafeAreaProvider>
              <StatusBar  barStyle={"dark-content"} />
              <AppNavigator />
            </SafeAreaProvider>
          </ApplicationProvider>
        </AppearanceProvider>
      </React.Fragment>
    );
  }
}

async function loadResourcesAsync() {
  await Promise.all([
    Asset.loadAsync([
      require('./assets/images/robot-dev.png'),
      require('./assets/images/robot-prod.png'),
    ]),
    Font.loadAsync({
      // This is the font that we are using for our tab bar
      ...Ionicons.font,
      // We include SpaceMono because we use it in HomeScreen.js. Feel free to
      // remove this if you are not using it in your app
      'space-mono': require('./assets/fonts/SpaceMono-Regular.ttf'),
      'gentium-book': require('./assets/fonts/GentiumBook-Regular.ttf'),
    }),
  ]);
}

function handleLoadingError(error) {
  // In this case, you might want to report the error to your error reporting
  // service, for example Sentry
  console.warn(error);
}

function handleFinishLoading(setLoadingComplete) {
  setLoadingComplete(true);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
