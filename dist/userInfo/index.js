const DB = wx.cloud.database().collection('userList');
const DBUS = wx.cloud.database().collection("memories");

Component({
  data: {
    openid: "",
    userInfo: [],
    visible1: false,
    backmineColor: "",
    isLogin: false,
    manager: false
  },
  lifetimes: {
    attached() {
      let that = this;
      wx.getStorage({
        key: "openId",
        success: (res) => {
          // console.log(res, "本地储存的openid");
          that.getUserInfo(res.data);
        },
        fail: (error) => {
          // console.log(error, "然并卵");
          wx.cloud.callFunction({
            name: "talkingUserOpenId",
            success(openid) {
              that.getUserInfo(openid.result.openid);
            }
          });
        }
      });
    }
  },
  methods: {
    // 查询数据库的用户信息
    async getUserInfo(val) {
      let that = this;
      let data = {
        _openid: val
      };
      DB.where(data).get({
        success(userInfo) {
          // console.log(userInfo, "用户在数据库有没有数据");
          if (userInfo.data.length > 0) {
            that.setData({
              userInfo: userInfo.data[0],
              isLogin: true
            });
          }
        }
      });
    },
    getUserProfile(e) {
      let that = this;
      wx.getUserProfile({
        desc: '用于展示个人信息',
        success: (res) => {
          wx.showToast({
            title: '恭喜你登录成功',
            icon: 'success',
            duration: 2000
          });
          let userInfo = res.userInfo;
          wx.cloud.callFunction({
            name: "talkingUserOpenId",
            success(openid) {
              if (openid.result.openid == 'o_BMd5IPJeXtDy4h-_rzTR-Kn2zM') {
                that.setData({
                  manager: true,
                  openid: openid.result.openid
                });
              } else if (openid.result.openid == 'o_BMd5ERRE6PLi2dS08lm89tiMgU') {
                that.setData({
                  manager: true,
                  openid: openid.result.openid
                });
              }
              userInfo.openid = openid.result.openid;
              userInfo.autograph = "";
              // userInfo.history_release = [];
              that.setData({
                isLogin: true,
                userInfo: userInfo
              });
              that.addUserInfo();
            }
          });
        }
      });
    },
    async addUserInfo() {
      DB.add({
        data: this.data.userInfo,
        success(res) {
          console.log(res, "获取用户信息成功，并保存云数据库");
        },
        fail(err) {
          console.log(err, "999999")
        }
      });
    },
    bindLabel(e) {
      if (!this.data.isLogin) {
        return wx.showToast({
          title: '请先登陆！!',
          icon: 'none',
          image: '../../images/mao.png',
          duration: 3000,
          mask: false,
        });
      }
      let type = e.currentTarget.dataset.type;
      let that = this;
      switch (type) {
        case "mine_edit":
          wx.navigateTo({
            url: '../../pages/mine_edit/index',
          });
          break;
        case "mine_history":
          wx.navigateTo({
            url: '../../pages/mine_history/index',
          });
          break;
        case "release":
          wx.navigateTo({
            url: '../../pages/release/index',
          });
          break;
        case "loveAdd":
          wx.navigateTo({
            url: '../../pages/loveAdd/index',
          });
          break;
        case "updateCard":
          wx.navigateTo({
            url: '../../pages/labelCard/index?type=add',
          });
          break;
        case "updateImg":
          that.updateimg();
          break;
        case "indexSwiper":
          wx.navigateTo({
            url: '../../pages/mineSwiper/index',
          });
          break;
        case "mustDoThing":
          wx.navigateTo({
            url: '../../pages/doThingLabel/addThing/index',
          });
          break;
      }
    },
    async updateimg() {
      let that = this;
      wx.chooseImage({
        count: 9,
        success: async res => {
          wx.showLoading({
            title: '拼命上传中...',
            mask: true
          });
          let nowC = 0;
          for (let i = 0; i < res.tempFilePaths.length; i++) {
            const tempFilePaths = res.tempFilePaths[i];
            const timeName = String(Date.parse(new Date()) / 1000) + i;
            await wx.compressImage({
              src: tempFilePaths,
              quality: 60,
              success: async res => {
                let up_file = res.tempFilePath;
                await wx.cloud.uploadFile({
                  cloudPath: timeName + ".png",
                  filePath: up_file,
                  success: async res => {
                    await wx.cloud.getTempFileURL({
                      fileList: [res.fileID],
                      success: async res => {
                        await DBUS.add({
                          data: {
                            id: Number(timeName),
                            src: res.fileList[0].tempFileURL,
                            creatby: this.timi(new Date()),
                          },
                          success: res => {
                            nowC = nowC + 1;
                          }
                        });
                      }
                    });
                  }
                });
              }
            });
          }
          that.data.timer = setInterval(() => {
            if (nowC == res.tempFilePaths.length) {
              wx.hideLoading();
              clearInterval(that.data.timer);
            }
          }, 1000);
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
  }
});