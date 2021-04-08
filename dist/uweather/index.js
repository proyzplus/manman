 const amap = require('../../utils/amap-wx.js');
 var timeFormat = require("../../utils/util");
 Component({
   options: {
     addGlobalClass: true,
     multipleSlots: true
   },
   properties: {
     weather: {
       type: String,
       value: '',
       observer: function (n, o) {
         //天气变化
       }
     },
     winfo: {
       type: Object,
       value: null,
       observer: function (n, o) {
         this.setData({
           obj: n
         })
       }
     }
   },
   data: {
     amapPlugin: null,
     key: "844261a9e672fd550b8b60c08fb894d5",
     obj: {},
     year: "",
     month: "",
     day: "",
     hour: "",
     minute: "",
     second: ""
   },
   lifetimes: {
     attached() {
       if (this.properties.winfo == null) {
         this.setData({
           amapPlugin: new amap.AMapWX({
             key: this.data.key
           })
         }, () => {
           this.getWeather()
         })
       }
       this.setData({
         year: (timeFormat.formatTimes(new Date())).slice(0, 4),
         month: (timeFormat.formatTimes(new Date())).slice(5, 7),
         day: (timeFormat.formatTimes(new Date())).slice(8, 10)
       })
       setInterval(() => {
         console.log()
         let datetime = timeFormat.formatTime(new Date())
         this.setData({
           hour: datetime.slice(11, 13),
           minute: datetime.slice(14, 16),
           second: datetime.slice(17, 19)
         })
       }, 1000)
     }
   },
   methods: {
     getWeather: function () {
       this.data.amapPlugin.getWeather({
         success: (data) => {
           wx.hideLoading()
           this.setData({
             obj: data.liveData,
           })
           if (this.properties.weather == '') {
             this.setData({
               weather: data.liveData.weather
             })
           }
         }
       })
     },
   }
 })