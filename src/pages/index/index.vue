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
          <image :src="isLogin ? riskLevelImage : '/static/logo.png'" mode="aspectFit"
            :style="isLogin ? 'width: 300px; height: 120px;' : 'width: 200px; height: 200px;'"></image>
        </view>
        <text class="qrcode-text">{{ isLogin ? riskLevelText : '未登录或者未绑定医生，无法展示您的健康码' }}</text>
      </view>

      <!-- 医生留言模块 -->
      <view class="doctor-message">
        <view class="message-header">
          <view class="header-left">
            <text class="message-title">就诊记录</text>
            <text class="message-subtitle">您的健康管理建议</text>
          </view>
        </view>

        <!-- 就诊记录卡片列表 -->
        <view class="record-cards">
          <view class="record-card" v-for="(record, index) in medicalRecords" :key="record.recordId">
            <!-- 卡片头部 -->
            <view class="card-header">
              <view class="card-info">
                <text class="card-title">就诊记录 {{ index + 1 }}</text>
                <text class="card-time">{{ record.createTime }}</text>
              </view>
              <text class="risk-badge" :class="getRiskClass(record.riskLevel)">{{ record.riskLevel }}</text>
            </view>

            <!-- 评分结果 -->
            <view class="card-section score-section">
              <view class="section-header">
                <uni-icons type="star-filled" size="14" color="#1890ff"></uni-icons>
                <text class="section-title">评分结果</text>
              </view>
              <view class="score-content">
                <view class="score-item">
                  <text class="score-label">总评分</text>
                  <text class="score-value" :class="getScoreClass(record.totalScore)">{{ record.totalScore }}分</text>
                </view>
                <view class="score-detail">
                  <text class="detail-item">血糖: {{ record.sugarScore }}分</text>
                  <text class="detail-item">血压: {{ record.pressureScore }}分</text>
                  <text class="detail-item">血脂: {{ record.ldlScore }}分</text>
                  <text class="detail-item">BMI: {{ record.bmiScore }}分</text>
                  <text class="detail-item">吸烟: {{ record.smokingScore }}分</text>
                </view>
              </view>
            </view>

            <!-- 诊断结果 -->
            <view class="card-section" v-if="record.diagnosisResult">
              <view class="section-header">
                <uni-icons type="flag-filled" size="14" color="#ff4d4f"></uni-icons>
                <text class="section-title">诊断结果</text>
              </view>
              <view class="section-content diagnosis-content">
                <text class="section-text">{{ record.diagnosisResult }}</text>
              </view>
            </view>

            <!-- 治疗建议 -->
            <view class="card-section" v-if="record.treatmentSuggestion">
              <view class="section-header">
                <uni-icons type="chatbubble-filled" size="14" color="#52c41a"></uni-icons>
                <text class="section-title">治疗建议</text>
              </view>
              <view class="section-content suggestion-content">
                <text class="section-text">{{ record.treatmentSuggestion }}</text>
              </view>
            </view>

            <!-- 病历图片 -->
            <view class="card-section" v-if="record.imgList && record.imgList.length > 0">
              <view class="section-header">
                <uni-icons type="image-filled" size="14" color="#1890ff"></uni-icons>
                <text class="section-title">病历图片</text>
              </view>
              <view class="img-container">
                <scroll-view class="img-scroll" scroll-x="true">
                  <view class="img-list">
                    <image v-for="(img, imgIndex) in record.imgList" :key="imgIndex" :src="img" class="medical-img"
                      mode="aspectFill" @click="previewRecordImg(record.imgList, imgIndex)"></image>
                  </view>
                </scroll-view>
              </view>
            </view>
          </view>
        </view>
      </view>
    </template>
  </view>
</template>

<script setup>
import { ref } from 'vue';
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
// 风险等级图片
const riskLevelImage = ref('/static/logo.png');
// 风险等级文字
const riskLevelText = ref('请先登录查看健康码');
// 就诊记录列表（假数据）
const medicalRecords = ref([
  // {
  //   recordId: 15,
  //   createTime: '2026-03-20 21:40:02',
  //   totalScore: 5,
  //   riskLevel: '高危',
  //   sugarScore: 0,
  //   pressureScore: 0,
  //   ldlScore: 2,
  //   bmiScore: 2,
  //   smokingScore: 1,
  //   diagnosisResult: '患者血糖控制不佳，血压正常，血脂偏高，BMI超标，吸烟量较大。综合评估为高危人群，需要立即采取干预措施。',
  //   treatmentSuggestion: '1. 建议立即戒烟，减少心血管风险因素\n2. 控制血糖，定期监测空腹及餐后血糖\n3. 调整饮食结构，减少高脂高糖食物摄入\n4. 增加有氧运动，每周至少150分钟中等强度运动\n5. 定期复查血脂，必要时启动降脂治疗',
  //   imgList: [
  //     'https://yiliao.admin.php7788.com/profile/record/2026/03/20/2b812402-df53-4470-abd3-18428b548abc_20260320213959A013.png',
  //     'https://yiliao.admin.php7788.com/profile/record/2026/03/20/04c1408b-0545-4299-adc0-ddc2564eb2aa_20260320214746A014.png'
  //   ]
  // },
  // {
  //   recordId: 13,
  //   createTime: '2026-03-20 17:18:06',
  //   totalScore: 7,
  //   riskLevel: '高危',
  //   sugarScore: 2,
  //   pressureScore: 0,
  //   ldlScore: 2,
  //   bmiScore: 2,
  //   smokingScore: 1,
  //   diagnosisResult: '诊断结果修改：患者近期血糖波动较大，血压控制良好，血脂水平持续偏高，体重超标情况未改善，吸烟习惯仍未戒除。',
  //   treatmentSuggestion: '治疗建议修改：\n1. 加强血糖监测频率，建议每日监测4次\n2. 调整降糖药物方案，考虑加用二甲双胍\n3. 严格控制饮食，减少碳水化合物摄入\n4. 建议参加戒烟门诊，获取专业戒烟指导\n5. 每月复诊一次，评估治疗效果',
  //   imgList: [
  //     'https://yiliao.admin.php7788.com/profile/record/2026/03/20/123_20260320210522A008.png',
  //     'https://yiliao.admin.php7788.com/profile/record/2026/03/20/avator_20260320210903A009.png',
  //     'https://yiliao.admin.php7788.com/profile/record/2026/03/20/img_20260320210908A010.jpeg'
  //   ]
  // }
]);

// 页面加载
// onMounted(() => {
//   getUserInfo();
// });

// 页面显示
onShow(() => {
  getUserInfo();
});
// 获取就诊记录
const getRecordList = (patientId) => {
  if (!patientId) {
    return;
  }
  uni.request({
    url: 'https://yiliao.admin.php7788.com/prod-api/system/patient/' + patientId,
    method: 'GET',
    timeout: 10000,
    header: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + uni.getStorageSync('token')
    },
    success: (res) => {
      console.log(res);

      if (res.data.code === 200) {
        medicalRecords.value = res.data.data.list || [];
      }
    }
  })
}
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
      console.log(res, 'res=====用户信息')
      if (res.data.code === 200) {
          userInfo.value = res.data.data;
          // 根据userType判断：0是医生，1是用户
          userType.value = res.data.data.userType === 0 ? 0 : 1;
          uni.setStorageSync('userInfo', res.data.data);
          // getPatientInfo(res.data.data.patientId);
          getRecordList(res.data.data.patientId);
          getScoreRecord(res.data.data.patientId);
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
// const getPatientInfo = (patientId) => {
//   if (!patientId) {
//     return;
//   }

//   uni.request({
//     url: 'https://yiliao.admin.php7788.com/prod-api/system/patient/' + patientId,
//     method: 'GET',
//     timeout: 10000,
//     header: {
//       'Content-Type': 'application/json',
//       'Authorization': 'Bearer ' + uni.getStorageSync('token')
//     },
//     success: (res) => {
//       if (res.statusCode === 200) {
//         const data = res.data;
//         if (data.code === 200 || data.code === 0) {
//           patientData.value = data.data || {};
//           // 处理病历图片的回显
//           medicalRecordImgList.value = [];
//           if (patientData.value.imgUrl) {
//             const imgUrls = patientData.value.imgUrl.split(',').filter(url => url.trim());
//             medicalRecordImgList.value = imgUrls.map(url => {
//               let imgUrl = url.trim();
//               // 如果已经是完整 URL，直接返回
//               if (imgUrl.startsWith('http')) {
//                 return { url: imgUrl };
//               }
//               // 去掉开头的 / 和 ` 符号，然后拼接
//               imgUrl = imgUrl.replace(/^[\/`]+/, '');
//               return { url: 'https://yiliao.admin.php7788.com/prod-api/' + imgUrl };
//             });
//           }

//           // 获取最新评分记录
//           getScoreRecord(patientId);
//         }
//       }
//     },
//     fail: (err) => {
//       console.error('获取患者信息失败:', err);
//     }
//   });
// };

// 获取评分记录
const getScoreRecord = (patientId) => {
  uni.request({
    url: 'https://yiliao.admin.php7788.com/prod-api/system/score/record/list?patientId=' + patientId,
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
          const records = data.rows || [];
          if (records.length > 0) {
            const latestRecord = records[0];
            const totalScore = latestRecord.totalScore || 0;

            // 根据总分设置风险等级图片和文字
            if (totalScore <= 1) {
              riskLevelImage.value = '/static/img/1.jpeg'; // 低危：0-1 分
              riskLevelText.value = '低危：0-1 分';
            } else if (totalScore <= 4) {
              riskLevelImage.value = '/static/img/3.jpeg'; // 中危：2-4 分
              riskLevelText.value = '中危：2-4 分';
            } else if (totalScore <= 7) {
              riskLevelImage.value = '/static/img/4.jpeg'; // 高危：5-7 分
              riskLevelText.value = '高危：5-7 分';
            } else {
              riskLevelImage.value = '/static/img/2.jpeg'; // 很高危：8-10 分（红色）
              riskLevelText.value = '很高危：8-10 分';
            }
          } else {
            riskLevelImage.value = '/static/img/1.jpeg';
            riskLevelText.value = '暂无评分记录';
          }
        }
      }
    },
    fail: (err) => {
      console.error('获取评分记录失败:', err);
      riskLevelImage.value = '/static/img/1.jpeg';
      riskLevelText.value = '暂无评分记录';
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

// 预览就诊记录图片
const previewRecordImg = (imgList, currentIndex) => {
  uni.previewImage({
    current: currentIndex,
    urls: imgList
  });
};

// 获取风险等级样式类
const getRiskClass = (riskLevel) => {
  switch (riskLevel) {
    case '低危':
      return 'risk-low';
    case '中危':
      return 'risk-medium';
    case '高危':
      return 'risk-high';
    case '很高危':
      return 'risk-very-high';
    default:
      return 'risk-normal';
  }
};

// 获取评分样式类
const getScoreClass = (score) => {
  if (score <= 1) return 'score-low';
  if (score <= 4) return 'score-medium';
  if (score <= 7) return 'score-high';
  return 'score-very-high';
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

/* 就诊记录卡片列表 */
.record-cards {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* 记录卡片 */
.record-card {
  background-color: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  border: 1px solid #f0f0f0;
}

/* 卡片头部 */
.card-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 16px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.card-title {
  font-size: 16px;
  font-weight: bold;
  color: #fff;
}

.card-time {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
}

.risk-badge {
  font-size: 12px;
  font-weight: bold;
  padding: 6px 14px;
  border-radius: 20px;
  background-color: rgba(255, 255, 255, 0.2);
  color: #fff;
}

.risk-badge.risk-low {
  background-color: rgba(82, 196, 26, 0.9);
}

.risk-badge.risk-medium {
  background-color: rgba(250, 173, 20, 0.9);
}

.risk-badge.risk-high {
  background-color: rgba(250, 140, 22, 0.9);
}

.risk-badge.risk-very-high {
  background-color: rgba(255, 77, 79, 0.9);
}

/* 卡片区块 */
.card-section {
  padding: 16px 20px;
  border-bottom: 1px solid #f5f5f5;
}

.card-section:last-child {
  border-bottom: none;
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

.section-content {
  background-color: #fafafa;
  padding: 14px;
  border-radius: 10px;
}

.section-text {
  font-size: 14px;
  color: #333;
  line-height: 1.8;
  white-space: pre-wrap;
}

/* 评分区块 */
.score-section {
  background-color: #f8faff;
}

.score-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.score-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background-color: #fff;
  border-radius: 10px;
  border: 1px solid #e8e8e8;
}

.score-label {
  font-size: 14px;
  color: #666;
}

.score-value {
  font-size: 20px;
  font-weight: bold;
}

.score-value.score-low {
  color: #52c41a;
}

.score-value.score-medium {
  color: #faad14;
}

.score-value.score-high {
  color: #fa8c16;
}

.score-value.score-very-high {
  color: #ff4d4f;
}

.score-detail {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.detail-item {
  font-size: 12px;
  color: #666;
  background-color: #fff;
  padding: 6px 12px;
  border-radius: 6px;
  border: 1px solid #e8e8e8;
}

/* 诊断结果 */
.diagnosis-content {
  background: linear-gradient(to right, #fff2f0, #fff);
  border-left: 3px solid #ff4d4f;
}

/* 治疗建议 */
.suggestion-content {
  background: linear-gradient(to right, #f6ffed, #fff);
  border-left: 3px solid #52c41a;
}

/* 病历图片区域 */
.img-container {
  margin-top: 10px;
}

.img-scroll {
  width: 100%;
  white-space: nowrap;
}

.img-list {
  display: flex;
  gap: 10px;
}

.medical-img {
  width: 100px;
  height: 100px;
  border-radius: 8px;
  flex-shrink: 0;
  border: 1px solid #eee;
}
</style>
