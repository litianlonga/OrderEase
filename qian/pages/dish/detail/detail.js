Page({
  data: {
    dish: null,
    imageUrl: ''
  },

  onLoad(options) {
    const dish = JSON.parse(decodeURIComponent(options.dish));
    this.setData({ 
      dish,
      imageUrl: `/images/${dish.name}.jpg`  // 修改为正确的图片路径
    });
  },

  handleImageError() {
    this.setData({
      imageUrl: '/images/default.jpg'  // 修改为正确的默认图片路径
    });
  },  // 添加逗号

  addToCart() {
    const pages = getCurrentPages();
    const menuPage = pages.find(p => p.route === 'pages/menu/menu');
    if (menuPage) {
      menuPage.addToCart({ currentTarget: { dataset: { dish: this.data.dish } } });
      wx.showToast({
        title: '已加入购物车',
        icon: 'success'
      });
    }
  }
});