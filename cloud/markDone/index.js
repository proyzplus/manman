// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: "test-01-nreh6" //这是云环境id
});
// 云函数入口函数
exports.main = async (event, context) => {
  try {
    const result = await cloud.openapi.subscribeMessage.send({
      touser: event.openId,
      page: 'pages/mustDoThings/index',
      data: {
        time5: {
          value: event.message.done_time
        },
        thing6: {
          value: event.message.done_address
        },
        thing4: {
          value: event.message.done_name
        },
        thing2: {
          value: event.message.done_desc
        }
      },
      templateId: 'oojBTy-6-cBvDol2M-Q6nEGl4xdn6g4XiR2A4i__b6c'
    });
    return result;
  } catch (err) {
    return err;
  }
};