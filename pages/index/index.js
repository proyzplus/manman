const DB = wx.cloud.database().collection('userList');
const DBAC = wx.cloud.database().collection("activity");
var app = getApp();
Page({
  data: {
    userInfo: {},
    topic: "我希望有个如你一般的人，如山间清爽的风，如古城温暖的光。从清晨到傍晚，由山野到书房。只要最后是你，就好！",
    openid: '',
    goodCount: 0,
    goodRow: 0,
    commodList: [],
    showModalStatus: false,
    animationData: [],
    safeWidth: 0,
    isMangerment: false,
    lastTapTime: 0,
    imgUrls: []
  },
  onLoad: function (e) {
    wx.getSystemInfo({
      success: res => {
        this.setData({
          safeWidth: (Number(res.safeArea.width) / 2) + 50
        });
      }
    });
    DBAC.get({
      success: res => {
        this.setData({
          imgUrls: res.data[1].swiperList
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
        this.isManger();
        if (res.result.openid == 'o_BMd5ERRE6PLi2dS08lm89tiMgU') {
          wx.showModal({
            title: "欢迎夫人来到‘慢慢Home’",
            content: "不见面的日子里，爱并不会消失，只会更加浓烈。我爱你，袁太太！",
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
  // 查看是否为管理
  isManger() {
    let data = {
      _openid: this.data.openid
    };
    DB.where(data).get({
      success: userInfo => {
        console.log(userInfo, "用户在数据库有没有数据");
        if (userInfo.data.length > 0) {
          this.setData({
            isMangerment: true
          });
        }
      }
    });
  },
  async loading() {
    wx.showLoading({
      title: "袁太太等一下",
      mask: true
    });
    let that = this
    wx.cloud.database().collection("talkingBucket").count({
      success(tal) {
        const countResult = tal.total;
        const batchTimes = Math.ceil(countResult / 10);
        that.setData({
          goodRow: 0,
          goodCount: batchTimes,
          commodList: []
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
    if (this.data.isMangerment) {
      let type = e.currentTarget.dataset.type;
      switch (type) {
        case "moreLove":
          wx.navigateTo({
            url: "../../pages/love/index"
          });
          break;
        case "memories":
          wx.navigateTo({
            url: "../../pages/photoList/index"
          });
          break;
        default:
          break;
      }
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
    } else {
      // wx.getUserProfile({
      //   desc: '用于展示个人信息',
      //   success: (res) => {
      //     wx.showToast({
      //       title: '恭喜你登录成功',
      //       icon: 'success',
      //       duration: 2000
      //     });
      //     let userInfo = res.userInfo;
      //     wx.cloud.callFunction({
      //       name: "talkingUserOpenId",
      //       success(openid) {
      //         userInfo.openid = openid.result.openid;
      //         userInfo.autograph = "";
      //         DB.add({
      //           data: userInfo,
      //           success(res) {
      //             console.log(res, "获取用户信息成功，并保存云数据库");
      //           }
      //         });
      //       }
      //     });
      //   }
      // });
    }
  }
});