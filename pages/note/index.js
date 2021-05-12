/*
 * @Author: proyzplus
 * @Date: 2021-05-10 16:37:11
 * @LastEditors: proyzplus
 * @LastEditTime: 2021-05-12 15:17:39
 * @Description: Description
 */
const DBNOTE = wx.cloud.database().collection("noteList");
Page({
  data: {
    content: "",
    openid: null,
    row: 0,
    count: 0,
    noteList: [],
    touchStart: 0,
    touchEnd: 0,
    isShowConfirm: false
  },
  onLoad: function (options) {
    wx.getStorage({
      key: "openId",
      success: (res) => {
        this.setData({
          openid: res.data
        });
        this.loading();
      }
    });
  },
  setValue: function (e) {
    this.setData({
      content: e.detail.value
    });
  },
  cancel: function () {
    this.setData({
      isShowConfirm: !this.data.isShowConfirm
    });
  },
  confirmAcceptance: function () {
    if (!this.data.content) {
      return;
    }
    DBNOTE.add({
      data: {
        id: Date.parse(new Date()) / 1000,
        time: this.timi(new Date()),
        content: this.data.content
      },
      success: res => {
        this.setData({
          row: 0,
          count: 0,
          noteList: [],
          isShowConfirm: false
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
    DBNOTE.count({
      success: tal => {
        const countResult = tal.total;
        const batchTimes = Math.ceil(countResult / 10);
        this.setData({
          row: 0,
          count: batchTimes,
          noteList: []
        });
        this.getNoteList();
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
        this.getNoteList();
      } else {
        console.log("list与总数已经相等，没有数据可加载了");
      }
    } else {
      console.log("数为0");
    }
  },
  async getNoteList() {
    wx.cloud.callFunction({
      name: "getNoteList",
      data: {
        row: this.data.row,
        openid: this.data.openid
      },
      success: res => {
        let noteList = res.result.data;
        // noteList.forEach(item => {
        //   item.time = this.timi(new Date(item.creatby));
        // });
        this.setData({
          noteList: this.data.noteList.concat(noteList)
        });
        wx.hideLoading();
        wx.hideNavigationBarLoading(); //完成停止加载
        wx.stopPullDownRefresh(); //停止下拉刷新 
      }
    });
  },
  timi(date) {
    let year = date.getFullYear();
    let month = date.getMonth() + 1;
    if (month < 10) {
      month = "0" + month;
    }
    let day = date.getDate();
    if (day < 10) {
      day = "0" + day;
    }
    let hour = date.getHours();
    if (hour < 10) {
      hour = "0" + hour;
    }
    let minute = date.getMinutes();
    if (minute < 10) {
      minute = "0" + minute;
    }
    let second = date.getSeconds();
    if (second < 10) {
      second = "0" + minute;
    }
    return year + "年" + month + "月" + day + "日" + hour + "时" + minute + "分" + second + "秒";
  },
  touchStart: function (e) {
    this.setData({
      touchStart: e.timeStamp
    });
  },
  touchEnd: function (e) {
    this.setData({
      touchEnd: e.timeStamp
    });
  },
  pressTap: function (e) {
    let det_id = e.currentTarget.dataset.id;
    let touchTime = this.data.touchEnd - this.data.touchStart;
    if (touchTime > 500) {
      wx.showModal({
        title: '提示',
        content: '是否想要删除该便签',
        success: (res) => {
          if (res.confirm) {
            DBNOTE.doc(det_id).remove({
              success: del => {
                this.setData({
                  row: 0,
                  count: 0,
                  noteList: []
                });
                setTimeout(() => {
                  this.loading();
                }, 200);
              }
            });
          }
        }
      });
    }
  }
});