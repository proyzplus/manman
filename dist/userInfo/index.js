const DB = wx.cloud.database().collection('userList');

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
          console.log(userInfo, "用户在数据库有没有数据");
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
              userInfo.history_release = [];
              that.setData({
                isLogin: true,
                userInfo: userInfo
              });
              that.addUserInfo();
            }
          });
        }
      })
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
    //编辑信息
    edit() {
      if (this.data.isLogin) {
        wx.navigateTo({
          url: '../../pages/mine_edit/index',
        });
      } else {
        wx.showToast({
          title: '主人要先登陆哟!',
          icon: 'none',
          image: '../../images/mao.png',
          duration: 3000,
          mask: false,
        });
      }
    },
    //我的发布
    history() {
      if (this.data.isLogin) {
        wx.navigateTo({
          url: '../../pages/mine_history/index',
        });
      } else {
        wx.showToast({
          title: '主人要先登陆哟!',
          icon: 'none',
          image: '../../images/mao.png',
          duration: 3000,
          mask: false,
        });
      }
    },
    recycle() {
      if (this.data.isLogin) {
        wx.navigateTo({
          url: '../../pages/recycle/index',
        });
      } else {
        wx.showToast({
          title: '主人要先登陆哟!',
          icon: 'none',
          image: '../../images/mao.png',
          duration: 3000,
          mask: false,
        });
      }
    },
    giveme() {
      if (this.data.isLogin) {
        wx.navigateTo({
          url: '../../pages/message/index',
        });
      } else {
        wx.showToast({
          title: '主人要先登陆哟!',
          icon: 'none',
          image: '../../images/mao.png',
          duration: 3000,
          mask: false,
        });
      }
    },
    tore() {
      wx.navigateTo({
        url: "../../pages/messList/index"
      });
    }
  }
});