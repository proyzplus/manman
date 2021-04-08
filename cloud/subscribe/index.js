// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: "test-01-nreh6"//这是云环境id
});

// 云函数入口函数
exports.main = async (event, context) => {
  try {
    const { OPENID } = cloud.getWXContext();
    const result = await cloud.openapi.subscribeMessage.send({
      touser: OPENID,
      page: 'pages/everyday/index',
      data: {
        thing1: {
          value: event.message.act_title
        },
        number3: {
          value: event.message.act_continuous
        },
        number6: {
          value: event.message.act_total
        },
        character_string11: {
          value: event.message.act_phone
        }, 
        time14: {
          value: event.message.act_time
        }
      },
      templateId: 'r90Y49XshBdZetTGd69KmUMIEwZbtv3T96ARxW4rAdU'
    });
    return result;
  } catch (err) { 
    return err;
  }
};
