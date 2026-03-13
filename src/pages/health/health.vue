<template>
  <view class="container">
    <view class="form-list">
      <!-- 糖化 -->
      <view class="form-item">
        <view class="item-left">
          <image src="/static/icon/tanghua.png" class="item-icon"></image>
          <text class="item-title">糖化</text>
        </view>
        <view class="item-right">
          <input type="digit" v-model="form.tanghua" placeholder="糖化血红蛋白值(%)" class="item-input" />
        </view>
      </view>

      <!-- 血压 -->
      <view class="form-item">
        <view class="item-left">
          <image src="/static/icon/xieya.png" class="item-icon"></image>
          <text class="item-title">血压</text>
        </view>
        <view class="item-right multi-input">
          <input type="digit" v-model="form.shousuoya" placeholder="收缩压(mmHg)" class="item-input small" />
          <input type="digit" v-model="form.shuzhangya" placeholder="舒张压(mmHg)" class="item-input small" />
        </view>
      </view>

      <!-- 血脂 -->
      <view class="form-item">
        <view class="item-left">
          <image src="/static/icon/xiezhi1.png" class="item-icon"></image>
          <text class="item-title">血脂(LDL)</text>
        </view>
        <view class="item-right">
          <input type="digit" v-model="form.xuezhi" placeholder="低密度脂蛋白胆固醇(mmol/L)" class="item-input" />
        </view>
      </view>

      <!-- 体重 -->
      <view class="form-item">
        <view class="item-left">
          <image src="/static/icon/tizhong.png" class="item-icon"></image>
          <text class="item-title">体重(BMI)</text>
        </view>
        <view class="item-right multi-input">
          <input type="digit" v-model="form.shengao" placeholder="身高(厘米)" class="item-input small" />
          <input type="digit" v-model="form.tizhong" placeholder="体重(公斤)" class="item-input small" />
        </view>
      </view>

      <!-- 控烟 -->
      <view class="form-item">
        <view class="item-left">
          <image src="/static/icon/kongyan.png" class="item-icon"></image>
          <text class="item-title">控烟</text>
        </view>
        <view class="item-right">
          <input type="number" v-model="form.kongyan" placeholder="不吸烟请填0(支)" class="item-input" />
        </view>
      </view>
    </view>

    <!-- 保存按钮 -->
    <view class="btn-container">
      <u--button type="primary" size="large" @click="saveData">保存数据</u--button>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue';

const form = ref({
  tanghua: '',
  shousuoya: '',
  shuzhangya: '',
  xuezhi: '',
  shengao: '',
  tizhong: '',
  kongyan: ''
});

const saveData = () => {
  // 保存数据逻辑
  uni.showToast({
    title: '保存成功',
    icon: 'success'
  });
  // 可以在这里添加跳转到其他页面的逻辑
};
</script>

<style scoped>
.container {
  min-height: 100vh;
  background-color: #f0f0f0;
  padding: 20px;
  box-sizing: border-box;
}

.form-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.form-item {
  background-color: #fff;
  border-radius: 12px;
  padding: 15px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.item-left {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
  min-width: 100px;
}

.item-icon {
  width: 36px;
  height: 36px;
  flex-shrink: 0;
}

.item-title {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  white-space: nowrap;
}

.item-right {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  margin-left: 10px;
  overflow: hidden;
}

.item-right.multi-input {
  gap: 8px;
}

.item-input {
  font-size: 13px;
  color: #666;
  text-align: right;
  width: 180px;
}

.item-input.small {
  width: 90px;
}

.btn-container {
  margin-top: 40px;
  padding: 0 10px;
}
</style>
