<template>
  <view class="container">
    <view class="content">
      <text>扫码录入功能</text>
    </view>
  </view>
</template>

<script setup>
import { onLoad } from '@dcloudio/uni-app';

onLoad(() => {
  uni.scanCode({
    success: (res) => {
      console.log('扫码结果:', res);
      uni.showToast({ title: '扫码成功', icon: 'success' });
    },
    fail: (err) => {
      console.log('扫码取消或失败:', err);
    }
  });
});
</script>

<style scoped>
.container {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 20px;
}
.content {
  text-align: center;
  padding: 50px 0;
}
</style>
