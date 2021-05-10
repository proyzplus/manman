/*
 * @Author: proyzplus
 * @Date: 2021-03-01 10:05:30
 * @LastEditors: proyzplus
 * @LastEditTime: 2021-03-15 17:51:17
 * @Description: Description
 */
const DB = wx.cloud.database().collection('userList');
const DBCARD = wx.cloud.database().collection("cardList");
const dateTimePicker = require('../../utils/util.js');
Page({
  data: {
    cardList: [],
    timer: null,
    openid: null,
    goodCount: 0,
    goodRow: 0,
    isScroll: true,
    windowHeight: 0,
    isMangerment: false
  },
  onLoad: function (options) {
    wx.getSystemInfo({
      success: res => {
        this.setData({
          windowHeight: res.windowHeight
        });
      }
    });
    // wx.setNavigationBarTitle({
    //   title: "爱的旅途"
    // });
    this.getCountLoading();
    wx.getStorage({
      key: "openId",
      success: (res) => {
        this.isManger(res.data);
      }
    });
  },
  // 查看是否为管理
  isManger(val) {
    DB.where({
      _openid: val
    }).get({
      success: userInfo => {
        if (userInfo.data.length > 0) {
          this.setData({
            isMangerment: true
          });
        }
      }
    });
  },
  async getCountLoading() {
    wx.showLoading({
      title: "袁太太等一下",
      mask: true
    });
    DBCARD.count({
      success: res => {
        const countResult = res.total;
        const batchTimes = Math.ceil(countResult / 10);
        this.setData({
          goodRow: 0,
          goodCount: batchTimes,
          cardList: []
        });
        this.getCardList();
      }
    });
  },
  // 下拉刷新
  async onPullDownRefresh() {
    wx.showNavigationBarLoading(); //在标题栏中显示加载 
    await this.getCountLoading();
  },
  // 上滑加载
  onReachBottom() {
    if (this.goodCount !== 0) {
      if (Number(this.data.goodRow) + 1 < Number(this.data.goodCount)) {
        this.setData({
          goodRow: Number(this.data.goodRow) + 1
        });
        this.getCardList();
      } else {
        console.log("list与总数已经相等，没有数据可加载了");
      }
    } else {
      console.log("数为0");
    }
  },
  async getCardList() {
    wx.cloud.callFunction({
      name: "talkingUserOpenId",
      success: res => {
        this.setData({
          openid: res.result.openid
        });
      }
    });
    wx.cloud.callFunction({
      name: "getCardList",
      data: {
        row: this.data.goodRow
      },
      success: res => {
        let cardList = [...this.data.cardList, ...res.result.data];
        this.data.timer = setInterval(() => {
          for (let i = 0; i < cardList.length; i++) {
            cardList[i].last_dateTime = cardList[i].dateTime;
            if (cardList[i].last_dateTime.indexOf("周") == -1) {
              cardList[i].last_dateTime = cardList[i].dateTime + " " + (dateTimePicker.dateLater(cardList[i].dateTime.replace(/-/g, "/"))).week;
            }
            cardList[i].lastMitune = this.countTime(cardList[i].dateTime);
          }
          this.setData({
            cardList: cardList
          });
        }, 1000);
        wx.hideLoading();
        wx.hideNavigationBarLoading(); //完成停止加载
        wx.stopPullDownRefresh(); //停止下拉刷新 
      }
    });
  },
  managerCard: function (e) {
    let id = e.currentTarget.id;
    if (this.data.isMangerment) {
      if (this.data.openid == 'o_BMd5IPJeXtDy4h-_rzTR-Kn2zM') {
        wx.navigateTo({
          url: "../../pages/labelCard/index?id=" + id + "&type=update"
        });
      } else if (this.data.openid == 'o_BMd5ERRE6PLi2dS08lm89tiMgU') {
        wx.navigateTo({
          url: "../../pages/labelCard/index?id=" + id + "&type=update"
        });
      }
    }
  },
  // 倒计时
  countTime(val) {
    let now = Date.parse(new Date());
    let end = Date.parse(new Date(val.replace(/-/g, "/")));
    //时间差  
    let leftTime = now - end;
    if (leftTime < 0) {
      leftTime = -leftTime;
    }
    //定义变量 d,h,m,s保存倒计时的时间  
    let d, h, m, s;
    d = Math.floor(leftTime / 1000 / 60 / 60 / 24);
    h = Math.floor(leftTime / 1000 / 60 / 60 % 24);
    m = Math.floor(leftTime / 1000 / 60 % 60);
    s = Math.floor(leftTime / 1000 % 60);
    //将0-9的数字前面加上0，例1变为01
    d = checkTime(d);
    h = checkTime(h);
    m = checkTime(m);
    s = checkTime(s);
    function checkTime(i) {
      if (Number(i) < 10 && Number(i) > 0) {
        i = "0" + i;
      }
      return i;
    }
    let lastMitune = d + "天" + h + "时" + m + "分" + s + "秒";
    return lastMitune;
  }
});