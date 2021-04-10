const DBAC = wx.cloud.database().collection("activity");
Page({
  data: {
    swiperList: [],
    editId: null
  },
  onLoad: function (options) {
    DBAC.get({
      success: res => {
        this.setData({
          editId: res.data[1]._id,
          swiperList: res.data[1].swiperList
        });
      }
    });
  },
  deleteSwiper(e) {
    let swiperList = this.data.swiperList;
    let newSwiperList = [];
    let deleteItem = e.currentTarget.dataset.item;
    swiperList.forEach(item => {
      if (item !== deleteItem) {
        newSwiperList.push(item);
      }
    });
    wx.showModal({
      title: '确定删除嘛?',
      content: '删除之后首页将不会出现该照片',
      success: res => {
        if (res.confirm) {
          this.setData({
            swiperList: newSwiperList
          });
          DBAC.doc(this.data.editId).update({
            data: {
              swiperList: newSwiperList
            },
            success: res => {
              wx.showToast({
                title: '已完成此次操作',
                icon: 'success',
                duration: 2000
              });
            }
          });
        }
      }
    });
  },
  async updateImage() {
    let swiperList = this.data.swiperList;
    wx.chooseImage({
      count: 1,
      success: async res => {
        wx.showLoading({
          title: '拼命上传中...',
        });
        const tempFilePaths = res.tempFilePaths[0];
        const timeName = String(Date.parse(new Date()) / 1000);
        await wx.compressImage({
          src: tempFilePaths,
          quality: 60,
          success: async res1 => {
            let up_file = res1.tempFilePath;
            await wx.cloud.uploadFile({
              cloudPath: timeName + ".png",
              filePath: up_file,
              success: async res2 => {
                await wx.cloud.getTempFileURL({
                  fileList: [res2.fileID],
                  success: async res3 => {
                    this.setData({
                      swiperList: [...swiperList, res3.fileList[0].tempFileURL]
                    });
                    await DBAC.doc(this.data.editId).update({
                      data: {
                        swiperList: this.data.swiperList
                      },
                      success: res4 => {
                        DBAC.get({
                          success: res5 => {
                            this.setData({
                              editId: res5.data[1]._id,
                              swiperList: res5.data[1].swiperList
                            });
                          }
                        });
                        wx.hideLoading();
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
  }
});