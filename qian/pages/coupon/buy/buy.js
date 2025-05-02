Page({
  data: {
    couponTypes: {
      1: { price: 39.9, discount: 0.8, count: 1 },
      2: { price: 59.9, discount: 0.7, count: 1 },
      3: { price: 99.9, discount: 0.5, count: 1 },
      4: { price: 648, package: true, content: {
        '0.8': 15,  // 15张8折券
        '0.7': 5,   // 5张7折券
        '0.5': 2    // 2张5折券
      }}
    }
  },

  buyCoupon(e) {
    const type = e.currentTarget.dataset.type;
    const coupon = this.data.couponTypes[type];
    
    wx.navigateTo({
      url: `/pages/payment/payment?type=coupon&amount=${coupon.price}&couponType=${type}`
    });
  }
});