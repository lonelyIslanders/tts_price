//用于控制tts.js播报


const express = require('express');
const exec = require('child_process').exec;
const app = express();
const tencentcloud = require('tencentcloud-sdk-nodejs-tts');
const fs = require('fs');
const request = require('sync-request');
const sound = require('play-sound')(opts = {});
const TtsClient = tencentcloud.tts.v20190823.Client;

const clientConfig = {
  credential: {
    secretId: "AKIDQgorfEbmhLh5KNI2au6B9xZ1IROI5hM5",
    secretKey: "dD6uVt3e8f6RipiP2jMpDRTM3f4HJbij",
  },
  region: "ap-nanjing",
  profile: {
    httpProfile: {
      endpoint: "tts.tencentcloudapi.com",
    },
  },
};


app.use('/static', express.static('public'));

app.get('/io', (req, res) => {
  console.log(req.query);
  if (req.query.target == 'on') {
    exec(req.query.cmd, (error, stdout, stderr) => {
      console.log(stdout);
    });
    const reqTime = Date.now().toString();
    const client = new TtsClient(clientConfig);
    const params = {
      "Text": '服务已启动',
      "SessionId": reqTime,
      "VoiceType": 1007
    };
    client.TextToVoice(params).then(
      (data) => {
        const au = Buffer.from(data.Audio.toString(), 'base64');
        fs.writeFileSync('io.wav', au);
        sound.play('io.wav', (err) => {
          if (err) {
            console.log(err)
          }
        })

      },
      (err) => {
        console.error("error", err);
      }
    );
    res.sendStatus(200);
    return
  }


  if (req.query.target == 'off') {
    exec(req.query.cmd, (error, stdout, stderr) => {
      console.log(stdout);
    });

    const reqTime = Date.now().toString();
    const client = new TtsClient(clientConfig);
    const params = {
      "Text": '服务已关闭',
      "SessionId": reqTime,
      "VoiceType": 1007
    };
    client.TextToVoice(params).then(
      (data) => {
        const au = Buffer.from(data.Audio.toString(), 'base64');
        fs.writeFileSync('io.wav', au);
        sound.play('io.wav', (err) => {
          if (err) {
            console.log(err)
          }
        })

      },
      (err) => {
        console.error("error", err);
      }
    );
    res.sendStatus(200);
    return
  }
});




app.listen(3000, () => {
  console.log("运行在3000")
})