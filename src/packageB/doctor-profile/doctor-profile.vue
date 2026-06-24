<template>
  <view class="container">
    <view class="header">
      <image :src="avatarUrl" class="avatar" mode="aspectFill" @click="chooseAvatar"></image>
      <text class="tips">点击更换头像</text>
    </view>
    <view class="form">
      <view class="form-item">
        <text class="label">昵称</text>
        <input class="input" v-model="userInfo.nickName" placeholder="请输入昵称" />
      </view>
      <view class="form-item">
        <text class="label">手机号</text>
        <input class="input" v-model="userInfo.phonenumber" type="number" placeholder="请输入手机号" />
      </view>
      <view class="form-item">
        <text class="label">邮箱</text>
        <input class="input" v-model="userInfo.email" placeholder="请输入邮箱" />
      </view>
      <view class="form-item">
        <text class="label">简介</text>
        <textarea class="textarea" v-model="userInfo.introduction" placeholder="请输入个人简介" />
      </view>
      <button class="save-btn" @click="saveUserInfo">保存</button>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';

const userInfo = ref({
  nickName: '',
  phonenumber: '',
  email: '',
  introduction: '',
  avatar: ''
});

const avatarUrl = computed(() => {
  if (!userInfo.value.avatar) return '/static/logo.png';
  if (userInfo.value.avatar.startsWith('http')) return userInfo.value.avatar;
  return 'https://yiliao.admin.php7788.com/prod-api/' + userInfo.value.avatar.replace(/\/+/g, '/');
});

onMounted(() => {
  const cachedUserInfo = uni.getStorageSync('userInfo');
  if (cachedUserInfo) {
    userInfo.value = { ...userInfo.value, ...cachedUserInfo };
  }
});

const chooseAvatar = () => {
  uni.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: (res) => {
      const tempFilePath = res.tempFilePaths[0];
      uploadAvatar(tempFilePath);
    }
  });
};

const uploadAvatar = (filePath) => {
  uni.showLoading({ title: '上传中...', mask: true });
  uni.uploadFile({
    url: 'https://yiliao.admin.php7788.com/prod-api/system/user/profile/avatar',
    filePath: filePath,
    name: 'avatarfile',
    header: { 'Authorization': 'Bearer ' + uni.getStorageSync('token') },
    success: (res) => {
      uni.hideLoading();
      if (res.statusCode === 200) {
        const data = JSON.parse(res.data);
        if (data.code === 200 || data.code === 0) {
          userInfo.value.avatar = data.imgUrl;
          uni.showToast({ title: '头像上传成功', icon: 'success' });
        }
      }
    },
    fail: () => {
      uni.hideLoading();
      uni.showToast({ title: '上传失败', icon: 'none' });
    }
  });
};

const saveUserInfo = () => {
  uni.showLoading({ title: '保存中...', mask: true });
  uni.request({
    url: 'https://yiliao.admin.php7788.com/prod-api/system/user/profile',
    method: 'put',
    header: { 'Authorization': 'Bearer ' + uni.getStorageSync('token'), 'Content-Type': 'application/json' },
    data: userInfo.value,
    success: (res) => {
      uni.hideLoading();
      if (res.statusCode === 200 && res.data.code === 200) {
        uni.setStorageSync('userInfo', userInfo.value);
        uni.showToast({ title: '保存成功', icon: 'success' });
      } else {
        uni.showToast({ title: res.data.msg || '保存失败', icon: 'none' });
      }
    },
    fail: () => {
      uni.hideLoading();
      uni.showToast({ title: '保存失败', icon: 'none' });
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
  width: 100px;
  height: 100px;
  border-radius: 50%;
  border: 3px solid #fff;
  margin-bottom: 10px;
}
.tips {
  font-size: 12px;
  color: rgba(255,255,255,0.8);
}
.form {
  background-color: #fff;
  margin: 15px;
  border-radius: 10px;
  padding: 20px;
}
.form-item {
  margin-bottom: 20px;
}
.label {
  display: block;
  font-size: 14px;
  color: #333;
  margin-bottom: 10px;
}
.input, .textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 14px;
  box-sizing: border-box;
}
.textarea {
  height: 80px;
}
.save-btn {
  width: 100%;
  padding: 12px;
  background-color: #1890ff;
  color: #fff;
  border-radius: 25px;
  font-size: 16px;
  margin-top: 20px;
}
</style>
