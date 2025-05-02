Page({
  data: {
    loginTypes: ['手机号', '邮箱'],
    loginTypeIndex: 0,
    account: '',
    password: ''
  },

  bindLoginTypeChange: function(e) {
    this.setData({
      loginTypeIndex: e.detail.value
    });
  },

  onAccountInput(e) {
    this.setData({
      account: e.detail.value
    });
  },

  onPasswordInput(e) {
    this.setData({
      password: e.detail.value
    });
  },

  login() {
    const { loginTypeIndex, account, password } = this.data;
    if (!account || !password) {
      wx.showToast({
        title: '请输入完整信息',
        icon: 'none'
      });
      return;
    }

    const loginType = loginTypeIndex === 0 ? 'phone' : 'email';
    
    wx.request({
      url: 'http://localhost:8080/user/login',
      method: 'POST',
      data: {
        [loginType]: account,
        password
      },
      success: (res) => {
        if (res.data.code === 200) {
          wx.showToast({
            title: '登录成功',
            icon: 'success'
          });
          wx.setStorageSync('userInfo', res.data.data);
          wx.switchTab({
            url: '/pages/menu/menu'
          });
        } else {
          wx.showToast({
            title: res.data.msg,
            icon: 'none'
          });
        }
      },
      fail: () => {
        wx.showToast({
          title: '网络错误',
          icon: 'none'
        });
      }
    });
  },

  goToRegister: function() {
    wx.navigateTo({
      url: '/pages/register/register'
    });
  }
});