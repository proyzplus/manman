const DBT = wx.cloud.database().collection("talkingBucket");
const WxParse = require('../../wxParse/wxParse.js');
const DB = wx.cloud.database().collection('userList');

Page({
  data: {
    shareId: null,
    actileData: [],
    nodes: '',
    creatby: "",
    userInfo: [],
    comment: "",
    isLogin: false
  },
  onLoad: function (options) {
    DBT.doc(options.id).get({
      success: res => {
        this.setData({
          actileData: res.data,
          nodes: res.data.content,
          creatby: res.data.creatby,
          shareId: options.id
        });
        var detail_content = res.data.content;
        WxParse.wxParse('detail_content', 'html', detail_content, this, 5);
        DB.where({
          _openid: res.data._openid
        }).get({
          success: userInfo => {
            if (userInfo.data.length > 0) {
              this.setData({
                userInfo: userInfo.data[0],
                isLogin: true
              });
              this.changeData();
            } else {
              this.setData({
                userInfo: [],
                isLogin: false
              });
            }
          }
        });
      }
    });
  },
  onShareAppMessage: function (res) {
    return {
      title: this.data.actileData.title,
      imageUrl: this.data.actileData.showImg,
      path: "/pages/detail/index?id=" + this.data.shareId
    };
  },
  dearInput(e) {
    this.setData({
      comment: e.detail.value,
    });
  },
  commentDear() {
    if (!this.data.comment) {
      return false;
    }
    let commentLi = {
      _openid: this.data.userInfo._openid,
      avatarUrl: this.data.userInfo.avatarUrl,
      nickName: this.data.userInfo.nickName,
      comment: this.data.comment
    };
    let commentList = [commentLi, ...this.data.actileData.commentList];
    DBT.where({
      id: Number(this.data.actileData.id)
    }).update({
      data: {
        commentList: commentList
      },
      success: res => {
        let actileData = this.data.actileData;
        actileData.commentList = commentList;
        this.setData({
          comment: "",
          actileData
        });
      }
    });
  },
  changeData() {
    const nowUser = {
      _openid: this.data.userInfo._openid,
      avatarUrl: this.data.userInfo.avatarUrl,
      nickName: this.data.userInfo.nickName
    };
    let watchListId = this.data.actileData.watchListId;
    let watchList = this.data.actileData.watchList;
    if (watchListId.length > 0) {
      for (let i = 0; i < watchListId.length; i++) {
        if (watchListId.indexOf(this.data.userInfo._id) == -1) {
          watchListId.push(this.data.userInfo._id);
          watchList = [nowUser, ...this.data.actileData.watchList];
        }
      }
    } else {
      watchListId = [this.data.userInfo._id];
      watchList = [nowUser];
    }
    DBT.doc(this.data.actileData._id).update({
      data: {
        watchListId,
        watchList
      }
    });
  }
});