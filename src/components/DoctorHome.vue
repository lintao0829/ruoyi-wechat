<template>
  <view class="doctor-container">
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
    <!-- <view class="module-grid">
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
        <text class="module-desc">扫码添加患者</text>
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
        <text class="module-name">个人中心</text>
        <text class="module-desc">医生信息设置</text>
      </view>
    </view> -->

    <!-- 今日统计 -->
    <!-- <view class="stats-section">
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
    </view> -->

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
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';

const props = defineProps({
  userInfo: {
    type: Object,
    default: () => ({})
  }
});

// 计算头像URL
const avatarUrl = computed(() => {
  if (!props.userInfo.avatar) {
    return '/static/logo.png';
  }
  if (props.userInfo.avatar.startsWith('http')) {
    return props.userInfo.avatar;
  }
  const avatarPath = props.userInfo.avatar.replace(/\/+/g, '/');
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
  getTodayStats();
  getRecentPatients();
});

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
  // 获取当前登录医生的token
  const token = uni.getStorageSync('token');
  if (!token) {
    console.log('未登录，无法获取患者数据');
    return;
  }

  // 获取当前医生的ID
  const doctorId = props.userInfo.userId;
  if (!doctorId) {
    console.log('医生ID为空，无法获取患者数据');
    return;
  }

  // 调用患者列表接口，获取最近的患者数据
  uni.request({
    url: 'https://yiliao.admin.php7788.com/prod-api/system/patient/list',
    method: 'GET',
    timeout: 10000,
    header: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    },
    data: {
      pageNum: 1,
      pageSize: 5, // 只获取最近5个患者
      doctorId: doctorId
    },
    success: (res) => {
      if (res.statusCode === 200) {
        const data = res.data;
        if (data.code === 200 || data.code === 0) {
          // 格式化患者数据
          recentPatients.value = (data.rows || []).map(patient => ({
            id: patient.patientId,
            name: patient.patientName,
            phone: patient.phone,
            createTime: formatTime(patient.createTime)
          }));
        } else {
          console.error('获取患者数据失败:', data.msg);
        }
      } else {
        console.error('请求失败，状态码:', res.statusCode);
      }
    },
    fail: (err) => {
      console.error('获取最近患者失败:', err);
    }
  });
};

// 格式化时间
const formatTime = (timeStr) => {
  if (!timeStr) return '';
  
  try {
    const date = new Date(timeStr);
    const now = new Date();
    const diff = now - date;
    
    // 小于1分钟
    if (diff < 60000) {
      return '刚刚';
    }
    
    // 小于1小时
    if (diff < 3600000) {
      const minutes = Math.floor(diff / 60000);
      return minutes + '分钟前';
    }
    
    // 小于1天
    if (diff < 86400000) {
      const hours = Math.floor(diff / 3600000);
      return hours + '小时前';
    }
    
    // 小于7天
    if (diff < 604800000) {
      const days = Math.floor(diff / 86400000);
      return days + '天前';
    }
    
    // 超过7天，显示具体日期
    return date.toLocaleDateString('zh-CN');
  } catch (error) {
    console.error('时间格式化失败:', error);
    return timeStr;
  }
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
    // /prod-api/system/patient/12
  });
};
</script>

<style scoped>
.doctor-container {
  min-height: 100vh;
  background-color: #f5f6fa;
  padding-bottom: 30px;
}

.header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 40px 20px 60px;
  border-radius: 0 0 20px 20px;
  position: relative;
  overflow: hidden;
}

.header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('/static/img/fNL6xQg8c.jpeg') center/cover;
  opacity: 0.3;
  z-index: 0;
}

.header-content {
  position: relative;
  z-index: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 15px;
}

.avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  border: 3px solid rgba(255, 255, 255, 0.3);
  background-color: #fff;
}

.user-text {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.user-name {
  font-size: 18px;
  font-weight: bold;
  color: #fff;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.user-role {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.9);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.scan-btn {
  width: 50px;
  height: 50px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.module-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
  padding: 20px;
  margin-top: -30px;
  position: relative;
  z-index: 2;
}

.module-item {
  background: #fff;
  border-radius: 16px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s ease;
}

.module-item:active {
  transform: translateY(-2px);
}

.module-icon {
  width: 50px;
  height: 50px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.module-icon.blue {
  background: linear-gradient(135deg, #1890ff, #096dd9);
}

.module-icon.green {
  background: linear-gradient(135deg, #52c41a, #389e0d);
}

.module-icon.orange {
  background: linear-gradient(135deg, #fa8c16, #d48806);
}

.module-icon.purple {
  background: linear-gradient(135deg, #722ed1, #531dab);
}

.module-name {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.module-desc {
  font-size: 12px;
  color: #999;
}

.stats-section {
  margin: 20px;
  background: #fff;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin-bottom: 20px;
  display: block;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.stat-item {
  text-align: center;
  padding: 15px;
  background: linear-gradient(135deg, #f5f5f5, #e8e8e8);
  border-radius: 12px;
}

.stat-num {
  font-size: 24px;
  font-weight: bold;
  color: #1890ff;
  display: block;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 12px;
  color: #666;
}

.recent-section {
  margin: 20px;
  background: #fff;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.more-link {
  font-size: 14px;
  color: #1890ff;
}

.patient-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.patient-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 12px;
  transition: background-color 0.3s ease;
}

.patient-item:active {
  background-color: #e9ecef;
}

.patient-info {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.patient-name {
  font-size: 16px;
  font-weight: 500;
  color: #333;
}

.patient-phone {
  font-size: 14px;
  color: #666;
}

.patient-time {
  font-size: 12px;
  color: #999;
}

.empty-tip {
  text-align: center;
  padding: 40px;
  color: #999;
  font-size: 14px;
}
</style>