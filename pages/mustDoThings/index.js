const DBTHING = wx.cloud.database().collection("mustThings");
const dateTimePicker = require('../../utils/util.js');
Page({
  data: {
    windowHeight: 0,
    latitude: "",
    longitude: "",
    key: "",
    thing_name: "",
    back_img: "",
    address: "",
    nowTime: "",
    currentIndex: 0,
    thingCount: 0,
    not_thingCount: 0,
    type: false,
    not_thingList: [],
    thingList: [],
    row: 0,
    count: 0,
    userFeedbackHidden: false,
    clock_item: {},
    userOpenId: null,
    use_type: null,
    card_add: ""
  },
  onLoad: function (options) {
    wx.getSystemInfo({
      success: res => {
        this.setData({
          windowHeight: Number(res.safeArea.bottom) - 50
        });
      }
    });
    wx.getStorage({
      key: "openId",
      success: (res) => {
        this.setData({
          userOpenId: res.data
        });
      }
    });
    if (options._id) {
      DBTHING.where({
        _id: options._id
      }).get({
        success: res => {
          if (!res.data[0].type) {
            this.click_label(res.data[0]);
          }
        }
      });
    }
    this.loading();
  },
  pagechange: function (e) {
    if (e.detail.source === "touch") {
      let currentPageIndex = this.data.currentIndex;
      currentPageIndex = (currentPageIndex + 1) % 2;
      this.setData({
        row: 0,
        currentIndex: currentPageIndex,
        type: !this.data.type,
        key: ""
      });
      setTimeout(() => {
        this.loading();
      }, 200);
    }
  },
  titleClick: function (e) {
    this.setData({
      row: 0,
      currentIndex: e.currentTarget.dataset.idx,
      type: !this.data.type,
      key: ""
    });
    this.loading();
  },
  // 获取当前位置信息
  async getLocation() {
    // await wx.getLocation({
    //   type: 'wgs84',
    //   success: async res => {
    //     const latitude = res.latitude;
    //     const longitude = res.longitude;
    //     await wx.request({
    //       url: 'https://apis.map.qq.com/ws/geocoder/v1/?location=' + latitude + "," + longitude,
    //       data: {
    //         key: "TDZBZ-3RP6X-OJ44C-TE3FP-YMSZJ-FDBUL"
    //       },
    //       header: { 'content-type': 'application/json' },
    //       method: 'GET',
    //       dataType: 'json',
    //       responseType: 'text',
    //       success: result => {
    //         this.setData({
    //           latitude,
    //           longitude,
    //           address: result.data.result.address
    //         });
    //       }
    //     });
    //   }
    // });
  },
  // 上滑加载
  onReachBottom() {
    if (this.goodCount !== 0) {
      if (Number(this.data.row) + 1 < Number(this.data.count)) {
        this.setData({
          row: Number(this.data.row) + 1
        });
        this.getThing();
      } else {
        console.log("list与总数已经相等，没有数据可加载了");
      }
    } else {
      console.log("数为0");
    }
  },
  loading() {
    wx.vibrateShort({
      type: "medium"
    });
    wx.showLoading({
      title: "袁太太等一下",
      mask: true
    });
    DBTHING.where({ type: true }).count({
      success: res => {
        this.setData({
          thingCount: res.total
        });
        DBTHING.count({
          success: tal => {
            const countResult = tal.total;
            const batchTimes = Math.ceil(countResult / 10);
            this.setData({
              not_thingCount: countResult - Number(this.data.thingCount),
              // type: false,
              row: 0,
              count: batchTimes,
              thingList: [],
              not_thingList: []
            });
            this.getThing();
          }
        });
      }
    });
  },
  bindKeyInput: function (e) {
    this.setData({
      key: e.detail.value
    });
    if (!e.detail.value) {
      this.setData({
        isDispaly: true
      });
    }
  },
  searchThing() {
    wx.showToast({
      title: "夫人等一下下",
      icon: "loading",
      mask: false
    });
    let key = this.data.key;
    const db = wx.cloud.database();
    const _ = db.command;
    DBTHING.where(_.or([
      {
        name: db.RegExp({ regexp: '.*' + key, options: 'i' }),
        type: this.data.type
      }
    ])).get({
      success: res => {
        const resultList = res.data;
        if (this.data.type) {
          this.setData({
            thingList: resultList
          });
        } else {
          this.setData({
            not_thingList: resultList
          });
        }
      }
    });
  },
  getThing() {
    wx.cloud.callFunction({
      name: "mustDoThings",
      data: {
        row: this.data.row,
        type: this.data.type
      },
      success: res => {
        if (this.data.type) {
          this.setData({
            thingList: this.data.thingList.concat(res.result.data)
          });
        } else {
          this.setData({
            not_thingList: this.data.not_thingList.concat(res.result.data)
          });
        }
        setTimeout(() => {
          wx.hideLoading();
          wx.hideNavigationBarLoading();
          wx.stopPullDownRefresh();
        }, 200);
      }
    });
  },
  ready_clock(e) {
    let item = e.currentTarget.dataset.item;
    this.click_label(item);
  },
  click_label(item) {
    const time = dateTimePicker.formatTime();
    const nowTime = time.slice(0, 4) + "年" + time.slice(5, 7) + "月" + time.slice(8, 10) + "日 " + time.slice(11, 13) + ":" + time.slice(14, 16);
    let use_type = null;
    if (this.data.userOpenId == "o_BMd5IPJeXtDy4h-_rzTR-Kn2zM") {
      if (item.man_use) {
        use_type = true;
      } else {
        use_type = false;
      }
    } else {
      if (item.woman_use) {
        use_type = true;
      } else {
        use_type = false;
      }
    }
    this.setData({
      thing_name: item.name,
      back_img: item.img,
      nowTime: nowTime,
      clock_item: item,
      userFeedbackHidden: true,
      use_type: use_type,
      card_add: item.card_add,
      address: item.address,
      latitude: item.latitude,
      longitude: item.longitude
    });
  },
  close(e) {
    let offsetLeft = e.target.offsetLeft;
    if (offsetLeft == 0) {
      this.setData({
        userFeedbackHidden: false
      });
    }
  },
  // 打卡纪念
  doThisThing() {
    if (!this.data.address) {
      return;
    }
    wx.showLoading({
      title: "爱你爱你爱你",
      mask: true
    });
    let message = {
      done_time: this.data.nowTime,
      done_address: this.data.card_add,
      done_name: "老袁的小胡和小胡的老袁",
      done_desc: this.data.clock_item.name + "--打卡完成！"
    };
    wx.requestSubscribeMessage({
      tmplIds: ["oojBTy-6-cBvDol2M-Q6nEGl4xdn6g4XiR2A4i__b6c"],
      success: async res => {
        if (res.errMsg === 'requestSubscribeMessage:ok') {
          await wx.cloud.callFunction({
            name: 'markDone',
            data: {
              openId: this.data.userOpenId,
              message: message
            },
          }).then(res1 => {
            wx.showToast({
              title: '打卡成功',
              icon: 'success',
              duration: 2000,
            });
            this.handleClick();
          });
        }
      }
    });
  },
  // 更改数据
  handleClick() {
    let type = null;
    let man_use = false;
    let woman_use = false;
    if (this.data.userOpenId == "o_BMd5IPJeXtDy4h-_rzTR-Kn2zM") {
      man_use = true;
      if (this.data.clock_item.woman_use) {
        type = true;
      } else {
        type = false;
      }
    } else {
      woman_use = true;
      if (this.data.clock_item.man_use) {
        type = true;
      } else {
        type = false;
      }
    }
    DBTHING.doc(this.data.clock_item._id).update({
      data: {
        type: type,
        card_add: this.data.card_add,
        address: this.data.address,
        creatby: this.data.nowTime,
        latitude: this.data.latitude,
        longitude: this.data.longitude,
        man_use: man_use,
        woman_use: woman_use
      },
      success: res => {
        wx.showToast({
          title: "一直幸福下去哟",
          mask: false
        });
        this.setData({
          userFeedbackHidden: false
        });
        this.loading();
      }
    });
  },
  clockDeatil(e) {
    wx.navigateTo({
      url: '../../pages/doThingLabel/thingDetail/index?id=' + e.currentTarget.dataset.id,
    });
  },
  choseAddress() {
    wx.getSetting({
      success: res => {
        if (!res.authSetting['scope.userLocation']) {
          wx.authorize({
            scope: 'scope.userLocation',
            success: () => {
              wx.chooseLocation({
                success: add => {
                  this.setData({
                    address: add.address + add.name,
                    card_add: add.name,
                    latitude: add.latitude,
                    longitude: add.longitude
                  });
                }
              });
            }
          });
        } else {
          wx.chooseLocation({
            success: add => {
              this.setData({
                address: add.address + add.name,
                card_add: add.name,
                latitude: add.latitude,
                longitude: add.longitude
              });
            }
          });
        }
      }
    });
  },
  onShareAppMessage: function (res) {
    return {
      title: this.data.clock_item.name,
      imageUrl: this.data.clock_item.img,
      path: "/pages/mustDoThings/index?_id=" + this.data.clock_item._id
    };
  }
});