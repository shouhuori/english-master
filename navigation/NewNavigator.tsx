import React from 'react';
import { createAppContainer, SafeAreaView } from 'react-navigation';
import { createBottomTabNavigator } from 'react-navigation-tabs';
import { createStackNavigator } from 'react-navigation-stack';
import { BottomNavigation, BottomNavigationTab, Layout, Text } from '@ui-kitten/components';
import HomeScreen from '../screens/HomeScreen';
import WordScreen from '../screens/WordScreen';
import {StyleSheet} from 'react-native';


const HomeStack = createStackNavigator(
  {
    Home: HomeScreen,
    Word: WordScreen,
  },
);


const OrdersScreen = () => (
  <Layout style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <Text category='h1'>单词</Text>
  </Layout>
);
const SettingScreen = () => (
  <Layout style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <Text category='h1'>设置</Text>
  </Layout>
);

const TabBarComponent = ({ navigation }) => {

  const onSelect = (index) => {
    const selectedTabRoute = navigation.state.routes[index];
    navigation.navigate(selectedTabRoute.routeName);
  };

  return (
    <SafeAreaView>
      <BottomNavigation indicatorStyle={styles.indicator}  selectedIndex={navigation.state.index} onSelect={onSelect}>
        <BottomNavigationTab  titleStyle={styles.tab}  title='起步'/>
        <BottomNavigationTab titleStyle={styles.tab} title='单词'/>
        <BottomNavigationTab titleStyle={styles.tab} title='设置'/>
      </BottomNavigation>
    </SafeAreaView>
  );
};

const TabNavigator = createBottomTabNavigator({
  HomeStack,
  Orders: OrdersScreen,
  Setting: SettingScreen,
}, {
  tabBarComponent: TabBarComponent,
});

const styles = StyleSheet.create({
  tab:{
    fontSize:15
  },
  indicator:{
    bottom:0
  }

})

export  const AppNavigator = createAppContainer(TabNavigator);