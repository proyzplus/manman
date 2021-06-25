const DBUS = wx.cloud.database().collection("memories");

Page({
  data: {
    imageSrc: [],
    goodRow: 0,
    goodCount: 0
  },
  onLoad() {
    this.loading();
  },
  async loading() {
    wx.vibrateShort({
      type: "medium"
    });
    wx.showLoading({
      title: "袁太太等一下",
      mask: true
    });
    let that = this
    DBUS.count({
      success(tal) {
        const countResult = tal.total;
        const batchTimes = Math.ceil(countResult / 10);
        that.setData({
          goodRow: 0,
          goodCount: batchTimes,
          imageSrc: []
        });
        that.getMoreTalking();
      }
    });
  },
  // 下拉刷新
  async onPullDownRefresh() {
    wx.showNavigationBarLoading(); //在标题栏中显示加载 
    await this.loading();
  },
  // 上滑加载
  onReachBottom() {
    if (this.goodCount !== 0) {
      if (Number(this.data.goodRow) + 1 < Number(this.data.goodCount)) {
        this.setData({
          goodRow: Number(this.data.goodRow) + 1
        });
        this.getMoreTalking();
      } else {
        console.log("list与总数已经相等，没有数据可加载了");
      }
    } else {
      console.log("数为0");
    }
  },
  async getMoreTalking() {
    wx.cloud.callFunction({
      name: "getMemories",
      data: {
        row: this.data.goodRow
      },
      success: res => {
        this.setData({
          imageSrc: this.data.imageSrc.concat(res.result.data)
        });
        wx.hideLoading();
        wx.hideNavigationBarLoading(); //完成停止加载
        wx.stopPullDownRefresh(); //停止下拉刷新 
      }
    });
  },
  seeImg(e) {
    wx.previewImage({
      current: e.currentTarget.dataset.src,
      urls: [e.currentTarget.dataset.src]
    });
  }
});