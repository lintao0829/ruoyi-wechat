<template>
  <view class="container">
    <!-- 头像设置 -->
    <view class="section">
      <text class="section-title">头像设置</text>
      <view class="avatar-setting" @click="chooseAvatar">
        <image :src="avatarUrl" class="avatar-img" mode="aspectFill"></image>
        <text class="avatar-tip">点击更换头像</text>
      </view>
    </view>

    <!-- 基本信息 -->
    <view class="section">
      <text class="section-title">基本信息</text>
      <view class="form-list">
        <view class="form-item">
          <text class="form-label">昵称</text>
          <input 
            type="text" 
            v-model="userForm.nickName" 
            placeholder="请输入昵称" 
            class="form-input"
          />
        </view>
        <view class="form-item">
          <text class="form-label">手机号</text>
          <input 
            type="text" 
            v-model="userForm.phonenumber" 
            placeholder="请输入手机号" 
            class="form-input"
            maxlength="11"
          />
        </view>
        <view class="form-item">
          <text class="form-label">邮箱</text>
          <input 
            type="text" 
            v-model="userForm.email" 
            placeholder="请输入邮箱" 
            class="form-input"
          />
        </view>
        <view class="form-item">
          <text class="form-label">性别</text>
          <view class="gender-options">
            <view 
              class="gender-option" 
              :class="{ active: userForm.sex === '0' }"
              @click="userForm.sex = '0'"
            >
              <text class="gender-text">男</text>
            </view>
            <view 
              class="gender-option" 
              :class="{ active: userForm.sex === '1' }"
              @click="userForm.sex = '1'"
            >
              <text class="gender-text">女</text>
            </view>
          </view>
        </view>
      </view>
      <button class="save-btn" @click="saveUserInfo">保存基本信息</button>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { onShow } from '@dcloudio/uni-app';

// 用户信息
const userInfo = ref({});

// 计算头像URL
const avatarUrl = computed(() => {
  if (!userInfo.value.avatar) {
    return '/static/logo.png';
  }
  if (userInfo.value.avatar.startsWith('http')) {
    return userInfo.value.avatar;
  }
  const avatarPath = userInfo.value.avatar.replace(/\/+/g, '/');
  return 'https://yiliao.admin.php7788.com/prod-api/' + avatarPath;
});

// 用户表单
const userForm = ref({
  nickName: '',
  phonenumber: '',
  email: '',
  sex: '0'
});

// 页面加载时获取用户信息
onMounted(() => {
  getUserInfo();
});

// 页面显示时获取用户信息
onShow(() => {
  getUserInfo();
});

// 获取用户信息
const getUserInfo = () => {
  uni.request({
    url: 'https://yiliao.admin.php7788.com/prod-api/system/user/profile',
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
          userInfo.value = data.data;
          // 填充表单
          userForm.value = {
            nickName: data.data.nickName || '',
            phonenumber: data.data.phonenumber || '',
            email: data.data.email || '',
            sex: data.data.sex || '0'
          };
        }
      }
    },
    fail: (err) => {
      console.error('获取用户信息失败:', err);
    }
  });
};

// 选择头像
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

// 上传头像
const uploadAvatar = (filePath) => {
  uni.showLoading({ title: '上传中...', mask: true });
  
  uni.uploadFile({
    url: 'https://yiliao.admin.php7788.com/prod-api/system/user/profile/avatar',
    filePath: filePath,
    name: 'avatarfile',
    header: {
      'Authorization': 'Bearer ' + uni.getStorageSync('token')
    },
    success: (res) => {
      uni.hideLoading();
      if (res.statusCode === 200) {
        const data = JSON.parse(res.data);
        if (data.code === 200 || data.code === 0) {
          uni.showToast({ title: '头像上传成功', icon: 'success' });
          // 更新本地头像
          userInfo.value.avatar = data.imgUrl;
          // 更新缓存
          const userCache = uni.getStorageSync('userInfo') || {};
          userCache.avatar = data.imgUrl;
          uni.setStorageSync('userInfo', userCache);
        } else {
          uni.showToast({ title: data.msg || '上传失败', icon: 'none' });
        }
      }
    },
    fail: (err) => {
      uni.hideLoading();
      uni.showToast({ title: '上传失败', icon: 'none' });
      console.error('上传头像失败:', err);
    }
  });
};

// 保存用户信息
const saveUserInfo = () => {
  // 表单验证
  if (!userForm.value.nickName) {
    uni.showToast({ title: '请输入昵称', icon: 'none' });
    return;
  }
  if (!userForm.value.phonenumber) {
    uni.showToast({ title: '请输入手机号', icon: 'none' });
    return;
  }
  if (!/^1[3-9]\d{9}$/.test(userForm.value.phonenumber)) {
    uni.showToast({ title: '手机号格式不正确', icon: 'none' });
    return;
  }
  if (!userForm.value.email) {
    uni.showToast({ title: '请输入邮箱', icon: 'none' });
    return;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userForm.value.email)) {
    uni.showToast({ title: '邮箱格式不正确', icon: 'none' });
    return;
  }

  uni.showLoading({ title: '保存中...', mask: true });

  uni.request({
    url: 'https://yiliao.admin.php7788.com/prod-api/system/user/profile',
    method: 'PUT',
    timeout: 10000,
    header: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + uni.getStorageSync('token')
    },
    data: userForm.value,
    success: (res) => {
      uni.hideLoading();
      if (res.statusCode === 200) {
        const data = res.data;
        if (data.code === 200 || data.code === 0) {
          uni.showToast({ title: '保存成功', icon: 'success' });
          // 更新缓存
          const userCache = uni.getStorageSync('userInfo') || {};
          userCache.nickName = userForm.value.nickName;
          userCache.phonenumber = userForm.value.phonenumber;
          userCache.email = userForm.value.email;
          userCache.sex = userForm.value.sex;
          uni.setStorageSync('userInfo', userCache);
        } else {
          uni.showToast({ title: data.msg || '保存失败', icon: 'none' });
        }
      }
    },
    fail: (err) => {
      uni.hideLoading();
      uni.showToast({ title: '保存失败', icon: 'none' });
      console.error('保存用户信息失败:', err);
    }
  });
};

</script>

<style scoped>
.container {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 40px;
}

/* 头部 */
.header {
  background: linear-gradient(135deg, #1890ff 0%, #36cfc9 100%);
  padding: 40px 20px 30px;
  text-align: center;
}

.header-title {
  font-size: 18px;
  font-weight: bold;
  color: white;
}

/* 区块 */
.section {
  background-color: white;
  margin: 15px;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}

.section-title {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #f0f0f0;
}

/* 头像设置 */
.avatar-setting {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 0;
}

.avatar-img {
  width: 80%;
  max-height: 300px;
  border-radius: 10px;
  border: 3px solid #f0f0f0;
  /* margin-bottom: 10px; */
}

.avatar-tip {
  font-size: 14px;
  color: #1890ff;
}

/* 表单列表 */
.form-list {
  margin-bottom: 20px;
}

.form-item {
  display: flex;
  align-items: center;
  padding: 15px 0;
  border-bottom: 1px solid #f5f5f5;
}

.form-item:last-child {
  border-bottom: none;
}

.form-label {
  width: 80px;
  font-size: 15px;
  color: #666;
  flex-shrink: 0;
}

.form-input {
  flex: 1;
  font-size: 15px;
  color: #333;
}

.eye-icon {
  font-size: 18px;
  padding: 5px;
  margin-left: 10px;
}

/* 性别选项 */
.gender-options {
  display: flex;
  gap: 20px;
}

.gender-option {
  padding: 8px 25px;
  border-radius: 20px;
  background-color: #f5f5f5;
  border: 1px solid transparent;
}

.gender-option.active {
  background-color: #e6f7ff;
  border-color: #1890ff;
}

.gender-text {
  font-size: 14px;
  color: #666;
}

.gender-option.active .gender-text {
  color: #1890ff;
}

/* 保存按钮 */
.save-btn {
  width: 100%;
  height: 44px;
  line-height: 44px;
  background: linear-gradient(135deg, #1890ff, #36cfc9);
  color: #fff;
  font-size: 16px;
  font-weight: bold;
  border-radius: 22px;
  border: none;
  margin-top: 10px;
}

.save-btn::after {
  border: none;
}

.save-btn:active {
  opacity: 0.9;
}
</style>
