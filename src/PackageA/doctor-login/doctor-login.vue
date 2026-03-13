<template>
  <view class="container">
    <!-- 顶部图片 -->
    <view class="header">
      <image src="/static/img/topPic.png" mode="widthFix" class="header-img"></image>
    </view>

    <!-- 登录表单 -->
    <view class="login-form">
      <text class="form-title">医生端登录</text>
      
      <!-- 账号 -->
      <view class="input-item">
        <uni-icons type="person" size="20" color="#999"></uni-icons>
        <input 
          type="text" 
          v-model="form.username" 
          placeholder="请输入您的账号" 
          class="input-field"
          maxlength="20"
        />
      </view>
      
      <!-- 密码 -->
      <view class="input-item">
        <uni-icons type="locked" size="20" color="#999"></uni-icons>
        <input 
          :type="showPassword ? 'text' : 'password'"
          v-model="form.password" 
          placeholder="请输入密码" 
          class="input-field"
          maxlength="20"
        />
        <view class="eye-icon" @click="showPassword = !showPassword">
          <uni-icons :type="showPassword ? 'eye' : 'eye-fill'" size="20" color="#999"></uni-icons>
        </view>
      </view>
      
      <!-- 验证码 -->
      <view class="captcha-wrapper" v-if="captchaEnabled">
        <view class="captcha-input-item">
          <uni-icons type="locked" size="20" color="#999"></uni-icons>
          <input
            type="text"
            v-model="form.code"
            placeholder="请输入验证码"
            class="input-field"
            maxlength="4"
          />
        </view>
        <view class="captcha-img-wrapper" @click="getCode">
          <image
            :src="codeUrl"
            class="captcha-img"
            mode="aspectFit"
          />
          <text class="captcha-tip">点击刷新</text>
        </view>
      </view>
      
      <button class="login-btn" :loading="loading" @click="handleLogin">
        <text v-if="!loading">立即登录</text>
        <text v-else>登录中...</text>
      </button>
      
      <!-- 返回用户端 -->
      <view class="back-link" @click="goBack">
        <text class="back-text">← 返回用户端</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';

// 加载状态
const loading = ref(false);
// 密码显示状态
const showPassword = ref(false);
// 验证码相关
const captchaEnabled = ref(true);
const codeUrl = ref('');

// 表单数据
const form = reactive({
  username: '',
  password: '',
  code: '',
  uuid: ''
});

// 页面加载时获取验证码
onMounted(() => {
  getCode();
});

// 获取验证码
const getCode = () => {
  uni.request({
    url: 'https://yiliao.admin.php7788.com/prod-api/captchaImage',
    method: 'GET',
    timeout: 20000,
    success: (res) => {
      if (res.statusCode === 200) {
        const data = res.data;
        captchaEnabled.value = data.captchaEnabled === undefined ? true : data.captchaEnabled;
        if (captchaEnabled.value) {
          codeUrl.value = 'data:image/gif;base64,' + data.img;
          form.uuid = data.uuid;
        }
      }
    },
    fail: (err) => {
      console.error('获取验证码失败:', err);
    }
  });
};

// 处理登录
const handleLogin = () => {
  // 表单验证
  if (!form.username) {
    uni.showToast({ title: '请输入账号', icon: 'none' });
    return;
  }
  if (!form.password) {
    uni.showToast({ title: '请输入密码', icon: 'none' });
    return;
  }
  if (captchaEnabled.value && !form.code) {
    uni.showToast({ title: '请输入验证码', icon: 'none' });
    return;
  }

  // 显示加载
  loading.value = true;

  // 登录数据
  const loginData = {
    username: form.username,
    password: form.password,
    code: form.code,
    uuid: form.uuid
  };

  // 调用登录接口
  uni.request({
    url: 'https://yiliao.admin.php7788.com/prod-api/login',
    method: 'POST',
    timeout: 10000,
    header: {
      'Content-Type': 'application/json'
    },
    data: loginData,
    success: (res) => {
      loading.value = false;
      if (res.statusCode === 200) {
        const data = res.data;
        if (data.code === 200 || data.code === 0) {
          // 保存token
          if (data.token) {
            uni.setStorageSync('token', data.token);
            uni.setStorageSync('userType', 'doctor'); // 标记为医生端登录
          }
          uni.showToast({ title: '登录成功', icon: 'success' });
          // 跳转到医生端首页
          setTimeout(() => {
            uni.reLaunch({
              url: '/pages/index/index'
            });
          }, 1000);
        } else {
          uni.showToast({
            title: data.msg || '登录失败',
            icon: 'none',
            duration: 2000
          });
          // 刷新验证码
          getCode();
          form.code = '';
        }
      } else {
        uni.showToast({
          title: '登录失败，请稍后重试',
          icon: 'none',
          duration: 2000
        });
        getCode();
        form.code = '';
      }
    },
    fail: (err) => {
      loading.value = false;
      uni.showToast({
        title: '网络连接超时，请检查网络',
        icon: 'none',
        duration: 2000
      });
      console.error('登录请求失败:', err);
    }
  });
};

// 返回用户端
const goBack = () => {
  uni.reLaunch({
    url: '/pages/index/index'
  });
};
</script>

<style scoped>
.container {
  min-height: 100vh;
  background-color: #fff;
}

/* 头部区域 */
.header {
  position: relative;
  width: 100%;
}

.header-img {
  width: 100%;
  display: block;
}

/* 登录表单 */
.login-form {
  padding: 30px;
  margin-top: -20px;
  background-color: #fff;
  border-radius: 20px 20px 0 0;
  position: relative;
  z-index: 1;
}

.form-title {
  font-size: 24px;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 30px;
  text-align: center;
}

/* 输入框 */
.input-item {
  display: flex;
  align-items: center;
  background-color: #f8f9fa;
  border-radius: 12px;
  padding: 15px 18px;
  margin-bottom: 15px;
  border: 1px solid transparent;
  transition: all 0.3s;
}

.input-item:focus-within {
  border-color: #1890ff;
  background-color: #fff;
  box-shadow: 0 0 0 3px rgba(24, 144, 255, 0.1);
}

.input-field {
  flex: 1;
  margin-left: 12px;
  font-size: 15px;
  color: #333;
  height: 22px;
  line-height: 22px;
}

.input-field::placeholder {
  color: #bbb;
}

.eye-icon {
  padding: 5px;
  margin-left: 5px;
  display: flex;
  align-items: center;
}

/* 验证码区域 */
.captcha-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 15px;
}

.captcha-input-item {
  flex: 1;
  display: flex;
  align-items: center;
  background-color: #f8f9fa;
  border-radius: 12px;
  padding: 15px 18px;
  border: 1px solid transparent;
  transition: all 0.3s;
}

.captcha-input-item:focus-within {
  border-color: #1890ff;
  background-color: #fff;
  box-shadow: 0 0 0 3px rgba(24, 144, 255, 0.1);
}

.captcha-img-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 4px;
  border-radius: 8px;
  transition: all 0.3s;
}

.captcha-img-wrapper:active {
  background-color: #f0f0f0;
}

.captcha-img {
  width: 100px;
  height: 44px;
  border-radius: 6px;
  border: 1px solid #e8e8e8;
  background-color: #fff;
}

.captcha-tip {
  font-size: 11px;
  color: #999;
}

/* 登录按钮 */
.login-btn {
  width: 100%;
  height: 50px;
  line-height: 50px;
  background: linear-gradient(135deg, #1890ff, #36cfc9);
  color: #fff;
  font-size: 17px;
  font-weight: bold;
  border-radius: 25px;
  border: none;
  margin-top: 20px;
  margin-bottom: 20px;
  box-shadow: 0 4px 15px rgba(24, 144, 255, 0.3);
}

.login-btn::after {
  border: none;
}

.login-btn:active {
  opacity: 0.9;
}

/* 返回链接 */
.back-link {
  text-align: center;
  padding: 10px 0;
}

.back-text {
  font-size: 14px;
  color: #1890ff;
}
</style>
