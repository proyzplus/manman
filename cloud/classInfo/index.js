// 云函数入口文件
const cloud = require('wx-server-sdk');
cloud.init();
const db = cloud.database();

// 云函数入口函数
exports.main = async (event, context) => {
  if (event.type == 'add') {
    db.collection('h5-classList').add({
      data: {
        id: Number(Date.parse(new Date()) / 1000),
        name: event.name,
        icon: ""
      },
    }).then(res => {
      return res;
    })
  } else {
    db.collection('h5-classList').doc(event._id).update({
      data: {
        name: event.name
      },
    }).then(res => {
      return res;
    })
  }
};