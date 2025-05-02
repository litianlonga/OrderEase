Page({
  data: {
    username: '',
    password: '',
    confirmPassword: '',
    phone: '',
    email: ''
  },

  onUsernameInput: function(e) {
    this.setData({ username: e.detail.value });
  },

  onPasswordInput: function(e) {
    this.setData({ password: e.detail.value });
  },

  onConfirmPasswordInput: function(e) {
    this.setData({ confirmPassword: e.detail.value });
  },

  onPhoneInput: function(e) {
    this.setData({ phone: e.detail.value });
  },

  onEmailInput: function(e) {
    this.setData({ email: e.detail.value });
  },

  register: function() {
    const { username, password, confirmPassword, phone, email } = this.data;

    if (!username || !password || !confirmPassword || !phone) {
      wx.showToast({
        title: '请填写必填项',
        icon: 'none'
      });
      return;
    }

    if (password !== confirmPassword) {
      wx.showToast({
        title: '两次密码不一致',
        icon: 'none'
      });
      return;
    }

    wx.request({
      url: 'http://localhost:8080/user/register',
      method: 'POST',
      data: {
        username,
        password,
        phone,
        email
      },
      success: (res) => {
        if (res.data.code === 200) {
          wx.showToast({
            title: '注册成功',
            icon: 'success'
          });
          setTimeout(() => {
            wx.navigateTo({
              url: '/pages/login/login'
            });
          }, 1500);
        } else {
          wx.showToast({
            title: res.data.msg,
            icon: 'none'
          });
        }
      }
    });
  },

  goToLogin: function() {
    wx.navigateTo({
      url: '/pages/login/login'
    });
  }
});