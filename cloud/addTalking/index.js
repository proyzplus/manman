// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  console.log(event, "云函数")
  return cloud.database().collection("talkingBucket").add({
    data: {
      content: event.result.event.event,
      creatby: event.result.event.creatby,
      introduction: event.result.event.introduction,
      showImg: event.result.event.showImg,
      title: event.result.event.title,
      updateby: event.result.event.updateby
    },
    success(res) {
      return res
    }, fail(err) {
      return err
    }
  })
}