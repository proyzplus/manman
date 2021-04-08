const cloud = require('wx-server-sdk');
cloud.init();
const db = cloud.database();

exports.main = async (event, context) => {
  try {
    return await db.collection('mes').doc(event._id).update({
      data: {
        mesContent: db.command.push({
          speaker: 'server',
          contentType: event.contentType,
          content: event.content,
          creatby: event.creatby,
          userInfo: event.userInfo
        })
      }
    });
  } catch (e) {
    console.error(e);
  }
};