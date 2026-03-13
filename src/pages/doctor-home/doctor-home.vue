<template>
  <view class="container">
    <!-- 头部 -->
    <view class="header">
      <view class="header-content">
        <view class="user-info">
          <image :src="avatarUrl" class="avatar" mode="aspectFill"></image>
          <view class="user-text">
            <text class="user-name">{{ userInfo.nickName || '医生' }}</text>
            <text class="user-role">{{ userInfo.dept?.deptName || '医生端' }}</text>
          </view>
        </view>
        <view class="scan-btn" @click="goToScan">
          <uni-icons type="scan" size="24" color="#fff"></uni-icons>
        </view>
      </view>
    </view>

    <!-- 功能模块 -->
    <view class="module-grid">
      <view class="module-item" @click="goToPatientList">
        <view class="module-icon blue">
          <uni-icons type="list" size="28" color="#fff"></uni-icons>
        </view>
        <text class="module-name">患者列表</text>
        <text class="module-desc">查看管理患者</text>
      </view>

      <view class="module-item" @click="goToScan">
        <view class="module-icon green">
          <uni-icons type="scan" size="28" color="#fff"></uni-icons>
        </view>
        <text class="module-name">扫码录入</text>
        <text class="module-desc">扫描患者二维码</text>
      </view>

      <view class="module-item" @click="goToAddPatient">
        <view class="module-icon orange">
          <uni-icons type="plus" size="28" color="#fff"></uni-icons>
        </view>
        <text class="module-name">新增患者</text>
        <text class="module-desc">手动添加患者</text>
      </view>

      <view class="module-item" @click="goToProfile">
        <view class="module-icon purple">
          <uni-icons type="person" size="28" color="#fff"></uni-icons>
        </view>
        <text class="module-name">个人信息</text>
        <text class="module-desc">修改个人资料</text>
      </view>
    </view>

    <!-- 今日统计 -->
    <view class="stats-section">
      <text class="section-title">今日统计</text>
      <view class="stats-grid">
        <view class="stat-item">
          <text class="stat-num">{{ todayStats.newPatients }}</text>
          <text class="stat-label">新增患者</text>
        </view>
        <view class="stat-item">
          <text class="stat-num">{{ todayStats.scans }}</text>
          <text class="stat-label">扫码次数</text>
        </view>
        <view class="stat-item">
          <text class="stat-num">{{ todayStats.totalPatients }}</text>
          <text class="stat-label">总患者数</text>
        </view>
      </view>
    </view>

    <!-- 最近患者 -->
    <view class="recent-section">
      <view class="section-header">
        <text class="section-title">最近添加</text>
        <text class="more-link" @click="goToPatientList">查看更多 →</text>
      </view>
      <view class="patient-list">
        <view
          class="patient-item"
          v-for="(patient, index) in recentPatients"
          :key="index"
          @click="goToPatientDetail(patient)"
        >
          <view class="patient-info">
            <text class="patient-name">{{ patient.name }}</text>
            <text class="patient-phone">{{ patient.phone }}</text>
          </view>
          <text class="patient-time">{{ patient.createTime }}</text>
        </view>
        <view class="empty-tip" v-if="recentPatients.length === 0">
          <text>暂无患者数据</text>
        </view>
      </view>
    </view>

    <!-- 退出登录 -->
    <view class="logout-section">
      <button class="logout-btn" @click="logout">退出登录</button>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { onShow } from '@dcloudio/uni-app';

// 用户信息
const userInfo = ref({});

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

// 今日统计
const todayStats = ref({
  newPatients: 0,
  scans: 0,
  totalPatients: 0
});

// 最近患者
const recentPatients = ref([]);

// 页面加载
onMounted(() => {
  checkLogin();
  getUserInfo();
  getTodayStats();
  getRecentPatients();
});

// 页面显示
onShow(() => {
  checkLogin();
  getUserInfo();
  getTodayStats();
  getRecentPatients();
});

// 检查登录状态
const checkLogin = () => {
  const token = uni.getStorageSync('token');
  const userType = uni.getStorageSync('userType');
  if (!token || userType !== 'doctor') {
    uni.reLaunch({
      url: '/pages/doctor-login/doctor-login'
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

// 获取今日统计
const getTodayStats = () => {
  todayStats.value = {
    newPatients: 3,
    scans: 12,
    totalPatients: 156
  };
};

// 获取最近患者
const getRecentPatients = () => {
  recentPatients.value = [
    { id: 1, name: '张三', phone: '138****1234', createTime: '10:30' },
    { id: 2, name: '李四', phone: '139****5678', createTime: '09:15' },
    { id: 3, name: '王五', phone: '137****9012', createTime: '昨天' }
  ];
};

// 跳转到扫码页面
const goToScan = () => {
  uni.navigateTo({
    url: '/pages/doctor-scan/doctor-scan'
  });
};

// 跳转到患者列表
const goToPatientList = () => {
  uni.navigateTo({
    url: '/pages/patient-list/patient-list'
  });
};

// 跳转到新增患者
const goToAddPatient = () => {
  uni.navigateTo({
    url: '/pages/patient-edit/patient-edit'
  });
};

// 跳转到个人信息
const goToProfile = () => {
  uni.navigateTo({
    url: '/pages/doctor-profile/doctor-profile'
  });
};

// 跳转到患者详情
const goToPatientDetail = (patient) => {
  uni.navigateTo({
    url: '/pages/patient-detail/patient-detail?id=' + patient.id
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
.container {
  min-height: 100vh;
  background-color: #f5f6fa;
  padding-bottom: 30px;
}

/* 头部区域 */
.header {
  background: linear-gradient(135deg, #1890ff, #36cfc9);
  padding: 50px 20px 30px;
  border-radius: 0 0 20px 20px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
}

.avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  border: 3px solid rgba(255, 255, 255, 0.3);
}

.user-text {
  margin-left: 15px;
}

.user-name {
  font-size: 20px;
  font-weight: bold;
  color: #fff;
  display: block;
}

.user-role {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.8);
  margin-top: 5px;
  display: block;
}

.scan-btn {
  width: 45px;
  height: 45px;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 功能模块 */
.module-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
  padding: 20px;
  margin-top: -10px;
}

.module-item {
  background-color: #fff;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.module-icon {
  width: 50px;
  height: 50px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 10px;
}

.module-icon.blue {
  background: linear-gradient(135deg, #1890ff, #69c0ff);
}

.module-icon.green {
  background: linear-gradient(135deg, #52c41a, #95de64);
}

.module-icon.orange {
  background: linear-gradient(135deg, #fa8c16, #ffc53d);
}

.module-icon.purple {
  background: linear-gradient(135deg, #722ed1, #b37feb);
}

.module-name {
  font-size: 15px;
  font-weight: bold;
  color: #333;
  margin-bottom: 4px;
}

.module-desc {
  font-size: 12px;
  color: #999;
}

/* 统计区域 */
.stats-section {
  background-color: #fff;
  margin: 0 20px 15px;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.section-title {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin-bottom: 15px;
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

/* 最近患者 */
.recent-section {
  background-color: #fff;
  margin: 0 20px 15px;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.more-link {
  font-size: 13px;
  color: #1890ff;
}

.patient-list {
  border-top: 1px solid #f0f0f0;
}

.patient-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 0;
  border-bottom: 1px solid #f0f0f0;
}

.patient-item:last-child {
  border-bottom: none;
}

.patient-info {
  display: flex;
  flex-direction: column;
}

.patient-name {
  font-size: 15px;
  font-weight: bold;
  color: #333;
}

.patient-phone {
  font-size: 13px;
  color: #999;
  margin-top: 4px;
}

.patient-time {
  font-size: 13px;
  color: #999;
}

.empty-tip {
  text-align: center;
  padding: 30px 0;
  color: #999;
  font-size: 14px;
}

/* 退出登录 */
.logout-section {
  padding: 0 20px;
}

.logout-btn {
  width: 100%;
  height: 45px;
  line-height: 45px;
  background-color: #fff;
  color: #ff4d4f;
  font-size: 15px;
  border-radius: 22px;
  border: 1px solid #ff4d4f;
}

.logout-btn::after {
  border: none;
}

.logout-btn:active {
  background-color: #fff2f0;
}
</style>
