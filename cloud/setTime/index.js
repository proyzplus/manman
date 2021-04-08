// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: "test-01-nreh6" //这是云环境id
});
const db = cloud.database();

// 云函数入口函数
exports.main = async (event, context) => {
  const tasks = [];
  const promise = db.collection('activity').where({
    _id: "b00064a760651dfe0cc8b73b57ebea2b"
  }).update({
    data: {
      man: {
        sayLove: false
      },
      woman: {
        sayLove: false
      }
    }
  })
  tasks.push(promise);
  return (await Promise.all(tasks)).reduce((acc, cur) => {
    return {
      data: acc.concat(cur),
      errMsg: acc.errMsg,
    };
  });
}