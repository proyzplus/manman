const DBAC = wx.cloud.database().collection("activity");
const DBUSER = wx.cloud.database().collection("userList");
const dateTimePicker = require('../../utils/util.js');
var QQMapWX = require('../../utils/qqmap-wx-jssdk.min');
var qqmapsdk = new QQMapWX({
  key: 'TDZBZ-3RP6X-OJ44C-TE3FP-YMSZJ-FDBUL'
});
Page({
  data: {
    everydayList: [],
    today_img: "",
    nowTime: "",
    openId: "",
    userUpdateInfo: {},
    latitude: null,
    longitude: null,
    city: "",
    woman: {},
    man: {},
    isMan: null,
    isWoman: null
  },
  onLoad: function (options) {
    this.getLocationAddress();
    this.getUser();
    wx.getStorage({
      key: "openId",
      success: (res) => {
        if (res.data == "o_BMd5IPJeXtDy4h-_rzTR-Kn2zM") {
          this.setData({
            isMan: true
          });
        }
        if (res.data == "o_BMd5ERRE6PLi2dS08lm89tiMgU") {
          this.setData({
            isWoman: true
          });
        }
        this.setData({
          openId: res.data
        });
      }
    });
    const time = dateTimePicker.formatTime();
    const nowTime = time.slice(0, 4) + "年" + time.slice(5, 7) + "月" + time.slice(8, 10) + "日 " + time.slice(11, 13) + ":" + time.slice(14, 16);
    DBAC.doc("28ee4e3e60ae057c1cbd62422e216e90").get({
      success: res => {
        let everydayList = res.data.everydayList;
        if (everydayList.length == 0) {
          this.newToday(everydayList, nowTime);
        } else {
          let history = (everydayList[0].time).slice(8, 10);
          if (Number(history) !== Number(time.slice(8, 10))) {
            this.newToday(everydayList, nowTime);
          } else {
            this.setData({
              everydayList,
              nowTime
            });
          }
        }
      }
    });
  },
  newToday(everydayList, nowTime) {
    let today = {
      id: Date.parse(new Date()) / 1000,
      man: {
        address: "",
        latitude: null,
        longitude: null,
        photo: ""
      },
      woman: {
        address: "",
        latitude: null,
        longitude: null,
        photo: ""
      },
      time: nowTime
    };
    this.setData({
      everydayList: [today, ...everydayList],
      nowTime
    });
  },
  getLocationAddress() {
    wx.getLocation({
      type: 'wgs84',
      success: res => {
        var latitude = res.latitude;
        var longitude = res.longitude;
        qqmapsdk.reverseGeocoder({
          location: { latitude: latitude, longitude: longitude },
          success: add => {
            this.setData({
              latitude,
              longitude,
              city: add.result.address_component.city
            });
          }
        });
      }
    });
  },
  getUser() {
    DBUSER.doc("79550af2603db5e807d9002f1ba8292a").get({
      success: res => {
        this.setData({
          woman: res.data
        });
      }
    });
    DBUSER.doc("28ee4e3e603db09d086199455bfe7acc").get({
      success: res => {
        this.setData({
          man: res.data
        });
      }
    });
  },
  async updateimg(e) {
    let user = e.currentTarget.dataset.user;
    let id = e.currentTarget.dataset.id;
    wx.chooseImage({
      count: 1,
      success: async res1 => {
        wx.showLoading({
          title: '拼命上传中...',
          mask: true
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
                    this.updateUserImage(user, res4.fileList[0].tempFileURL, id);
                    wx.hideLoading();
                  }
                });
              }
            });
          }
        });
      }
    });
  },
  updateUserImage(user, img, id) {
    let everydayList = this.data.everydayList;
    everydayList.forEach(item => {
      if (Number(item.id) == Number(id)) {
        if (user == "man") {
          item.man = {
            address: this.data.city,
            latitude: this.data.latitude,
            longitude: this.data.longitude,
            photo: img
          };
        } else {
          item.woman = {
            address: this.data.city,
            latitude: this.data.latitude,
            longitude: this.data.longitude,
            photo: img
          };
        }
      }
    });
    this.setData({
      everydayList: everydayList
    });
    DBAC.doc("28ee4e3e60ae057c1cbd62422e216e90").update({
      data: {
        everydayList: everydayList
      }
    });
  },
  seeImg(e) {
    wx.previewImage({
      current: e.currentTarget.dataset.src,
      urls: [e.currentTarget.dataset.src]
    });
  },
  openLocation(e){
    wx.openLocation({
      latitude: e.currentTarget.dataset.latitude,
      longitude: e.currentTarget.dataset.longitude,
      scale: 14
    });
  }
});