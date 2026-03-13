<template>
  <view class="container">
    <view class="patient-list">
      <view class="patient-item" v-for="(patient, index) in patientList" :key="index" @click="goToDetail(patient)">
        <image :src="getAvatar(patient.avatar)" class="patient-avatar" mode="aspectFill"></image>
        <view class="patient-info">
          <text class="patient-name">{{ patient.name }}</text>
          <text class="patient-phone">{{ patient.phone }}</text>
        </view>
        <uni-icons type="right" size="16" color="#ccc"></uni-icons>
      </view>
    </view>
    <view class="empty-tip" v-if="patientList.length === 0">
      <text>暂无患者</text>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue';

const patientList = ref([]);

const getAvatar = (avatar) => {
  if (!avatar) return '/static/logo.png';
  if (avatar.startsWith('http')) return avatar;
  return 'https://yiliao.admin.php7788.com/prod-api/' + avatar.replace(/\/+/g, '/');
};

const goToDetail = (patient) => {
  uni.navigateTo({
    url: '/pages/doctor/patient-detail/patient-detail?id=' + patient.id
  });
};
</script>

<style scoped>
.container {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 15px;
}
.patient-item {
  display: flex;
  align-items: center;
  background-color: #fff;
  padding: 15px;
  border-radius: 10px;
  margin-bottom: 10px;
}
.patient-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  margin-right: 15px;
}
.patient-info {
  flex: 1;
}
.patient-name {
  font-size: 16px;
  color: #333;
  font-weight: bold;
  display: block;
  margin-bottom: 5px;
}
.patient-phone {
  font-size: 14px;
  color: #999;
}
.empty-tip {
  text-align: center;
  padding: 50px;
  color: #999;
}
</style>
