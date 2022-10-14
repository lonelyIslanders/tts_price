// Depends on tencentcloud-sdk-nodejs version 4.0.3 or higher
const tencentcloud = require('tencentcloud-sdk-nodejs-tts');
const fs = require('fs');
const request = require('sync-request');
const sound = require('play-sound')(opts = {});
const exec = require('child_process').exec;

const TtsClient = tencentcloud.tts.v20190823.Client;


// 实例化一个认证对象，入参需要传入腾讯云账户secretId，secretKey,此处还需注意密钥对的保密
// 密钥可前往https://console.cloud.tencent.com/cam/capi网站进行获取
const clientConfig = {
  credential: {
    secretId: "AKID73j7E6h14ycz5tQggPr2wZv0nJXVCcle",
    secretKey: "f3B2bttc5IE0WliOs64mDPKxKQElBKBl",
  },
  region: "ap-nanjing",
  profile: {
    httpProfile: {
      endpoint: "tts.tencentcloudapi.com",
    },
  },
};

// 实例化要请求产品的client对象,clientProfile是可选的
const client = new TtsClient(clientConfig);
const reqTime = Date.now().toString();

const priceBuffer = request(`GET`, `http://price.spbad.asia`);
const price = JSON.parse(priceBuffer.body);
const BTC = price[0].price;
const ETH = price[1].price;

// console.log(parseFloat(BTC));

const params = {
  "Text": `比特币价格为${parseFloat(BTC)}，以太坊价格为${parseFloat(ETH)}`,
  "SessionId": reqTime,
  "VoiceType": 1007
};
client.TextToVoice(params).then(
  (data) => {
    // console.log(data);
    fs.writeFileSync('price.txt', data.Audio);
    const au = Buffer.from(data.Audio.toString(), 'base64');
    fs.writeFileSync('price.wav', au);
    // sound.play('price.wav', (err) => {
    //   if (err) {
    //     console.log(err);
    //   }
    // });

    exec('play price.wav')
  },
  (err) => {
    console.error("error", err);
  }
);