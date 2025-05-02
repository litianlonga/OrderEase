Page({
  data: {
    userInfo: null
  },

  onShow() {
    const userInfo = wx.getStorageSync('userInfo');
    if (!userInfo) {
      wx.redirectTo({
        url: '/pages/login/login'
      });
      return;
    }
    this.setData({ userInfo });
  },

  chooseAvatar() {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePath = res.tempFilePaths[0];
        wx.uploadFile({
          url: 'http://localhost:8080/user/upload/avatar',
          filePath: tempFilePath,
          name: 'file',
          formData: {
            userId: this.data.userInfo.id
          },
          success: (res) => {
            const data = JSON.parse(res.data);
            if (data.code === 200) {
              const userInfo = this.data.userInfo;
              userInfo.avatar = data.data;
              this.setData({ userInfo });
              wx.setStorageSync('userInfo', userInfo);
              wx.showToast({
                title: '上传成功',
                icon: 'success'
              });
            }
          }
        });
      }
    });
  },

  logout() {
    wx.showModal({
      title: '提示',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          wx.removeStorageSync('userInfo');
          wx.redirectTo({
            url: '/pages/login/login'
          });
        }
      }
    });
  },

  goToMyCoupons() {
    wx.navigateTo({
      url: '/pages/coupon/my/my'
    });
  },

  goToHistoryOrders() {
    wx.navigateTo({
      url: '/pages/order/history/history'
    });
  },

  goToSettings() {
    wx.navigateTo({
      url: '/pages/settings/settings'
    });
  }
});