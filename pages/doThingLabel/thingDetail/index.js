const DBTHING = wx.cloud.database().collection("mustThings");
Page({
  data: {
    id: "",
    doneThing: {},
    timer: null
  },
  onLoad: function (options) {
    this.setData({
      id: options.id
    });
    DBTHING.doc(this.data.id).get({
      success: res => {
        this.setData({
          doneThing: res.data
        });
      }
    });
  },
  navigation() {
    wx.openLocation({
      latitude: this.data.doneThing.latitude,
      longitude: this.data.doneThing.longitude,
      scale: 18
    });
  },
  updateMore() {
    let that = this;
    wx.chooseImage({
      count: 9,
      success: async res => {
        wx.showLoading({
          title: '拼命上传中...',
          mask: true
        });
        let detail = that.data.doneThing.detail;
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
                      detail.push(res.fileList[0].tempFileURL);
                      nowC = nowC + 1;
                    }
                  });
                }
              });
            }
          });
        }
        that.data.timer = setInterval(async () => {
          if (nowC == res.tempFilePaths.length) {
            await DBTHING.doc(that.data.id).update({
              data: {
                detail
              },
              success: result => {
                let doneThing = that.data.doneThing;
                doneThing.detail = detail;
                that.setData({ doneThing });
                that.setData({});
                wx.hideLoading();
                clearInterval(that.data.timer);
              }
            });
          }
        }, 1000);
      }
    });
  },
  seeImg(e) {
    wx.previewImage({
      current: e.currentTarget.dataset.src,
      urls: [e.currentTarget.dataset.src]
    });
  }
});