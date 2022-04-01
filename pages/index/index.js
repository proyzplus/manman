const DB = wx.cloud.database().collection('userList');
const DBAC = wx.cloud.database().collection("activity");
var app = getApp();
Page({
  data: {
    userInfo: {},
    topic: "",
    openid: '',
    goodCount: 0,
    goodRow: 0,
    commodList: [],
    showModalStatus: false,
    animationData: [],
    safeWidth: 0,
    isMangerment: false,
    lastTapTime: 0,
    imgUrls: [],
    classList: []
  },
  onLoad: function (e) {
    wx.getSystemInfo({
      success: res => {
        this.setData({
          safeWidth: (Number(res.safeArea.width) / 2) + 50
        });
      }
    });
    this.loading();
    wx.cloud.callFunction({
      name: "talkingUserOpenId",
      success: res => {
        wx.setStorage({
          key: 'openId',
          data: res.result.openid
        });
        this.setData({
          openid: res.result.openid
        });
        if (res.result.openid == 'o_BMd5ERRE6PLi2dS08lm89tiMgU') {
          wx.showModal({
            title: "欢迎夫人来到‘慢慢Home’",
            content: "不见面的日子里，爱并不会消失，只会更加浓烈。我爱你，袁太太！对不起.",
            showCancel: false,
            confirmText: "我也爱你",
            confirmColor: "#f44336",
            success: res => {
              if (res.confirm) {
                console.log('用户点击确定');
              }
            },
          });
        }
      }
    });
  },
  onHide: function (e) {
    this.setData({
      showModalStatus: false
    });
  },
  async loading() {
    DBAC.get({
      success: res => {
        this.setData({
          imgUrls: res.data[1].swiperList,
          isMangerment: res.data[2].config,
          classList: res.data[3].classList,
          topic: res.data[3].topic
        });
      }
    });
    wx.vibrateShort({
      type: "medium"
    });
    wx.showLoading({
      title: "袁太太等一下"
    });
    wx.cloud.database().collection("talkingBucket").count({
      success: tal => {
        const countResult = tal.total;
        const batchTimes = Math.ceil(countResult / 10);
        this.setData({
          goodRow: 0,
          goodCount: batchTimes,
          commodList: []
        });
        this.getMoreTalking();
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
      name: "talkingData",
      data: {
        row: this.data.goodRow,
        type: "normal"
      },
      success: res => {
        this.setData({
          commodList: this.data.commodList.concat(res.result.data)
        });
        wx.hideLoading();
        wx.hideNavigationBarLoading(); //完成停止加载
        wx.stopPullDownRefresh(); //停止下拉刷新 
      }
    });
  },
  // 查看详情
  toDetailsTap: function (e) {
    wx.navigateTo({
      url: "../../pages/articleDetail/index?id=" + e.currentTarget.dataset.id
    });
  },
  navPage(e) {
    let id = e.currentTarget.dataset.id;
    if (Number(id) == 1001001) {
      wx.navigateTo({
        url: "../../pages/love/index"
      });
    } else if (Number(id) == 1001002) {
      wx.navigateTo({
        url: "../../pages/photoList/index"
      });
    } else if (Number(id) == 1001003) {
      wx.navigateTo({
        url: '../../pages/mustDoThings/index'
      });
    } else if (Number(id) == 1001004) {
      wx.navigateTo({
        url: '../../pages/note/index'
      });
    } else if (Number(id) == 1001005) {
      wx.navigateTo({
        url: "../../pages/togetherPhonts/index"
      });
    }
  },
  powerDrawer: function (e) {
    this.util(e.currentTarget.dataset.statu);
  },
  util: function (currentStatu) {
    var animation = wx.createAnimation({
      duration: 300,
      timingFunction: "linear",
      delay: 0
    });
    this.animation = animation;
    animation.translateX(0).step();
    this.setData({
      animationData: animation.export()
    });
    let safeWidth = this.data.safeWidth;
    setTimeout(function () {
      animation.translateX(safeWidth).step();
      this.setData({
        animationData: animation
      });
      if (currentStatu == "close") {
        this.setData({
          showModalStatus: false
        });
      }
    }.bind(this), 200);
    if (currentStatu == "open") {
      this.setData({
        showModalStatus: true
      });
    }
  },
  doubleClick(e) {
    let curTime = e.timeStamp;
    let lastTime = e.currentTarget.dataset.time;
    if (curTime - lastTime > 0) {
      if (curTime - lastTime < 300) {
        if (this.data.isMangerment) {
          this.util("open");
        }
      }
    }
    this.setData({
      lastTapTime: curTime
    });
  },
  openUserInfo() {
    if (this.data.isMangerment) {
      this.util("open");
    }
  },
  renavgiteOnlyMe() {
    wx.navigateTo({
      url: "../onlyMine/index"
    });
  }
});