const DBUS = wx.cloud.database().collection("memories");

Page({
  data: {
    imageSrc: []
  },
  onLoad() {
    let that = this;
    wx.cloud.callFunction({
      name: "getMemories",
      data: {
        row: 0
      },
      success(res) {
        let photoList = res.result.data;
        photoList.sort(function (a, b) {
          return b.creatby - a.creatby;
        });
        that.setData({
          imageSrc: photoList
        });
      }
    });
  },
  seeImg(e) {
    wx.previewImage({
      current: e.currentTarget.dataset.src,
      urls: [e.currentTarget.dataset.src]
    })
  }
});