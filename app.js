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
  onError(error) {
  },
  onHide() {
  },
  globalData: {
  }
});