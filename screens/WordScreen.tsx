import React, { useEffect } from 'react';
import {Text,Divider,Icon, Layout,Button ,Input,TopNavigationAction,TopNavigation} from '@ui-kitten/components';
import {
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  View,
} from 'react-native';
import {Audio} from 'expo-av';
import * as SQLite from 'expo-sqlite';

const soundObject = new Audio.Sound();

const db  = SQLite.openDatabase('beDict.db');

const testDb = async() => {
   db.transaction(tx => {
    tx.executeSql("CREATE TABLE  IF NOT EXISTS word_learn (  ID INT PRIMARY KEY NOT NULL,due_date CHAR(50)  NOT NULL,title CHAR(50)  NOT NULL,content TEXT  NOT NULL, create_date CHAR  NOT NULL,status INT  NOT NULL)", []);
    tx.executeSql("insert into word_learn (due_date, title,content,create_date,status) values (?,?,?,?,?)", [0, 1,2,3,4]);
    tx.executeSql("select * from word_learn;",[],(_, { rows })=>{
      console.log(rows)
      console.log('work')
   })
  })

}
const DICT_LINK = 'http://localhost:3000/find/token';

const  getWord = async(text) =>{
  try {
    let response = await fetch(
      DICT_LINK + encodeURIComponent(text.replace(/\s+/g, ' '))
    );
    return response.text();
  } catch (error) {
    console.error(error);
  }
}

/**
 * 播放声音 
 * @param uri 
 */
const playSound = async (uri) => {
  try {
    const { sound: soundObject, status } = await Audio.Sound.createAsync(
      { uri: uri },
      { shouldPlay: true })

    await soundObject.playAsync();
  } catch (error) {
    console.log(error);
  }
}

/**
 * 发音 
 * @param param0 
 */
const Phsym = ({ data }) => {
  return data.map((i, index) =>
    <Text
      key={index}
      style={styles.phsym}
      category='p1'>{i.lang}
    </Text>
  )

}

const Define = ({data})=>{
  return data.map((i, index) =>
    <Text
      key={index}
      style={styles.phsym}
      category='p1'>{i.pos}{i.def}
    </Text>
  )
}

 const add = (text) => {
    // is text empty?
    if (text === null || text === "") {
      return false;
    }

    db.transaction(
      tx => {
        tx.executeSql("insert into words (title) values (?)", ['1']);
        tx.executeSql("select * from words", [], (_, { rows }) =>
          console.log(JSON.stringify(rows))
        );
      },
      null,
      );
  }
  
const Sens = ({data})=>{
  return data.map((i, index) =>
    <Text
      key={index}
      style={styles.phsym}
      category='p1'>{i}
    </Text>
)
}

/**
 * 背单词页面
 */
export default  function WordScreen(props) {
  const [value, setValue] = React.useState('');

  useEffect(()=>{
    db.transaction(tx => {
      tx.executeSql("create table if not exists  words (id integer primary key not null,due_date text,title varchar,content text, create_date varchar,status int);");
    })
  })
  return (
    <Layout style={styles.container}>
      <TopNavigation title='熟悉单词'/>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{}}>
      <Text
        style={styles.titleLabel}
        category='h1'>{data.title}
      </Text>
      <Phsym data={data.phsym} />
      <Define data={data.cdef} />
      <Divider/>
      <Sens data={data.sens} />
      </ScrollView>
      <View style={styles.tabBarInfoContainer}>
        <View style={styles.buttonGroup}>
          <Button style={styles.button} onPress={()=>{
            add('test');
          }} appearance='filled'>陌生</Button>
          <Button style={styles.button} appearance='outline'>熟悉</Button>
          <Button style={styles.button} appearance='ghost'>移除</Button>
        </View>
      </View>
    </Layout>
  );
}

WordScreen.navigationOptions = {
  header: null,
};


  const data = {
    "_id": "5e32b114029b063bf0d35f32",
    "title": "title",
    "cdef": [
      {
        "pos": "n.",
        "def": "标题；头衔；职称；所有权凭证"
      },
      {
        "pos": "v.",
        "def": "（给书、乐曲等）加标题"
      },
      {
        "pos": "网络",
        "def": "题目；书名；网页标题"
      }
    ],
    "phsym": [
      {
        "lang": "美: [ˈtaɪt(ə)l] ",
        "pron": "https://dictionary.blob.core.chinacloudapi.cn/media/audio/tom/57/51/5751D1984E0ECC6FFFAB9E1C36906B40.mp3"
      },
      {
        "lang": "英: ['taɪt(ə)l] ",
        "pron": "https://dictionary.blob.core.chinacloudapi.cn/media/audio/george/57/51/5751D1984E0ECC6FFFAB9E1C36906B40.mp3"
      }
    ],
    "audio": {
      "us": "https://dictionary.blob.core.chinacloudapi.cn/media/audio/tom/57/51/5751D1984E0ECC6FFFAB9E1C36906B40.mp3",
      "uk": "https://dictionary.blob.core.chinacloudapi.cn/media/audio/george/57/51/5751D1984E0ECC6FFFAB9E1C36906B40.mp3"
    },
    "infs": [
      "titles"
    ],
    "sens": [
      "But there is no doubt that he deserves the title \"outstanding player of his generation\" .但是毫无疑问，他无愧于“一代杰出球员”这一称号。wenku.baidu.com",
      "Subsequently he made this the title of his own movie, no doubt as a further gesture of anti-European defiance.再后来，他竟以此作为自己的电影的名字。毫无疑问，这是他蔑视欧洲人的进一步表现。dictsearch.appspot.com",
      "Her mother did not get past the title before breaking down.她的母亲还没读完标题就崩溃了。cn.nytimes.com",
      "It's was Boston's first title since the passing of Auerbach, whose signature victory cigar was the only thing missing on this night.这是波士顿在奥尔巴赫逝世后第一次夺冠。整个夜晚唯一缺少的，也就是他标志性的夺冠后的雪茄。article.yeeyan.org",
      "Friends disproved the title, for \"death\" is considered too unlucky a word to be used in the name of any project.朋友们不赞同这个片名，因为“死亡”是个不吉利的词，不适合用做任何名字。article.yeeyan.org",
      "If the authors really want to wage war on complexity, the title might have been a good place to start.假如作者真的要向复杂性开战，这个标题或许是不错的出发点。www.ftchinese.com",
      "After the crisis in Canada, I thought it was an appropriate title for the film because Dimitri can be dangerous with his love.在加拿大事件之后，我认为用这个做片名很适当，因为迪米特里和他的爱可以是危险的。article.yeeyan.org",
      "The occupying Power never transferred the sovereignty over Taiwan or title to its territory to any other government.佔领权国不曾将对台湾的主权、或是对其领土的所有权，转移给任何其他政府。dictsearch.appspot.com",
      "And he's repaid the team's faith in him with a second-half revival that fueled United's title run.而他也在确保夺冠的比赛下半场复苏，回报了球队对他的信任。article.yeeyan.org",
      "The name and the title of the parent are stored in an information dictionary, so that the data can be easily retrieved in a page template.如果是的话这个父对象的名称和标题将被存放在字典中，以至于能够比较轻易的在页面模板中重新得到数据。wiki.ubuntu.org.cn"
    ]
  }
const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    margin: 10
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
