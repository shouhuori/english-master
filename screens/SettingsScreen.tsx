import React, { useEffect } from 'react';
import {Text,Divider,Icon, Layout,Button,Modal ,Input,TopNavigationAction,TopNavigation} from '@ui-kitten/components';
import {
  Image,
  Platform,
  ScrollView,
  Dimensions,
  StyleSheet,
  TouchableOpacity,
  Alert,
  View,
} from 'react-native';
import {Audio} from 'expo-av';
import ms from '../components/ms'
import * as SQLite from 'expo-sqlite';

export default function SettingsScreen(props) {
  return (
    <Layout style={styles.container}>
      <Text 
        style={styles.titleLabel}
        category='h4'>词汇量
      </Text>
      <Text 
        style={styles.titleLabel}
        category='p1'>感到自己英文水平提升的时候就做一次测试，建议经常测试。
      </Text>
      <View style={styles.testButtonContainer}>
        <Button onPress={() => {
         props.navigation.navigate('WordTest')
        }}>测试</Button>
      </View>
    </Layout>
    )
}


SettingsScreen.navigationOptions = {
  header: null,
};

const styles = StyleSheet.create({
  testButtonContainer: {
    alignItems: 'center',
    // margin: 10,
  },
  container: {
    flex: 1,
  },
  contentBack:{
    width:Dimensions.get('window').width,
    height:Dimensions.get('window').height,
  },
  nextButton: {
    width:100,
    position:"absolute",
    bottom: 20,
    right: 20,
  },
  list: {
    flex: 1,
  },
  header: {
    marginBottom: 8,
  },
  buttonGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  button: {
    margin: 15
  },
  tabBarInfoContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    ...Platform.select({
      ios: {
        shadowColor: 'black',
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 20,
      },
    }),
    alignItems: 'center',
    backgroundColor: '#fbfbfb',
    paddingVertical: 10,
  },
  image: {
    height: 240,
  },
  titleLabel: {
    marginHorizontal: 24,
    marginVertical: 16,
  },
  phsym:{
    marginHorizontal: 24,
    marginVertical: 6,
  },
  descriptionLabel: {
    margin: 24,
  },
  contentLabel: {
    margin: 24,
  },
  authoringContainer: {
    flexDirection: 'row',
    marginHorizontal: 24,
  },
  dateLabel: {
    marginHorizontal: 8,
  },
  commentInputLabel: {
    fontSize: 16,
    marginBottom: 8,
  },
  commentInput: {
    marginHorizontal: 24,
    marginTop: 24,
    marginBottom: 20,
  },

});
