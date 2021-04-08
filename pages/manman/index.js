const DBUS = wx.cloud.database().collection("memories");
Page({
  data: {
    stararray: [],
    cardList: [],
    timer: null,
    weather: {},
    isDispaly: false
  },
  onLoad: function (options) {
    if (Date.now() > 1617894000000) {
      this.setData({
        isDispaly: true
      });
    }
    /**生成背景星星-开始 */
    var stars = 400;
    var r = 0;
    var stararray = [];
    for (var i = 0; i < stars; i++) {
      var s = 0.2 + Math.random() * 1;
      var curR = r + Math.random() * 300;
      var rotateY = Math.random() * 360;
      var rotateX = Math.random() * -50;
      stararray[i] = {
        curR: curR,
        rotateY: rotateY,
        rotateX: rotateX,
        s: s
      };
    }
    this.setData({
      stararray: stararray,
    });
  },
  async updateimg() {
    let that = this;
    wx.chooseImage({
      count: 9,
      success: async res => {
        wx.showLoading({
          title: '拼命上传中...',
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
      second = "0" + second;
    }
    return year + "-" + month + "-" + day + " " + hour + ":" + minute + ":" + second;
  },
});