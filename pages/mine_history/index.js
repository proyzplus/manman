const DB = wx.cloud.database().collection("userList");
const DBT = wx.cloud.database().collection("talkingBucket");

Page({
  data: {
    release: [],
    // choose: false,
    // animationData: {},
    userInfo: []
  },
  onLoad: function (options) {
    //获取用户在数据库的信息
    let that = this
    wx.getStorage({
      key: 'openId',
      success: function (res) {
        DB.where({
          _openid: res.data
        }).get({
          success: function (res) {
            console.log(res, "用户的发不信息");
            that.setData({
              userInfo: res.data[0]
            });
            for (let i = 0; i < res.data[0].history_release.length; i++) {
              // res.data[0].history_release[i].creatby = time.formatTime(res.data[0].history_release[i].creatby, 'Y-M-D h:m:s');
              // res.data[0].history_release[i].updateby = time.formatTime(res.data[0].history_release[i].updateby, 'Y-M-D h:m:s');
              res.data[0].history_release[i].time = res.data[0].history_release[i].creatby.substring(0, 10);
            }
            let tabData = res.data[0].history_release;
            for (var i = 1; i < tabData.length; i++) {
              for (var j = 0; j < tabData.length - 1; j++) {
                var max = tabData[j].creatby;
                var nextCount = tabData[j + 1].creatby;
                if (nextCount > max) {
                  var preData = tabData[j];
                  tabData[j] = tabData[j + 1];
                  tabData[j + 1] = preData;
                }
              }
            }
            that.setData({
              release: tabData
            });
          }
        });
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
    let that = this;
    let id = e.currentTarget.dataset.item._id;
    wx.showModal({
      title: '确定删除嘛?',
      content: '删除之后可以在回收站查看,目前回收站功能暂未开放!',
      success: function (ew) {
        if (ew.confirm) {
          console.log('用户点击确定');
          //删除talking集合的信息
          DBT.doc(id).remove({
            success(res) {
              console.log(res, "talking删除成功!");
              //删除用户历史集合的信息
              console.log(that.data.userInfo, "456");
              let his = [];
              let hisData = that.data.userInfo.history_release;
              for (let i = 0; i < hisData.length; i++) {
                if (id != hisData[i]._id) {
                  his.push(hisData[i])
                }
              }
              wx.getStorage({
                key: 'openId',
                success: function (re) {
                  DB.where({
                    _openid: re.data
                  }).update({
                    data: {
                      history_release: his
                    },
                    success: function (r) {
                      console.log(r, "用户历史更改成功!");
                      wx.reLaunch({
                        url: '../../pages/index/index'
                      });
                    }
                  });
                }
              });
            }
          });
        }
      }
    });
  },
  toMessagee(){
    wx.navigateTo({
      url: "../pages/message/index"
    });
  }
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