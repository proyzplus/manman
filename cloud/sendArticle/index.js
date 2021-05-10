// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  var nowTime = Date.parse(new Date());
  var setTime = Date.parse("2021-04-25 11:12:00");
  console.log(nowTime, setTime, nowTime < setTime);
  return {
    event,
    openid: wxContext.OPENID,
    appid: wxContext.APPID,
    unionid: wxContext.UNIONID,
  }
}