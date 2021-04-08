const DB = wx.cloud.database().collection('userList');
Page({
  data: {
    id: "",
    nickName: "",
    autograph: ""
  },
  onLoad: function (options) {
    //获取用户在数据库的信息
    let that = this;
    wx.getStorage({
      key: 'openId',
      success: function (res) {
        console.log(res.data);
        DB.where({
          _openid: res.data
        }).get({
          success: function (res) {
            that.setData({
              id: res.data[0]._id,
              nickName: res.data[0].nickName,
              autograph: res.data[0].autograph
            });
          }
        });
      }
    });
  },
  //更改图像
  updateAvatar() {
    const that = this;
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success(res) {
        // tempFilePath可以作为img标签的src属性显示图片
        const tempFilePaths = res.tempFilePaths[0];
        const timeName = Date.parse(new Date()) / 1000;
        //拿到图片路径上传到云储存
        wx.cloud.uploadFile({
          cloudPath: timeName + ".png", // 上传至云端的路径
          filePath: tempFilePaths, // 小程序临时文件路径
          success: ress => {
            console.log(ress, "上传图片成功");
            DB.doc(that.data.id).update({
              data: {
                avatarUrl: ress.fileID
              },
              success(re) {
                console.log(re, "更新成功");
                // wx.reLaunch({
                //   url: '../../pages/index/index'
                // });
              }
            });
          }
        });
      }
    });
  },
  editName(e) {
    console.log(e.detail.detail.value, "e.detail.detail.value")
    this.setData({
      nickName: e.detail.detail.value
    });
  },
  editautograph(e) {
    console.log(e);
    this.setData({
      autograph: e.detail.detail.value
    });
  },
  //更改名字和个性签名
  submit() {
    console.log(this.data.nickName, this.data.autograph);
    let that = this;
    DB.doc(that.data.id).update({
      data: {
        nickName: that.data.nickName,
        autograph: that.data.autograph
      },
      success(res) {
        console.log(res, "更新成功");
        wx.reLaunch({
          url: '../../pages/index/index'
        });
      }
    });
  }
});