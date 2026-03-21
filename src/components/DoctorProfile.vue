<template>
  <view class="doctor-container">
    <!-- 头部 -->
    <view class="header">
      <text class="header-title">医生个人中心</text>
    </view>

    <!-- 医生信息卡片 -->
    <view class="doctor-card">
      <view class="doctor-info">
        <image :src="avatarUrl" class="avatar" mode="aspectFill" @click="chooseAvatar"></image>
        <view class="doctor-text">
          <text class="doctor-name">{{ userInfo.nickName || '医生' }}</text>
          <text class="doctor-title">{{ userInfo.dept?.deptName || '暂无科室' }}</text>
        </view>
      </view>
      <view class="edit-btn" @click="goToEdit">
        <uni-icons type="compose" size="20" color="#1890ff"></uni-icons>
        <text class="edit-text">编辑</text>
      </view>
    </view>

    <!-- 医生统计 -->
    <!-- <view class="stats-section">
      <text class="section-title">我的统计</text>
      <view class="stats-grid">
        <view class="stat-item">
          <text class="stat-num">{{ stats.patients }}</text>
          <text class="stat-label">患者数量</text>
        </view>
      </view>
    </view> -->

    <!-- 功能菜单 -->
    <view class="menu-section">
      <view class="menu-item" @click="goToSettings">
        <!-- <view class="menu-icon orange">
          <uni-icons type="settings" size="24" color="#fff"></uni-icons>
        </view> -->
        <text class="menu-text">设置中心</text>
        <uni-icons type="right" size="18" color="#999"></uni-icons>
      </view>
      
      <view class="menu-item" @click="goToChangePassword">
        <!-- <view class="menu-icon purple">
          <uni-icons type="locked" size="24" color="#fff"></uni-icons>
        </view> -->
        <text class="menu-text">修改密码</text>
        <uni-icons type="right" size="18" color="#999"></uni-icons>
      </view>
    </view>

    <!-- 退出登录 -->
    <view class="logout-section">
      <text class="logout-text" @click="logout">退出登录</text>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { onShow } from '@dcloudio/uni-app';

// 用户信息
const userInfo = ref({});

// 统计数据
const stats = ref({
  patients: 0,
  scans: 0,
  visits: 0
});

// 计算头像URL
const avatarUrl = computed(() => {
  if (!userInfo.value.avatar) {
    return '/static/logo.png';
  }
  if (userInfo.value.avatar.startsWith('http')) {
    return userInfo.value.avatar;
  }
  const avatarPath = userInfo.value.avatar.replace(/\/+/g, '/');
  return 'https://yiliao.admin.php7788.com/prod-api/' + avatarPath;
});

// 页面加载
onMounted(() => {
  checkLogin();
  getUserInfo();
  getStats();
});

// 页面显示
onShow(() => {
  checkLogin();
  getUserInfo();
  getStats();
});

// 检查登录状态
const checkLogin = () => {
  const token = uni.getStorageSync('token');
  if (!token) {
    uni.reLaunch({
      url: '/packageA/login/login'
    });
  }
};

// 获取用户信息
const getUserInfo = () => {
  uni.request({
    url: 'https://yiliao.admin.php7788.com/prod-api/system/user/profile',
    method: 'GET',
    timeout: 10000,
    header: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + uni.getStorageSync('token')
    },
    success: (res) => {
      if (res.statusCode === 200) {
        const data = res.data;
        if (data.code === 200 || data.code === 0) {
          userInfo.value = data.data;
          uni.setStorageSync('userInfo', data.data);
        }
      }
    },
    fail: (err) => {
      console.error('获取用户信息失败:', err);
    }
  });
};

// 获取统计数据
const getStats = () => {
  // 模拟数据
  stats.value = {
    patients: 156,
    scans: 452,
    visits: 890
  };
};

// 选择头像
const chooseAvatar = () => {
  uni.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: (res) => {
      const tempFilePath = res.tempFilePaths[0];
      uploadAvatar(tempFilePath);
    }
  });
};

// 上传头像
const uploadAvatar = (filePath) => {
  uni.showLoading({ title: '上传中...', mask: true });
  
  uni.uploadFile({
    url: 'https://yiliao.admin.php7788.com/prod-api/system/user/profile/avatar',
    filePath: filePath,
    name: 'avatarfile',
    header: {
      'Authorization': 'Bearer ' + uni.getStorageSync('token')
    },
    success: (res) => {
      uni.hideLoading();
      if (res.statusCode === 200) {
        const data = JSON.parse(res.data);
        if (data.code === 200 || data.code === 0) {
          uni.showToast({ title: '头像上传成功', icon: 'success' });
          userInfo.value.avatar = data.imgUrl;
          uni.setStorageSync('userInfo', userInfo.value);
        } else {
          uni.showToast({ title: data.msg || '上传失败', icon: 'none' });
        }
      }
    },
    fail: (err) => {
      uni.hideLoading();
      uni.showToast({ title: '上传失败', icon: 'none' });
      console.error('上传头像失败:', err);
    }
  });
};

// 跳转到编辑页面
const goToEdit = () => {
  uni.navigateTo({
    url: '/pages/doctor-profile-edit/doctor-profile-edit'
  });
};

// 跳转到患者列表
const goToPatientList = () => {
  uni.navigateTo({
    url: '/pages/patient-list/patient-list'
  });
};

// 跳转到扫码
const goToScan = () => {
  uni.navigateTo({
    url: '/pages/doctor-scan/doctor-scan'
  });
};

// 跳转到设置
const goToSettings = () => {
  uni.navigateTo({
    url: '/pages/settings/settings'
  });
};

// 跳转到修改密码
const goToChangePassword = () => {
  uni.navigateTo({
    url: '/packageA/change-password/change-password'
  });
};

// 退出登录
const logout = () => {
  uni.showModal({
    title: '提示',
    content: '确定要退出登录吗？',
    success: (res) => {
      if (res.confirm) {
        // 调用后端退出登录接口
        uni.request({
          url: 'https://yiliao.admin.php7788.com/prod-api/logout',
          method: 'POST',
          timeout: 10000,
          header: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + uni.getStorageSync('token')
          },
          success: () => {
            clearLoginState();
          },
          fail: () => {
            clearLoginState();
          }
        });
      }
    }
  });
};

// 清空登录状态
const clearLoginState = () => {
  uni.removeStorageSync('token');
  uni.removeStorageSync('userType');
  uni.removeStorageSync('userInfo');
  uni.showToast({
    title: '已退出登录',
    icon: 'success'
  });
  setTimeout(() => {
    uni.reLaunch({
      url: '/pages/index/index'
    });
  }, 1000);
};
</script>

<style scoped>
.doctor-container {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 40px;
}

/* 头部 */
.header {
  background: linear-gradient(135deg, #1890ff 0%, #36cfc9 100%);
  padding: 40px 20px 60px;
  text-align: center;
}

.header-title {
  font-size: 18px;
  font-weight: bold;
  color: white;
}

/* 医生卡片 */
.doctor-card {
  background-color: white;
  margin: -40px 15px 15px;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.doctor-info {
  display: flex;
  align-items: center;
}

.avatar {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  margin-right: 15px;
  background-color: #f0f0f0;
}

.doctor-text {
  display: flex;
  flex-direction: column;
}

.doctor-name {
  font-size: 18px;
  font-weight: bold;
  color: #333;
  margin-bottom: 5px;
}

.doctor-title {
  font-size: 14px;
  color: #999;
}

.edit-btn {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 8px 12px;
  background-color: #f0f8ff;
  border-radius: 20px;
}

.edit-text {
  font-size: 13px;
  color: #1890ff;
}

/* 统计区域 */
.stats-section {
  background-color: white;
  margin: 0 15px 15px;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
}

.section-title {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin-bottom: 20px;
  display: block;
}

.stats-grid {
  display: flex;
  justify-content: space-around;
}

.stat-item {
  text-align: center;
}

.stat-num {
  font-size: 24px;
  font-weight: bold;
  color: #1890ff;
  display: block;
}

.stat-label {
  font-size: 13px;
  color: #999;
  margin-top: 5px;
  display: block;
}

/* 菜单区域 */
.menu-section {
  background-color: white;
  margin: 0 15px 15px;
  padding: 0;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 18px 20px;
  border-bottom: 1px solid #f0f0f0;
}

.menu-item:last-child {
  border-bottom: none;
}

.menu-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
}

.menu-icon.blue {
  background: linear-gradient(135deg, #1890ff, #69c0ff);
}

.menu-icon.green {
  background: linear-gradient(135deg, #52c41a, #95de64);
}

.menu-icon.orange {
  background: linear-gradient(135deg, #fa8c16, #ffc53d);
}

.menu-icon.purple {
  background: linear-gradient(135deg, #722ed1, #b37feb);
}

.menu-text {
  flex: 1;
  font-size: 16px;
  color: #333;
}

/* 退出登录 */
.logout-section {
  padding: 0 20px;
  box-sizing: border-box;
  margin-top: 20px;
}

.logout-text {
  display: block;
  text-align: center;
  color: #ff4d4f;
  font-size: 16px;
  padding: 15px;
  background-color: white;
  border-radius: 25px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
}
</style>
