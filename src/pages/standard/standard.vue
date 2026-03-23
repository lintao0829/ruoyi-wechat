<template>
  <view class="container">
    <view class="header">
      <text class="title">CP健康指数评分</text>
      <text class="subtitle">守护健康更安心</text>
    </view>
    <view class="content">
      <view class="standard-content">
        <text class="section-title">CP健康指数评分标准</text>
        <image src="/static/img/fNL2If31J.jpeg" mode="widthFix" class="standard-img"></image>
        <view class="risk-level">
          <text class="risk-item green">低危: 0~1分</text>
          <text class="risk-item yellow">中危: 2~4分</text>
          <text class="risk-item orange">高危: 5~7分</text>
          <text class="risk-item red">很高危: 8~10分</text>
        </view>
      </view>
      <view class="qrcode-list">
        <text class="section-title">"ABCOS"健康码</text>
        <view style="display: flex; justify-content: space-between; flex-wrap: nowrap; gap: 5px;">
          <view class="qrcode-item">
            <image src="/static/img/11.jpeg" mode="aspectFit" class="qrcode-img"></image>
            <text class="qrcode-label">低危</text>
          </view>
          <view class="qrcode-item">
            <image src="/static/img/22.jpeg" mode="aspectFit" class="qrcode-img"></image>
            <text class="qrcode-label">中危</text>
          </view>
          <view class="qrcode-item">
            <image src="/static/img/33.jpeg" mode="aspectFit" class="qrcode-img"></image>
            <text class="qrcode-label">高危</text>
          </view>
          <view class="qrcode-item">
            <image src="/static/img/44.jpeg" mode="aspectFit" class="qrcode-img"></image>
            <text class="qrcode-label">很高危</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
// 页面无数据和方法，使用空的script setup
</script>

<style scoped>
.container {
  flex: 1;
  background-color: #f5f5f5;
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

.standard-content {
  border-radius: 8px;
  background-color: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.section-title {
  font-size: 18px;
  font-weight: bold;
  color: #333;
  /* margin-bottom: 10px; */
  display: block;
  padding-bottom: 10px;
  padding-left: 10px;
}

.standard-img {
  width: 100%;
  border-radius: 8px;
}

.risk-level {
  padding: 15px 0;
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 14px;
  font-size: 12px;
}

.risk-item {
  font-size: 12px;
  font-weight: 500;
}

.risk-item.green {
  color: #52C41A;
}

.risk-item.yellow {
  color: #FAAD14;
}

.risk-item.orange {
  color: #FA8C16;
}

.risk-item.red {
  color: #F5222D;
}

.qrcode-list {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  background-color: white;
  padding: 20px 0;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-top: 20px;
}

.qrcode-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 25%;
}

.qrcode-img {
  width: 80px;
  height: 80px;
  margin-bottom: 8px;
}

.qrcode-label {
  font-size: 14px;
  color: #333;
  font-weight: 500;
}
</style>
