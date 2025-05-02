Page({
  data: {
    myCoupons: []
  },

  onShow() {
    const userInfo = wx.getStorageSync('userInfo');
    if (userInfo) {
      // 从本地存储获取优惠券
      const myCoupons = wx.getStorageSync(`coupons_${userInfo.id}`) || [];
      this.setData({ myCoupons });
    }
  }
});