import React, { useEffect } from 'react';
import {Text,Divider,Icon, Layout,Button,Modal ,Input,TopNavigationAction,TopNavigation} from '@ui-kitten/components';
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
import ms from '../components/ms'
import * as SQLite from 'expo-sqlite';

const db  = SQLite.openDatabase('beDict.db');
const MS = new ms();

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
  return data=== undefined ? null : data.map((i, index) =>
    <Text
      key={index}
      style={styles.phsym}
      category='p1'>{i.lang}
    </Text>
  )

}

const Define = ({data})=>{
  return  data.map((i, index) =>
    <Text
      key={index}
      style={styles.phsym}
      category='p1'>{i.pos}{i.def}
    </Text>
  )
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
 * 添加单词 
 * @param data
 */
const addWord = (data,score) => {
  const check = new Promise((resolve, reject) => {
    db.transaction(
      tx => {
        tx.executeSql("select * from words where title = ?", [data.title], (_, { rows }) =>
          resolve(rows._array)
        );
      }
    )
  });

  check.then((rows) => {
    console.log(rows);
    // 添加全新单词
    if (rows.length < 1) {
    const old = MS.getProgress(0, new Date());
    const cal = MS.calculate(score, old, new Date());
      db.transaction(
        tx => {
          tx.executeSql("insert into words (title,progress,due_date,content,create_date,update_date,status) values (?,?,?,?,?,?,?)", [
            data.title,
            cal.progress,//progress
            cal.date,//due_data
            JSON.stringify(data),
            new Date(),
            new Date(),
            1,
          ]);
          tx.executeSql("select * from words", [], (_, { rows }) =>
            console.log(JSON.stringify(rows))
          );
        },
        null,
      );
      return;
    }
    // 更新已有单词分数
    const id = rows[0].id
    const old = MS.getProgress(rows[0].progress, rows[0].due_date);
    const cal = MS.calculate(score, old, new Date());
    db.transaction(
      tx=>{
        tx.executeSql("update words set progress = ? ,due_date = ?,update_date =? where id = ? ", [cal.progress, cal.date, new Date(), id])
      }

    )

  })

}
  

/**
 * 背单词页面
 */
export default  function WordScreen(props) {
  const [words, setWords] = React.useState(data);
  const [wordNow, setWordNow] = React.useState(0);
  const [word, setWord] = React.useState(words[0]);



  useEffect(()=>{
    db.transaction(tx => {
      tx.executeSql("create table if not exists words (id integer primary key not null,progress int,due_date text,title varchar,content text,update_date varchar,create_date varchar,status int);");
    })
  },[])

  useEffect(()=>{
    if(wordNow > words.length-1){
      Alert.alert('达到了','My Alert Msg');
    }else{
      setWord(words[wordNow])
    }

  },[wordNow])

  useEffect(() => {
    word.audio != undefined ? playSound(word.audio.us) : null;
  }, [word])

  const nextWord = (score) => {
    addWord(word,score)
    setWordNow(wordNow + 1);
  }

  return (
    <Layout style={styles.container}>
      <TopNavigation title='熟悉单词'/>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{}}>
      <Text
        style={styles.titleLabel}
        category='h1'>{word.title}
      </Text>
      <Phsym data={word.phsym} />
      <Define data={word.cdef} />
      <Divider/>
      <Sens data={word.sens} />
      </ScrollView>
      <View style={styles.tabBarInfoContainer}>
        <View style={styles.buttonGroup}>
          <Button style={styles.button} onPress={()=>{
            nextWord(0);
            }} appearance='filled'>陌生</Button>

          <Button style={styles.button} appearance='outline' onPress={()=>{
            nextWord(2);
          }}
            >熟悉</Button>
          <Button style={styles.button} appearance='ghost'>移除</Button>
        </View>
      </View>
    </Layout>
  );
}

WordScreen.navigationOptions = {
  header: null,
};


  const data = [
    {
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
  },
   {
    "title": "Zen",
    "cdef": [
      {
        "pos": "n.",
        "def": "日本禅宗"
      },
      {
        "pos": "网络",
        "def": "禅意；禅宗模式；神探任恩"
      }
    ],
    "phsym": [
      {
        "lang": "美: [zen] ",
        "pron": "https://dictionary.blob.core.chinacloudapi.cn/media/audio/tom/f4/fa/F4FAEA22C0FA1A30AB3CD1C0F5F2C9FB.mp3"
      },
      {
        "lang": "英: [zen] ",
        "pron": "https://dictionary.blob.core.chinacloudapi.cn/media/audio/george/f4/fa/F4FAEA22C0FA1A30AB3CD1C0F5F2C9FB.mp3"
      }
    ],
    "audio": {
      "us": "https://dictionary.blob.core.chinacloudapi.cn/media/audio/tom/f4/fa/F4FAEA22C0FA1A30AB3CD1C0F5F2C9FB.mp3",
      "uk": "https://dictionary.blob.core.chinacloudapi.cn/media/audio/george/f4/fa/F4FAEA22C0FA1A30AB3CD1C0F5F2C9FB.mp3"
    },
    "sens": [
      "Told Jude today about the inner poise thing and she said, interestingly, that she'd been reading a self-help book about Zen.今天和茱儿提到所谓“内在的安定”。她说，太有趣了，她最近看了一本自我成长的书，是关于禅的。dictsearch.appspot.com",
      "Historians used zen with a primary sense of \"in total defiance of any legal restraint\" or \"with outrageous disregard of one's proper duty\" .历史学家使用“贼”的最初意义——“挑战任何法律约束”或“蛮横第默示其特有的义务”。chunfengqiushui.blog..com",
      "Spending two hours a day in gridlock traffic is enough to drive even the most Zen commuter up the wall.每天花两个小时的时间在拥挤的交通中，都足够让最慢的交通工具爬上墙了。article.yeeyan.org",
      "One of my favorite Zen monks, Thich Nhat Hanh, simplified the rules in just a few words: \"Smile, breathe and go slowly. \"我最喜欢的禅僧一行禅师把规则简化为简单的几句话：微笑、呼吸和慢行。article.yeeyan.org",
      "I found this exercise in an old book on Zen living; it's one of my favorites to this day.我学禅时在一本旧书里发现这个方法；这是直到今天为止我最喜欢的一个。article.yeeyan.org",
      "I call it a \"Zen run\" because my goal is not to improve performance or burn a lot of calories, but to focus on being present as I run.我称之为禅跑，因为我的目标不是提高我俄跑步能力或者燃烧更多的能量，而是关注我目前的跑步状态。article.yeeyan.org",
      "This desire to improve myself and my life was one of the things that led to Zen Habits.对自己和生活的改进的渴望是促使我们访问ZenHabits的原因之一。article.yeeyan.org",
      "Zen: It's possible. We are sieged here by enemies, Ju Ba and Xie Yu included. . . . We must find out how much dynamite is still left nearby!战：有可能，我们在这受到了围攻，其中包括朱魃和獬貐…我们必须赶快检查一下这附近还有多少炸药！dictsearch.appspot.com",
      "People dealing with the effects of the global financial crisis can be inspired after understanding Zen's wisdom and power, he said.释永信表示，这个项目能够使金融危机中的人们感受到禅的智慧和力量，鼓舞人们的信心。www.chinadaily.com.cn",
      "His on-stage persona as a Zen-like mystic notwithstanding, Mr Jobs was an autocratic manager with a fierce temper.尽管在台上，乔布斯充满了禅宗似的神秘感，但台下，他却是一个独裁的暴脾气管理者。www.ecocn.org"
    ],
    "_id": "5e3ae6b8a2be874988a32cf1"
  },
    {
    "title": "addtion",
    "cdef": [
      {
        "pos": "网络",
        "def": "加法指令；添加新定义单词的按钮"
      }
    ],
    "sens": [
      "In addtion, there're some cards, sort of postcards, you may have seen.另外，这里有些明信片，你们可能已经看到了。open..com",
      "Please post the closeup of inscriptions and kylin on armguard. Addtion : Let me edit the title , and let everybody have a look .请再上图，外文部分和护手麒麟的细图另外：冒昧编辑一下题目，请大家一起看。www.ecd.com",
      "In addtion, the design of hardware and software of the system are also discussed in this paper.论文中亦详细介绍了系统的硬件电路设计及系统的软件设计。www.showxiu.com",
      "In addtion, I learned at my previous jobs how to cooperate with my colleagues.而且，我还在以往的工作中学会了如何与同事合作。www.kekenet.com",
      "in addtion, Using a web build enterprise information system, can improve the enterprise internal management and work efficiency.利用网站建立企业信息系统，能提高企业内部管理和工作效率。wenku.baidu.com",
      "In addtion, their principles apply to different fields.他们各自建构出来的原则也具有不同的适用范围。www.ceps.com.tw",
      "In addtion, they are the leaders of my family.另外，他们是这个家的领导人。www.hjenglish.com",
      "In addtion, many kinds of nano structures have been fabricated for further local work functin measurements.我们还制备了多种纳米结构，为进一步的研究奠定了基础。www.keyanjijin.cn",
      "In addtion to the above, the following configuration should also be noted in the database configuration除了以上设置，还应在数据库配置中注意下列配置www.ibm.com"
    ]
  }
]
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
