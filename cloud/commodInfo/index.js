// 云函数入口文件
const cloud = require('wx-server-sdk');
cloud.init();
const db = cloud.database();

// 云函数入口函数
exports.main = async (event, context) => {
  if (event.type == 'add') {
    db.collection('h5-commodList').add({
      data: {
        id: Number(Date.parse(new Date()) / 1000),
        classId: event.classId,
        desc: event.desc,
        img: event.img ? event.img : "https://7465-test-01-nreh6-1301410290.tcb.qcloud.la/1621703187.png",
        name: event.name,
        num: 0,
        price: event.price,
        tag: event.tag,
        type: event.isTop ? 'top' : 'normal'
      },
    }).then(res => {
      return res;
    })
  } else {
    db.collection('h5-commodList').doc(event._id).update({
      data: {
        classId: event.classId,
        desc: event.desc,
        img: event.img,
        name: event.name,
        num: 0,
        price: event.price,
        tag: event.tag,
        type: event.isTop ? 'top' : 'normal'
      },
    }).then(res => {
      return res;
    })
  }
};