Page({
  data: {
    orders: [],
    currentOrder: null,
    showDetail: false,
    statusMap: {
      0: '待付款',
      1: '已付款',
      2: '已取消'
    }
  },

  onShow() {
    const userInfo = wx.getStorageSync('userInfo');
    if (!userInfo) {
      wx.redirectTo({
        url: '/pages/login/login'
      });
      return;
    }

    const orders = wx.getStorageSync('orders') || [];
    const updatedOrders = orders.map(order => ({
      ...order,
      statusText: this.data.statusMap[order.status] || '未知状态'
    }));

    this.setData({ orders: updatedOrders });
    this.loadOrders(userInfo.id);
  },

  loadOrders: function(userId) {
    wx.request({
      url: `http://localhost:8080/order/list?userId=${userId}`,
      success: (res) => {
        if (res.data.code === 200) {
          this.setData({
            orders: res.data.data
          });
        }
      }
    });
  },

  showOrderDetail: function(e) {
    const orderId = e.currentTarget.dataset.id;
    wx.request({
      url: `http://localhost:8080/order/detail?orderId=${orderId}`,
      success: (res) => {
        if (res.data.code === 200) {
          const currentOrder = this.data.orders.find(order => order.id === orderId);
          this.setData({
            currentOrder: {
              ...currentOrder,
              details: res.data.data
            },
            showDetail: true
          });
        }
      }
    });
  },

  hideDetail: function() {
    this.setData({
      showDetail: false,
      currentOrder: null
    });
  },

  addMoreDishes: function() {
    if (this.data.currentOrder.status !== 0) {
      wx.showToast({
        title: '已付款订单不能加菜',
        icon: 'none'
      });
      return;
    }
    wx.setStorageSync('addToOrderId', this.data.currentOrder.id);
    wx.switchTab({
      url: '/pages/menu/menu'
    });
  },

  deleteOrder: function(e) {
    const orderId = e.currentTarget.dataset.id;
    if (!orderId) {
      wx.showToast({
        title: '订单信息错误',
        icon: 'none'
      });
      return;
    }

    wx.showModal({
      title: '提示',
      content: '确定要删除此订单吗？',
      success: (res) => {
        if (res.confirm) {
          wx.request({
            url: `http://localhost:8080/order/delete?orderId=${orderId}`,
            method: 'DELETE',
            success: (res) => {
              if (res.data.code === 200) {
                wx.showToast({
                  title: '删除成功',
                  icon: 'success'
                });
                this.hideDetail();
                const userInfo = wx.getStorageSync('userInfo');
                this.loadOrders(userInfo.id);
              }
            }
          });
        }
      }
    });
  },

  deleteDish: function(e) {
    if (this.data.currentOrder.status !== 0) {
      wx.showToast({
        title: '已付款订单不能删除菜品',
        icon: 'none'
      });
      return;
    }
    const orderDetailId = e.currentTarget.dataset.id;
    wx.showModal({
      title: '提示',
      content: '确定要删除这个菜品吗？',
      success: (res) => {
        if (res.confirm) {
          wx.request({
            url: `http://localhost:8080/order/dish/delete?orderDetailId=${orderDetailId}&orderId=${this.data.currentOrder.id}`,
            method: 'DELETE',
            success: (res) => {
              if (res.data.code === 200) {
                wx.showToast({
                  title: '删除成功',
                  icon: 'success'
                });
                this.showOrderDetail({
                  currentTarget: {
                    dataset: {
                      id: this.data.currentOrder.id
                    }
                  }
                });
                const userInfo = wx.getStorageSync('userInfo');
                this.loadOrders(userInfo.id);
              }
            }
          });
        }
      }
    });
  },  // 添加逗号

  goToPayment: function() {
    wx.setStorageSync('currentOrderId', this.data.currentOrder.id);
    wx.navigateTo({
      url: `/pages/payment/payment?totalPrice=${this.data.currentOrder.total_price}`
    });
  }
});