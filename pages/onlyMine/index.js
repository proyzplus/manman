// pages/onlyMine/index.js
Page({
  data: {
    safeAreaHeader: 0,
  },
  onLoad: function (options) {
    wx.getSystemInfo({
      success: res => {
        this.setData({
          safeAreaHeader: Number(res.safeArea.top)
        });
      }
    });
  }
});