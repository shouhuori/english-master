import React from 'react';
import { createAppContainer, SafeAreaView } from 'react-navigation';
import { createBottomTabNavigator } from 'react-navigation-tabs';
import { createStackNavigator } from 'react-navigation-stack';
import { BottomNavigation, BottomNavigationTab, Layout, Text } from '@ui-kitten/components';
import HomeScreen from '../screens/HomeScreen';
import WordScreen from '../screens/WordScreen';



const HomeStack = createStackNavigator(
  {
    Home: HomeScreen,
    Word: WordScreen,
  },
);


const OrdersScreen = () => (
  <Layout style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <Text category='h1'>设置</Text>
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
      <BottomNavigation selectedIndex={navigation.state.index} onSelect={onSelect}>
        <BottomNavigationTab title='起步'/>
        <BottomNavigationTab title='单词'/>
        <BottomNavigationTab title='设置'/>
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

export  const AppNavigator = createAppContainer(TabNavigator);