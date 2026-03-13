<template>
  <view class="container">
    <view class="header">
      <text class="title">评分档案</text>
      <text class="subtitle">守护健康更安心</text>
    </view>
    <view class="health-score-card">
      <view class="health-score-header">
        <text class="score-title">健康评分</text>
        <u--button type="primary" shape="circle" @click="goToHealth" plain>重新填写</u--button>
      </view>
      <view class="score-cards">
        <view class="score-card">
          <view class="icon-text">
            <image src="/static/icon/tanghua.png" class="score-icon"></image>
            <text class="score-label">糖化</text>
          </view>
          <text class="score-value">0分</text>
        </view>
        <view class="score-card">
          <view class="icon-text">
            <image src="/static/icon/xieya.png" class="score-icon"></image>
            <text class="score-label">血压</text>
          </view>
          <text class="score-value">0分</text>
        </view>
        <view class="score-card">
          <view class="icon-text">
            <image src="/static/icon/xiezhi1.png" class="score-icon"></image>
            <text class="score-label">血脂</text>
          </view>
          <text class="score-value">0分</text>
        </view>
        <view class="score-card">
          <view class="icon-text">
            <image src="/static/icon/tizhong.png" class="score-icon"></image>
            <text class="score-label">体重</text>
          </view>
          <text class="score-value">0分</text>
        </view>
        <view class="score-card">
          <view class="icon-text">
            <image src="/static/icon/kongyan.png" class="score-icon"></image>
            <text class="score-label">控烟</text>
          </view>
          <text class="score-value">0分</text>
        </view>
      </view>
    </view>
    <view class="history-section">
      <text class="history-title">历史评分记录</text>
      <view class="history-list">
        <view class="history-item">
          <text class="history-date">2024-03-01</text>
          <text class="history-score">总分: 2分</text>
        </view>
        <view class="history-item">
          <text class="history-date">2024-02-15</text>
          <text class="history-score">总分: 3分</text>
        </view>
        <view class="history-item">
          <text class="history-date">2024-01-20</text>
          <text class="history-score">总分: 1分</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { onShow } from '@dcloudio/uni-app';

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
  }
});

const goToHealth = () => {
  uni.navigateTo({
    url: '/pages/health/health'
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

.rewrite-btn {
  border-radius: 20px;
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
}

.history-date {
  font-size: 14px;
  color: #666;
}

.history-score {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}
</style>