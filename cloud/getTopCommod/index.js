// 云函数入口文件
const cloud = require('wx-server-sdk');
cloud.init();
const db = cloud.database();
const MAX_LIMIT = 99;
// 云函数入口函数
exports.main = async (event, context) => {
  const tasks = [];
  const promise = db.collection('h5-commodList').where({
    type: "top"
  }).skip(0).limit(MAX_LIMIT).orderBy('id', 'desc').get();
  tasks.push(promise);
  return (await Promise.all(tasks)).reduce((acc, cur) => {
    return {
      data: acc.data.concat(cur.data),
      errMsg: acc.errMsg,
    };
  });
};