<template>
  <view class="container">
    <view class="header">
      <text class="title">评分档案</text>
      <text class="subtitle">守护健康更安心</text>
    </view>
    <view class="health-score-card">
      <view class="health-score-header">
        <text class="score-title">健康评分</text>
        <u--button type="primary" shape="circle" @click="goToHealth" plain>开始评分</u--button>
      </view>
      <view class="score-cards">
        <view class="score-card">
          <view class="icon-text">
            <image src="/static/icon/tanghua.png" class="score-icon"></image>
            <text class="score-label">糖化</text>
          </view>
          <text class="score-value">{{ currentRecord.sugarScore || 0 }}分</text>
        </view>
        <view class="score-card">
          <view class="icon-text">
            <image src="/static/icon/xieya.png" class="score-icon"></image>
            <text class="score-label">血压</text>
          </view>
          <text class="score-value">{{ currentRecord.pressureScore || 0 }}分</text>
        </view>
        <view class="score-card">
          <view class="icon-text">
            <image src="/static/icon/xiezhi1.png" class="score-icon"></image>
            <text class="score-label">血脂</text>
          </view>
          <text class="score-value">{{ currentRecord.ldlScore || 0 }}分</text>
        </view>
        <view class="score-card">
          <view class="icon-text">
            <image src="/static/icon/tizhong.png" class="score-icon"></image>
            <text class="score-label">体重</text>
          </view>
          <text class="score-value">{{ currentRecord.bmiScore || 0 }}分</text>
        </view>
        <view class="score-card">
          <view class="icon-text">
            <image src="/static/icon/kongyan.png" class="score-icon"></image>
            <text class="score-label">控烟</text>
          </view>
          <text class="score-value">{{ currentRecord.smokingScore || 0 }}分</text>
        </view>
      </view>
      <view class="total-score">
        <text class="total-label">总评分</text>
        <text class="total-value">{{ currentRecord.totalScore || 0 }}分</text>
        <text class="risk-level" :class="riskLevelClass">{{ currentRecord.riskLevel || '低风险' }}</text>
      </view>
    </view>
    <view class="history-section">
      <text class="history-title">历史评分记录</text>
      <view class="history-list">
        <view class="history-item" v-for="record in historyRecords" :key="record.id"
          @click="viewRecordDetail(record.id)">
          <view class="history-info">
            <text class="history-date">{{ record.createTime }}</text>
            <text class="history-score">总分：{{ record.totalScore }}分</text>
          </view>
          <uni-icons type="arrowright" size="18" color="#999"></uni-icons>
        </view>
        <view class="empty-state" v-if="historyRecords.length === 0">
          <uni-icons type="document" size="64" color="#ccc"></uni-icons>
          <text class="empty-text">暂无评分记录</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue';
import { onShow } from '@dcloudio/uni-app';

const currentRecord = ref({});
const historyRecords = ref([]);
const patientId = ref(null);

// 风险等级样式类
const riskLevelClass = computed(() => {
  const level = currentRecord.value.riskLevel || '';
  if (level.includes('高')) return 'high';
  if (level.includes('中')) return 'medium';
  return 'low';
});

// 风险等级图片
const riskLevelImage = computed(() => {
  const score = currentRecord.value.totalScore || 0;
  // 根据总分判断风险等级图片
  if (score <= 1) {
    return '/static/img/1.jpeg'; // 低危：0-1 分
  } else if (score <= 4) {
    return '/static/img/3.jpeg'; // 中危：2-4 分
  } else if (score <= 7) {
    return '/static/img/4.jpeg'; // 高危：5-7 分
  } else {
    return '/static/img/2.jpeg'; // 很高危：8-10 分（红色）
  }
});

// 获取患者 ID
const getPatientId = () => {
  const userInfo = uni.getStorageSync('userInfo');
  const data = userInfo?.data || userInfo;
  // 从 userInfo 中获取 patientId
  patientId.value = data?.patientId || null;

  if (!patientId.value && data?.userId) {
    // 如果没有 patientId，尝试使用 userId 作为备选
    patientId.value = data.userId;
  }
};

// 获取历史评分记录
const fetchHistoryRecords = () => {
  if (!patientId.value) {
    console.error('未获取到 patientId');
    return;
  }

  uni.request({
    url: `https://yiliao.admin.php7788.com/prod-api/system/score/record/list?patientId=${patientId.value}`,
    method: 'GET',
    header: {
      'Authorization': 'Bearer ' + uni.getStorageSync('token')
    },
    success: (res) => {
      console.log(res, 'res=====历史评分记录')
      if (res.statusCode === 200 && (res.data.code === 200 || res.data.code === 0)) {
        const allRecords = res.data.rows || [];
        // 最多展示前 10 条
        historyRecords.value = allRecords.slice(0, 10);
        currentRecord.value = allRecords[0] || {};
      }
    },
    fail: () => {
      console.error('获取历史评分记录失败');
    }
  });
};

onShow(() => {
  const userInfo = uni.getStorageSync('userInfo');
  const userType = userInfo?.userType ?? userInfo?.data?.userType;

  if (userType === 0) {
    uni.showToast({
      title: '医生端无法访问此功能',
      icon: 'none'
    });
    setTimeout(() => {
      uni.switchTab({
        url: '/pages/index/index'
      });
    }, 1000);
    return;
  }

  // 获取 patientId
  getPatientId();

  // 获取最新记录和历史记录
  // fetchCurrentRecord();
  fetchHistoryRecords();
});

const goToHealth = () => {
  // 判断是否登录
  const token = uni.getStorageSync('token');
  const userInfo = uni.getStorageSync('userInfo');

  if (!token || !userInfo) {
    uni.showToast({
      title: '请先登录',
      icon: 'none'
    });
    setTimeout(() => {
      uni.navigateTo({
        url: '/packageA/login/login'
      });
    }, 1500);
    return;
  }

  // 判断是否为医生端
  const userType = userInfo?.userType ?? userInfo?.data?.userType;
  if (userType === 0) {
    uni.showToast({
      title: '医生端无法使用此功能',
      icon: 'none'
    });
    return;
  }

  uni.navigateTo({
    url: '/packageA/health/health'
  });
};

// 查看评分详情
const viewRecordDetail = (recordId) => {
  uni.request({
    url: `https://yiliao.admin.php7788.com/prod-api/system/score/record/${recordId}`,
    method: 'GET',
    header: {
      'Authorization': 'Bearer ' + uni.getStorageSync('token')
    },
    success: (res) => {
      if (res.statusCode === 200 && (res.data.code === 200 || res.data.code === 0)) {
        const record = res.data.data;
        const content = `
糖化：${record.sugarValue || 0}% (${record.sugarScore || 0}分)
血压：${record.systolicPressure || 0}/${record.diastolicPressure || 0}mmHg (${record.pressureScore || 0}分)
血脂：${record.ldlValue || 0}mmol/L (${record.ldlScore || 0}分)
体重：${record.height || 0}cm/${record.weight || 0}kg (${record.bmiScore || 0}分)
吸烟：${record.smokingCount || 0}支 (${record.smokingScore || 0}分)
总评分：${record.totalScore || 0}分
风险等级：${record.riskLevel || '-'}
        `.trim();

        uni.showModal({
          title: '评分详情',
          content: content,
          showCancel: false
        });
      }
    },
    fail: () => {
      uni.showToast({
        title: '获取详情失败',
        icon: 'none'
      });
    }
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
  background-color: #1E88E5;
  padding: 20px;
  text-align: center;
  color: white;
}

.title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 10px;
  display: block;
}

.subtitle {
  font-size: 14px;
  opacity: 0.9;
  display: block;
  background-color: #2196F3;
  padding: 5px 15px;
  border-radius: 20px;
  display: inline-block;
}

.health-score-card {
  background-color: white;
  padding: 10px;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.health-score-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.score-title {
  font-size: 18px;
  font-weight: bold;
  color: #333;
  display: block;
  width: 120%;
}

.score-cards {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  justify-content: space-between;
}

.score-card {
  width: 33%;
  background-color: #f5f5f5;
  padding: 20px;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.icon-text {
  display: flex;
  align-items: center;
  gap: 8px;
}

.score-icon {
  width: 24px;
  height: 24px;
}

.score-label {
  font-size: 18px;
  color: #333;
  font-weight: 500;
}

.score-value {
  font-size: 16px;
  font-weight: bold;
  color: #333;
}

.total-score {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background-color: #f0f8ff;
  border-radius: 8px;
  margin-top: 20px;
}

.total-label {
  font-size: 18px;
  font-weight: bold;
  color: #333;
}

.total-value {
  font-size: 24px;
  font-weight: bold;
  color: #1E88E5;
}

.risk-level {
  font-size: 16px;
  font-weight: bold;
  padding: 5px 15px;
  border-radius: 20px;
}

.risk-level.high {
  background-color: #ffcccc;
  color: #ff0000;
}

.risk-level.medium {
  background-color: #fff3cd;
  color: #ffc107;
}

.risk-level.low {
  background-color: #d4edda;
  color: #28a745;
}

.history-section {
  margin-top: 20px;
  background-color: white;
  padding: 10px;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.history-title {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin-bottom: 15px;
  display: block;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.history-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background-color: #f5f5f5;
  border-radius: 8px;
  cursor: pointer;
}

.history-info {
  flex: 1;
}

.history-date {
  font-size: 14px;
  color: #666;
  margin-bottom: 5px;
  display: block;
}

.history-score {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.empty-state {
  text-align: center;
  padding: 60px 0;
}

.empty-text {
  font-size: 14px;
  color: #999;
  margin-top: 15px;
  display: block;
}
</style>