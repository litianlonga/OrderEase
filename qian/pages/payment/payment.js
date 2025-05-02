Page({
  data: {
    totalPrice: 0,
    originalPrice: 0,
    showWxPay: false,
    showAliPay: false,
    type: '',
    couponType: '0',  // 修改默认值为字符串
    showCouponList: false,
    availableCoupons: [],
    selectedCoupon: null
  },

  onLoad(options) {
    const price = options.type === 'coupon' ? options.amount : options.totalPrice || 0;
    this.setData({
      totalPrice: price,
      originalPrice: price,
      type: options.type || 'order',
      couponType: options.couponType || '0'
    });
  
    // 验证订单ID
    const orderId = wx.getStorageSync('currentOrderId');
    if (!orderId && this.data.type === 'order') {
      wx.showToast({
        title: '订单信息异常',
        icon: 'none',
        success: () => {
          setTimeout(() => {
            wx.navigateBack();
          }, 1500);
        }
      });
      return;
    }
  
    // 仅在订单支付时加载优惠券
    if (this.data.type === 'order') {
      this.loadAvailableCoupons();
    }
  },

  showWxPayImage() {  // 添加支付方法
    this.setData({
      showWxPay: true,
      showAliPay: false
    });
  },

  showAliPayImage() {  // 添加支付方法
    this.setData({
      showWxPay: false,
      showAliPay: true
    });
  },

  loadAvailableCoupons() {
    const userInfo = wx.getStorageSync('userInfo');
    const coupons = wx.getStorageSync(`coupons_${userInfo.id}`) || [];
    this.setData({
      availableCoupons: coupons.filter(c => c.status === '未使用')
    });
  },

  showCouponList() {
    // 购买优惠券时不允许使用优惠券
    if (this.data.type === 'coupon') {
      wx.showToast({
        title: '购买优惠券不可使用优惠券',
        icon: 'none'
      });
      return;
    }
    this.setData({ showCouponList: true });
  },

  hideCouponList() {
    this.setData({ showCouponList: false });
  },

  selectCoupon(e) {
    const index = parseInt(e.detail.value);
    const coupon = this.data.availableCoupons[index];
    const newPrice = (this.data.originalPrice * coupon.discount).toFixed(2);
    
    this.setData({
      selectedCoupon: coupon,
      totalPrice: newPrice,
      showCouponList: false
    });
  },

  confirmPayment() {
    if (this.data.type === 'coupon') {
      const userInfo = wx.getStorageSync('userInfo');
      const couponTypes = {
        '1': { discount: 0.8, count: 1 },
        '2': { discount: 0.7, count: 1 },
        '3': { discount: 0.5, count: 1 },
        '4': { 
          discount: [0.8, 0.7, 0.5], 
          count: [15, 5, 2]  // 超值套餐：15张8折，5张7折，2张5折
        }
      };
      
      const couponType = couponTypes[this.data.couponType];
      if (!couponType) {
        wx.showToast({
          title: '优惠券类型错误',
          icon: 'none'
        });
        return;
      }

      let newCoupons = [];
      if (this.data.couponType === '4') {
        // 处理超值套餐
        couponType.discount.forEach((discount, index) => {
          const count = couponType.count[index];
          const coupons = Array(count).fill().map(() => ({
            id: Date.now() + Math.random(),
            discount: discount,
            status: '未使用'
          }));
          newCoupons = [...newCoupons, ...coupons];
        });
      } else {
        // 处理单张优惠券
        newCoupons = Array(couponType.count).fill().map(() => ({
          id: Date.now() + Math.random(),
          discount: couponType.discount,
          status: '未使用'
        }));
      }

      const existingCoupons = wx.getStorageSync(`coupons_${userInfo.id}`) || [];
      wx.setStorageSync(`coupons_${userInfo.id}`, [...existingCoupons, ...newCoupons]);

      wx.showToast({
        title: '购买成功',
        icon: 'success',
        duration: 2000,
        success: () => {
          setTimeout(() => {
            wx.navigateBack();
          }, 2000);
        }
      });
    } else {
      // 调用后端支付接口
      const orderId = wx.getStorageSync('currentOrderId');
      const userInfo = wx.getStorageSync('userInfo');
      
      wx.request({
        url: 'http://localhost:8080/order/pay',
        method: 'POST',
        data: {
          orderId: orderId,
          userId: userInfo.id  // 添加用户ID
        },
        success: (res) => {
          console.log('支付响应:', res.data);
          
          // 修改判断逻辑，同时检查 HTTP 状态码和业务状态码
          if (res.statusCode === 200 && res.data.code !== 500) {
            // 支付成功的处理逻辑
            if (this.data.selectedCoupon) {
              const userInfo = wx.getStorageSync('userInfo');
              let coupons = wx.getStorageSync(`coupons_${userInfo.id}`) || [];
              coupons = coupons.filter(c => c.id !== this.data.selectedCoupon.id);
              wx.setStorageSync(`coupons_${userInfo.id}`, coupons);
            }
  
            // 更新本地订单状态
            const orders = wx.getStorageSync('orders') || [];
            const updatedOrders = orders.map(order => {
              if (order.id === orderId) {
                return { ...order, status: 1 };
              }
              return order;
            });
            wx.setStorageSync('orders', updatedOrders);
  
            wx.showToast({
              title: '支付成功',
              icon: 'success',
              duration: 2000,
              success: () => {
                setTimeout(() => {
                  wx.switchTab({
                    url: '/pages/order/order'
                  });
                }, 2000);
              }
            });
          } else {
            wx.showToast({
              title: res.data.msg || '支付失败',
              icon: 'none'
            });
          }
        },
        fail: (err) => {
          wx.showToast({
            title: '网络请求失败',
            icon: 'none'
          });
        }
      });
    }
  }
  
});