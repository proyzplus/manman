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
    acid: "",
    islogin: true
  },
  onLoad: function (options) {
    let that = this;
    //获取用户在数据库的信息
    wx.getStorage({
      key: 'openId',
      success: function (res) {
        DB.where({
          _openid: res.data
        }).get({
          success: function (res) {
            that.setData({
              userRealese: res.data[0]
            });
            console.log(that.data.userRealese, "用户的发布信息");
            if (options.id) {
              console.log(options.id, "不好意思，我过来修改内容的");
              that.update(options.id);
              that.setData({
                update: true,
                acid: options.id
              });
            }
          }
        });
      },
      fail(err) {
        console.log("没有登陆");
        that.setData({
          islogin: false
        })
      }
    });
  },
  // 过来修改
  update(id) {
    let that = this;
    let updateData = [];
    for (let i = 0; i < that.data.userRealese.history_release.length; i++) {
      if (id == that.data.userRealese.history_release[i]._id) {
        updateData = that.data.userRealese.history_release[i];
      }
    }
    that.setData({
      title: updateData.title,
      introduction: updateData.introduction,
      actile_img: updateData.showImg
    });
  },
  //上一步
  handToSence() {
    let that = this;
    wx.showModal({
      title: '友情提示',
      content: '返回上一步将清空文章内容，你可选择发布之后进行修改',
      success: function () {
        that.setData({
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
    let that = this;
    if (that.data.update) {
      that.setData({
        actile_img: ""
      });
    }
    wx.chooseImage({
      count: 1,
      success(res) {
        wx.showLoading({
          title: '上传中...',
        })
        console.log(res, "图片上传");
        const tempFilePaths = res.tempFilePaths[0];
        const timeName = Date.parse(new Date()) / 1000;
        wx.cloud.uploadFile({
          cloudPath: timeName + ".png",
          filePath: tempFilePaths,
          success: res => {
            console.log(res, "图片存储");
            that.setData({
              actile_img: res.fileID
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
  // 显示结果
  clickShowText(e) {
    let that = this;
    that.setData({
      nodes: that.data.content.html,
      content_html: that.data.content.html
    });
    if (that.data.content.html) {
      if (that.data.update) {
        console.log("好了,过来修改吧!");
        //修改talking集合里面的这条数据
        DBT.doc(that.data.acid).update({
          data: {
            title: that.data.title,
            introduction: that.data.introduction,
            showImg: that.data.actile_img,
            content: that.data.nodes,
            updateby: that.timi(new Date())
          },
          success(res) {
            console.log(res, "更新成功");
            //更改用户发布历史的数据
            let hisData = that.data.userRealese.history_release;
            for (let i = 0; i < hisData.length; i++) {
              if (that.data.acid == hisData[i]._id) {
                hisData[i].content = that.data.nodes;
                hisData[i].updateby = that.timi(new Date());
                hisData[i].introduction = that.data.introduction;
                hisData[i].title = that.data.title;
                hisData[i].showImg = that.data.actile_img;
              }
            }
            wx.getStorage({
              key: 'openId',
              success: function (re) {
                DB.where({
                  _openid: re.data
                }).update({
                  data: {
                    history_release: hisData
                  },
                  success: function (r) {
                    console.log(r, "用户历史更改成功!");
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
              }
            });
          }
        });
      } else {
        //向talking集合里面添加
        DBT.add({
          data: {
            id: Date.parse(new Date()) / 1000,
            title: that.data.title,
            introduction: that.data.introduction,
            showImg: that.data.actile_img,
            content: that.data.nodes,
            creatby: that.timi(new Date()),
            updateby: that.timi(new Date()),
            userInfo: that.data.userRealese
          },
          success(res) {
            console.log(res, "添加成功");
            //向用户的发布历史里面添加
            that.addTalking(res._id);
          }
        });
      }
    } else {
      wx.showToast({
        content: "你还没有写内容呢亲!"
      })
    }
  },
  addTalking(_id) {
    let that = this;
    let his_realese = that.data.userRealese.history_release;
    his_realese.push({
      _id: _id,
      title: that.data.title,
      introduction: that.data.introduction,
      showImg: that.data.actile_img,
      content: that.data.nodes,
      creatby: that.timi(new Date()),
      updateby: that.timi(new Date())
    });
    DB.doc(that.data.userRealese._id).update({
      data: {
        history_release: his_realese
      },
      success(res) {
        console.log(res, "更新成功");
        wx.showToast({
          title: '成功',
          icon: 'success',
          duration: 2000
        });
        wx.reLaunch({
          url: '../../pages/index/index'
        });
      }
    });
  },
  getEditorValue(e) {
    this.setData({
      content: e.detail
    })
    wx.setStorageSync("content", e.detail)
  },
  onEditorReady() {
    const that = this
    wx.createSelectorQuery().select('#editor').context(function (res) {
      that.editorCtx = res.context;
      wx.showLoading({
        title: '加载内容中...',
      })
      setTimeout(function () {
        let data = that.data;
        wx.hideLoading();
        that.editorCtx.setContents({
          html: data.pageData ? data.pageData.content : '',
          success: (res) => {
            console.log(res)
          }
        })
      }, 1000)
    }).exec()
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
    } = e.target.dataset
    if (!name) return
    this.editorCtx.format(name, value)
  },
  insertImage() {
    var _this = this;
    wx.showLoading({
      title: '上传中...',
    })
    wx.chooseImage({
      count: 1,
      success(res) {
        console.log(res, "图片上传")
        const tempFilePaths = res.tempFilePaths[0];
        const timeName = Date.parse(new Date()) / 1000;
        //拿到图片路径上传到云储存
        wx.cloud.uploadFile({
          cloudPath: timeName + ".png",
          filePath: tempFilePaths,
          success: res => {
            console.log(res.fileID);
            _this.editorCtx.insertImage({
              src: res.fileID,
              data: {
                id: 'abcd',
                role: 'god'
              },
              success: function () {
                console.log('insert image success')
                wx.hideLoading();
              },
              fail: console.error
            })
          },
          fail: console.error
        });
      }
    })
  }
})