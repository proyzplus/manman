 Component({
   properties: {
     imgUrls: Array,
   },
   data: {
     currentIndex: 0
   },
   methods: {
     swiperChange(e) {
       this.setData({
         currentIndex: e.detail.current
       });
     }
   }
 });