<template>
  <view class="container">
    <!-- 医生端个人中心 -->
    <DoctorProfile v-if="isLogin && userType === 0" />

    <!-- 用户端个人中心 -->
    <template v-else>
      <!-- 头部背景 -->
      <view class="header">
        <text class="header-title">个人中心</text>
      </view>

      <!-- 用户信息 -->
      <view class="user-card" @click="isLogin ? goToUserInfo() : goToLogin()">
        <view class="user-info">
          <image :src="avatarUrl" class="avatar" mode="aspectFill"></image>
          <view class="user-text">
            <text class="login-tip">{{ isLogin ? userInfo.nickName || userInfo.userName : '请点击登录' }}</text>
            <text class="login-subtip">{{ isLogin ? userInfo.dept?.deptName || '暂无部门' : '登录之后享受更多权益' }}</text>
          </view>
        </view>
      </view>

      <!-- 健康服务 -->
      <view class="service-section">
        <text class="section-title">健康服务</text>
        <view class="service-grid two-col">
          <view class="service-item" @click="goToRecord">
            <view class="icon-box blue">
              <image src="/static/icon/dangan.png" class="service-icon" mode="aspectFit"></image>
            </view>
            <text class="service-label">评分档案</text>
          </view>
          <view class="service-item" @click="goToDoctor">
            <view class="icon-box green">
              <image src="/static/icon/yisheng.png" class="service-icon" mode="aspectFit"></image>
            </view>
            <text class="service-label">我的医生</text>
          </view>
        </view>
      </view>

      <!-- 更多服务 -->
      <view class="service-section">
        <text class="section-title">更多服务</text>
        <view class="service-grid four-col">
          <view class="service-item" @click="contactService">
            <view class="icon-box orange">
              <image src="/static/icon/kefu.png" class="service-icon" mode="aspectFit"></image>
            </view>
            <text class="service-label">联系客服</text>
          </view>
          <view class="service-item" @click="goToMessage">
            <view class="icon-box red">
              <image src="/static/icon/duzheliuyan.png" class="service-icon" mode="aspectFit"></image>
            </view>
            <text class="service-label">医生留言</text>
          </view>
          <view class="service-item" @click="goToInfo">
            <view class="icon-box cyan">
              <image src="/static/icon/xinxi.png" class="service-icon" mode="aspectFit"></image>
            </view>
            <text class="service-label">修改密码</text>
          </view>
          <view class="service-item" @click="goToSettings">
            <view class="icon-box blue-light">
              <image src="/static/icon/a-shezhi.png" class="service-icon" mode="aspectFit"></image>
            </view>
            <text class="service-label">设置中心</text>
          </view>
        </view>
      </view>

      <!-- 切换到医生端 -->
      <view class="switch-section" @click="switchToDoctor">
        <view class="switch-item">
          <view class="switch-left">
            <view class="icon-box small blue">
              <image src="/static/icon/yisheng_1.png" class="service-icon-small" mode="aspectFit"></image>
            </view>
            <text class="switch-text">切换到医生端</text>
          </view>
        </view>
      </view>

      <!-- 退出登录 -->
      <view class="logout-section">
        <text class="logout-text" @click="logout">退出登录</text>
      </view>
    </template>
  </view>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import DoctorProfile from '@/components/DoctorProfile.vue';

// 登录状态
const isLogin = ref(false);
// 用户信息
const userInfo = ref({});
// 用户类型：0-医生，1-用户
const userType = ref(1);

// 计算头像URL
const avatarUrl = computed(() => {
  if (!isLogin.value || !userInfo.value.avatar) {
    return '/static/avator.png';
  }
  // 如果avatar已经是完整URL，直接返回
  if (userInfo.value.avatar.startsWith('http')) {
    return userInfo.value.avatar;
  }
  // 处理路径中的双斜杠，拼接完整URL
  const avatarPath = userInfo.value.avatar.replace(/\/+/g, '/');
  return 'https://yiliao.admin.php7788.com/prod-api/' + avatarPath;
});

// 页面显示时获取用户信息（切换tab时触发）
onShow(() => {
  checkLoginStatus();
});

// 检查登录状态
const checkLoginStatus = () => {
  const token = uni.getStorageSync('token');
  if (token) {
    isLogin.value = true;
    getUserInfo();
  } else {
    isLogin.value = false;
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
          // 保存用户信息到本地
          userInfo.value = data.data;
          // 根据userType判断：0是医生，1是用户
          userType.value = data.data.userType === 0 ? 0 : 1;
        } else {
          console.error('获取用户信息失败:', data.msg);
          // 如果token失效，清除登录状态
          if (data.code === 401) {
            handleTokenExpired();
          }
        }
      }
    },
    fail: (err) => {
      console.error('获取用户信息请求失败:', err);
    }
  });
};

// 处理token过期
const handleTokenExpired = () => {
  uni.removeStorageSync('token');
  uni.removeStorageSync('userInfo');
  isLogin.value = false;
  userInfo.value = {};
  uni.showToast({
    title: '登录已过期，请重新登录',
    icon: 'none'
  });
};

const goToLogin = () => {
  uni.navigateTo({
    url: '/packageA/login/login'
  });
};

const goToUserInfo = () => {
  uni.showToast({
    title: '查看个人信息',
    icon: 'none'
  });
};

const goToRecord = () => {
  uni.switchTab({
    url: '/pages/record/record'
  });
};

const goToDoctor = () => {
  const doctorIdList = userInfo.value.doctorId || [];
  uni.navigateTo({
    url: '/pages/doctor-detail/doctor-detail?doctorIdList=' + encodeURIComponent(JSON.stringify(doctorIdList))
  });
};

const contactService = () => {
  uni.showToast({
    title: '请现场联系医生',
    icon: 'none'
  });
};

const goToMessage = () => {
  if (!isLogin.value) {
    uni.showToast({
      title: '请先登录',
      icon: 'none'
    });
    return;
  }
  uni.showToast({
    title: '医生留言',
    icon: 'none'
  });
};

const goToInfo = () => {
  if (!isLogin.value) {
    uni.showToast({
      title: '请先登录',
      icon: 'none'
    });
    return;
  }
  uni.navigateTo({
    url: '/packageA/change-password/change-password'
  });
};

const goToSettings = () => {
  if (!isLogin.value) {
    uni.showToast({
      title: '请先登录',
      icon: 'none'
    });
    return;
  }
  uni.navigateTo({
    url: '/pages/settings/settings'
  });
};

const switchToDoctor = () => {
  uni.navigateTo({
    url: '/packageA/doctor-login/doctor-login'
  });
};

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
          success: (response) => {
            console.log('后端退出登录成功:', response);
          },
          fail: (err) => {
            console.error('后端退出登录失败:', err);
          },
          complete: () => {
            // 无论后端接口是否成功，都清空前端缓存
            clearLoginState();
          }
        });
      }
    }
  });
};

// 清空登录状态
const clearLoginState = () => {
  // 清除本地缓存
  uni.removeStorageSync('token');
  uni.removeStorageSync('userInfo');

  // 重置状态
  isLogin.value = false;
  userInfo.value = {};

  // 发送事件通知其他页面清空数据
  uni.$emit('logoutEvent');

  uni.showToast({
    title: '已退出登录',
    icon: 'success'
  });
};
</script>

<style scoped>
.container {
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

/* 用户卡片 */
.user-card {
  background-color: white;
  margin: -40px 15px 15px;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.user-info {
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

.user-text {
  display: flex;
  flex-direction: column;
}

.login-tip {
  font-size: 18px;
  font-weight: bold;
  color: #333;
  margin-bottom: 5px;
}

.login-subtip {
  font-size: 14px;
  color: #999;
}

/* 服务区块 */
.service-section {
  background-color: white;
  margin: 0 15px 15px;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.section-title {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin-bottom: 20px;
  display: block;
}

.service-grid {
  display: flex;
  flex-wrap: wrap;
}

.service-grid.two-col .service-item {
  width: 50%;
}

.service-grid.four-col .service-item {
  width: 25%;
}

.service-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px 0;
}

.icon-box {
  width: 40px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-box.small {
  width: 40px;
  height: 40px;
  margin-bottom: 0;
  margin-right: 12px;
}

.service-icon {
  width: 36px;
  height: 36px;
}

.service-icon-small {
  width: 32px;
  height: 32px;
}

.service-label {
  font-size: 14px;
  color: #666;
}

/* 切换医生端 */
.switch-section {
  background-color: white;
  margin: 0 15px 15px;
  padding: 15px 20px;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.switch-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.switch-left {
  display: flex;
  align-items: center;
}

.switch-text {
  font-size: 16px;
  color: #333;
  font-weight: 500;
}

.arrow {
  font-size: 18px;
  color: #999;
}

/* 退出登录 */
.logout-section {
  background-color: white;
  margin: 0 15px;
  padding: 15px;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  text-align: center;
}

.logout-text {
  font-size: 16px;
  color: #1890ff;
  font-weight: 500;
}
</style>
