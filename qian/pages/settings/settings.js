Page({
  data: {
    userInfo: []
  },

  onShow() {
    const user = wx.getStorageSync('userInfo');
    if (user) {
      this.setData({
        userInfo: [
          { key: 'username', label: '用户名', value: user.username || '未设置' },
          { key: 'phone', label: '手机号', value: user.phone || '未设置' },
          { key: 'email', label: '邮箱', value: user.email || '未设置' }
        ]
      });
    }
  },

  editInfo(e) {
    const field = e.currentTarget.dataset.field;
    const currentValue = this.data.userInfo.find(item => item.key === field).value;
    
    wx.showModal({
      title: '修改信息',
      content: '请输入新的内容',
      editable: true,
      placeholderText: currentValue,
      success: (res) => {
        if (res.confirm && res.content) {
          // 更新本地数据
          const newUserInfo = this.data.userInfo.map(item => {
            if (item.key === field) {
              item.value = res.content;
            }
            return item;
          });
          this.setData({ userInfo: newUserInfo });
          
          // 更新存储
          const userStorage = wx.getStorageSync('userInfo');
          userStorage[field] = res.content;
          wx.setStorageSync('userInfo', userStorage);
          
          wx.showToast({
            title: '修改成功',
            icon: 'success'
          });
        }
      }
    });
  }
});