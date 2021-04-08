const DB = wx.cloud.database().collection("userList");
const DBLOVE = wx.cloud.database().collection("wenAnList");

Page({
  data: {
    word: "",
    userInfo: [],
    total: 0
  },
  onLoad: function (options) {
    //获取用户在数据库的信息
    let that = this;
    wx.getStorage({
      key: 'openId',
      success: function (res) {
        DB.where({
          _openid: res.data
        }).get({
          success: function (res) {
            that.setData({
              userInfo: res.data[0]
            });
          }
        });
      }
    });
    DBLOVE.count({
      success(res) {
        that.setData({
          total: res.total
        });
      }
    });
  },
  bindinput: function (e) {
    this.setData({
      word: e.detail.value
    });
  },
  handleClick() {
    let that = this;
    DBLOVE.add({
      data: {
        creatby: that.timi(new Date()),
        userInfo: that.data.userInfo,
        word: that.data.word,
        id: Number(that.data.total) + 1
      },
      success(res) {
        console.log(res, "成功添加它");
        wx.showToast({
          title: '恭喜你添加成功!',
          icon: 'success',
          image: '',
          duration: 1500,
          mask: false,
        });
        wx.navigateBack({ changed: true });//返回上一页
        // wx.reLaunch({
        //   url: '../../pages/index/index'
        // });
      }
    });
  },
  timi(date) {
    let year = date.getFullYear();
    let month = date.getMonth() + 1;
    if (month < 10) {
      month = "0" + month;
    }
    let day = date.getDate();
    if (day < 10) {
      day = "0" + day;
    }
    let hour = date.getHours();
    if (hour < 10) {
      hour = "0" + hour;
    }
    let minute = date.getMinutes();
    if (minute < 10) {
      minute = "0" + minute;
    }
    let second = date.getSeconds();
    if (second < 10) {
      second = "0" + minute;
    }
    return year + "-" + month + "-" + day + " " + hour + ":" + minute + ":" + second;
  }
});