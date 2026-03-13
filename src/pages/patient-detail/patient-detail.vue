<template>
  <view class="container">
    <view class="header">
      <image :src="patient.avatar || '/static/logo.png'" class="avatar" mode="aspectFill"></image>
      <text class="name">{{ patient.name || '患者' }}</text>
      <text class="info">{{ patient.sex === '0' ? '男' : '女' }} · {{ patient.age }}岁</text>
    </view>
    <view class="card">
      <view class="card-title">基本信息</view>
      <view class="info-row">
        <text class="label">电话</text>
        <text class="value">{{ patient.phone || '-' }}</text>
      </view>
      <view class="info-row">
        <text class="label">诊断结果</text>
        <text class="value">{{ patient.diagnosisResult || '-' }}</text>
      </view>
      <view class="info-row">
        <text class="label">治疗建议</text>
        <text class="value">{{ patient.treatmentSuggestion || '-' }}</text>
      </view>
    </view>
    <view class="btn-group">
      <button class="btn edit" @click="editPatient">编辑</button>
      <button class="btn delete" @click="deletePatient">删除</button>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue';

const patient = ref({
  name: '张三',
  phone: '13800138000',
  sex: '0',
  age: 45,
  diagnosisResult: '高血压',
  treatmentSuggestion: '注意饮食，定期测量血压'
});

const editPatient = () => {
  uni.navigateTo({
    url: '/pages/patient-edit/patient-edit?id=' + patient.value.id
  });
};

const deletePatient = () => {
  uni.showModal({
    title: '提示',
    content: '确定要删除该患者吗？',
    success: (res) => {
      if (res.confirm) {
        uni.showToast({ title: '删除成功', icon: 'success' });
        setTimeout(() => {
          uni.navigateBack();
        }, 1500);
      }
    }
  });
};
</script>

<style scoped>
.container {
  min-height: 100vh;
  background-color: #f5f5f5;
}
.header {
  background: linear-gradient(135deg, #1890ff, #36cfc9);
  padding: 40px 20px;
  text-align: center;
}
.avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  margin-bottom: 15px;
}
.name {
  display: block;
  font-size: 20px;
  color: #fff;
  font-weight: bold;
  margin-bottom: 5px;
}
.info {
  font-size: 14px;
  color: rgba(255,255,255,0.8);
}
.card {
  background-color: #fff;
  margin: 15px;
  border-radius: 10px;
  padding: 20px;
}
.card-title {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #f0f0f0;
}
.info-row {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
}
.label {
  font-size: 14px;
  color: #666;
}
.value {
  font-size: 14px;
  color: #333;
}
.btn-group {
  display: flex;
  gap: 15px;
  padding: 0 15px;
  margin-top: 20px;
}
.btn {
  flex: 1;
  padding: 12px;
  border-radius: 25px;
  font-size: 16px;
}
.edit {
  background-color: #1890ff;
  color: #fff;
}
.delete {
  background-color: #ff4d4f;
  color: #fff;
}
</style>
