<template>
  <view class="container">
    <view class="form-list">
      <!-- 糖化 -->
      <view class="form-item">
        <view class="item-left">
          <image src="../../static/icon/tanghua.png" class="item-icon"></image>
          <text class="item-title">糖化</text>
        </view>
        <view class="item-right">
          <input type="digit" v-model="form.sugarValue" placeholder="糖化血红蛋白值 (%)" class="item-input" />
        </view>
      </view>

      <!-- 血压 -->
      <view class="form-item">
        <view class="item-left">
          <image src="../../static/icon/xieya.png" class="item-icon"></image>
          <text class="item-title">血压</text>
        </view>
        <view class="item-right multi-input">
          <input type="digit" v-model="form.systolicPressure" placeholder="收缩压 (mmHg)" class="item-input small" />
          <input type="digit" v-model="form.diastolicPressure" placeholder="舒张压 (mmHg)" class="item-input small" />
        </view>
      </view>

      <!-- 血脂 -->
      <view class="form-item">
        <view class="item-left">
          <image src="../../static/icon/xiezhi1.png" class="item-icon"></image>
          <text class="item-title">血脂 (LDL)</text>
        </view>
        <view class="item-right">
          <input type="digit" v-model="form.ldlValue" placeholder="低密度脂蛋白胆固醇 (mmol/L)" class="item-input" />
        </view>
      </view>

      <!-- 体重 -->
      <view class="form-item">
        <view class="item-left">
          <image src="../../static/icon/tizhong.png" class="item-icon"></image>
          <text class="item-title">体重 (BMI)</text>
        </view>
        <view class="item-right multi-input">
          <input type="digit" v-model="form.height" placeholder="身高 (厘米)" class="item-input small" />
          <input type="digit" v-model="form.weight" placeholder="体重 (公斤)" class="item-input small" />
        </view>
      </view>

      <!-- 控烟 -->
      <view class="form-item">
        <view class="item-left">
          <image src="../../static/icon/kongyan.png" class="item-icon"></image>
          <text class="item-title">控烟</text>
        </view>
        <view class="item-right">
          <input type="number" v-model="form.smokingCount" placeholder="不吸烟请填 0(支)" class="item-input" />
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
  sugarValue: '',
  systolicPressure: '',
  diastolicPressure: '',
  ldlValue: '',
  height: '',
  weight: '',
  smokingCount: ''
});

const saveData = () => {
  // 表单验证
  if (!form.value.sugarValue || !form.value.systolicPressure || !form.value.diastolicPressure || !form.value.ldlValue || !form.value.height || !form.value.weight || form.value.smokingCount === '') {
    uni.showToast({
      title: '请填写完整数据',
      icon: 'none'
    });
    return;
  }
  form.value.doctorId = uni.getStorageSync('userInfo').doctorId;
  form.value.patientId = uni.getStorageSync('userInfo').patientId;
  console.log(form.value,'评分form.value=====')
  // return false;
  // 调用保存接口
  uni.request({
    url: 'https://yiliao.admin.php7788.com/prod-api/system/score/record/submit',
    method: 'POST',
    header: {
      'Authorization': 'Bearer ' + uni.getStorageSync('token'),
      'Content-Type': 'application/json'
    },
    data: form.value,
    success: (res) => {
      if (res.statusCode === 200 && (res.data.code === 200 || res.data.code === 0)) {
        uni.showToast({
          title: '保存成功',
          icon: 'success'
        });
        // 保存成功后跳转到历史记录页面
        setTimeout(() => {
          uni.switchTab({
            url: '/pages/record/record'
          });
        }, 1500);
      } else {
        uni.showToast({
          title: res.data.msg || '保存失败',
          icon: 'none'
        });
      }
    },
    fail: () => {
      uni.showToast({
        title: '网络错误',
        icon: 'none'
      });
    }
  });
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
