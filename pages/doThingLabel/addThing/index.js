const DBTHING = wx.cloud.database().collection("mustThings");
Page({
  data: {
    name: "",
    type: false,
    img: ""
  },
  onLoad: function (options) {

  },
  bandleChange(e) {
    this.setData({
      type: e.detail.value
    });
  },
  bindKeyName(e) {
    this.setData({
      name: e.detail.value
    });
  },
  updateimg() {
    wx.chooseImage({
      count: 1,
      success: photo => {
        wx.showLoading({
          title: '拼命上传中...',
        });
        const tempFilePaths = photo.tempFilePaths[0];
        const timeName = String(Date.parse(new Date()) / 1000) + "mT";
        wx.cloud.uploadFile({
          cloudPath: timeName + ".png",
          filePath: tempFilePaths,
          success: res => {
            this.setData({ img: res.fileID });
            wx.hideLoading();
          }
        });
      }
    });
  },
  postServeList() {
    if (!this.data.name) {
      return wx.showToast({
        icon: "error",
        title: "请认真填写事情名称！"
      });
    }
    if (!this.data.img) {
      return wx.showToast({
        icon: "error",
        title: "请认真上传图片！"
      });
    }
    let data = {
      name: this.data.name,
      img: this.data.img,
      type: this.data.type,
      address: "",
      creatby: "",
      detail: [],
      id: Date.parse(new Date()) / 1000,
      clockCount: this.data.type == true ? 1 : 0,
      latitude: "",
      longitude: ""
    };
    DBTHING.add({
      data, success(res) {
        wx.showToast({
          title: '添加成功!',
          icon: 'success',
          image: '',
          duration: 1500,
          mask: false,
        });
        wx.navigateBack({ changed: true });
      }
    });
  }
});