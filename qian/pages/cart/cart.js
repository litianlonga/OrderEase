Page({
  data: {
    cartItems: [],
    totalPrice: 0
  },

  onLoad() {
    // ... 其他代码 ...
  },

  submitOrder() {
    const cartItems = this.data.cartItems;
    if (cartItems.length === 0) {
      wx.showToast({
        title: '购物车为空',
        icon: 'none'
      });
      return;
    }

    const orderId = Date.now();
    const newOrder = {
      id: orderId,
      items: cartItems,
      totalPrice: this.data.totalPrice,
      status: 0,  // 使用数字状态
      createTime: new Date().toLocaleString()
    };

    const orders = wx.getStorageSync('orders') || [];
    orders.push(newOrder);
    wx.setStorageSync('orders', orders);
    wx.setStorageSync('currentOrderId', orderId);

    // 清空购物车
    this.setData({
      cartItems: [],
      totalPrice: 0
    });
    wx.setStorageSync('cartItems', []);

    wx.navigateTo({
      url: `/pages/payment/payment?totalPrice=${this.data.totalPrice}`
    });
  }
});