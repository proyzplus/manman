const DB = wx.cloud.database().collection("wenAnList");
const DBUSER = wx.cloud.database().collection("userList");

Page({
  data: {
    listData: [],
    userInfo: [],
    page: 0,
    totalCount: 0,
    comment: "",
    editItem: null,
    isLogin: false
  },
  onLoad: function (options) {
    wx.setNavigationBarTitle({
      title: "袁太太我好爱你吖"
    });
    this.loading();
    wx.getStorage({
      key: "openId",
      success: (res) => {
        if (res.data == 'o_BMd5IPJeXtDy4h-_rzTR-Kn2zM') {
          this.setData({
            isLogin: true
          });
        }
        if (res.data == 'o_BMd5ERRE6PLi2dS08lm89tiMgU') {
          this.setData({
            isLogin: true
          });
        }
        let data = {
          _openid: res.data
        };
        DBUSER.where(data).get({
          success: userInfo => {
            this.setData({
              userInfo: userInfo.data[0],
            });
          }
        });
      },
    });
  },
  async loading() {
    wx.showLoading({
      title: "袁太太等一下",
      mask: true
    });
    DB.count({
      success: tal => {
        const countResult = tal.total;
        const batchTimes = Math.ceil(countResult / 10);
        this.setData({
          page: 0,
          totalCount: batchTimes,
          listData: []
        });
        this.getWenList();
      }
    });
  },
  // 下拉刷新
  async onPullDownRefresh() {
    wx.showNavigationBarLoading(); //在标题栏中显示加载 
    await this.loading();
  },
  // 上滑加载
  onReachBottom() {
    if (this.totalCount !== 0) {
      if (Number(this.data.page) + 1 < Number(this.data.totalCount)) {
        this.setData({
          page: Number(this.data.page) + 1
        });
        this.getWenList();
      } else {
        console.log("list与总数已经相等，没有数据可加载了");
      }
    } else {
      console.log("数为0");
    }
  },
  // 获取数据
  async getWenList() {
    wx.cloud.callFunction({
      name: "loveList",
      data: {
        row: this.data.page
      },
      success: res => {
        let totalData = this.data.listData.concat(res.result.data);
        totalData.forEach(item => {
          item.comment = "";
        });
        this.setData({
          listData: totalData
        });
        wx.hideLoading();
        wx.hideNavigationBarLoading(); //完成停止加载
        wx.stopPullDownRefresh(); //停止下拉刷新 
      }
    });
  },
  handleClick(e) {
    wx.setClipboardData({
      data: e.currentTarget.dataset.word,
      success(res) {
        wx.getClipboardData({
          success(res) {
            console.log(res.data);
          }
        });
      }
    });
  },
  dearInput(e) {
    console.log(e);
    this.setData({
      comment: e.detail.value,
      editItem: e.currentTarget.dataset.item
    });
  },
  commentDear() {
    if (!this.data.comment) {
      return false;
    }
    let commentLi = {
      _openid: this.data.userInfo._openid,
      avatarUrl: this.data.userInfo.avatarUrl,
      nickName: this.data.userInfo.nickName,
      comment: this.data.comment
    };
    let commentList = [commentLi, ...this.data.editItem.commentList];
    DB.where({
      id: Number(this.data.editItem.id)
    }).update({
      data: {
        commentList: commentList
      },
      success: res => {
        let listData = this.data.listData;
        listData.forEach(item => {
          if (item.id == this.data.editItem.id) {
            item.commentList = commentList;
          }
        });
        this.setData({
          comment: "",
          listData
        });
      }
    });
  }
});