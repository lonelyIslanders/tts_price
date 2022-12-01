// Depends on tencentcloud-sdk-nodejs version 4.0.3 or higher
const tencentcloud = require('tencentcloud-sdk-nodejs-tts');
const fs = require('fs');
const request = require('sync-request');
const sound = require('play-sound')(opts = {});

const TtsClient = tencentcloud.tts.v20190823.Client;

const currentHour = new Date().getHours();

// if(1){
// return;
// }
//if (currentHour >= 2 && currentHour <= 15) {
//  console.log('qiao你妈，不允许播放')
//  return;
//}


//AKIDQgorfEbmhLh5KNI2au6B9xZ1IROI5hM5
//dD6uVt3e8f6RipiP2jMpDRTM3f4HJbij

// 实例化一个认证对象，入参需要传入腾讯云账户secretId，secretKey,此处还需注意密钥对的保密
// 密钥可前往https://console.cloud.tencent.com/cam/capi网站进行获取
const clientConfig = {
  credential: {
    secretId: "666",
    secretKey: "666",
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
  const bufferData = fs.readFileSync('lastPrice2.json');
  if (bufferData.toString() == '') {
    let content = `{
      "latest": {
        "TIME": 1,
        "BTC": 1,
        "ETH": 1
      },
      "AGO": {
        "five": {
          "time": 1,
          "btc": 1,
          "eth": 1
        },
        "fifteen": {
          "time": 1,
          "btc": 1,
          "eth": 1
        },
        "hour": {
          "time": 1,
          "btc": 1,
          "eth": 1
        },
        "day": {
          "time": 1,
          "btc": 1,
          "eth": 1
        }
      }
    }`;
    fs.writeFileSync('lastPrice2.json', content);
    return;
  }

  const nowTime = Date.now();
  // if (new Date().getHours == 0) {
  // }



  const lastData = JSON.parse(bufferData);
  const lastBTC = lastData.latest.BTC;
  const lastETH = lastData.latest.ETH;

  console.log("上次比特币价格" + lastBTC);
  console.log("最新比特币价格" + nowPrice.BTC);
  console.log(lastData);
  if (lastData.AGO == undefined) {//lastPrice没有AGO就全部写入先
    console.log('没有AGO就全部写入先');
    lastData.AGO = {
      "five": {
        "time": 1,
        "btc": 1,
        "eth": 1
      },
      "fifteen": {
        "time": 1,
        "btc": 1,
        "eth": 1
      },
      "hour": {
        "time": 1,
        "btc": 1,
        "eth": 1
      },
      "day": {
        "time": 1,
        "btc": 1,
        "eth": 1
      },
    };
    console.log(lastData);

    lastData.AGO.five = { "time": nowTime, "btc": nowPrice.BTC, "eth": nowPrice.ETH };
    lastData.AGO.fifteen = { "time": nowTime, "btc": nowPrice.BTC, "eth": nowPrice.ETH };
    lastData.AGO.hour = { "time": nowTime, "btc": nowPrice.BTC, "eth": nowPrice.ETH };
    lastData.AGO.day = { "time": nowTime, "btc": nowPrice.BTC, "eth": nowPrice.ETH };

    fs.writeFileSync('lastPrice2.json', JSON.stringify(lastData));
    return;
  }

  //计算BTC
  if (nowPrice.BTC - lastBTC >= 0) {//代表BTC价格较上次涨了嘿
    console.log("较上次btc涨了");
    const diff = (nowPrice.BTC - lastBTC);
    const percent = Math.round(diff / lastBTC * 10000) / 100.00;
    lastData.latest = nowPrice;
    if (percent > 0.1) {//秒涨0.1%报警
      fs.writeFileSync('lastPrice2.json', JSON.stringify(lastData));
      return backData = { alert: 1, symbol: '比特币', trend: '上涨', diffPrice: diff.toFixed(2), percent: "涨幅" + percent + "%", now: nowPrice.BTC };//播报，附加上涨价格和幅度
    }
    else {
      fs.writeFileSync('lastPrice2.json', JSON.stringify(lastData));
      backData = { alert: 0 };//不报警就不return了，不然区间计算泡不到
    }
  }
  if (nowPrice.BTC - lastBTC < 0) {//代表BTC价格较上次跌了日
    console.log("较上次btc跌了");
    const diff = lastBTC - nowPrice.BTC;
    const percent = Math.round(diff / lastBTC * 10000) / 100.00;
    lastData.latest = nowPrice;
    if (percent > 0.1) {//秒跌0.1报警
      fs.writeFileSync('lastPrice2.json', JSON.stringify(lastData));
      return backData = { alert: 1, symbol: '比特币', trend: '下跌', diffPrice: diff.toFixed(2), percent: "跌幅" + percent + "%", now: nowPrice.BTC }//播报，附加下跌价格和幅度
    }
    else {
      fs.writeFileSync('lastPrice2.json', JSON.stringify(lastData));
      backData = { alert: 0 };//不报警
    }
  }


  //ETH计算
  if (nowPrice.ETH - lastETH >= 0) {
    const diff = nowPrice.ETH - lastETH;
    const percent = Math.round(diff / lastETH * 10000) / 100.00;
    lastData.latest = nowPrice;
    if (percent > 0.1) {
      fs.writeFileSync('lastPrice2.json', JSON.stringify(lastData));
      return backData = { alert: 1, symbol: '以太坊', trend: '上涨', diffPrice: diff.toFixed(2), percent: "涨幅" + percent + "%", now: nowPrice.ETH };
    }
    else {
      fs.writeFileSync('lastPrice2.json', JSON.stringify(lastData));
      backData = { alert: 0 };
    }
  }
  if (nowPrice.ETH - lastETH < 0) {
    const diff = lastETH - nowPrice.ETH;
    const percent = Math.round(diff / lastETH * 10000) / 100.00;
    lastData.latest = nowPrice;
    if (percent > 0.1) {
      fs.writeFileSync('lastPrice2.json', JSON.stringify(lastData));
      return backData = { alert: 1, symbol: '以太坊', trend: '下跌', diffPrice: diff.toFixed(2), percent: "跌幅" + percent + "%", now: nowPrice.ETH }
    }
    else {
      fs.writeFileSync('lastPrice2.json', JSON.stringify(lastData));
      backData = { alert: 0 };//不报警
    }
  }















  //区间计算
  //1小时过去了，计算
  if (nowTime - lastData.AGO.hour.time >= 3600000) {
    if (nowPrice.BTC - lastData.AGO.hour.btc >= 0) {//现价高于60分钟前
      console.log("btc涨了1h");
      const diff = (nowPrice.BTC - lastData.AGO.hour.btc);//差价
      const percent = Math.round(diff / lastData.AGO.hour.btc * 10000) / 100.00;
      lastData.AGO.hour = { "time": nowTime, "btc": nowPrice.BTC, "eth": nowPrice.ETH };
      if (percent > 0.25) {//一小时涨跌0.25%
        fs.writeFileSync('lastPrice2.json', JSON.stringify(lastData));
        return backData = { alert: 1, symbol: '比特币', trend: '1小时内上涨', diffPrice: diff.toFixed(2), percent: "涨幅" + percent + "%", now: nowPrice.BTC };//播报，附加价格和幅度
      } else {
        fs.writeFileSync('lastPrice2.json', JSON.stringify(lastData));
        backData = { alert: 0 };//不报警
      }
    }
    if (nowPrice.BTC - lastData.AGO.hour.btc < 0) {
      console.log("btc跌了1h");
      const diff = Math.abs(nowPrice.BTC - lastData.AGO.hour.btc);//差价
      const percent = Math.round(diff / lastData.AGO.hour.btc * 10000) / 100.00;
      lastData.AGO.hour = { "time": nowTime, "btc": nowPrice.BTC, "eth": nowPrice.ETH };
      if (percent > 0.25) {
        fs.writeFileSync('lastPrice2.json', JSON.stringify(lastData));
        return backData = { alert: 1, symbol: '比特币', trend: '1小时内下跌', diffPrice: diff.toFixed(2), percent: "跌幅" + percent + "%", now: nowPrice.BTC };//播报，附加价格和幅度
      } else {
        fs.writeFileSync('lastPrice2.json', JSON.stringify(lastData));
        backData = { alert: 0 };//不报警
      }
    }


    //1小时以太坊计算
    if (nowPrice.ETH - lastData.AGO.hour.eth >= 0) {
      console.log("eth涨了");
      const diff = nowPrice.ETH - lastData.AGO.hour.eth;
      const percent = Math.round(diff / lastData.AGO.hour.eth * 10000) / 100.00;
      if (percent > 0.00001) {
        fs.writeFileSync('lastPrice2.json', JSON.stringify(lastData));
        return backData = { alert: 1, symbol: '以太坊', trend: '1小时内上涨', diffPrice: diff.toFixed(2), percent: "涨幅" + percent + "%", now: nowPrice.ETH };
      }
      else {
        fs.writeFileSync('lastPrice2.json', JSON.stringify(lastData));
        backData = { alert: 0 };
      }
    } else {
      console.log("eth跌了");
      const diff = Math.abs(nowPrice.ETH - lastData.AGO.hour.eth);//绝对值
      const percent = Math.round(diff / lastData.AGO.hour.eth * 10000) / 100.00;
      if (percent > 0.00001) {
        fs.writeFileSync('lastPrice2.json', JSON.stringify(lastData));
        return backData = { alert: 1, symbol: '以太坊', trend: '1小时内下跌', diffPrice: diff.toFixed(2), percent: "跌幅" + percent + "%", now: nowPrice.ETH };
      }
      else {
        fs.writeFileSync('lastPrice2.json', JSON.stringify(lastData));
        backData = { alert: 0 };
      }
    }
  }


  //15分钟计算
  if (nowTime - lastData.AGO.fifteen.time >= 900000) { //15分钟过去了，计算
    if (nowPrice.BTC - lastData.AGO.fifteen.btc >= 0) {//现价高于15分钟前
      console.log("btc涨了15");
      const diff = (nowPrice.BTC - lastData.AGO.five.btc);//差价
      const percent = Math.round(diff / lastData.AGO.five.btc * 10000) / 100.00;
      lastData.AGO.fifteen = { "time": nowTime, "btc": nowPrice.BTC, "eth": nowPrice.ETH };
      if (percent > 0.3) {//15分钟内涨幅0.1%报警
        fs.writeFileSync('lastPrice2.json', JSON.stringify(lastData));
        return backData = { alert: 1, symbol: '比特币', trend: '15分钟内上涨', diffPrice: diff.toFixed(2), percent: "涨幅" + percent + "%", now: nowPrice.BTC };//播报，附加价格和幅度
      } else {
        fs.writeFileSync('lastPrice2.json', JSON.stringify(lastData));
        backData = { alert: 0 };//不报警
      }
    }
    if (nowPrice.BTC - lastData.AGO.fifteen.btc < 0) {
      console.log("btc跌了15");
      const diff = Math.abs(nowPrice.BTC - lastData.AGO.fifteen.btc);//差价
      const percent = Math.round(diff / lastData.AGO.fifteen.btc * 10000) / 100.00;
      lastData.AGO.fifteen = { "time": nowTime, "btc": nowPrice.BTC, "eth": nowPrice.ETH };
      if (percent > 0.3) {//15分钟内跌幅0.1%报警
        fs.writeFileSync('lastPrice2.json', JSON.stringify(lastData));
        return backData = { alert: 1, symbol: '比特币', trend: '15分钟内下跌', diffPrice: diff.toFixed(2), percent: "跌幅" + percent + "%", now: nowPrice.BTC };//播报，附加价格和幅度
      } else {
        fs.writeFileSync('lastPrice2.json', JSON.stringify(lastData));
        backData = { alert: 0 };//不报警
      }
    }


    //15分钟以太坊计算
    if (nowPrice.ETH - lastData.AGO.fifteen.eth >= 0) {
      console.log("eth涨了");
      const diff = nowPrice.ETH - lastData.AGO.fifteen.eth;
      const percent = Math.round(diff / lastData.AGO.fifteen.eth * 10000) / 100.00;
      if (percent > 0.00001) {
        fs.writeFileSync('lastPrice2.json', JSON.stringify(lastData));
        return backData = { alert: 1, symbol: '以太坊', trend: '15分钟内上涨', diffPrice: diff.toFixed(2), percent: "涨幅" + percent + "%", now: nowPrice.ETH };
      }
      else {
        fs.writeFileSync('lastPrice2.json', JSON.stringify(lastData));
        backData = { alert: 0 };
      }
    } else {
      console.log("eth跌了");
      const diff = Math.abs(nowPrice.ETH - lastData.AGO.fifteen.eth);//绝对值
      const percent = Math.round(diff / lastData.AGO.fifteen.eth * 10000) / 100.00;
      if (percent > 0.00001) {
        fs.writeFileSync('lastPrice2.json', JSON.stringify(lastData));
        return backData = { alert: 1, symbol: '以太坊', trend: '15分钟内下跌', diffPrice: diff.toFixed(2), percent: "跌幅" + percent + "%", now: nowPrice.ETH };
      }
      else {
        fs.writeFileSync('lastPrice2.json', JSON.stringify(lastData));
        backData = { alert: 0 };
      }
    }
  }



  //5分钟过去了，计算
  if (nowTime - lastData.AGO.five.time >= 300000) {
    if (nowPrice.BTC - lastData.AGO.five.btc >= 0) {//现价高于5分钟前
      console.log("btc涨了5");
      const diff = (nowPrice.BTC - lastData.AGO.five.btc);//差价
      const percent = Math.round(diff / lastData.AGO.five.btc * 10000) / 100.00;
      lastData.AGO.five = { "time": nowTime, "btc": nowPrice.BTC, "eth": nowPrice.ETH };
      if (percent > 0.2) {//5分钟内涨幅0.1%报警
        fs.writeFileSync('lastPrice2.json', JSON.stringify(lastData));
        return backData = { alert: 1, symbol: '比特币', trend: '5分钟内上涨', diffPrice: diff.toFixed(2), percent: "涨幅" + percent + "%", now: nowPrice.BTC };//播报，附加价格和幅度
      } else {
        fs.writeFileSync('lastPrice2.json', JSON.stringify(lastData));
        backData = { alert: 0 };//不报警
      }
    }
    if (nowPrice.BTC - lastData.AGO.five.btc < 0) {
      console.log("btc跌了5");
      const diff = Math.abs(nowPrice.BTC - lastData.AGO.five.btc);//差价
      const percent = Math.round(diff / lastData.AGO.five.btc * 10000) / 100.00;
      lastData.AGO.five = { "time": nowTime, "btc": nowPrice.BTC, "eth": nowPrice.ETH };
      if (percent > 0.2) {//5分钟内跌幅0.1%报警
        fs.writeFileSync('lastPrice2.json', JSON.stringify(lastData));
        return backData = { alert: 1, symbol: '比特币', trend: '5分钟内下跌', diffPrice: diff.toFixed(2), percent: "跌幅" + percent + "%", now: nowPrice.BTC };//播报，附加价格和幅度
      } else {
        fs.writeFileSync('lastPrice2.json', JSON.stringify(lastData));
        backData = { alert: 0 };//不报警
      }
    }



    //5分钟以太坊计算
    if (nowPrice.ETH - lastData.AGO.five.eth >= 0) {
      console.log("eth涨了5");
      const diff = nowPrice.ETH - lastData.AGO.five.eth;
      const percent = Math.round(diff / lastData.AGO.five.eth * 10000) / 100.00;
      lastData.AGO.five = { "time": nowTime, "btc": nowPrice.BTC, "eth": nowPrice.ETH };
      if (percent > 0.00001) {
        fs.writeFileSync('lastPrice2.json', JSON.stringify(lastData));
        return backData = { alert: 1, symbol: '以太坊', trend: '5分钟内上涨', diffPrice: diff.toFixed(2), percent: "涨幅" + percent + "%", now: nowPrice.ETH };
      }
      else {
        fs.writeFileSync('lastPrice2.json', JSON.stringify(lastData));
        backData = { alert: 0 };
      }
    } else {
      console.log("eth跌了");
      const diff = Math.abs(nowPrice.ETH - lastData.AGO.five.eth);//绝对值
      const percent = Math.round(diff / lastData.AGO.five.eth * 10000) / 100.00;
      lastData.AGO.five = { "time": nowTime, "btc": nowPrice.BTC, "eth": nowPrice.ETH };
      if (percent > 0.00001) {
        fs.writeFileSync('lastPrice2.json', JSON.stringify(lastData));
        return backData = { alert: 1, symbol: '以太坊', trend: '5分钟内下跌', diffPrice: diff.toFixed(2), percent: "跌幅" + percent + "%", now: nowPrice.ETH };
      }
      else {
        fs.writeFileSync('lastPrice2.json', JSON.stringify(lastData));
        backData = { alert: 0 };
      }
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
  "TIME": nowTime, "BTC": parseFloat(BTC), "ETH": parseFloat(ETH)
};




// const lastPriceData = fs.readFileSync('lastPrice2.json');//上一次价格
// const lastPriceJson = JSON.parse(lastPriceData);
// fs.writeFileSync('lastPrice2.json', JSON.stringify(latestPriceData));//写入最新价保存
// fs.writeFile('lastPrice2.json', JSON.stringify(lastData), (err) => {
//   if (err) {
//     console.log(err);
//     return;
//   }
//   console.log("写入OK")
// });

let textContent = `比特币价格为${parseFloat(BTC)}，以太坊价格为${parseFloat(ETH)}`;//仍然最新价
const isAlert = comparePrice(latestPriceData);//计算的话传入最新价obj
console.log(isAlert);
// return;
if (isAlert.alert == 0) {
  console.log("不紧急，勿播报");
  textContent = `比特币价格为${parseFloat(BTC)}，以太坊价格为${parseFloat(ETH)}`;
  return;
} else {
  console.log("紧急情况，迅速播报");
  textContent = `${isAlert.symbol}${isAlert.trend}${isAlert.diffPrice}刀,现报${isAlert.now}`
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
