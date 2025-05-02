Page({
  data: {
    historyOrders: []
  },

  onShow() {
    wx.showLoading({
      title: '加载中...'
    });
    this.loadHistoryOrders();
  },

  loadHistoryOrders() {
    const userInfo = wx.getStorageSync('userInfo');
    if (!userInfo) {
      wx.hideLoading();
      return;
    }

    wx.request({
      url: 'http://localhost:8080/order/history',
      method: 'GET',
      data: {
        userId: userInfo.id
      },
      success: (res) => {
        if (res.data.code === 200) {
          try {
            const historyOrders = res.data.data.map(order => {
              const items = order.items ? order.items.split(',').map(item => {
                const [name, quantity, price] = item.split(':');
                return {
                  name,
                  quantity: parseInt(quantity) || 0,
                  price: parseFloat(price) || 0
                };
              }) : [];

              return {
                ...order,
                items,
                total_price: parseFloat(order.total_price) || 0
              };
            });
            
            this.setData({ historyOrders });
          } catch (error) {
            console.error('Data processing error:', error);
          }
        }
      },
      complete: () => {
        wx.hideLoading();
      }
    });
  }
});