const DB = wx.cloud.database().collection("userList");
const DBT = wx.cloud.database().collection("talkingBucket");

var that = this;
Page({
  data: {
    content: '',
    content_html: '',
    placeholder: '开始输入...',
    isReadOnly: false,
    nodes: [{
      name: 'div',
      attrs: {
        class: 'div_class',
        style: 'line-height: 60px; color: red;'
      },
      children: [{
        type: 'text',
        text: 'RichText组件'
      }]
    }],
    current: 0,
    verticalCurrent: 0,
    title: "",
    introduction: "",
    actile_img: "",
    userRealese: [],
    update: false,
    userInfo: [],
    acid: ""
  },
  onLoad: function (options) {
    if (options.id) {
      this.update(options.id);
      this.setData({
        update: true,
        acid: options.id
      });
    }
    wx.getStorage({
      key: "openId",
      success: (res) => {
        DB.where({
          _openid: res.data
        }).get({
          success: userInfo => {
            if (userInfo.data.length > 0) {
              this.setData({
                userInfo: userInfo.data[0],
              });
            }
          }
        });
      }
    });

  },
  // 过来修改
  update(id) {
    DBT.doc(id).get({
      success: res => {
        this.setData({
          title: res.data.title,
          introduction: res.data.introduction,
          actile_img: res.data.showImg,
          pageData: {
            content: res.data.content
          }
        });
      }
    });
  },
  //上一步
  handToSence() {
    wx.showModal({
      title: '友情提示',
      content: '返回上一步将清空文章内容',
      success: res => {
        this.setData({
          current: 0,
          verticalCurrent: 0
        });
      }
    });
  },
  //下一步
  handleClick() {
    if (this.data.title || this.data.introduction || this.data.actile_img) {
      const addCurrent = this.data.current + 1;
      const current = addCurrent > 1 ? 0 : addCurrent;
      this.setData({
        'current': current
      })
    } else {
      wx.showModal({
        title: '提示',
        content: '请填写所有信息'
      });
    }
  },
  titleEdit(e) {
    this.setData({
      title: e.detail.detail.value
    });
  },
  introEdit(e) {
    this.setData({
      introduction: e.detail.detail.value
    });
  },
  //上传图片
  updateimg() {
    if (this.data.update) {
      this.setData({
        actile_img: ""
      });
    }
    wx.chooseImage({
      count: 1,
      success: res => {
        wx.showLoading({
          title: '上传中...',
        });
        const tempFilePaths = res.tempFilePaths[0];
        const timeName = Date.parse(new Date()) / 1000;
        wx.cloud.uploadFile({
          cloudPath: timeName + ".png",
          filePath: tempFilePaths,
          success: res1 => {
            this.setData({
              actile_img: res1.fileID
            });
            wx.hideLoading();
          }
        });
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
      second = "0" + minute;
    }
    return year + "-" + month + "-" + day + " " + hour + ":" + minute + ":" + second;
  },
  // 新增与修改
  clickShowText(e) {
    this.setData({
      nodes: this.data.content.html,
      content_html: this.data.content.html
    });
    if (this.data.content.html) {
      if (this.data.update) {
        //修改talking集合里面的这条数据
        DBT.doc(this.data.acid).update({
          data: {
            title: this.data.title,
            introduction: this.data.introduction,
            showImg: this.data.actile_img,
            content: this.data.nodes,
            updateby: this.timi(new Date())
          },
          success: res => {
            console.log(res, "更新成功");
            wx.showToast({
              title: '更改成功',
              icon: 'success',
              duration: 2000
            });
            wx.reLaunch({
              url: '../../pages/index/index'
            });
          }
        });
      } else {
        //向talking集合里面添加
        DBT.add({
          data: {
            id: Date.parse(new Date()) / 1000,
            title: this.data.title,
            introduction: this.data.introduction,
            showImg: this.data.actile_img,
            content: this.data.nodes,
            commentList: [],
            isDisplay: true,
            watchList: [],
            watchListId: [],
            creatby: this.timi(new Date()),
            updateby: this.timi(new Date()),
            userInfo: {
              _openid: this.data._openid,
              avatarUrl: this.data.avatarUrl,
              nickName: this.data.nickName
            }
          },
          success: res => {
            console.log(res, "添加成功");
            wx.showToast({
              title: '新增成功',
              icon: 'success',
              duration: 2000
            });
            wx.reLaunch({
              url: '../../pages/index/index'
            });
          }
        });
      }
    } else {
      wx.showToast({
        content: "你还没有写内容呢亲!"
      });
    }
  },
  getEditorValue(e) {
    this.setData({
      content: e.detail
    });
  },
  onEditorReady() {
    wx.createSelectorQuery().select('#editor').context(res => {
      this.editorCtx = res.context;
      wx.showLoading({
        title: '加载内容中...',
      });
      setTimeout(() => {
        let data = this.data;
        wx.hideLoading();
        this.editorCtx.setContents({
          html: data.pageData ? data.pageData.content : '',
          success: (res) => {
            // console.log(res);
          }
        });
      }, 1000);
    }).exec();
  },
  insertDivider() {
    this.editorCtx.insertDivider({
      success: function () {
        console.log('insert divider success')
      }
    })
  },
  format(e) {
    let {
      name,
      value
    } = e.target.dataset;
    if (!name) return;
    this.editorCtx.format(name, value);
  },
  insertImage() {
    wx.showLoading({
      title: '上传中...',
    });
    wx.chooseImage({
      count: 1,
      success: res => {
        const tempFilePaths = res.tempFilePaths[0];
        const timeName = Date.parse(new Date()) / 1000;
        wx.cloud.uploadFile({
          cloudPath: timeName + ".png",
          filePath: tempFilePaths,
          success: res1 => {
            this.editorCtx.insertImage({
              src: res1.fileID,
              data: {
                id: 'abcd',
                role: 'god'
              },
              success: function () {
                wx.hideLoading();
              },
              fail: console.error
            });
          },
          fail: console.error
        });
      }
    });
  }
});
