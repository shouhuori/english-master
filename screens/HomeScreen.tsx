import React from 'react';
import {Text, Layout,Button ,Input} from '@ui-kitten/components';
import {
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  View,
} from 'react-native';



export default function HomeScreen(props) {
  const [value, setValue] = React.useState('');
  const [text, setText] = React.useState('1917 is a 2019 war film directed and produced by Sam Mendes, who wrote the screenplay with Krysty Wilson-Cairns. The film stars George MacKay, Dean-Charles Chapman, Mark Strong, Andrew Scott, Richard Madden, Claire Duburcq, with Colin Firth, and Benedict Cumberbatch. The film is based in part on an account told to Mendes by his paternal grandfather, Alfred Mendes,[3] and it chronicles the story of two young British soldiers at the height of WWI during Spring 1917 who have been given a mission to deliver a message which will warn of an ambush during one of the skirmishes soon after the German retreat to the Hindenburg Line during Operation Alberich.');
  return (
    <Layout style={styles.container}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}>
        <View style={styles.welcomeContainer}>
        </View>
      <Text  style={{ fontFamily: 'gentium-book',fontSize:20,lineHeight:25}} category='p1'>{text}</Text>
      </ScrollView>

      <View style={styles.tabBarInfoContainer}>
        <Button onPress={() => {
         props.navigation.navigate('Word')
        }}>OK</Button>
      </View>
    </Layout>
  );
}

HomeScreen.navigationOptions = {
  header: null,
};



const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding:5,
    backgroundColor: '#fff',
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
  welcomeContainer: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
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
