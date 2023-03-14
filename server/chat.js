const axios = require('axios');
const express = require('express')
const bodyParser = require('body-parser')
const NodeCache = require( "node-cache" );
var md5 = require('md5');
const myCache = new NodeCache();

const app = express()
const port = 3000
const apiKey = 'YOUR-API-KEY';

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

app.use('*', function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Access-Control-Allow-Credentials', 'true');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else next();
});

app.get('/', async (req, res) => {
  let prompt = 'about '+req.query['wd']+' in Chinese less than 300 words'
  response = await chat(prompt)
  res.send(response)
  res.end()
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

async function chatTest(wd) {
  return `ChatGPT是一款智能聊天机器人，可以用于许多不同的目的，比如社交娱乐，个人助理和教育等。它可以与用户进行对话，回答问题和提供信息。

  聊天机器人的工作原理是通过自然语言处理技术和机器学习算法来理解用户的意图，然后提供相应的回答。ChatGPT可以处理多种语言，包括中文。
  
  用户可以在ChatGPT中进行多种任务，如搜索信息，预订机票，订购产品等。机器人还可以向用户提供课程，帮助他们学习新技能、提高工作技能和提高生产力。
  
  ChatGPT的另一个实用功能是在社交娱乐方面。用户可以与机器人聊天，共享笑话，玩游戏等。聊天还可以帮助用户放松和减轻压力。
  
  ChatGPT还可以被用做智能个人助理，帮助用户安排日程，提醒重要事项等。它还可以与其他设备和应用程序集成，使其更加功能强大。
  
  总之，ChatGPT是一款功能强大的智能聊天机器人。它可以帮助用户解决许多日常问题，为他们提供有用的信息，同时还能提供娱乐和放松功能。`
}

async function chat(wd) {

  //search cache first
  value = myCache.get(md5(wd));
  if (value != undefined) {
    console.log("cache hit with word " + wd + " md5 is " + md5(wd));
    return value;
  }

  //cache missed
  try {
    const response = await axios.post(
      'http://openai.xfyun.cn/v1/chat/completions',
      {
        "model": "gpt-3.5-turbo",
        "messages": [{ "role": "user", "content": wd }]
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + apiKey
        }
      }
    )
    console.log(response)
    res = response.data.choices[0].message.content
    if(res) {
      myCache.set( md5(wd), res, 86400);
    }
    return res
  }
  catch (err) {
    console.error(err)
  }

}
