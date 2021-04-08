// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init();
const db = cloud.database();

// 云函数入口函数
exports.main = async (event, context) => {
  const tasks = [];
  const promise_man = db.collection('activity').where({
    manOpenid: event.openid
  }).get();
  const promise_woman = db.collection('activity').where({
    womanOpenid: event.openid
  }).get();
  tasks.push(promise_man);
  tasks.push(promise_woman);
  return (await Promise.all(tasks)).reduce((acc, cur) => {
    var isLady = false;
    if (acc.data.length > 0) {
      isLady = false;
    } else if (cur.data.length > 0) {
      isLady = true;
    }
    return {
      data: acc.data.concat(cur.data),
      isLady: isLady,
      normal: false,
      errMsg: acc.errMsg,
    };
  });
}