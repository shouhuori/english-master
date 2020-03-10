import React,{useEffect} from 'react';
import {Text,List, Layout,Button,Card,Input} from '@ui-kitten/components';
import {cleanWordArray}  from '../components/Func';
import {
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  ListRenderItemInfo,
  TouchableOpacity,
  Alert,
  View,
} from 'react-native';
import * as SQLite from 'expo-sqlite';
const db  = SQLite.openDatabase('dict.db');

const data = [
  {name:'name'},
  {name:'native'},
  {name:'react'},
]


class WordInReading {
  constructor(
    readonly name: string,
    readonly id: string,
  ) { }
}
const renderItem = (info:ListRenderItemInfo<WordInReading>): React.ReactElement => (
  <View style={{ marginVertical: 4, marginHorizontal: 16 }}>
    <Text style={styles.fontBook}>{info.item.name}-{info.item.id}</Text>
  </View>
);


export default function ReadingScreen(props) {
  const [value, setValue] = React.useState('');
  const [words, setWords] = React.useState([{name:'',id:0}]);
  const [text, setText] = React.useState('1917 is a 2019 war film directed and produced by Sam Mendes, who wrote the screenplay with Krysty Wilson-Cairns. The film stars George MacKay, Dean-Charles Chapman, Mark Strong, Andrew Scott, Richard Madden, Claire Duburcq, with Colin Firth, and Benedict Cumberbatch. The film is based in part on an account told to Mendes by his paternal grandfather, Alfred Mendes,[3] and it chronicles the story of two young British soldiers at the height of WWI during Spring 1917 who have been given a mission to deliver a message which will warn of an ambush during one of the skirmishes soon after the German retreat to the Hindenburg Line during Operation Alberich.');

   const setWordList = ()=>{
    let wordArray = cleanWordArray(text).map((word)=>{
      return "'"+word+"'"
    })
    let wordString = String(wordArray);
    console.log(wordString);
    db.transaction(tx => {
      tx.executeSql(
        `select * from wordfeq where id > ? and  name in (`+ wordString+`) ;`,
        [5000,wordString],
        (_, { rows: { _array } }) =>{
          console.log(_array)
          console.log(_array[0])
          setWords(_array);
        },(tx,error)=>{
          console.log(tx);
          console.log(error);
        }
      )
    })
  }

  useEffect(() => {
    setWordList();
  }, [])

  return (
    <Layout style={styles.container}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}>
        <View style={styles.articleContainer}>
        <Text style={{ fontFamily: 'gentium-book', fontSize: 20, lineHeight: 25 }} category='p1'>{text}</Text>
        </View>
        <List
          data={words}
          style={{paddingTop:8,paddingBottom:16}}
          renderItem={renderItem}
        />
      </ScrollView>
    </Layout>
  );
}

ReadingScreen.navigationOptions = {
  header: null,
};



const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop:5,
  },
  fontBook: {
    fontFamily: 'gentium-book',
    fontSize: 20,
    lineHeight: 25
  },
  developmentModeText: {
    marginBottom: 20,
    color: 'rgba(0,0,0,0.4)',
    fontSize: 14,
    lineHeight: 19,
    textAlign: 'center',
  },
  contentContainer: {
    paddingTop: 0,
  },
  articleContainer: {
    flex: 1,
    padding:5,
    marginVertical: 4,
    marginHorizontal: 16
  },
  welcomeImage: {
    width: 100,
    height: 80,
    resizeMode: 'contain',
    marginTop: 3,
    marginLeft: -10,
  },
  getStartedContainer: {
    alignItems: 'center',
    marginHorizontal: 50,
  },
  homeScreenFilename: {
    marginVertical: 7,
  },
  codeHighlightText: {
    color: 'rgba(96,100,109, 0.8)',
  },
  codeHighlightContainer: {
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 3,
    paddingHorizontal: 4,
  },
  getStartedText: {
    fontSize: 17,
    color: 'rgba(96,100,109, 1)',
    lineHeight: 24,
    textAlign: 'center',
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
    paddingVertical: 20,
  },
  tabBarInfoText: {
    fontSize: 17,
    color: 'rgba(96,100,109, 1)',
    textAlign: 'center',
  },
  navigationFilename: {
    marginTop: 5,
  },
  helpContainer: {
    marginTop: 15,
    alignItems: 'center',
  },
  helpLink: {
    paddingVertical: 15,
  },
  helpLinkText: {
    fontSize: 14,
    color: '#2e78b7',
  },
});
