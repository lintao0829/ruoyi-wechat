<template>
  <view class="container">
    <!-- 页面标题 -->
    <view class="page-header">
      <text class="page-title">我的医生</text>
      <text class="page-subtitle">您的专属健康管理顾问</text>
    </view>

    <!-- 医生列表 -->
    <view class="doctor-list">
      <view class="doctor-card" v-for="(doctor, index) in doctorList" :key="index">
        <!-- 头部信息 -->
        <view class="card-header">
          <view class="avatar-section">
            <image :src="'https://yiliao.admin.php7788.com/prod-api/' + doctor.doctorImg" class="doctor-avatar" mode="aspectFill"></image>
            <view class="avatar-decoration"></view>
          </view>
          <view class="doctor-info">
            <text class="doctor-name">{{ doctor.userName || '医生' }}</text>
            <view class="doctor-title-row">
              <text class="doctor-title">{{ doctor.nickName || '医生' }}</text>
              <text class="separator">|</text>
              <text class="doctor-dept">{{ doctor.department || '内科' }}</text>
            </view>
            <text class="doctor-hospital">
              <uni-icons type="location" size="12" color="#666"></uni-icons>
              {{ doctor.hospital || '医生名片' }}
            </text>
          </view>
        </view>

        <!-- 医生标签 -->
        <view class="tags-section" v-if="doctor.skills && doctor.skills.length > 0">
          <view class="tag" v-for="(skill, sIndex) in doctor.skills" :key="sIndex">
            <uni-icons type="star" size="10" color="#fff"></uni-icons>
            <text class="tag-text">{{ skill }}</text>
          </view>
        </view>

        <!-- 医生简介 -->
        <view class="intro-section" v-if="doctor.introduction">
          <view class="section-header">
            <uni-icons type="file" size="16" color="#1890ff"></uni-icons>
            <text class="section-title">医生简介</text>
          </view>
          <text class="intro-content">{{ doctor.introduction }}</text>
        </view>

        <!-- 擅长领域 -->
        <view class="skill-section" v-if="doctor.expertIn && doctor.expertIn.length > 0">
          <view class="section-header">
            <uni-icons type="star" size="16" color="#fa8c16"></uni-icons>
            <text class="section-title">擅长领域</text>
          </view>
          <view class="skill-grid">
            <view class="skill-item" v-for="(skill, sIndex) in doctor.expertIn" :key="sIndex">
              <view class="skill-dot"></view>
              <text class="skill-text">{{ skill }}</text>
            </view>
          </view>
        </view>

        <!-- 联系方式 -->
        <view class="contact-section">
          <!-- <view class="section-header">
            <uni-icons type="phone" size="16" color="#52c41a"></uni-icons>
            <text class="section-title">联系方式</text>
          </view> -->
          <!-- <view class="contact-grid"> -->
            <!-- <view class="contact-item" v-if="doctor.phonenumber">
              <image src="/static/icon/lianxidianhua.png" class="contact-icon-img"></image>
              <view class="contact-info">
                <text class="contact-label">联系电话</text>
                <text class="contact-value">{{ doctor.phonenumber }}</text>
              </view>
              <uni-icons type="right" size="14" color="#ccc"></uni-icons>
            </view> -->
            <!-- <view class="contact-item" v-if="doctor.email">
              <image src="/static/icon/youxiang.png" class="contact-icon-img"></image>
              <view class="contact-info">
                <text class="contact-label">邮箱</text>
                <text class="contact-value">{{ doctor.email }}</text>
              </view>
            </view> -->
          <!-- </view> -->
        </view>

        <!-- 操作按钮 -->
        <!-- <view class="action-buttons">
          <view class="action-btn primary" @click="makeAppointment(doctor)">
            <uni-icons type="calendar" size="16" color="#fff"></uni-icons>
            <text>预约挂号</text>
          </view>
          <view class="action-btn secondary" @click="onlineConsult(doctor)">
            <uni-icons type="chat" size="16" color="#1890ff"></uni-icons>
            <text>在线咨询</text>
          </view>
        </view> -->
      </view>
    </view>

    <!-- 无医生提示 -->
    <view class="empty-section" v-if="doctorList.length === 0 && !loading">
      <image src="/static/icon/no-data.png" class="empty-icon" mode="aspectFit"></image>
      <text class="empty-title">暂无绑定医生</text>
      <text class="empty-desc">绑定医生后即可查看医生信息</text>
    </view>

    <!-- 加载中 -->
    <view class="loading-section" v-if="loading">
      <view class="loading-spinner"></view>
      <text class="loading-text">加载中...</text>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';

const doctorList = ref([]);
const loading = ref(false);

onLoad((options) => {
  const doctorIdListStr = options.doctorIdList;
  if (doctorIdListStr) {
    try {
      const doctorIdList = JSON.parse(decodeURIComponent(doctorIdListStr));
      if (doctorIdList && doctorIdList.length > 0) {
        getDoctorInfo(doctorIdList);
        return;
      }
    } catch (e) {
      console.error('解析doctorIdList失败:', e);
    }
  }
  loading.value = false;
  uni.showToast({ title: '暂无绑定医生', icon: 'none' });
});

const getDoctorInfo = (doctorIdList) => {
  loading.value = true;
  uni.request({
    url: 'https://yiliao.admin.php7788.com/prod-api/system/user/selectDoctorIdList',
    method: 'POST',
    timeout: 10000,
    header: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + uni.getStorageSync('token')
    },
    data: { doctorId: doctorIdList },
    success: (res) => {
      loading.value = false;
      if (res.statusCode === 200) {
        const data = res.data;
        if (data.code === 200 || data.code === 0) {
          doctorList.value = data.data || [];
        }
      }
    },
    fail: (err) => {
      loading.value = false;
      console.error('获取医生列表失败:', err);
    }
  });
};

const getAvatar = (avatar) => {
  if (!avatar) return '/static/logo.png';
  if (avatar.startsWith('http')) return avatar;
  return 'https://yiliao.admin.php7788.com/prod-api/' + avatar.replace(/\/+/g, '/');
};

// const callPhone = (phone) => {
//   uni.makePhoneCall({ phoneNumber: phone });
// };

// const makeAppointment = (doctor) => {
//   uni.showToast({ title: '预约功能开发中', icon: 'none' });
// };

// const onlineConsult = (doctor) => {
//   uni.showToast({ title: '咨询功能开发中', icon: 'none' });
// };
</script>

<style scoped>
.container {
  min-height: 100vh;
  background-color: #f5f7fa;
  padding-bottom: 30px;
}

/* 页面头部 */
.page-header {
  background: linear-gradient(135deg, #1a89ff 0%, #36cfc9 100%);
  padding: 30px 20px 50px;
  text-align: center;
}

.page-title {
  font-size: 24px;
  font-weight: bold;
  color: #fff;
  display: block;
}

.page-subtitle {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
  margin-top: 8px;
  display: block;
}

/* 医生列表 */
.doctor-list {
  padding: 0 15px;
  margin-top: -30px;
}

/* 医生卡片 */
.doctor-card {
  background-color: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  margin-bottom: 20px;
  overflow: hidden;
}

/* 卡片头部 */
.card-header {
  display: flex;
  padding: 20px;
  background: linear-gradient(135deg, #f0f9ff 0%, #e6f7ff 100%);
  border-bottom: 1px solid #f0f0f0;
}

.avatar-section {
  position: relative;
  margin-right: 15px;
}

.doctor-avatar {
  width: 85px;
  height: 85px;
  /* border-radius: 50%; */
  border: 3px solid #fff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.avatar-decoration {
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 20px;
  height: 20px;
  background: linear-gradient(135deg, #52c41a, #73d13d);
  border-radius: 50%;
  border: 2px solid #fff;
}

.doctor-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.doctor-name {
  font-size: 20px;
  font-weight: bold;
  color: #333;
  margin-bottom: 6px;
}

.doctor-title-row {
  display: flex;
  align-items: center;
  margin-bottom: 6px;
}

.doctor-title {
  font-size: 14px;
  color: #1890ff;
  font-weight: 500;
}

.separator {
  margin: 0 8px;
  color: #ddd;
}

.doctor-dept {
  font-size: 14px;
  color: #666;
}

.doctor-hospital {
  font-size: 13px;
  color: #999;
  display: flex;
  align-items: center;
  gap: 4px;
}

/* 标签区域 */
.tags-section {
  padding: 15px 20px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  border-bottom: 1px solid #f5f5f5;
}

.tag {
  display: flex;
  align-items: center;
  gap: 4px;
  background: linear-gradient(135deg, #1890ff, #69c0ff);
  padding: 6px 12px;
  border-radius: 20px;
}

.tag-text {
  font-size: 12px;
  color: #fff;
}

/* 简介区域 */
.intro-section {
  padding: 20px;
  border-bottom: 1px solid #f5f5f5;
}

.section-header {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.section-title {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin-left: 8px;
}

.intro-content {
  font-size: 14px;
  color: #666;
  line-height: 1.8;
}

/* 擅长领域 */
.skill-section {
  padding: 20px;
  border-bottom: 1px solid #f5f5f5;
}

.skill-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.skill-item {
  display: flex;
  align-items: center;
  background-color: #fff7e6;
  padding: 10px 14px;
  border-radius: 8px;
  border: 1px solid #ffd591;
}

.skill-dot {
  width: 6px;
  height: 6px;
  background-color: #fa8c16;
  border-radius: 50%;
  margin-right: 8px;
}

.skill-text {
  font-size: 13px;
  color: #fa8c16;
}

/* 联系方式 */
.contact-section {
  padding: 20px;
  border-bottom: 1px solid #f5f5f5;
}

.contact-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.contact-item {
  display: flex;
  align-items: center;
  padding: 12px;
  background-color: #fafafa;
  border-radius: 10px;
}

.contact-icon-img {
  width: 28px;
  height: 28px;
  margin-right: 12px;
  flex-shrink: 0;
}

.contact-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.contact-label {
  font-size: 12px;
  color: #999;
  margin-bottom: 2px;
}

.contact-value {
  font-size: 14px;
  color: #333;
}

/* 操作按钮 */
.action-buttons {
  display: flex;
  padding: 20px;
  gap: 15px;
}

.action-btn {
  flex: 1;
  height: 46px;
  border-radius: 23px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 500;
}

.action-btn.primary {
  background: linear-gradient(135deg, #1890ff, #36cfc9);
  color: #fff;
  box-shadow: 0 4px 15px rgba(24, 144, 255, 0.3);
}

.action-btn.secondary {
  background-color: #fff;
  color: #1890ff;
  border: 1px solid #1890ff;
}

/* 空状态 */
.empty-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
}

.empty-icon {
  width: 200px;
  height: 150px;
  margin-bottom: 20px;
}

.empty-title {
  font-size: 18px;
  color: #333;
  font-weight: bold;
  margin-bottom: 10px;
}

.empty-desc {
  font-size: 14px;
  color: #999;
}

/* 加载中 */
.loading-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60px 20px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f0f0f0;
  border-top-color: #1890ff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-text {
  margin-top: 15px;
  font-size: 14px;
  color: #999;
}
</style>
