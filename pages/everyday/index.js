/*
 * @Author: proyzplus
 * @Date: 2021-03-31 15:36:05
 * @LastEditors: proyzplus
 * @LastEditTime: 2021-04-07 09:30:21
 * @Description: Descriptio;
 */
const DBAC = wx.cloud.database().collection("activity");
const DBUSER = wx.cloud.database().collection('userList');
const dateTimePicker = require('../../utils/util.js');
Page({
  data: {
    act_phone: "",
    act_time: "",
    activityList: {},
    animationMiddleHeaderItem: {},
    year: "",
    month: "",
    day: "",
    hour: "",
    minute: "",
    second: "",
    safeAreaHeader: 50,
    openId: "",
    isLady: false,
    sayLove: true
  },
  onReady: function () {
    var circleCount = 0;
    this.animationMiddleHeaderItem = wx.createAnimation({
      duration: 1000,
      timingFunction: 'linear',
      delay: 100,
      transformOrigin: '50% 50%',
    });
    setInterval(function () {
      if (circleCount % 2 == 0) {
        this.animationMiddleHeaderItem.scale(1.15).step();
      } else {
        this.animationMiddleHeaderItem.scale(1.0).step();
      }
      this.setData({
        animationMiddleHeaderItem: this.animationMiddleHeaderItem.export()
      });
      circleCount++;
      if (circleCount == 1000) {
        circleCount = 0;
      }
    }.bind(this), 1000);
    this.setData({
      year: (dateTimePicker.formatTimes(new Date())).slice(0, 4),
      month: (dateTimePicker.formatTimes(new Date())).slice(5, 7),
      day: (dateTimePicker.formatTimes(new Date())).slice(8, 10)
    });
    setInterval(() => {
      let datetime = dateTimePicker.formatTime(new Date());
      this.setData({
        hour: datetime.slice(11, 13),
        minute: datetime.slice(14, 16),
        second: datetime.slice(17, 19)
      })
    }, 1000);
  },
  onLoad: function (options) {
    const time = dateTimePicker.formatTime();
    const nowTime = time.slice(0, 4) + "年" + time.slice(5, 7) + "月" + time.slice(8, 10) + "日 " + time.slice(11, 13) + ":" + time.slice(14, 16);
    wx.getSystemInfo({
      success: res => {
        this.setData({
          safeAreaHeader: Number(res.safeArea.top) + 8,
          act_phone: res.model,
          act_time: nowTime
        });
      }
    });
    wx.cloud.callFunction({
      name: "talkingUserOpenId",
      success: openid => {
        wx.setStorage({
          key: 'openId',
          data: openid.result.openid
        });
        this.setData({
          openId: openid.result.openid
        });
        wx.cloud.callFunction({
          name: "everyLove",
          data: {
            openid: openid.result.openid
          },
          success: res => {
            console.log(res, "通过用户openid获取数据");
            const act_data = res.result;
            this.setData({
              isLady: act_data.isLady
            });
            if (act_data.data.length > 0) {
              const activityData = act_data.data[0];
              this.setData({
                activityList: activityData,
                sayLove: act_data.isLady ? activityData.woman.sayLove : activityData.man.sayLove
              });
            } else {
              DBAC.doc("b00064a760651dfe0cc8b73b57ebea2b").get({
                success: act3 => {
                  console.log("陌生进来");
                  this.setData({
                    activityList: act3.data,
                    isLady: false,
                    sayLove: true
                  });
                }
              });
            }
          }
        });
      }
    });
  },
  order_submit() {
    const {
      openId,
      activityList
    } = this.data;
    let act_continuous = "";
    let act_total = "";
    if (openId == activityList.manOpenid) {
      act_continuous = Number(activityList.man.continuous) + 1;
      act_total = Number(activityList.man.total) + 1;
      activityList.man.continuous = act_continuous;
      activityList.man.total = act_total;
      activityList.man.sayLove = true;
    } else {
      act_continuous = Number(activityList.woman.continuous) + 1;
      act_total = Number(activityList.woman.total) + 1;
      activityList.woman.continuous = act_continuous;
      activityList.woman.total = act_total;
      activityList.woman.sayLove = true;
    }
    this.setData({
      activityList,
      sayLove: true
    });
    let message = {
      act_title: this.data.activityList.title + (openId == activityList.manOpenid ? "--袁太太" : "--老袁头"), // 活动标题
      act_continuous: act_continuous, // 连续签到天数
      act_total: act_total, // 累计签到天数
      act_phone: this.data.act_phone, // 设备ID
      act_time: this.data.act_time //签到日期 
    };
    wx.requestSubscribeMessage({
      tmplIds: ["r90Y49XshBdZetTGd69KmUMIEwZbtv3T96ARxW4rAdU"],
      success: res => {
        if (res.errMsg === 'requestSubscribeMessage:ok') {
          wx.cloud
            .callFunction({
              name: 'subscribe',
              data: {
                message: message
              },
            })
            .then(res => {
              wx.showToast({
                title: '订阅成功',
                icon: 'success',
                duration: 2000,
              });

              this.updateActivity();
            })
            .catch(res => {
              wx.showToast({
                title: '订阅失败',
                icon: 'success',
                duration: 2000,
              });
              this.setData({
                sayLove: false
              });
            });
        }
      },
      fail: err => {
        console.log(err)
      }
    });
  },
  getUserProfile(e) {
    let that = this;
    wx.getUserProfile({
      desc: '用于展示个人信息',
      success: (res) => {
        console.log(res, "获取用户信息 ");
        let userInfo = res.userInfo;
        console.log(userInfo);
        let activityList = that.data.activityList;
        if (that.data.openId == activityList.manOpenid) {
          activityList.man.name = userInfo.nickName;
          activityList.man.avatarUrl = userInfo.avatarUrl;
          this.setData({
            activityList
          });
        } else {
          activityList.woman.name = userInfo.nickName;
          activityList.woman.avatarUrl = userInfo.avatarUrl;
          this.setData({
            activityList
          });
        }
        DBUSER.where({
          _openid: that.data.openId
        }).update({
          data: {
            avatarUrl: userInfo.avatarUrl,
            nickName: userInfo.nickName
          },
          success: res => {
            that.updateActivity();
          }
        });

      }
    })
  },
  async updateActivity() {
    let activityList = this.data.activityList;
    DBAC.where({
      _id: "b00064a760651dfe0cc8b73b57ebea2b"
    }).update({
      data: {
        man: activityList.man,
        woman: activityList.woman,
        backImg: activityList.backImg
      },
      success: res => {
        console.log(res);
      }
    });
  },
  async updateimg() {
    let activityList = this.data.activityList;
    wx.chooseImage({
      count: 1,
      success: async res1 => {
        wx.showLoading({
          title: '拼命上传中...',
        });
        const tempFilePaths = res1.tempFilePaths[0];
        const timeName = String(Date.parse(new Date()) / 1000);
        await wx.compressImage({
          src: tempFilePaths,
          quality: 60,
          success: async res2 => {
            let up_file = res2.tempFilePath;
            await wx.cloud.uploadFile({
              cloudPath: timeName + ".png",
              filePath: up_file,
              success: async res3 => {
                await wx.cloud.getTempFileURL({
                  fileList: [res3.fileID],
                  success: async res4 => {
                    wx.hideLoading();
                    activityList.backImg = res4.fileList[0].tempFileURL;
                    this.setData({
                      activityList: activityList
                    });
                    this.updateActivity();
                  }
                });
              }
            });
          }
        });
      }
    });
  }
});