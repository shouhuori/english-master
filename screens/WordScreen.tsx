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
  const [hiddenMean, setHiddenMean] = React.useState(true);
  const [hiddenButtonGroup, setHiddenButtonGroup] = React.useState(true);
  let title = wordNow+1 +'/' + words.length;



  let _listView;

  useEffect(()=>{
    db.transaction(tx => {
      tx.executeSql("create table if not exists words (id integer primary key not null,progress int,due_date text,title varchar,content text,update_date varchar,create_date varchar,status int);");
    })
  },[])

  useEffect(()=>{
    if(wordNow > words.length-1){
      setWordNow(wordNow-1)
      Alert.alert('恭喜','单词已背诵完毕');
    }else{
      setWord(words[wordNow])
      hidenWordHiddenButtonGroup();
    }

  },[wordNow])

  useEffect(() => {
    word.audio != undefined ? playSound(word.audio.us) : null;
  }, [word])



  const showWordHiddenButtonGroup =()=>{
    setHiddenMean(false);
    setHiddenButtonGroup(false);
  }

  const  hidenWordHiddenButtonGroup =()=>{
    setHiddenMean(true);
    setHiddenButtonGroup(true);
  }
  const nextWord =(score)=>{
    addWord(word,score)
    setWordNow(wordNow + 1);
    _listView.scrollTo({ y: 0, animated: false })
  }

  return (
    <Layout style={styles.container}>
      <TopNavigation title={title}/>
      <ScrollView
        ref={ref => _listView = ref}
        style={styles.container}
        contentContainerStyle={{}}>
      <Text 
        style={styles.titleLabel}
        category='h1'>{word.title}
      </Text>
        {
        hiddenMean ? <TouchableOpacity onPress ={()=>{
          showWordHiddenButtonGroup();
        }} style={styles.contentBack}></TouchableOpacity> :
          (<View>
            <Phsym data={word.phsym} />
            <Define data={word.cdef} />
            <Divider />
            <Sens data={word.sens} />
          </View>) 
        }
      </ScrollView>
      {
        hiddenButtonGroup ? null :
          <View style={styles.tabBarInfoContainer}>
            <View style={styles.buttonGroup}>
              <Button style={styles.button} onPress={() => {
                nextWord(0);
              }} appearance='filled'>陌生</Button>

              <Button style={styles.button} appearance='outline' onPress={() => {
                nextWord(2);
              }}
              >熟悉</Button>
              <Button style={styles.button} appearance='ghost'>移除</Button>
            </View>
          </View>
      }
      
    </Layout>
  );
}

WordScreen.navigationOptions = {
  header: null,
};

const data = [
  {
    "_id": "5e3ae6b4a2be874988a32ce8",
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
        "lang": "美: ['taɪt(ə)l] ",
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
      "titles",
      "titling",
      "titled"
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
    "_id": "5e3ae6b5a2be874988a32ce9",
    "title": "name",
    "cdef": [
      {
        "pos": "n.",
        "def": "名称；名字；名声；名誉"
      },
      {
        "pos": "v.",
        "def": "命名；任命；给…取名；说出…的名称"
      },
      {
        "pos": "adj.",
        "def": "〈美口〉著名的；(作品等)据以取名的"
      },
      {
        "pos": "网络",
        "def": "姓名；品名；产品名称"
      }
    ],
    "phsym": [
      {
        "lang": "美: [neɪm] ",
        "pron": "https://dictionary.blob.core.chinacloudapi.cn/media/audio/tom/e0/fc/E0FCFD4221B63E99CECCE49152FBEE00.mp3"
      },
      {
        "lang": "英: [neɪm] ",
        "pron": "https://dictionary.blob.core.chinacloudapi.cn/media/audio/george/e0/fc/E0FCFD4221B63E99CECCE49152FBEE00.mp3"
      }
    ],
    "audio": {
      "us": "https://dictionary.blob.core.chinacloudapi.cn/media/audio/tom/e0/fc/E0FCFD4221B63E99CECCE49152FBEE00.mp3",
      "uk": "https://dictionary.blob.core.chinacloudapi.cn/media/audio/george/e0/fc/E0FCFD4221B63E99CECCE49152FBEE00.mp3"
    },
    "infs": [
      "names",
      "naming",
      "named"
    ],
    "sens": [
      "He could scarcely pronounce my name but he taught me that it is not how much we give but how much love we put in the giving.他连我的名字都说不清楚，但他教给我：重要的不在于我们给了多少，而是在我们给的时候有多少爱。www.readfree.net",
      "One day he met a Wemmick who was unlike any he'd ever met. She had no dots or stars. She was just wooden. Her name was Lucia.有一天，他遇到一个与他见过的所有的人都不一样的微美克人。她既没有灰点也没有星星。只是木头，她的名字叫露西亚。blog.sina.com.cn",
      "This door does not demand of him who enters whether he has a name, but whether he has a grief.这扇门并不问走进来的人有没有名字，但是要问他是否有痛苦。www.ebigear.com",
      "you might not know the name but his art, once seen, tends to stay with you.弗兰克弗雷泽塔…你或许不知道他的名字，但他的艺术，一旦为你所见，终生难忘。article.yeeyan.org",
      "It is even prepared to be flexible over the contentious issue of the name the island uses.台湾甚至准备柔性处理存在争议的名称。article.yeeyan.org",
      "The name Susan is often abbreviated to Sue.人名Susan经常被缩写为Sue。www.kekenet.com",
      "You can obtain the name of the class to which an object belongs, as well as its member properties and methods.你可以取得对象所属的类的名字，以及它的成员属性和方法。www.phpx.com",
      "Only the people sacrificed in high places, because there was no house built unto the name of the LORD, until those days.当那些日子，百姓仍在邱坛献祭，因为还没有为耶和华的名建殿。www.for.com",
      "The name must be identical with that used on the HKID card, passport or other identity document of applicant's home country.该内容必须与所用的身份证，护照或其他身份证明完全相符zhidao.baidu.com",
      "Mr Madoff was himself a big name, having been a chairman of the Nasdaq exchange, and his investors regarded him as a Wall Street insider.马多夫自己就是个名人——他曾任纳斯达克（Nasdaq）证交所主席，他的投资者将他视为华尔街的内部人士。www.ftchinese.com"
    ]
  },
  {
    "_id": "5e3ae6b5a2be874988a32cea",
    "title": "sex",
    "cdef": [
      {
        "pos": "n.",
        "def": "性；性别；男性；女性"
      },
      {
        "pos": "adj.",
        "def": "性的；与性有关的"
      },
      {
        "pos": "v.",
        "def": "辨识…的性别"
      },
      {
        "pos": "网络",
        "def": "性别(sexuality)；性感；性行为"
      }
    ],
    "phsym": [
      {
        "lang": "美: [seks] ",
        "pron": "https://dictionary.blob.core.chinacloudapi.cn/media/audio/tom/26/00/26005C9F1E3A661B004041E82483281C.mp3"
      },
      {
        "lang": "英: [seks] ",
        "pron": "https://dictionary.blob.core.chinacloudapi.cn/media/audio/george/26/00/26005C9F1E3A661B004041E82483281C.mp3"
      }
    ],
    "audio": {
      "us": "https://dictionary.blob.core.chinacloudapi.cn/media/audio/tom/26/00/26005C9F1E3A661B004041E82483281C.mp3",
      "uk": "https://dictionary.blob.core.chinacloudapi.cn/media/audio/george/26/00/26005C9F1E3A661B004041E82483281C.mp3"
    },
    "infs": [
      "sexes",
      "sexing",
      "sexed"
    ],
    "sens": [
      "I've got to put in two hours for the Junior Anti-Sex League, handing out leaflets, or something.我得替反性青年团干上两个小时，发个传单什么的。真该死，对不对？article.yeeyan.org",
      "Did he lie to the American people when he said I never had sex with that woman?当他说，他没有和那个女人做爱，他对美国人民撒谎了么？---他不认为他有，是因为…www.justing.com.cn",
      "And men who have sex two or more times a week halve their risk of a cardiac arrest, a study at Bristol University found.布里斯托尔大学的一项研究表明，一周有两次或两次以上性生活的男性心脏骤停的风险要小一半。gb.cri.cn",
      "The benefit is being able to have sex with someone you know, rather than a stranger.好处是可以和一个你了解的人而不是陌生人发生性关系。article.yeeyan.org",
      "In  Sweden decided that prostitution was a form of violence against women and made it a crime to buy sex, although not to sell it.年瑞士把卖淫认定为一种反妇女的暴力形式，并对买春者定罪。article.yeeyan.org",
      "Jim used to be homosexual. However, now Jim is married to a woman and no longer has sex with men.吉姆曾经是一个同性恋患者。但是现在吉姆同一位女士结婚并对男性不再有性冲动了。article.yeeyan.org",
      "How sad that you are only with me to have sex. Now that I know this, it looks like you're doing me a favor dumping me.原来你和我在一起只知道做爱，多么可悲。现在我知道了，你甩了我吧，正好帮我个忙。article.yeeyan.org",
      "The Labour MP was criticised for walking out of a Muslim wedding last summer after learning that the guests would be segregated by sex.而工党下议员菲资帕特里克由于去年的一件事被人批评，去年他曾因为得知宾客会按性别分离开来，退出了一场穆斯林婚礼。www.ecocn.org",
      "Really mastering the subtleties of touching is one of the best ways to really explode a woman's ideas of just how amazing sex can be.真正的掌握爱抚的微妙之处可以爆炸式的改变女人的观念，让她们知道性爱可以有多么的奇妙，这是最好的方法之一。article.yeeyan.org",
      "You might already be a sex guru, but there might also be something in this article for you to step your game up.你可能已经是一位性爱大师，但是这篇文章中也可能会有一些东西能让你进一步提升自己的水平。article.yeeyan.org"
    ]
  },
  {
    "_id": "5e3ae6b6a2be874988a32ceb",
    "title": "discard",
    "cdef": [
      {
        "pos": "v.",
        "def": "丢弃；抛弃；垫（牌）；打出（无用的牌）"
      },
      {
        "pos": "n.",
        "def": "被抛弃的人（或物）；（尤指纸牌游戏中）垫出的牌"
      },
      {
        "pos": "网络",
        "def": "放弃；遗弃；舍弃"
      }
    ],
    "phsym": [
      {
        "lang": "美: [dɪs'kɑrd] ",
        "pron": "https://dictionary.blob.core.chinacloudapi.cn/media/audio/tom/1e/ad/1EAD821E339809224A0ABF16B3964BAC.mp3"
      },
      {
        "lang": "英: [dɪs'kɑː(r)d] ",
        "pron": "https://dictionary.blob.core.chinacloudapi.cn/media/audio/george/1e/ad/1EAD821E339809224A0ABF16B3964BAC.mp3"
      }
    ],
    "audio": {
      "us": "https://dictionary.blob.core.chinacloudapi.cn/media/audio/tom/1e/ad/1EAD821E339809224A0ABF16B3964BAC.mp3",
      "uk": "https://dictionary.blob.core.chinacloudapi.cn/media/audio/george/1e/ad/1EAD821E339809224A0ABF16B3964BAC.mp3"
    },
    "infs": [
      "discarded",
      "discarding",
      "discards"
    ],
    "sens": [
      "At least you have nothing to lose by looking and you can always discard what you find if it does not appear to be useful.如果没有发现什么问题，您至少也不会有什么损失。www.ibm.com",
      "When you use undoable mode for your virtual machine, it allows you to either keep or discard the changes you made to the virtual machine.如果为虚拟机使用undoable模式，那么既可以保留对虚拟机的更改，也可以放弃这一更改。www.ibm.com",
      "bought pork farms, how much a little fat fat, tasteless but wasteful to discard.菜场买来的猪肉，多少带点肥膘，食之无味，弃之可惜。www.qiyeku.com",
      "Application code had to be able to either identify and discard the duplicate, or reprocess the duplicate without negative effects.应用程序代码必须能够识别出重复消息并放弃它，或者重新处理该重复消息，而不产生任何负面效果。msdn.microsoft.com",
      "Discard any question of whether the service charge is aimed at the staff or at the restaurant managers. It makes no difference.别再考虑小费是给普通员工还是餐馆经理的问题了，这没任何差别。www.ftchinese.com",
      "She would also like to discard as ordinary people like Mei Lan back to mother, but she did not do so.她如普通人一样也想抛弃媚兰回到母亲身边，但她没有这样做。img.vikecn.com",
      "So my advice it to give it a try and do not discard it because of the taste.我建议你试试看，不要因为它的味道就放弃。www.taobao.com",
      "Before you discard a distribution for looking dull, run a few searches to see if it can be spruced up.在你放弃看上去很无趣的发行版之前，去搜索一下，看看它能不能更好一些。article.yeeyan.org",
      "Most people can't make a dent in such a pile, so they either read at random or discard much of it in frustration.大部分的人都没法减少这些堆积如山的资料。所以他们不是随便看看，就是沮丧地把大多数的资料扔掉。www.zxxyy.com",
      "I said that I loved you, was willing to discard all protects you, thought that you were me the woman.我说我爱你，愿意放弃所有保护你，以为你是我的女人。wenwen.soso.com"
    ]
  },
  {
    "_id": "5e3ae6b6a2be874988a32cec",
    "title": "steam",
    "cdef": [
      {
        "pos": "n.",
        "def": "蒸汽；水蒸气；水汽；蒸汽动力"
      },
      {
        "pos": "v.",
        "def": "蒸发；散发蒸汽；冒水汽；蒸（食物）"
      },
      {
        "pos": "网络",
        "def": "水蒸汽"
      }
    ],
    "phsym": [
      {
        "lang": "美: [stim] ",
        "pron": "https://dictionary.blob.core.chinacloudapi.cn/media/audio/tom/d4/0c/D40C4CA4015038AC1D9D3FBAE5488AD5.mp3"
      },
      {
        "lang": "英: [stiːm] ",
        "pron": "https://dictionary.blob.core.chinacloudapi.cn/media/audio/george/d4/0c/D40C4CA4015038AC1D9D3FBAE5488AD5.mp3"
      }
    ],
    "audio": {
      "us": "https://dictionary.blob.core.chinacloudapi.cn/media/audio/tom/d4/0c/D40C4CA4015038AC1D9D3FBAE5488AD5.mp3",
      "uk": "https://dictionary.blob.core.chinacloudapi.cn/media/audio/george/d4/0c/D40C4CA4015038AC1D9D3FBAE5488AD5.mp3"
    },
    "infs": [
      "steams",
      "steaming",
      "steamed"
    ],
    "sens": [
      "Most people know electricity standing still is no more useful than is a stationary belt between a steam engine and a machine to be driven.大多数人认为，停滞不动的电并不比架设在蒸汽机和要被传动的机器之间的固定带更有用。dict.ebigear.com",
      "That could take some of the steam out of China's nascent recovery, and with it a return in healthy demand for oil.这可能削弱中国刚刚开始的经济复苏的一部分动力，同时阻碍原油需求回归正常水平。www.ebigear.com",
      "The long hot streak at the box office seems to be losing steam, just as the summer hits.在夏季来临之际，美国票房持续已久的火爆形势看来要失去动力了。c.wsj.com",
      "It remains to be seen how much that perspective becomes another way for China to let the West blow off steam while it moves coolly ahead.目前仍然要看这种设想能在多大程度上，在中国走得太过时，能成为让西方发泄抑制的感情另一种方式。dictsearch.appspot.com",
      "he took , when he was a school - boy , to constructing steam - engines out of saucepans.当他还是个小学生的时候，他就喜欢用小锅做蒸汽机。www.ichacha.net",
      "The result of invention of steam engine was that human power was replaced by mechanical power.蒸汽机发明的结果是机械动力代替了人力。www.wenkuwu.com",
      "The invention of steam engine by Watt marked the end of great tradition of labor with hands and the beginning of a new era of machinery.瓦特蒸汽机的发明标志着手工劳动这一伟大传统的结束和机器时代的到来。bbs.koolearn.com",
      "Of his skills as a carpenter, he said, \"You will see downstairs there is a steam bath that I built myself in one weekend. \"谈到他拥有的木匠技能，他说：「你在楼下会看到一间蒸汽浴室，是我利用一个周末独力完成的。」dictsearch.appspot.com",
      "The invention of the steam engine helped manufactures by giving them cheaper power to work their machines. Machines took the place of men.而蒸汽发动机的发明，使得产品可以用更廉价的动力驱动机器生产，于是，机器取代了人工操作。www.fane.cn",
      "With an earsplitting burst of superheated steam, the contraption lifts Ross gently into the air and, for a few noisy seconds, he is flying.随着加热的蒸汽发出震耳欲聋的爆鸣声，装置缓缓将罗斯推到空中，闹哄哄的几秒钟后，他就在自由飞行了。article.yeeyan.org"
    ]
  },
  {
    "_id": "5e3ae6b7a2be874988a32ced",
    "title": "people",
    "cdef": [
      {
        "pos": "n.",
        "def": "人；人们；人民；百姓"
      },
      {
        "pos": "v.",
        "def": "居住在；把…挤满人；住满居民"
      },
      {
        "pos": "网络",
        "def": "人物；人员；民族"
      }
    ],
    "phsym": [
      {
        "lang": "美: ['pip(ə)l] ",
        "pron": "https://dictionary.blob.core.chinacloudapi.cn/media/audio/tom/31/ce/31CEFFDAF3B448606B1DEB97A6DB11C4.mp3"
      },
      {
        "lang": "英: ['piːp(ə)l] ",
        "pron": "https://dictionary.blob.core.chinacloudapi.cn/media/audio/george/31/ce/31CEFFDAF3B448606B1DEB97A6DB11C4.mp3"
      }
    ],
    "audio": {
      "us": "https://dictionary.blob.core.chinacloudapi.cn/media/audio/tom/31/ce/31CEFFDAF3B448606B1DEB97A6DB11C4.mp3",
      "uk": "https://dictionary.blob.core.chinacloudapi.cn/media/audio/george/31/ce/31CEFFDAF3B448606B1DEB97A6DB11C4.mp3"
    },
    "infs": [
      "peoples",
      "peopling",
      "peopled"
    ],
    "sens": [
      "However that may be, the moment a people adopts representatives it is no longer free; it no longer exists.不论会怎样，一个民族一旦接受了代表，他就不再自由了，再也生存不下去了。blog.hjenglish.com",
      "Anthropologists say all this was only possible because people were willing to treat total strangers in a manner once reserved for kin.人类学家说，这一切只可能是因为人们愿意用对待家属的态度来对陌生人。article.yeeyan.org",
      "One of the people familiar with the matter said Mr. Lee is leaving to work on his own venture. Mr. Lee could not be reached for comment.一位知情人士称，李开复是离职创业。记者目前无法联系到李开复置评。www.hjenglish.com",
      "He began to count the people in his mind while they were having the delicious food.当他们食用可口食物时，他在他的头脑里开始计数人民。wenwen.soso.com",
      "The people enjoying all this extra leisure are the couch potatoes at the bottom of the heap economically and educationally.享有这些额外闲暇时间的人都是无所事事之辈，位于经济和教育的底层。www.ftchinese.com",
      "Some people do seem to be more resilient by nature but, like most things, resilience is a trait which can be developed.有些人似乎天生就很坚韧，但就像其它的东西一样，韧性是可以开发的。article.yeeyan.org",
      "Be strong and of good courage, for to this people you shall divide as an inheritance the land which I swore to their fathers to give them.你当刚强壮胆！因为你必使这百姓承受那地为业，就是我向他们列祖起誓应许赐给他们的地。pearlpig.spaces.live.com",
      "Some people sleep better in a clean and neat environment, so they like to straighten and clean their room just before going to bed.一些人在干净整洁的环境中睡眠会更好，因此他们喜欢在睡觉前整理清洁自己的房间。dongxi.net",
      "It is often used among slightly older people, because the terms 'boyfriend' and 'girlfriend' make it sound like they are teenagers.多在年纪稍大的人中使用，因为“男友”或“女友”让人听起来觉得他们像十几岁的人。liuxi.blog..com",
      "no, there were too many people. When she got out of the car, her fans were all screaming, trying to give her flowers and ger her autographs.没有，人太多了.她一下车，歌迷们就不停地尖叫，给她献花，还抢着要她的签名。talk.oralpractice.com"
    ]
  },
  {
    "_id": "5e3ae6b7a2be874988a32cee",
    "title": "electricity",
    "cdef": [
      {
        "pos": "n.",
        "def": "电；电能；强烈的感情；激动"
      },
      {
        "pos": "网络",
        "def": "电学；电力；电流"
      }
    ],
    "phsym": [
      {
        "lang": "美: [.ilek'trɪsəti] ",
        "pron": "https://dictionary.blob.core.chinacloudapi.cn/media/audio/tom/42/d7/42D7BE54091A7B808F219B417B8C7988.mp3"
      },
      {
        "lang": "英: [ɪ.lek'trɪsəti] ",
        "pron": "https://dictionary.blob.core.chinacloudapi.cn/media/audio/george/42/d7/42D7BE54091A7B808F219B417B8C7988.mp3"
      }
    ],
    "audio": {
      "us": "https://dictionary.blob.core.chinacloudapi.cn/media/audio/tom/42/d7/42D7BE54091A7B808F219B417B8C7988.mp3",
      "uk": "https://dictionary.blob.core.chinacloudapi.cn/media/audio/george/42/d7/42D7BE54091A7B808F219B417B8C7988.mp3"
    },
    "sens": [
      "But the share of electricity generated by renewables is still far behind that of dirty-but-cheap coal, which will rise to almost %.然而可再生物质发电在电力中占到的比例仍然远远不及污染严重但价格低廉的煤，使用煤发电的比例将上升到将近%。www.ecocn.org",
      "PLN, the state power company, has been trying to encourage private-sector investment, but subsidised electricity acts as a disincentive.印尼国有电力公司PLN一直鼓励私人投资发电产业，但政府电力补贴政策却扯着后腿。www.ecocn.org",
      "Right now, it's impossible now to know how much electricity our lights and geothermal system will use at Sheep Dog.眼下，我们还不可能知道在牧羊犬这个地方要用多少电来照明，要用多大规模的地热系统来取暖。article.yeeyan.org",
      "Even simple rate plans where the price of electricity depends on the time of day have had to be abandoned after customer protests.甚至简单的电费收取计划（即按照用电时间来收取电费）也在消费者的抗议之后不得不放弃。www.ecocn.org",
      "It seems to me not true to write that Italy is \" trying to reduce [its] dependence on nuclear electricity\" .依我看来，意大利“正在试图减少对核能发电的依赖”这并不是事实。www.chinadialogue.net",
      "The idea of fish being able to generate electricity strong enough to run an electric motor, is almost unbelievable.鱼能发电，其强度足以点亮小灯泡甚至还能发动马达，真是令人难以置信。blog..com",
      "The central government also continues to subsidise the cost of electricity to the tune of billions of dollars a year.巴基斯坦中央政府也在继续对用电成本进行每年数十亿美元的补贴。article.yeeyan.org",
      "But China's efforts to increase supplies of any kind of electricity have been hamstrung by a lack of transmission lines.而在目前，中国增加电力供应的努力正受到输电线路不足的钳制。article.yeeyan.org",
      "A new study aims to find out how much electricity from wind and sunshine the aging power grid can support.一项新的研究旨在弄清现有的陈旧电网接纳风电和太阳能发电的能力。blog.hjenglish.com",
      "And how much does that freezer burn each year in electricity?这个冰柜一年要消耗多少电？c.wsj.com"
    ]
  },
  {
    "_id": "5e3ae6b7a2be874988a32cef",
    "title": "put",
    "cdef": [
      {
        "pos": "v.",
        "def": "放；说；安置；安装"
      },
      {
        "pos": "n.",
        "def": "推；投；戳；一扔的距离"
      },
      {
        "pos": "adj.",
        "def": "不动的"
      },
      {
        "pos": "网络",
        "def": "放置；摆；卖权"
      }
    ],
    "phsym": [
      {
        "lang": "美: [pʊt] ",
        "pron": "https://dictionary.blob.core.chinacloudapi.cn/media/audio/tom/c5/1b/C51BC7DD58CC55FBE8DDFA38889E5873.mp3"
      },
      {
        "lang": "英: [pʊt] ",
        "pron": "https://dictionary.blob.core.chinacloudapi.cn/media/audio/george/c5/1b/C51BC7DD58CC55FBE8DDFA38889E5873.mp3"
      }
    ],
    "audio": {
      "us": "https://dictionary.blob.core.chinacloudapi.cn/media/audio/tom/c5/1b/C51BC7DD58CC55FBE8DDFA38889E5873.mp3",
      "uk": "https://dictionary.blob.core.chinacloudapi.cn/media/audio/george/c5/1b/C51BC7DD58CC55FBE8DDFA38889E5873.mp3"
    },
    "infs": [
      "putting",
      "puts"
    ],
    "sens": [
      "For as soon as he began to turn, or double, the greater number of his pursuers would put escape out of the question.因为只要他一往回跑，或是拐弯，敌人人多，就会把他围住。",
      "He picked up a piece and put it in his mouth and chewed it slowly. it was not unpleasant.他拿起一片放在嘴里慢慢地嚼，并不怎么难吃嘛！www.cuyoo.com",
      "How much more torture would you have put me through?多少酷刑你会帮我吗？zhidao.baidu.com",
      "He invented tektology, the study of organizational systems, in an attempt to put socialism on a more empirical footing.他建立了组织形态学---组织系统化科学，为了让社会主义更加脚踏实地。article.yeeyan.org",
      "I watched as she picked up a large package of T-bones, dropped them in her basket. . . hesitated, and then put them back.我看着她将一大块T型牛柳丢进购物车，犹豫了一下，然后又将牛柳放回原处。www.suiniyi.com",
      "The size of the camera is so small it just about fits in your palm, but it's a little too big to put into a pocket.摄像机非常小，可以完全放入我们的掌心，但是如果要放入口袋，那就稍微大了点。www.elanso.com",
      "Put the matter in the hands of a solicitor.把这事交给律师去办。wske.spaces.live.com",
      "He looked around the boy section, picked up this item and that, and carefully put then back in their place.他环视了一下男孩区，拿起一个玩具，又小心地把它放回原位。wenwen.soso.com",
      "Ada Ida insists on passing remarks: 'Look what a nervous tic that man has. And look how much powder that old woman's put on. '安达一直在发表评论：“看那个男人神经抽搐，看那个老女人抹了多少粉。”article.yeeyan.org",
      "The moment that Donna heard the news, Cheryl later told me, she rushed to put on a wedding dress that she had been saving for years.谢丽尔后来告诉我，唐娜听到消息后，迅速跑去穿上了她存放了多年的婚纱。article.yeeyan.org"
    ]
  },
  {
    "_id": "5e3ae6b8a2be874988a32cf0",
    "title": "zero",
    "cdef": [
      {
        "pos": "n.",
        "def": "【数】数字0；零位；零摄氏度；没有任何…"
      },
      {
        "pos": "num.",
        "def": "零；（气温、压力等的）零度；最少量；最低点"
      },
      {
        "pos": "v.",
        "def": "将（仪器、控制装置等）调到零；归零；瞄准；聚焦"
      },
      {
        "pos": "adj.",
        "def": "零(度)的；【气】云幕低于50英尺"
      },
      {
        "pos": "网络",
        "def": "零度(zerodegree)；零点；意大利零度"
      }
    ],
    "phsym": [
      {
        "lang": "美: [ˈziroʊ] ",
        "pron": "https://dictionary.blob.core.chinacloudapi.cn/media/audio/tom/e1/44/E1445D73D276C4B548021AB29F8A92A2.mp3"
      },
      {
        "lang": "英: ['zɪərəʊ] ",
        "pron": "https://dictionary.blob.core.chinacloudapi.cn/media/audio/george/e1/44/E1445D73D276C4B548021AB29F8A92A2.mp3"
      }
    ],
    "audio": {
      "us": "https://dictionary.blob.core.chinacloudapi.cn/media/audio/tom/e1/44/E1445D73D276C4B548021AB29F8A92A2.mp3",
      "uk": "https://dictionary.blob.core.chinacloudapi.cn/media/audio/george/e1/44/E1445D73D276C4B548021AB29F8A92A2.mp3"
    },
    "infs": [
      "zeroes",
      "zeroing",
      "zeroed"
    ],
    "sens": [
      "People were celebrating at ground zero and in Times Square, cheering as if the ball had dropped on New Year's.人们正在坍塌点和时代广场上庆祝，就好像庆祝新年的球体落下一般。article.yeeyan.org",
      "Mr. Jones urges the BOJ to keep its policy rate close to zero and 'focus on trying to stop deflation. '他督促日本央行将政策利率维持在接近零的水平，集中精力努力遏制通货紧缩。c.wsj.com",
      "Short that it may be zero to six-year-old, to put it a little bit longer, probably until the age of twelve.说得短一点，可能是零到六岁，说得长一点，大概要到十二岁。www.tradeask.com",
      "They asked him how much he knew about markets, on a scale of a zero to one hundred.他们问他对市场有多么了解，如果是从到算的话。www..cx",
      "Flux is going to be zero because nothing passes through the surface.通量之所以为零，是因为根本没有东西通过曲面。open..com",
      "You are nothing but emptiness-zero, this zero trying to become something is the battle of mind.你什么都不是，只是空无-零。这个零总试图成为什么，这就是头脑所有的挣扎。www.nn.com",
      "The classical concept of truth turns out to be a special, zero-interactivity-degree case of computability .真理的经典概念转变为可计算性的特殊的零交互度的情况。dictsearch.appspot.com",
      "A view is only visible if it has a color or an image assigned to it, and if the height and width are greater than zero.如果将一个颜色或一张图片分派给视图并且他的宽和高都大于零，那他是可见的。www.openface.org.cn",
      "To avoid trying to handle the header of the CSV, I first check to see if the byte count (the key object) is not zero.为了避免除了CSV头部，首先检查是否字节数（key对象）为零。www.ibm.com",
      "When there was no activity, zero, back in March and April, it clearly was a crisis of confidence-CEO confidence and consumer confidence.他说，没有并购交易的时候，比如像、月份的情况，很明显出现了信心危机，对企业高管和消费者信心都是如此。c.wsj.com"
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
    "_id": "5e3aec19a2be874988a32cf3"
  },
  {
    "title": "addition",
    "cdef": [
      {
        "pos": "n.",
        "def": "添加；增加；加法；增加物"
      },
      {
        "pos": "网络",
        "def": "附加物；相加；加成"
      }
    ],
    "phsym": [
      {
        "lang": "美: [ə'dɪʃ(ə)n] ",
        "pron": "https://dictionary.blob.core.chinacloudapi.cn/media/audio/tom/46/af/46AF63C9EB18C6834D0E60A83268C479.mp3"
      },
      {
        "lang": "英: [ə'dɪʃ(ə)n] ",
        "pron": "https://dictionary.blob.core.chinacloudapi.cn/media/audio/george/46/af/46AF63C9EB18C6834D0E60A83268C479.mp3"
      }
    ],
    "audio": {
      "us": "https://dictionary.blob.core.chinacloudapi.cn/media/audio/tom/46/af/46AF63C9EB18C6834D0E60A83268C479.mp3",
      "uk": "https://dictionary.blob.core.chinacloudapi.cn/media/audio/george/46/af/46AF63C9EB18C6834D0E60A83268C479.mp3"
    },
    "infs": [
      "additions"
    ],
    "sens": [
      "In addition to what he said at the meeting, there was something else about the matter.除了他在会上所说的之外，关于这个问题还有些弦外之音。wenku.baidu.com",
      "In addition to supplying the wind turbines, GE is selling about a third of the land required for the project to the city of Los Angeles.除了提供风力涡轮机，通用电气还将向洛杉矶市出售项目所需的三分之一的土地。blog.gkong.com",
      "Practice can be very useful, and is highly recommended because in addition to building confidence, it also tends to improve quality.练习可以很有用，然后我强烈推荐，因为在增加自信的同时，也会增加你的能力。article.yeeyan.org",
      "In addition, it seems to us that this trouble market is having too much bullish hopefulness .但另一方面，当前这个困境重重的市场却似乎内涵著太多看涨的希望。dictsearch.appspot.com",
      "McNabb said the case was unusual in many ways - in addition to the fact that it ended on only the second day of trial.麦克纳布说，案子在开庭审理的第二天就结束了，这在某种程度上，可以说是不寻常的。www.tingvoa.com",
      "In addition, some works are easy to understand and not worth spending too much time reading thoroughly.而有些作品比较易懂，也不值得花太多时间去深究。www.ebigear.com",
      "with addition of the drug to the culture dish , the vast majority of cells , those that had not reverted to embryonic stem cells , died.由于药物的加入，培养皿中那些未完全转化为胚胎干细胞的细胞死亡。www.ichacha.net",
      "There was a dramatic improvement within a few days after addition of vitamin C and starting highly nutritious food.有一个显着改善在几天之后除了维生素C和起点高营养的食物。www.syyxw.com",
      "In cases of a serious violation, a fine less than % of the gold and silver value shall be imposed in addition.情节恶劣的，并处以违法等值金银价款%以下的罚款；www.eduzhai.net",
      "Dim in the existence that seems to have metempsychosis , now, the addition of the design begins to anabiosis.冥冥之中似乎有轮回的存在，现在，设计的加法开始复苏。dictsearch.appspot.com"
    ]
  }
]

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
