const DBCOMMOD = wx.cloud.database().collection("h5-commodList");

Page({
  data: {
    commodList: []
  },
  onLoad: function (options) {
    this.getData();
  },
  getData() {
    wx.cloud.callFunction({
      name: "getCommodList",
      data: {},
      success: res => {
        this.setData({
          commodList: res.result.data
        });
      }
    })
  },
  updateImg(e) {
    wx.chooseImage({
      count: 1,
      success: async res => {
        wx.showLoading({
          title: '拼命上传中...',
          mask: true
        });
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
                      await DBCOMMOD.doc(e.currentTarget.dataset.id).update({
                        data: {
                          img: res.fileList[0].tempFileURL
                        }
                      });
                      wx.hideLoading();
                      this.getData();
                    }
                  });
                }
              });
            }
          });
        }
      }
    });
  }
});