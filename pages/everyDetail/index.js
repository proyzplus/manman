const DBAC = wx.cloud.database().collection("activity");
Page({
  data: {
    objectId: '',
    days: [],
    signUp: [],
    cur_year: 0,
    cur_month: 0,
    count: 0,
    openId: null,
    card_date: [],
    touchS: [0, 0],
    touchE: [0, 0],
    user: {}
  },
  onLoad: function (options) {
    this.setData({ objectId: options.objectId });
    const date = new Date();
    const cur_year = date.getFullYear();
    const cur_month = date.getMonth() + 1;
    const weeks_ch = ['日', '一', '二', '三', '四', '五', '六'];
    this.calculateEmptyGrids(cur_year, cur_month);
    this.calculateDays(cur_year, cur_month);
    this.setData({
      cur_year,
      cur_month,
      weeks_ch
    });
    this.setTitle();
    wx.getStorage({
      key: "openId",
      success: (res) => {
        let openid = res.data;
        DBAC.doc("b00064a760651dfe0cc8b73b57ebea2b").get({
          success: res1 => {
            let ac_data = res1.data;
            let card_date = [];
            let user = {};
            if (openid == "o_BMd5IPJeXtDy4h-_rzTR-Kn2zM") {
              card_date = ac_data.man.dateList;
              user = ac_data.man;
            } else {
              card_date = ac_data.woman.dateList;
              user = ac_data.woman;
            }
            this.setData({
              openId: res.data,
              signUp: card_date,
              user
            });
            this.onJudgeSign();
          }
        });
      }
    });
  },
  setTitle() {
    wx.setNavigationBarTitle({
      title: this.data.cur_year + " ♥ " + this.data.cur_month
    });
  },
  // 获取当月共多少天
  getThisMonthDays: function (year, month) {
    return new Date(year, month, 0).getDate()
  },
  // 获取当月第一天星期几
  getFirstDayOfWeek: function (year, month) {
    return new Date(Date.UTC(year, month - 1, 1)).getDay();
  },
  // 计算当月1号前空了几个格子，把它填充在days数组的前面
  calculateEmptyGrids: function (year, month) {
    var that = this;
    //计算每个月时要清零
    that.setData({ days: [] });
    const firstDayOfWeek = this.getFirstDayOfWeek(year, month);
    if (firstDayOfWeek > 0) {
      for (let i = 0; i < firstDayOfWeek; i++) {
        var obj = {
          date: null,
          isSign: false
        };
        that.data.days.push(obj);
      }
      this.setData({
        days: that.data.days
      });
      //清空
    } else {
      this.setData({
        days: []
      });
    }
  },
  // 绘制当月天数占的格子，并把它放到days数组中
  calculateDays: function (year, month) {
    var that = this;
    const thisMonthDays = this.getThisMonthDays(year, month);
    for (let i = 1; i <= thisMonthDays; i++) {
      var obj = {
        date: i,
        isSign: false
      };
      that.data.days.push(obj);
    }
    this.setData({
      days: that.data.days
    });
  },
  //匹配判断当月与当月哪些日子签到打卡
  onJudgeSign: function () {
    var that = this;
    var signs = that.data.signUp;
    var daysArr = that.data.days;
    for (var i = 0; i < signs.length; i++) {
      var current = new Date(signs[i].replace(/-/g, "/"));
      var year = current.getFullYear();
      var month = current.getMonth() + 1;
      var day = current.getDate();
      day = parseInt(day);
      for (var j = 0; j < daysArr.length; j++) {
        //年月日相同并且已打卡
        if (year == that.data.cur_year && month == that.data.cur_month && daysArr[j].date == day) {
          daysArr[j].isSign = true;
        }
      }
    }
    that.setData({ days: daysArr });
  },
  // 切换控制年月，上一个月，下一个月
  handleCalendar: function (e) {
    const handle = e;
    const cur_year = this.data.cur_year;
    const cur_month = this.data.cur_month;
    if (handle === 'prev') {
      let newMonth = cur_month - 1;
      let newYear = cur_year;
      if (newMonth < 1) {
        newYear = cur_year - 1;
        newMonth = 12;
      }
      this.calculateEmptyGrids(newYear, newMonth);
      this.calculateDays(newYear, newMonth);
      this.setData({
        cur_year: newYear,
        cur_month: newMonth
      });
      this.onJudgeSign();
    } else {
      let newMonth = cur_month + 1;
      let newYear = cur_year;
      if (newMonth > 12) {
        newYear = cur_year + 1;
        newMonth = 1;
      }
      this.calculateEmptyGrids(newYear, newMonth);
      this.calculateDays(newYear, newMonth);
      this.setData({
        cur_year: newYear,
        cur_month: newMonth
      });
      this.onJudgeSign();
    }
    this.setTitle();
  },
  touchStart: function (e) {
    let sx = e.touches[0].pageX;
    let sy = e.touches[0].pageY;
    this.data.touchS = [sx, sy];
  },
  touchMove: function (e) {
    let sx = e.touches[0].pageX;
    let sy = e.touches[0].pageY;
    this.data.touchE = [sx, sy];
  },
  touchEnd: function (e) {
    let start = this.data.touchS;
    let end = this.data.touchE;
    if (start[0] < end[0] - 50) {
      this.handleCalendar('prev');
    } else if (start[0] > end[0] + 50) {
      this.handleCalendar('next');
    } else {
      console.log('静止');
    }
  }
});
