const fs = require('fs');



function comparePrice(nowPrice) {
  let backData;
  const bufferData = fs.readFileSync('lastPrice.json');

  const lastData = JSON.parse(bufferData);
  const lastBTC = lastData.BTC;
  const lastETH = lastData.ETH;
  const lastTimeStamp = lastData.TIME;

  //计算BTC
  if (nowPrice.BTC - lastBTC > 0) {//代表BTC价格较上次涨了嘿
    const diff = (nowPrice.BTC - lastBTC);
    const percent = Math.round(diff / lastBTC * 10000) / 100.00;
    if (percent > 0.2) {//秒涨0.2%报警
      return backData = { alert: 1, symbol: 'BTC', trend: '上涨', diffPrice: diff.toFixed(2), percent: "涨幅" + percent + "%" };//播报，附加上涨价格和幅度
    }
    else {
      backData = { alert: 0 };//不报警
    }
  }
  if (nowPrice.BTC - lastBTC < 0) {//代表BTC价格较上次跌了日
    const diff = lastBTC - nowPrice.BTC;
    const percent = Math.round(diff / lastBTC * 10000) / 100.00;
    if (percent > 0.2) {//秒跌0.2报警
      return backData = { alert: 1, symbol: 'BTC', trend: '下跌', diffPrice: diff.toFixed(2), percent: "跌幅" + percent + "%" }//播报，附加下跌价格和幅度
    }
    else {
      backData = { alert: 0 };//不报警
    }
  }


  //ETH计算
  if (nowPrice.ETH - lastETH > 0) {
    const diff = nowPrice.ETH - lastETH;
    const percent = Math.round(diff / lastETH * 10000) / 100.00;
    if (percent > 0.2) {
      return backData = { alert: 1, symbol: 'ETH', trend: '上涨', diffPrice: diff.toFixed(2), percent: "涨幅" + percent + "%" };
    }
    else {
      backData = { alert: 0 };
    }
  }
  if (nowPrice.ETH - lastETH < 0) {
    const diff = lastETH - nowPrice.ETH;
    const percent = Math.round(diff / lastETH * 10000) / 100.00;
    if (percent > 0.2) {
      return backData = { alert: 1, symbol: 'ETH', trend: '下跌', diffPrice: diff.toFixed(2), percent: "跌幅" + percent + "%" }
    }
    else {
      backData = { alert: 0 };//不报警
    }
  }
  return backData;
}

const a = { "TIME": 1666114238097, "BTC": 19900, "ETH": 1307 };

console.log(comparePrice(a))