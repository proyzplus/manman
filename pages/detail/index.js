const DBT = wx.cloud.database().collection("talkingBucket");
const WxParse = require('../../wxParse/wxParse.js');
const DB = wx.cloud.database().collection('userList');

Page({
  data: {
    shareId: null,
    actileData: [],
    nodes: '',
    creatby: "",
    userInfo: []
  },
  onLoad: function (options) {
    let that = this;
    DBT.doc(options.id).get({
      success(res) {
        console.log(res.data, "wend");
        DB.where({
          _openid: res.data._openid
        }).get({
          success: function (re) {
            that.setData({
              userInfo: re.data[0]
            });
          }
        });
        that.setData({
          actileData: res.data,
          nodes: res.data.content,
          creatby: res.data.creatby,
          shareId: options.id
        });
        var detail_content = res.data.content;
        WxParse.wxParse('detail_content', 'html', detail_content, that, 5);
      }
    });
  },
  onShareAppMessage: function (res) {
    return {
      title: this.data.actileData.title,
      imageUrl: this.data.actileData.showImg,
      path: "/pages/detail/index?id=" + this.data.shareId
    };
  }
});