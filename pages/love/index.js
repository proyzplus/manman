const DB = wx.cloud.database().collection("wenAnList");

Page({
  data: {
    listData: [],
    userInfo: [],
    page: 0,
    totalCount: 0
  },
  onLoad: function (options) {
    let that = this
    // wx.setNavigationBarTitle({
    //   title: "总有一句可以送给她"
    // });
    DB.count({
      success(tal) {
        const countResult = tal.total;
        const batchTimes = Math.ceil(countResult / 10);
        that.setData({
          page: 0,
          totalCount: batchTimes
        });
        that.getWenList();
      }
    });
  },
  // 获取数据
  async getWenList() {
    let that = this;
    wx.cloud.callFunction({
      name: "loveList",
      data: {
        row: that.data.page
      },
      success(res) {
        console.log(res, "1")
        that.setData({
          listData: res.result.data
        });
      }
    });

  },
  // 上一页
  returnPage() {
    if (Number(this.data.page) == 0) {
      wx.showToast({
        title: '这是第一页咯',
        icon: 'none',
        image: '../../images/mao.png',
        duration: 3000,
        mask: false,
      });
      return false;
    } else {
      let page = Number(this.data.page) - 1;
      this.setData({
        page: page,
        listData: []
      });
      this.getWenList();
    }
  },
  // 下一页
  nextPage() {
    if (this.data.page + 1 == this.data.totalCount) {
      wx.showToast({
        title: '已经是最后一页',
        icon: 'none',
        image: '../../images/mao.png',
        duration: 3000,
        mask: false,
      });
      return false;
    } else {
      let page = Number(this.data.page) + 1;
      this.setData({
        page: page,
        listData: []
      });
      this.getWenList();
    }
  },
  handleClick(e) {
    wx.setClipboardData({
      data: e.currentTarget.dataset.word,
      success(res) {
        wx.getClipboardData({
          success(res) {
            console.log(res.data);
          }
        });
      }
    });
  }
});