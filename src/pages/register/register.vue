<template>
  <view class="container">
    <!-- 顶部背景 -->
    <view class="header-bg">
      <view class="header-content">
        <text class="welcome-title">欢迎注册</text>
        <text class="welcome-subtitle">创建您的健康账号</text>
      </view>
      <view class="circle-decoration circle-1"></view>
      <view class="circle-decoration circle-2"></view>
    </view>

    <!-- 注册表单卡片 -->
    <view class="register-card">
      <!-- 表单内容 -->
      <view class="form-content">
        <view class="input-group">
          <!-- 账号 -->
          <view class="input-item">
            <uni-icons type="person" size="20" color="#999"></uni-icons>
            <input
              type="text"
              v-model="form.username"
              placeholder="请输入账号(姓名)"
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
            />
            <view class="eye-icon" @click="showPassword = !showPassword">
              <uni-icons :type="showPassword ? 'eye' : 'eye-fill'" size="20" color="#999"></uni-icons>
            </view>
          </view>
          <!-- 确认密码 -->
          <view class="input-item">
            <uni-icons type="locked" size="20" color="#999"></uni-icons>
            <input
              :type="showConfirmPassword ? 'text' : 'password'"
              v-model="form.confirmPassword"
              placeholder="请确认密码"
              class="input-field"
              maxlength="20"
            />
            <text class="eye-icon" @click="showConfirmPassword = !showConfirmPassword">
              {{ showConfirmPassword ? '👁️' : '👁️‍🗨️' }}
            </text>
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

        <!-- 密码提示 -->
        <view class="password-hint">
          <text class="hint-text">密码长度必须介于 5 和 20 之间</text>
        </view>
      </view>

      <!-- 注册按钮 -->
      <button class="register-btn" :loading="loading" @click="handleRegister">
        <text v-if="!loading">注 册</text>
        <text v-else>注 册 中...</text>
      </button>

      <!-- 已有账号 -->
      <view class="has-account">
        <text class="account-text">已有账号？</text>
        <text class="login-link" @click="goToLogin">使用已有账户登录</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';

// 加载状态
const loading = ref(false);
// 验证码相关
const captchaEnabled = ref(true);
const codeUrl = ref('');
// 密码显示状态
const showPassword = ref(false);
const showConfirmPassword = ref(false);

// 表单数据
const form = reactive({
  username: '',
  password: '',
  confirmPassword: '',
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

// 处理注册
const handleRegister = () => {
  // 表单验证
  if (!form.username) {
    uni.showToast({ title: '请输入您的账号', icon: 'none' });
    return;
  }
  if (form.username.length < 2 || form.username.length > 20) {
    uni.showToast({ title: '用户账号长度必须介于 2 和 20 之间', icon: 'none' });
    return;
  }
  if (!form.password) {
    uni.showToast({ title: '请输入您的密码', icon: 'none' });
    return;
  }
  if (form.password.length < 5 || form.password.length > 20) {
    uni.showToast({ title: '用户密码长度必须介于 5 和 20 之间', icon: 'none' });
    return;
  }
  // 检查非法字符
  if (/[<>"'|\\]/.test(form.password)) {
    uni.showToast({ title: '不能包含非法字符：< > " \' \\ |', icon: 'none' });
    return;
  }
  if (!form.confirmPassword) {
    uni.showToast({ title: '请再次输入您的密码', icon: 'none' });
    return;
  }
  if (form.password !== form.confirmPassword) {
    uni.showToast({ title: '两次输入的密码不一致', icon: 'none' });
    return;
  }
  if (captchaEnabled.value && !form.code) {
    uni.showToast({ title: '请输入验证码', icon: 'none' });
    return;
  }

  // 显示加载状态
  loading.value = true;

  // 调用注册接口
  const registerData = {
    username: form.username,
    password: form.password,
    confirmPassword: form.confirmPassword,
    code: form.code,
    uuid: form.uuid,
    userType: 1
  };

  uni.request({
    url: 'https://yiliao.admin.php7788.com/prod-api/register',
    method: 'POST',
    timeout: 10000,
    header: {
      'Content-Type': 'application/json'
    },
    data: registerData,
    success: (res) => {
      loading.value = false;
      if (res.statusCode === 200) {
        const data = res.data;
        if (data.code === 200 || data.code === 0) {
          // 注册成功
          uni.showModal({
            title: '系统提示',
            content: `恭喜你，您的账号 ${form.username} 注册成功！`,
            showCancel: false,
            success: () => {
              // 跳转到登录页
              uni.navigateBack();
            }
          });
        } else {
          // 注册失败
          uni.showToast({
            title: data.msg || '注册失败',
            icon: 'none',
            duration: 2000
          });
          // 刷新验证码
          if (captchaEnabled.value) {
            getCode();
            form.code = '';
          }
        }
      } else {
        uni.showToast({
          title: '注册失败，请稍后重试',
          icon: 'none',
          duration: 2000
        });
        // 刷新验证码
        if (captchaEnabled.value) {
          getCode();
          form.code = '';
        }
      }
    },
    fail: (err) => {
      loading.value = false;
      uni.showToast({
        title: '网络连接超时，请检查网络',
        icon: 'none',
        duration: 2000
      });
      console.error('注册请求失败:', err);
    }
  });
};

// 跳转到登录页
const goToLogin = () => {
  uni.navigateBack();
};
</script>

<style scoped>
.container {
  min-height: 100vh;
  background-color: #f5f7fa;
  position: relative;
}

/* 顶部背景 */
.header-bg {
  background: linear-gradient(135deg, #1890ff 0%, #36cfc9 100%);
  padding: 60px 30px 100px;
  position: relative;
  overflow: hidden;
}

.header-content {
  position: relative;
  z-index: 1;
}

.welcome-title {
  font-size: 32px;
  font-weight: bold;
  color: #fff;
  display: block;
  margin-bottom: 10px;
}

.welcome-subtitle {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.9);
  display: block;
}

/* 装饰圆圈 */
.circle-decoration {
  position: absolute;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.1);
}

.circle-1 {
  width: 150px;
  height: 150px;
  top: -50px;
  right: -30px;
}

.circle-2 {
  width: 100px;
  height: 100px;
  bottom: 20px;
  right: 50px;
}

/* 注册卡片 */
.register-card {
  background-color: #fff;
  margin: -60px 20px 20px;
  padding: 30px 25px;
  border-radius: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  position: relative;
  z-index: 2;
}

/* 输入框组 */
.input-group {
  margin-bottom: 20px;
}

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
}

.input-field::placeholder {
  color: #bbb;
}

.eye-icon {
  padding: 5px;
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
  cursor: pointer;
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

/* 密码提示 */
.password-hint {
  margin-top: 5px;
  padding-left: 5px;
}

.hint-text {
  font-size: 12px;
  color: #999;
}

/* 注册按钮 */
.register-btn {
  width: 100%;
  height: 50px;
  line-height: 50px;
  background: linear-gradient(135deg, #1890ff, #36cfc9);
  color: #fff;
  font-size: 17px;
  font-weight: bold;
  border-radius: 25px;
  border: none;
  margin-bottom: 20px;
  box-shadow: 0 4px 15px rgba(24, 144, 255, 0.3);
}

.register-btn::after {
  border: none;
}

.register-btn:active {
  opacity: 0.9;
}

/* 已有账号 */
.has-account {
  text-align: center;
}

.account-text {
  font-size: 14px;
  color: #999;
}

.login-link {
  font-size: 14px;
  color: #1890ff;
  margin-left: 5px;
}
</style>
