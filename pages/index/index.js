var app = getApp();
var touchStartX = 0;//触摸时的原点  
var touchStartY = 0;//触摸时的原点  
var time = 0;// 时间记录，用于滑动时且时间小于1s则执行左右滑动  
var interval = "";// 记录/清理时间记录  
var touchMoveX = 0; // x轴方向移动的距离
var touchMoveY = 0; // y轴方向移动的距离
Page({
  data: {
    userInfo: {},
    topic: "温柔的晚风,傍晚的晚餐,解暑的西瓜,冒泡的啤酒,从今年开始每个夏天都要和你过啦!",
    openid: '',
    goodCount: 0,
    goodRow: 0,
    commodList: [],
    showModalStatus: false,
    animationData: [],
    safeWidth: 0
  },
  onLoad: function (e) {
    wx.getSystemInfo({
      success: res => {
        this.setData({
          safeWidth: Number(res.safeArea.width) - 98
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
  async loading() {
    wx.showLoading({
      title: "夫人等一下啦",
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
        row: this.data.goodRow
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
  // 查看商品详情
  toDetailsTap: function (e) {
    wx.navigateTo({
      url: "../../pages/detail/index?id=" + e.currentTarget.dataset.id
    });
  },
  love() {
    wx.navigateTo({
      url: "../../pages/love/index"
    });
  },
  sang() {
    wx.navigateTo({
      url: "../../pages/photoList/index"
    });
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
  // 触摸开始事件  
  touchStart: function (e) {
    touchStartX = e.touches[0].pageX; // 获取触摸时的原点  
    touchStartY = e.touches[0].pageY; // 获取触摸时的原点  
    // 使用js计时器记录时间    
    interval = setInterval(function () {
      time++;
    }, 100);
  },
  // 触摸移动事件  
  touchMove: function (e) {
    touchMoveX = e.touches[0].pageX;
    touchMoveY = e.touches[0].pageY;
  },
  // 触摸结束事件  
  touchEnd: function (e) {
    var moveX = touchMoveX - touchStartX;
    var moveY = touchMoveY - touchStartY;
    if (Math.sign(moveX) == -1) {
      moveX = moveX * -1;
    }
    if (Math.sign(moveY) == -1) {
      moveY = moveY * -1;
    }
    if (moveX <= moveY) {
      if (touchMoveY - touchStartY <= -30 && time < 10) {
        console.log("向上滑动");
      }
      if (touchMoveY - touchStartY >= 30 && time < 10) {
        console.log('向下滑动 ');
      }
    } else {
      if (touchMoveX - touchStartX <= -30 && time < 10) {
        console.log("左滑页面");
      }
      if (touchMoveX - touchStartX >= 30 && time < 10) {
        console.log('向右滑动');
        var currentStatu = "open";
        this.util(currentStatu);
      }
    }
    clearInterval(interval);
    time = 0;
  }
});