const DBT = wx.cloud.database().collection("talkingBucket");

Page({
  data: {
    release: [],
    // choose: false,
    // animationData: {}, 
    _openid: null,
    row: 0,
    count: 0
  },
  onLoad: function (options) {
    wx.getStorage({
      key: 'openId',
      success: res => {
        this.setData({
          _openid: res.data
        });
        this.loading();
      }
    });
  },
  async loading() {
    wx.showLoading({
      title: "袁太太等一下",
      mask: true
    });
    let that = this
    DBT.count({
      success(tal) {
        const countResult = tal.total;
        const batchTimes = Math.ceil(countResult / 10);
        that.setData({
          row: 0,
          count: batchTimes,
          release: []
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
    if (this.count !== 0) {
      if (Number(this.data.row) + 1 < Number(this.data.count)) {
        this.setData({
          row: Number(this.data.row) + 1
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
      name: "talkingData",
      data: {
        row: this.data.row,
        type: "history",
        _openid: this.data._openid
      },
      success: res => {
        this.setData({
          release: this.data.release.concat(res.result.data)
        });
        wx.hideLoading();
        wx.hideNavigationBarLoading(); //完成停止加载
        wx.stopPullDownRefresh(); //停止下拉刷新 
      }
    });
  },
  detail: function (e) {
    wx.navigateTo({
      url: "../../pages/articleDetail/index?id=" + e.currentTarget.dataset.item._id
    });
  },
  update: function (e) {
    wx.navigateTo({
      url: "../../pages/release/index?id=" + e.currentTarget.dataset.item._id
    });
  },
  delete: function (e) {
    let id = e.currentTarget.dataset.item._id;
    wx.showModal({
      title: '确定删除嘛?',
      content: '删除之后可以在回收站查看,目前回收站功能暂未开放!',
      success: res => {
        if (res.confirm) {
          console.log('用户点击确定');
          DBT.doc(id).update({
            data: {
              isDisplay: false
            },
            success: result => {
              wx.reLaunch({
                url: '../../pages/index/index'
              });
            }
          });
        }
      }
    });
  },
  // //展开动画
  // showContent() {
  //   let that = this;
  //   let animation = wx.createAnimation({
  //     duration: 400,
  //     timingFunction: 'linear'
  //   });
  //   that.animation = animation;
  //   animation.width("0").opacity(0).step();
  //   that.setData({
  //     animationData: animation.export(),
  //     choose: true
  //   });
  //   setTimeout(function () {
  //     animation.width("94%").opacity(1).step({
  //       duration: 400
  //     });
  //     that.setData({
  //       animationData: animation.export(),
  //     });
  //   }, 50);
  // },
  // //关闭动画
  // hideContent() {
  //   let that = this;
  //   let animation = wx.createAnimation({
  //     duration: 400,
  //     timingFunction: 'linear'
  //   });
  //   that.animation = animation;
  //   animation.width(0).opacity(0).step({
  //     duration: 400
  //   });
  //   that.setData({
  //     animationData: animation.export()
  //   });
  //   setTimeout(function () {
  //     animation.width("94%").step();
  //     that.setData({
  //       animationData: animation.export(),
  //       choose: false,
  //     });
  //   }, 400);
  // },
});