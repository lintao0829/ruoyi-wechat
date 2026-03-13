<template>
  <view class="container">
    <!-- 医生端视图 -->
    <DoctorHome v-if="userType === 0" :userInfo="userInfo" />

    <!-- 用户端视图 -->
    <template v-else>
      <view class="header">
        <image src="/static/img/fNL6xQg8c.jpeg" mode="aspectFill" class="header-bg"></image>
        <view class="header-content">
          <text class="title">CP健康码平台</text>
          <text class="subtitle">"ABCOS"慢病管理理念推广</text>
        </view>
      </view>
      <view class="qrcode-container">
        <view class="qrcode">
          <image src="/static/logo.png" mode="aspectFit" style="width: 200px; height: 200px;"></image>
        </view>
        <text class="qrcode-text">未登录或者未绑定医生，无法展示您的健康码</text>
      </view>

      <!-- 医生留言模块 -->
      <view class="doctor-message">
        <view class="message-header">
          <view class="header-left">
            <text class="message-title">医生留言</text>
            <text class="message-subtitle">您的健康管理建议</text>
          </view>
        </view>

        <!-- 有患者信息时显示 -->
        <view class="patient-info-card" v-if="patientData.patientId">
          <!-- 基础信息卡片 -->
          <view class="info-card">
            <view class="info-row">
              <view class="info-item">
                <text class="info-label">主治医师</text>
                <text class="info-value primary">{{ patientData.doctorName || '-' }}</text>
              </view>
              <view class="info-item">
                <text class="info-label">就诊时间</text>
                <text class="info-value">{{ patientData.visitTime || '-' }}</text>
              </view>
            </view>
          </view>

          <!-- 病历图片 -->
          <view class="section" v-if="medicalRecordImgList && medicalRecordImgList.length > 0">
            <view class="section-header">
              <uni-icons type="image" size="16" color="#1890ff"></uni-icons>
              <text class="section-title">病历图片</text>
            </view>
            <scroll-view class="img-scroll" scroll-x="true">
              <view class="img-list">
                <image v-for="(img, index) in medicalRecordImgList" :key="index" :src="img.url" class="medical-img"
                  mode="aspectFill" @click="previewImg(index)"></image>
              </view>
            </scroll-view>
          </view>

          <!-- 诊断结果 -->
          <view class="section diagnosis-section" v-if="patientData.diagnosisResult">
            <view class="section-header">
              <uni-icons type="flag" size="16" color="#ff4d4f"></uni-icons>
              <text class="section-title">诊断结果</text>
            </view>
            <view class="diagnosis-box">
              <text class="diagnosis-text">{{ patientData.diagnosisResult }}</text>
            </view>
          </view>

          <!-- 治疗建议 -->
          <view class="section" v-if="patientData.treatmentSuggestion">
            <view class="section-header">
              <uni-icons type="chatbubble" size="16" color="#52c41a"></uni-icons>
              <text class="section-title">治疗建议</text>
            </view>
            <view class="suggestion-box">
              <text class="suggestion-text">{{ patientData.treatmentSuggestion }}</text>
            </view>
          </view>

          <!-- 病例备注 -->
          <view class="section" v-if="patientData.remark">
            <view class="section-header">
              <uni-icons type="file" size="16" color="#fa8c16"></uni-icons>
              <text class="section-title">病例备注</text>
            </view>
            <view class="remark-box">
              <text class="remark-text">{{ patientData.remark }}</text>
            </view>
          </view>

          <!-- 更新时间 -->
          <view class="update-time" v-if="patientData.updateTime">
            <uni-icons type="time" size="12" color="#999"></uni-icons>
            <text>更新于 {{ patientData.updateTime }}</text>
          </view>
        </view>

        <!-- 无患者信息时显示空状态 -->
        <view class="empty-state" v-else-if="!isLogin">
          <image src="/static/img/fNL9ufsp0.jpeg" mode="aspectFit" class="empty-img"></image>
          <text class="empty-text">请先登录查看医生留言~</text>
          <button class="login-btn" @click="goToLogin">立即登录</button>
        </view>

        <!-- 登录后无患者信息 -->
        <view class="empty-state" v-else>
          <image src="/static/img/fNL9ufsp0.jpeg" mode="aspectFit" class="empty-img"></image>
          <text class="empty-text">暂无医生留言~</text>
        </view>
      </view>
    </template>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import DoctorHome from '@/components/DoctorHome.vue';

// 用户类型：0-医生，1-用户
const userType = ref(1);
// 登录状态
const isLogin = ref(false);
// 用户信息
const userInfo = ref({});
// 患者数据
const patientData = ref({});
// 病历图片列表
const medicalRecordImgList = ref([]);

// 页面加载
onMounted(() => {
  getUserInfo();
});

// 页面显示
onShow(() => {
  getUserInfo();
});

// 获取用户信息
const getUserInfo = () => {
  const token = uni.getStorageSync('token');
  if (!token) {
    userType.value = 1;
    isLogin.value = false;
    return;
  }
  isLogin.value = true;

  uni.request({
    url: 'https://yiliao.admin.php7788.com/prod-api/system/user/profile',
    method: 'GET',
    timeout: 10000,
    header: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    },
    success: (res) => {
      if (res.statusCode === 200) {
        const datass = res.data;
        if (datass.code === 200 || datass.code === 0) {
          userInfo.value = datass.data;
          // 根据userType判断：0是医生，1是用户
          userType.value = datass.data.userType === 0 ? 0 : 1;
          uni.setStorageSync('userInfo', datass.data);
          getPatientInfo(datass.data.patientId);
        }
      }
    },
    fail: (err) => {
      console.error('获取用户信息失败:', err);
    }
  });
};

const goToLogin = () => {
  uni.navigateTo({
    url: '/packageA/login/login'
  });
};

// 获取患者信息
const getPatientInfo = (patientId) => {
  uni.request({
    url: 'https://yiliao.admin.php7788.com/prod-api/system/patient/' + patientId,
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
          patientData.value = data.data || {};
          // 处理病历图片的回显
          medicalRecordImgList.value = [];
          if (patientData.value.imgUrl) {
            const imgUrls = patientData.value.imgUrl.split(',').filter(url => url.trim());
            medicalRecordImgList.value = imgUrls.map(url => {
              let imgUrl = url.trim();
              // 如果已经是完整URL，直接返回
              if (imgUrl.startsWith('http')) {
                return { url: imgUrl };
              }
              // 去掉开头的 / 和 ` 符号，然后拼接
              imgUrl = imgUrl.replace(/^[\/`]+/, '');
              return { url: 'https://yiliao.admin.php7788.com/prod-api/' + imgUrl };
            });
          }
        }
      }
    },
    fail: (err) => {
      console.error('获取患者信息失败:', err);
    }
  });
};

// 预览图片
const previewImg = (currentIndex) => {
  const urls = medicalRecordImgList.value.map(img => img.url);
  uni.previewImage({
    current: currentIndex,
    urls: urls
  });
};
</script>

<style scoped>
.container {
  flex: 1;
  background-color: #f5f5f5;
  padding-bottom: 60px;
}

.header {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.header-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
}

.header-content {
  position: relative;
  z-index: 1;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(to bottom, rgba(30, 136, 229, 0.3), rgba(30, 136, 229, 0.6));
}

.title {
  font-size: 28px;
  font-weight: bold;
  color: white;
  margin-bottom: 10px;
  display: block;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.subtitle {
  font-size: 16px;
  color: white;
  display: block;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.qrcode-container {
  background-color: white;
  margin: 10px;
  padding: 30px 20px;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.qrcode {
  margin-bottom: 20px;
}

.qrcode-text {
  color: #666;
  font-size: 14px;
  line-height: 1.5;
}

.info-btn {
  background-color: #1E88E5;
  color: white;
  margin: 0 20px;
  padding: 15px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: bold;
}

.btn-text {
  margin-left: 10px;
}

.doctor-message {
  margin: 10px;
  padding: 20px;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.message-title {
  font-size: 18px;
  font-weight: bold;
  color: #333;
  margin-bottom: 20px;
  display: block;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 30px 0;
}

.empty-img {
  width: 200px;
  height: 150px;
  margin-bottom: 20px;
}

/* 医生留言头部 */
.message-header {
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.header-left {
  flex: 1;
}

.message-title {
  font-size: 18px;
  font-weight: bold;
  color: #333;
  display: block;
}

.message-subtitle {
  font-size: 13px;
  color: #999;
  margin-top: 5px;
  display: block;
}

/* 基础信息卡片 */
.info-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 15px;
}

.info-card .info-row {
  display: flex;
  gap: 20px;
  border-bottom: none;
  padding: 0;
}

.info-card .info-item {
  flex: 1;
}

.info-card .info-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 6px;
}

.info-card .info-value {
  font-size: 16px;
  color: #fff;
  font-weight: bold;
}

.info-card .info-value.primary {
  color: #ffd700;
}

/* 区块通用样式 */
.section {
  background-color: #fff;
  border-radius: 10px;
  padding: 15px;
  margin-bottom: 12px;
  border: 1px solid #f0f0f0;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.section-title {
  font-size: 15px;
  font-weight: bold;
  color: #333;
}

/* 诊断结果 */
.diagnosis-section {
  background: linear-gradient(to right, #fff7e6, #fff);
  border-left: 3px solid #ff4d4f;
}

.diagnosis-box {
  background-color: #fff;
  padding: 12px;
  border-radius: 8px;
}

.diagnosis-text {
  font-size: 15px;
  color: #333;
  line-height: 1.6;
}

/* 治疗建议 */
.suggestion-box {
  background-color: #f6ffed;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #b7eb8f;
}

.suggestion-text {
  font-size: 14px;
  color: #389e0d;
  line-height: 1.6;
}

/* 病例备注 */
.remark-box {
  background-color: #fffbe6;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #ffe58f;
}

.remark-text {
  font-size: 14px;
  color: #d48806;
  line-height: 1.6;
}

/* 患者信息卡片 */
.patient-info-card {
  background-color: #f8f9fa;
  border-radius: 12px;
  padding: 5px;
}

/* 病历图片区域 */
.img-scroll {
  width: 100%;
  white-space: nowrap;
  margin-top: 10px;
}

.img-list {
  display: flex;
  gap: 10px;
}

.medical-img {
  width: 120px;
  height: 120px;
  border-radius: 8px;
  flex-shrink: 0;
  border: 1px solid #eee;
}

/* 信息行 */
.info-row {
  display: flex;
  flex-direction: column;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.info-row:last-of-type {
  border-bottom: none;
}

.info-row.highlight {
  background-color: #fff7e6;
  margin: 0 -15px;
  padding: 15px;
  border-radius: 8px;
  border-bottom: none;
  border-left: 3px solid #fa8c16;
}

.info-label {
  font-size: 13px;
  color: #999;
  margin-bottom: 6px;
  display: block;
}

.info-value {
  font-size: 15px;
  color: #333;
  line-height: 1.6;
  display: block;
}

.info-row.highlight .info-value {
  color: #fa8c16;
  font-weight: 500;
}

/* 更新时间 */
.update-time {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 5px;
  margin-top: 15px;
  padding-top: 10px;
  border-top: 1px dashed #eee;
  font-size: 12px;
  color: #999;
}

.empty-text {
  font-size: 16px;
  color: #666;
}

.login-btn {
  margin-top: 20px;
  padding: 10px 40px;
  background: linear-gradient(135deg, #1E88E5, #1565C0);
  color: #fff;
  border-radius: 25px;
  font-size: 15px;
  border: none;
}
</style>
