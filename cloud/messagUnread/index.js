// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: "test-01-nreh6" //这是云环境id
});

// 云函数入口函数
exports.main = async (event, context) => {
  try {
    const result = await cloud.openapi.subscribeMessage.send({
      touser: event.openid,
      page: 'pages/everyday/index',
      data: {
        thing4: {
          value: event.message.mes_send_name
        },
        thing2: {
          value: event.message.mes_content
        },
        thing9: {
          value: event.message.mes_receive_name
        },
        time3: {
          value: event.message.mes_time
        }
      },
      templateId: '8C-6eWdT1Izc1MsRy40iFDIX0kxeSGhCE4SANaOfuos'
    });
    return result;
  } catch (err) {
    return err;
  }
};