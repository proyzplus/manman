/*
 * @Author: proyzplus
 * @Date: 2021-03-01 10:05:29
 * @LastEditors: proyzplus
 * @LastEditTime: 2021-05-11 14:05:08
 * @Description: Description
 */
//app.js
App({
  onLaunch: function (options) {
    wx.cloud.init({
      env: "test-01-nreh6"
    });
    this.scene = options.scene;
  },
  //渐入，渐出实现 
  show: function (that, param, opacity) {
    var animation = wx.createAnimation({
      //持续时间800ms
      duration: 800,
      timingFunction: 'ease',
    });
    //var animation = this.animation
    animation.opacity(opacity).step();
    //将param转换为key
    var json = '{"' + param + '":""}';
    json = JSON.parse(json);
    json[param] = animation.export();
    //设置动画
    that.setData(json);
  },
  //滑动渐入渐出
  slideupshow: function (that, param, px, opacity) {
    var animation = wx.createAnimation({
      duration: 800,
      timingFunction: 'ease',
    });
    animation.translateY(px).opacity(opacity).step();
    //将param转换为key
    var json = '{"' + param + '":""}';
    json = JSON.parse(json);
    json[param] = animation.export();
    //设置动画
    that.setData(json);
  },
  //向右滑动渐入渐出
  sliderightshow: function (that, param, px, opacity) {
    var animation = wx.createAnimation({
      duration: 800,
      timingFunction: 'ease',
    });
    animation.translateX(px).opacity(opacity).step();
    //将param转换为key
    var json = '{"' + param + '":""}';
    json = JSON.parse(json);
    json[param] = animation.export();
    //设置动画
    that.setData(json);
  },
  onError(error) { },
  onShow() {
    this.upDataApp();
  },
  onHide() { },
  globalData: {},
  upDataApp: function () { //版本更新
    if (wx.canIUse('getUpdateManager')) { //判断当前微信版本是否支持版本更新
      const updateManager = wx.getUpdateManager();
      updateManager.onCheckForUpdate(function (res) {
        if (res.hasUpdate) { // 请求完新版本信息的回调
          updateManager.onUpdateReady(function () {
            wx.showModal({
              title: '更新提示',
              content: '新版本已经准备好，是否重启应用？',
              success: function (res) {
                if (res.confirm) { // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
                  updateManager.applyUpdate();
                }
              }
            });
          });
          updateManager.onUpdateFailed(function () {
            wx.showModal({ // 新的版本下载失败
              title: '已经有新版本了哟~',
              content: '新版本已经上线啦~，请您删除当前小程序，重新搜索打开哟~'
            });
          });
        }
      });
    } else {
      wx.showModal({ // 如果希望用户在最新版本的客户端上体验您的小程序，可以这样子提示
        title: '提示',
        content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。'
      });
    }
  }
});