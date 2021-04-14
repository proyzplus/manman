var dateTimePicker = require('../../utils/dateTimePicker.js');
const DBCARD = wx.cloud.database().collection("cardList");
Page({
  data: {
    date: '2018-10-01',
    time: '12:00',
    dateTimeArray: null,
    dateTime: null,
    startYear: 2010,
    endYear: 2099,
    word: "Mr.Y   Ms.H",
    lastTime: "9999天23时59分59秒",
    img_url: "http://tmp/chrIovxSfyzZ5848401adbd2ff8815d8e8a0299c065c",
    defaulSetTime: "",
    editId: null,
    edit_id: null,
    pageType: ""
  },
  onLoad(options) {
    var obj = dateTimePicker.dateTimePicker(this.data.startYear, this.data.endYear);
    const { dateTimeArray, dateTime } = obj;
    let bingoTime = dateTimeArray[0][dateTime[0]] + '-' + dateTimeArray[1][dateTime[1]] + '-' + dateTimeArray[2][dateTime[2]] + ' ' + dateTimeArray[3][dateTime[3]] + ':' + dateTimeArray[4][dateTime[4]] + ':' + dateTimeArray[5][dateTime[5]];
    this.setData({
      defaulSetTime: bingoTime
    });
    this.setData({
      dateTime: obj.dateTime,
      dateTimeArray: obj.dateTimeArray,
      pageType: options.type
    });
    console.log(options, "**************");
    if (options.type == 'update') {
      this.setData({
        editId: options.id ? Number(options.id) : 100001
      });
      let that = this;
      DBCARD.where({
        id: that.data.editId
      }).get({
        success(res) {
          that.setData({
            word: res.data[0].word,
            defaulSetTime: res.data[0].dateTime,
            img_url: res.data[0].back,
            edit_id: res.data[0]._id
          });
          that.countTime(res.data[0].dateTime);
        }
      });
    }
  },
  readyUpdate() {
    let data = {
      word: this.data.word,
      dateTime: this.data.defaulSetTime,
      back: this.data.img_url
    };
    DBCARD.doc(this.data.edit_id).update({
      data: data,
      success(res) {
        console.log(res, "更新成功");
        wx.showToast({
          title: '恭喜你修改成功!',
          icon: 'success',
          image: '',
          duration: 1500,
          mask: false,
        });
        wx.reLaunch({
          url: "../loveCard/index"
        });
        // wx.navigateBack({ changed: true });//返回上一页
      }
    });
  },
  addNewCard() {
    if (!this.data.img_url) {
      return wx.showToast({
        icon: 'error',
        title: '请上传背景图!'
      });
    }
    if (!this.data.word) {
      return wx.showToast({
        icon: 'error',
        title: '请填写文案!'
      });
    }
    let data = {
      id: Date.parse(new Date()) / 1000,
      word: this.data.word,
      dateTime: this.data.defaulSetTime,
      back: this.data.img_url
    };
    DBCARD.add({
      data,
      success(res) {
        console.log(res, "新增成功");
        wx.showToast({
          title: '恭喜你添加成功!',
          icon: 'success',
          image: '',
          duration: 1500,
          mask: false,
        });
        wx.reLaunch({
          url: "../loveCard/index"
        });
        // wx.navigateBack({ changed: true });//返回上一页
      }
    });
  },
  bindKeyName: function (e) {
    this.setData({ word: e.detail.value });
  },
  changeDateTime(e) {
    this.setData({ dateTime: e.detail.value });
    const { dateTimeArray, dateTime } = this.data;
    let bingoTime = dateTimeArray[0][dateTime[0]] + '-' + dateTimeArray[1][dateTime[1]] + '-' + dateTimeArray[2][dateTime[2]] + ' ' + dateTimeArray[3][dateTime[3]] + ':' + dateTimeArray[4][dateTime[4]] + ':' + dateTimeArray[5][dateTime[5]];
    this.setData({
      defaulSetTime: bingoTime
    });
    this.countTime(bingoTime);
  },
  changeDateTimeColumn(e) {
    var arr = this.data.dateTime, dateArr = this.data.dateTimeArray;
    arr[e.detail.column] = e.detail.value;
    dateArr[2] = dateTimePicker.getMonthDay(dateArr[0][arr[0]], dateArr[1][arr[1]]);
    this.setData({
      dateTimeArray: dateArr,
      dateTime: arr
    });
  },
  // 倒计时
  countTime(val) {
    let now = Date.parse(new Date());
    let end = Date.parse(new Date(val.replace(/-/g, "/")));
    //时间差  
    let leftTime = now - end;
    if (leftTime < 0) {
      leftTime = -leftTime;
    }
    //定义变量 d,h,m,s保存倒计时的时间  
    let d, h, m, s;
    d = Math.floor(leftTime / 1000 / 60 / 60 / 24);
    h = Math.floor(leftTime / 1000 / 60 / 60 % 24);
    m = Math.floor(leftTime / 1000 / 60 % 60);
    s = Math.floor(leftTime / 1000 % 60);
    //将0-9的数字前面加上0，例1变为01
    d = checkTime(d);
    h = checkTime(h);
    m = checkTime(m);
    s = checkTime(s);
    function checkTime(i) {
      if (Number(i) < 10 && Number(i) > 0) {
        i = "0" + i;
      }
      return i;
    }
    this.setData({
      lastTime: d + "天" + h + "时" + m + "分" + s + "秒",
    });
  },
  updateimg() {
    let that = this;
    wx.chooseImage({
      count: 1,
      success(res) {
        // console.log(res, "上传")
        wx.showLoading({
          title: '拼命上传中...',
          mask: true
        });
        for (let i = 0; i < res.tempFilePaths.length; i++) {
          const tempFilePaths = res.tempFilePaths[i];
          const timeName = String(Date.parse(new Date()) / 1000) + i;
          wx.compressImage({
            src: tempFilePaths,
            quality: 60,
            success(res) {
              let up_file = res.tempFilePath;
              wx.cloud.uploadFile({
                cloudPath: timeName + ".png",
                filePath: up_file,
                success: res => {
                  wx.cloud.getTempFileURL({
                    fileList: [res.fileID],
                    success: res => {
                      that.setData({
                        img_url: res.fileList[0].tempFileURL
                      });
                      wx.hideLoading();
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
