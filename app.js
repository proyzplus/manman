/*
 * @Author: proyzplus
 * @Date: 2021-03-01 10:05:29
 * @LastEditors: proyzplus
 * @LastEditTime: 2021-04-07 09:26:04
 * @Description: Description
 */
//app.js
App({
  onLaunch: function (options) {
    wx.cloud.init({
      env: "test-01-nreh6"
    });
    this.scene = options.scene;
    //获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          wx.getUserInfo({
            success: res => {
              // 可以将 res 发送给后台解码出 unionId
              this.globalData.userInfo = res.userInfo;
              this.globalData.userStatus = true;
            },
            fail: function (res) {
              console.log(res, 'err');
            }
          });
        } else {
          console.log('cuo');
        }
      }
    });
  },
  onError(error) {
    // console.log(error, 'error');
    // "scope.userLocation": {
    //   "desc": "你的位置信息将用于定位效果和天气信息展示"
    // },
    // "permission": {
    //   "scope.userLocation": {
    //     "desc": "你的位置信息将用于小程序位置接口的效果展示" 
    //   }
    // }

    // ,
    //   {
    //     "pagePath": "pages/mine/index",
    //     "text": "HGY",
    //     "iconPath": "images/mine.png",
    //     "selectedIconPath": "images/mine-s.png"
    //   }
  },
  onHide() {
    // console.log(1);
  },
  globalData: {
    userInfo: null,
    userStatus: false
  },
  getUserInfo: function (cb) {
    var that = this;
    wx.getUserInfo({
      success: function (res) {
        that.globalData.userInfo = res.userInfo;
        that.globalData.userStatus = true;
      }
    });
  }
});