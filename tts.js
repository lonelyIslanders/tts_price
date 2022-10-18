// Depends on tencentcloud-sdk-nodejs version 4.0.3 or higher
const tencentcloud = require('tencentcloud-sdk-nodejs-tts');
const fs = require('fs');
const request = require('sync-request');
const sound = require('play-sound')(opts = {});
// const exec = require('child_process').exec;

const TtsClient = tencentcloud.tts.v20190823.Client;

const currentHour = new Date().getHours();

if (currentHour >= 2 && currentHour <= 13) {
  console.log('qiao你妈，不允许播放')
  return;
}


//AKIDQgorfEbmhLh5KNI2au6B9xZ1IROI5hM5
//dD6uVt3e8f6RipiP2jMpDRTM3f4HJbij

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

function comparePrice(nowPrice) {
  fs.readFile('lastPrice.json', (err, data) => {
    if (err) {
      console.log(err);
      return;
    }
    const lastData = JSON.parse(data);
    const lastBTC = lastData.BTH;
    const lastETH = lastData.ETH;
    const lastTimeStamp = lastData.TIME;
    if (nowPrice.BTC - lastBTC > 0) {//代表BTC价格较上次涨了嘿
      const diff = nowPrice.BTC - lastBTC;
      const percent = Math.round(diff / lastBTC * 10000) / 100.00;
      if (percent > 0.2) {//秒涨0.2%报警
        return { alert: 1, risePrice: diff, risePercent: percent };//播报，附加上涨价格和幅度
      }
      else {
        return { alert: 0 };//不报警
      }
    }
    if (nowPrice.BTC - lastBTC < 0) {//代表BTC价格较上次跌了日
      const diff = lastBTC - nowPrice.BTC;
      const percent = Math.round(diff / lastBTC * 10000) / 100.00;
      if (percent > 0.2) {//秒跌0.2报警
        return { alert: 1, fallPrise: diff, fallPercent: percent }//播报，附加下跌价格和幅度
      }
      else {
        return { alert: 0 };//不报警
      }
    }


    //ETH计算
    if (nowPrice.ETH - lastETH > 0) {
      const diff = nowPrice.ETH - lastETH;
      const percent = Math.round(diff / lastETH * 10000) / 100.00;
      if (percent > 0.2) {
        return { alert: 1, risePrice: diff, risePercent: percent };
      }
      else {
        return { alert: 0 };
      }
    }
    if (nowPrice.ETH - lastETH < 0) {
      const diff = lastETH - nowPrice.ETH;
      const percent = Math.round(diff / lastETH * 10000) / 100.00;
      if (percent > 0.2) {
        return { alert: 1, fallPrise: diff, fallPercent: percent }
      }
      else {
        return { alert: 0 };//不报警
      }
    }
  })
}

// 实例化要请求产品的client对象,clientProfile是可选的
const client = new TtsClient(clientConfig);
const reqTime = Date.now().toString();

const priceBuffer = request(`GET`, `http://price.spbad.asia`);
const price = JSON.parse(priceBuffer.body);
const BTC = price[0].price;
const ETH = price[1].price;
const nowTime = Date.now();
const lastData = { TIME: nowTime, BTC: parseFloat(BTC), ETH: parseFloat(ETH) };

// fs.writeFileSync('lastPrice.json', JSON.stringify(lastData));
fs.writeFile('lastPrice.json', JSON.stringify(lastData), (err) => {
  if (err) {
    console.log(err);
    return;
  }
  console.log("写入OK")
});


const params = {
  "Text": `比特币价格为${parseFloat(BTC)}，以太坊价格为${parseFloat(ETH)}`,
  "SessionId": reqTime,
  "VoiceType": 1007
};
client.TextToVoice(params).then(
  (data) => {
    // fs.writeFile('priceBase64.txt', data.Audio, (err) => {
    //   if (err) {
    //     console.log(err);
    //     return;
    //   }
    // })
    // fs.writeFileSync('priceBase64.txt', data.Audio);
    const au = Buffer.from(data.Audio.toString(), 'base64');
    fs.writeFileSync('price.wav', au);
    sound.play('price.wav', (err) => {
      if (err) {
        console.log(err)
      }
    })

  },
  (err) => {
    console.error("error", err);
  }
);