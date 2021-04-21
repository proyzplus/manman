/*
 * @Author: proyzplus
 * @Date: 2021-03-01 10:05:30
 * @LastEditors: proyzplus
 * @LastEditTime: 2021-04-21 14:27:28
 * @Description: Description
 */
const DB = wx.cloud.database().collection("userList");
const DBLOVE = wx.cloud.database().collection("wenAnList");
const dateTimePicker = require('../../utils/util.js');

Page({
  data: {
    word: "",
    userInfo: [],
    total: 0,
    copyWord: "",
    userFeedbackHidden: false,
    other_user: [],
    mes_ime: "",
    openId: ""
  },
  onLoad: function (options) {
    wx.getClipboardData({
      success: res => {
        if (res.data) {
          this.setData({
            copyWord: res.data,
            userFeedbackHidden: true
          });
        }
      }
    });
    wx.getStorage({
      key: 'openId',
      success: openid => {
        DB.where({
          _openid: openid.data
        }).get({
          success: res => {
            const time = dateTimePicker.formatTime();
            this.setData({
              openId: openid.data,
              userInfo: res.data[0],
              mes_ime: time.slice(0, 4) + "年" + time.slice(5, 7) + "月" + time.slice(8, 10) + "日 " + time.slice(11, 13) + ":" + time.slice(14, 16)
            });
            DB.where({
              _openid: openid.data == "o_BMd5ERRE6PLi2dS08lm89tiMgU" ? "o_BMd5IPJeXtDy4h-_rzTR-Kn2zM" : "o_BMd5ERRE6PLi2dS08lm89tiMgU"
            }).get({
              success: res1 => {
                this.setData({
                  other_user: res1.data[0]
                });
              }
            });
          }
        });
      }
    });
    DBLOVE.count({
      success(res) {
        that.setData({
          total: res.total
        });
      }
    });
  },
  order_submit(e) {
    let type = e.currentTarget.dataset.type;
    switch (type) {
      case 'cancel':
        this.setData({
          userFeedbackHidden: false
        });
        break;
      case "ready":
        this.setData({
          word: this.data.copyWord,
          userFeedbackHidden: false
        });
        break;
      default:
        break;
    }
  },
  sayToLove(e) {
    this.setData({
      copyWord: e.detail.value
    });
  },
  bindinput: function (e) {
    this.setData({
      word: e.detail.value
    });
  },
  handleClick() {
    DBLOVE.add({
      data: {
        creatby: this.timi(new Date()),
        userInfo: {
          _openid: this.data.userInfo._openid,
          avatarUrl: this.data.userInfo.avatarUrl,
          nickName: this.data.userInfo.nickName
        },
        word: this.data.word,
        id: Date.parse(new Date()) / 1000,
        commentList: []
      },
      success: res => {
        wx.showToast({
          title: '新增成功',
          icon: 'success',
          duration: 2000,
        });
        wx.navigateBack({
          changed: true
        });
      }
    });
  },
  sendMessage() {
    if (!this.data.word) {
      return false;
    }
    wx.showLoading({
      title: "爱你爱你爱你",
      mask: true
    });
    let toUser = null;
    let mes_send_name = null;
    let mes_receive_name = null;
    const { openId } = this.data;
    if (openId == "o_BMd5ERRE6PLi2dS08lm89tiMgU") {
      toUser = "o_BMd5IPJeXtDy4h-_rzTR-Kn2zM";
      mes_send_name = "老袁的老婆" + "(" + this.data.userInfo.nickName + ")";
      mes_receive_name = "老袁" + "(" + this.data.other_user.nickName + ")";
    } else {
      toUser = "o_BMd5ERRE6PLi2dS08lm89tiMgU";
      mes_send_name = "小胡的老公" + "(" + this.data.userInfo.nickName + ")";
      mes_receive_name = "小胡" + "(" + this.data.other_user.nickName + ")";
    }
    let message = {
      mes_send_name: mes_send_name,
      mes_content: this.data.word,
      mes_receive_name: mes_receive_name,
      mes_time: this.data.mes_ime
    };
    wx.requestSubscribeMessage({
      tmplIds: ["8C-6eWdT1Izc1MsRy40iFDIX0kxeSGhCE4SANaOfuos"],
      success: res => {
        if (res.errMsg === 'requestSubscribeMessage:ok') {
          wx.cloud
            .callFunction({
              name: 'messagUnread',
              data: {
                openid: toUser,
                message: message
              },
            })
            .then(res1 => {
              console.log(res1, "res1");
              wx.hideLoading();
              wx.showToast({
                title: '订阅成功',
                icon: 'success',
                duration: 2000,
              });
              this.handleClick();
            })
            .catch(res => {
              wx.hideLoading();
              wx.showToast({
                title: '订阅失败',
                icon: 'success',
                duration: 2000,
              });
            });
        }
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
    return year + "-" + month + "-" + day + " " + hour + ":" + minute + ":" + second;
  }
});