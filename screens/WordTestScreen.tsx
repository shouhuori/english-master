import React, { useEffect } from 'react';
import {Text, Layout,Button,TopNavigation} from '@ui-kitten/components';
import {
  Platform,
  Dimensions,
  StyleSheet,
  View,
} from 'react-native';

import * as SQLite from 'expo-sqlite';

const db  = SQLite.openDatabase('dict.db');


const getRandomNumberByRangeWord = (start, end) => {
  return   Math.floor(Math.random() * (end - start) + start)
}

/**
 从5000开始，答错减1000，答对加1000，跳过增加难度
 15道题后，同时 在区间内相差不到1000达到3次。答对加100答错减100
 */

/**
 * 词汇量测试
 */
export default  function WordTestScreen(props) {
  const [num, setNum] = React.useState(0);
  const [word, setWord] = React.useState(0);
  let id = getRandomNumberByRangeWord(5000,5100);

  useEffect(() => {
    console.log(id)
    db.transaction(tx => {
      tx.executeSql(
        `select * from wordfeq where id = ?;`,
        [id],
        (_, { rows: { _array } }) => setWord(_array[0])
      )
    })
  }, []);



  return (
    <Layout style={styles.container}>
      <TopNavigation title={'当前词汇量: '+num}/>
      <View style={styles.container}>
      <Text  style={styles.titleLabel} category='h1'>{word.name}</Text>
      </View>
          <View style={styles.tabBarInfoContainer}>
            <View style={styles.buttonGroup}>
              <Button style={styles.button} onPress={() => {
              }} appearance='filled'>陌生</Button>
              <Button style={styles.button} appearance='outline' onPress={() => {
              }} >熟悉</Button>
            </View>
          </View>
    </Layout>
  );
}

WordTestScreen.navigationOptions = {
  header: null,
};

const styles = StyleSheet.create({
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
