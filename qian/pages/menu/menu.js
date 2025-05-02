Page({
  data: {
    dishes: [],
    categories: [],
    keyword: '',
    cart: [],
    isAddToExistingOrder: false,
    existingOrderId: null,
    selectedCategory: null
  },

  onShow: function() {
    const addToOrderId = wx.getStorageSync('addToOrderId');
    if (addToOrderId) {
      this.setData({
        isAddToExistingOrder: true,
        existingOrderId: addToOrderId
      });
      wx.removeStorageSync('addToOrderId');
    }
    this.loadDishes();
  },

  loadDishes: function() {
    wx.request({
      url: 'http://localhost:8080/dish/list',
      success: (res) => {
        if (res.data.code === 200) {
          const dishes = res.data.data;
          const categories = ['全部', ...new Set(dishes.map(dish => dish.category))];
          this.setData({
            dishes,
            categories
          });
        }
      }
    });
  },

  selectCategory: function(e) {
    const category = e.currentTarget.dataset.category;
    this.setData({ selectedCategory: category });
    
    if (category === '全部') {
      this.loadDishes();
      return;
    }

    wx.request({
      url: `http://localhost:8080/dish/category?category=${category}`,
      success: (res) => {
        if (res.data.code === 200) {
          this.setData({
            dishes: res.data.data
          });
        }
      }
    });
  },

  search: function() {
    const { keyword } = this.data;
    wx.request({
      url: `http://localhost:8080/dish/search?keyword=${keyword}`,
      success: (res) => {
        if (res.data.code === 200) {
          this.setData({
            dishes: res.data.data
          });
        }
      }
    });
  },

  onKeywordInput: function(e) {
    this.setData({
      keyword: e.detail.value
    });
  },

  addToCart: function(e) {
    const { dish } = e.currentTarget.dataset;
    const cart = [...this.data.cart];
    const index = cart.findIndex(item => item.id === dish.id);

    if (index > -1) {
      cart[index].quantity += 1;
    } else {
      cart.push({
        ...dish,
        quantity: 1
      });
    }

    this.setData({ cart });
  },

  createOrder: function() {
    const userInfo = wx.getStorageSync('userInfo');
    if (!userInfo) {
      wx.navigateTo({ url: '/pages/login/login' });
      return;
    }

    const { cart, isAddToExistingOrder, existingOrderId } = this.data;
    const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    
    const url = isAddToExistingOrder ? 
      'http://localhost:8080/order/addDishes' : 
      'http://localhost:8080/order/create';

    wx.request({
      url: url,
      method: 'POST',
      data: {
        userId: userInfo.id,
        orderId: existingOrderId,
        totalPrice,
        items: cart.map(item => ({
          dishId: item.id,
          quantity: item.quantity,
          price: item.price
        }))
      },
      success: (res) => {
        if (res.data.code === 200) {
          wx.showToast({
            title: isAddToExistingOrder ? '加菜成功' : '下单成功',
            icon: 'success'
          });
          this.setData({ 
            cart: [],
            isAddToExistingOrder: false,
            existingOrderId: null
          });
          if (isAddToExistingOrder) {
            wx.switchTab({
              url: '/pages/order/order'
            });
          }
        }
      }
    });
  },
  showDishDetail(e) {
      const dish = e.currentTarget.dataset.dish;
      wx.navigateTo({
        url: `/pages/dish/detail/detail?dish=${encodeURIComponent(JSON.stringify(dish))}`
      });
    }
});