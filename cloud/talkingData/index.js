// 云函数入口文件
const cloud = require('wx-server-sdk');
cloud.init();
const db = cloud.database();
const MAX_LIMIT = 10;
// 云函数入口函数
exports.main = async (event, context) => {
  const tasks = [];
  var promise = "";
  if (event.type == 'history') {
    promise = db.collection('talkingBucket').where({
      isDisplay: true,
      _openid: event._openid
    }).skip(event.row * MAX_LIMIT).limit(MAX_LIMIT).orderBy('id', 'desc').get();
  } else {
    promise = db.collection('talkingBucket').where({
      isDisplay: true
    }).skip(event.row * MAX_LIMIT).limit(MAX_LIMIT).orderBy('id', 'desc').get();
  }
  tasks.push(promise);
  return (await Promise.all(tasks)).reduce((acc, cur) => {
    return {
      data: acc.data.concat(cur.data),
      errMsg: acc.errMsg,
    };
  });
};