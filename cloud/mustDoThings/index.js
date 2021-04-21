// 云函数入口文件
const cloud = require('wx-server-sdk');
cloud.init();
const db = cloud.database();
const MAX_LIMIT = 10;
// 云函数入口函数
exports.main = async (event, context) => {
  const tasks = [];
  const promise = db.collection('mustThings').where({
    type: event.type
  }).skip(event.row * MAX_LIMIT).limit(MAX_LIMIT).orderBy('id', 'desc').get();
  tasks.push(promise);
  return (await Promise.all(tasks)).reduce((acc, cur) => {
    return {
      data: acc.data.concat(cur.data),
      errMsg: acc.errMsg,
    };
  });
};