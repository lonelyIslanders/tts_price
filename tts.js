// Depends on tencentcloud-sdk-nodejs version 4.0.3 or higher
const tencentcloud = require('tencentcloud-sdk-nodejs-tts');
const fs = require('fs');
const request = require('sync-request');
const sound = require('play-sound')(opts = {});

const TtsClient = tencentcloud.tts.v20190823.Client;

const currentHour = new Date().getHours();



//AKIDQgorfEbmhLh5KNI2au6B9xZ1IROI5hM5
//dD6uVt3e8f6RipiP2jMpDRTM3f4HJbij

// 实例化一个认证对象，入参需要传入腾讯云账户secretId，secretKey,此处还需注意密钥对的保密
// 密钥可前往https://console.cloud.tencent.com/cam/capi网站进行获取
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

function comparePrice(nowPrice) {
  let backData;
  const bufferData = fs.readFileSync('lastPrice.json');
  const bufferToParse = JSON.parse(bufferData);
  const nowTime = Date.now();
  // if (new Date().getHours == 0) {
  // }
  if (bufferToParse.AGO == undefined) {//lastPrice没有AGO就全部写入先
    nowPrice.AGO.five = { "time": nowTime, "btc": nowPrice.BTC, "eth": nowPrice.ETH };
    nowPrice.AGO.fifteen = { "time": nowTime, "btc": nowPrice.BTC, "eth": nowPrice.ETH };
    nowPrice.AGO.hour = { "time": nowTime, "btc": nowPrice.BTC, "eth": nowPrice.ETH };
    fs.writeFileSync('lastPrice.json', JSON.stringify(nowPrice));
    return;
  }





  const lastData = JSON.parse(bufferData);
  const lastBTC = lastData.BTC;
  const lastETH = lastData.ETH;

  console.log("上次比特币价格" + lastBTC);
  console.log("最新比特币价格" + nowPrice.BTC);

  //计算BTC
  if (nowPrice.BTC - lastBTC >= 0) {//代表BTC价格较上次涨了嘿
    console.log("btc涨了");
    const diff = (nowPrice.BTC - lastBTC);
    const percent = Math.round(diff / lastBTC * 10000) / 100.00;
    if (percent > 0.1) {//秒涨0.1%报警
      fs.writeFileSync('lastPrice.json', JSON.stringify(nowPrice));
      return backData = { alert: 1, symbol: '比特币', trend: '上涨', diffPrice: diff.toFixed(2), percent: "涨幅" + percent + "%", now: nowPrice.BTC };//播报，附加上涨价格和幅度
    }
    else {
      fs.writeFileSync('lastPrice.json', JSON.stringify(nowPrice));
      backData = { alert: 0 };//不报警
    }
  }
  if (nowPrice.BTC - lastBTC < 0) {//代表BTC价格较上次跌了日
    console.log("btc跌了")
    const diff = lastBTC - nowPrice.BTC;
    const percent = Math.round(diff / lastBTC * 10000) / 100.00;
    if (percent > 0.1) {//秒跌0.1报警
      fs.writeFileSync('lastPrice.json', JSON.stringify(nowPrice));
      return backData = { alert: 1, symbol: '比特币', trend: '下跌', diffPrice: diff.toFixed(2), percent: "跌幅" + percent + "%", now: nowPrice.BTC }//播报，附加下跌价格和幅度
    }
    else {
      fs.writeFileSync('lastPrice.json', JSON.stringify(nowPrice));
      backData = { alert: 0 };//不报警
    }
  }


  //ETH计算
  if (nowPrice.ETH - lastETH >= 0) {
    const diff = nowPrice.ETH - lastETH;
    const percent = Math.round(diff / lastETH * 10000) / 100.00;
    if (percent > 0.1) {
      fs.writeFileSync('lastPrice.json', JSON.stringify(nowPrice));
      return backData = { alert: 1, symbol: '以太坊', trend: '上涨', diffPrice: diff.toFixed(2), percent: "涨幅" + percent + "%", now: nowPrice.ETH };
    }
    else {
      fs.writeFileSync('lastPrice.json', JSON.stringify(nowPrice));
      backData = { alert: 0 };
    }
  }
  if (nowPrice.ETH - lastETH < 0) {
    const diff = lastETH - nowPrice.ETH;
    const percent = Math.round(diff / lastETH * 10000) / 100.00;
    if (percent > 0.1) {
      fs.writeFileSync('lastPrice.json', JSON.stringify(nowPrice));
      return backData = { alert: 1, symbol: '以太坊', trend: '下跌', diffPrice: diff.toFixed(2), percent: "跌幅" + percent + "%", now: nowPrice.ETH }
    }
    else {
      fs.writeFileSync('lastPrice.json', JSON.stringify(nowPrice));
      backData = { alert: 0 };//不报警
    }
  }

  return backData;
}

// 实例化要请求产品的client对象,clientProfile是可选的
const client = new TtsClient(clientConfig);
const reqTime = Date.now().toString();

const priceBuffer = request(`GET`, `http://spbad.asia:3000/price`);
const price = JSON.parse(priceBuffer.body);
const BTC = price[0].price;
const ETH = price[1].price;
const nowTime = Date.now();



const latestPriceData = {
  "TIME": nowTime, "BTC": parseFloat(BTC), "ETH": parseFloat(ETH),//最新价
  "AGO": {
    "five": {
      "time": null,
      "btc": null,
      "eth": null
    },
    "fifteen": {
      "time": null,
      "btc": null,
      "eth": null
    },
    "hour": {
      "time": null,
      "btc": null,
      "eth": null
    },
    "day": {
      "time": null,
      "btc": null,
      "eth": null
    }
  }
};




// const lastPriceData = fs.readFileSync('lastPrice.json');//上一次价格
// const lastPriceJson = JSON.parse(lastPriceData);
// fs.writeFileSync('lastPrice.json', JSON.stringify(latestPriceData));//写入最新价保存
// fs.writeFile('lastPrice.json', JSON.stringify(lastData), (err) => {
//   if (err) {
//     console.log(err);
//     return;
//   }
//   console.log("写入OK")
// });

let textContent = `比特币价格为${parseFloat(BTC)}，以太坊价格为${parseFloat(ETH)}`;//仍然最新价
const isAlert = comparePrice(latestPriceData);//计算的话传入最新价obj
console.log(isAlert);
if (isAlert.alert == 0) {
  console.log("不紧急，勿播报");
  textContent = `比特币价格为${parseFloat(BTC)}，以太坊价格为${parseFloat(ETH)}`;
  return;
} else {
  console.log("紧急情况，迅速播报");
  textContent = `${isAlert.symbol}${isAlert.trend}${isAlert.diffPrice}刀,${isAlert.percent},现报${isAlert.now}`
}

if (currentHour >= 2 && currentHour <= 12) {
  console.log('qiao你妈，不允许播放')
  return;
}



const params = {
  // "Text": `比特币价格为${parseFloat(BTC)}，以太坊价格为${parseFloat(ETH)}`,
  "Text": textContent,
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