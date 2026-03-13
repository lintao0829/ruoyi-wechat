<template>
  <view class="container">
    <!-- 顶部装饰背景 -->
    <view class="header-bg">
      <view class="header-content">
        <text class="welcome-title">欢迎登录</text>
        <text class="welcome-subtitle">CP健康码平台</text>
      </view>
      <view class="circle-decoration circle-1"></view>
      <view class="circle-decoration circle-2"></view>
    </view>

    <!-- 登录表单卡片 -->
    <view class="login-card">
      <!-- 登录方式切换 -->
      <view class="login-tabs">
        <view 
          class="tab-item" 
          :class="{ active: loginType === 'password' }"
          @click="loginType = 'password'"
        >
          <text class="tab-text">密码登录</text>
        </view>
        <!-- <view 
          class="tab-item" 
          :class="{ active: loginType === 'code' }"
          @click="loginType = 'code'"
        >
          <text class="tab-text"></text>
        </view> -->
      </view>

      <!-- 密码登录表单 -->
      <view v-if="loginType === 'password'" class="form-content">
        <view class="input-group">
          <view class="input-item">
            <uni-icons type="person" size="20" color="#999"></uni-icons>
            <input 
              type="text" 
              v-model="form.username" 
              placeholder="请输入账号" 
              class="input-field"
            />
          </view>
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
        </view>
      </view>

      <!-- 验证码登录表单 -->
      <view v-else class="form-content">
        <view class="input-group">
          <view class="input-item">
            <uni-icons type="person" size="20" color="#999"></uni-icons>
            <input 
              type="text" 
              v-model="form.phone" 
              placeholder="请输入账号" 
              class="input-field"
              maxlength="11"
            />
          </view>
          <view class="input-item">
            <uni-icons type="locked" size="20" color="#999"></uni-icons>
            <input 
              type="text" 
              v-model="form.code" 
              placeholder="请输入验证码" 
              class="input-field"
              maxlength="6"
            />
            <view 
              class="code-btn" 
              :class="{ disabled: countdown > 0 }"
              @click="sendCode"
            >
              <text class="code-text">{{ countdown > 0 ? `${countdown}s` : '获取验证码' }}</text>
            </view>
          </view>
        </view>

        <!-- 记住密码和验证码 -->
        <view class="form-footer">
          <view class="remember-wrapper" @click="rememberMe = !rememberMe">
            <view class="toggle-switch" :class="{ active: rememberMe }">
              <view class="toggle-dot"></view>
            </view>
            <text class="toggle-text" :class="{ active: rememberMe }">记住密码</text>
          </view>
          <text class="forgot-text" v-if="captchaEnabled" @click="getCode">换一张</text>
        </view>
      </view>

      <!-- 登录按钮 -->
      <button class="login-btn" @click="handleLogin">登 录</button>

      <!-- 其他选项 -->
      <view class="other-options">
        <text class="option-text" @click="goToRegister">注册账号</text>
      </view>

      <!-- 协议同意 -->
      <view class="agreement">
        <view class="checkbox-wrapper" @click="agree = !agree">
          <view class="checkbox" :class="{ checked: agree }">
            <uni-icons v-if="agree" type="checkmarkempty" size="12" color="#fff"></uni-icons>
          </view>
        </view>
        <text class="agreement-text">
          我已阅读并同意
          <text class="link" @click.stop="showAgreement">《用户协议》</text>
          和
          <text class="link" @click.stop="showPrivacy">《隐私政策》</text>
        </text>
      </view>
    </view>
    <!-- 协议弹窗 -->
    <AgreementModal
      :visible="modalVisible"
      :title="modalTitle"
      :content="modalContent"
      @close="modalVisible = false"
    />
  </view>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import AgreementModal from '@/components/AgreementModal.vue';

const loginType = ref('password');
const agree = ref(false);
const showPassword = ref(false);
const countdown = ref(0);
const modalVisible = ref(false);
const modalTitle = ref('');
const modalContent = ref('');

// 验证码相关
const captchaEnabled = ref(true);
const codeUrl = ref('');

const form = reactive({
  username: '',
  password: '',
  code: '',
  uuid: ''
});

// 记住密码
const rememberMe = ref(false);

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

// 页面加载时获取验证码
onMounted(() => {
  // 读取保存的账号密码
  const savedUsername = uni.getStorageSync('savedUsername');
  const savedPassword = uni.getStorageSync('savedPassword');
  const savedRemember = uni.getStorageSync('rememberMe');
  
  if (savedRemember) {
    form.username = savedUsername || '';
    form.password = savedPassword || '';
    rememberMe.value = savedRemember;
  }
  
  getCode();
});

// 用户协议内容
const userAgreement = `<h2 style="font-size: 16px; font-weight: bold; margin-bottom: 15px;">用户协议</h2>
<p style="margin-bottom: 10px; line-height: 1.6;">欢迎使用本应用（以下简称"本应用"）。请您仔细阅读并遵守本《用户协议》（以下简称"本协议"）。</p>
<h3 style="font-size: 14px; font-weight: bold; margin: 15px 0 10px;">一、协议生效与变更</h3>
<p style="margin-bottom: 8px; line-height: 1.6;">1. 您在注册、登录或使用本应用时，即表示您已充分阅读、理解并同意本协议的全部内容。</p>
<p style="margin-bottom: 8px; line-height: 1.6;">2. 本应用有权根据业务发展需要，随时修改本协议内容，修改后的协议将在本应用内公示，公示后立即生效。若您继续使用本应用，即视为同意变更后的协议。</p>
<h3 style="font-size: 14px; font-weight: bold; margin: 15px 0 10px;">二、账号与安全</h3>
<p style="margin-bottom: 8px; line-height: 1.6;">1. 您应自行负责账号和密码的安全，不得将账号转借、出租或出售给他人使用。</p>
<p style="margin-bottom: 8px; line-height: 1.6;">2. 若您发现账号被盗或存在异常登录情况，请立即联系客服处理。</p>
<p style="margin-bottom: 8px; line-height: 1.6;">3. 您应对您账号下的所有操作行为承担法律责任。</p>
<h3 style="font-size: 14px; font-weight: bold; margin: 15px 0 10px;">三、用户行为规范</h3>
<p style="margin-bottom: 8px; line-height: 1.6;">1. 您不得利用本应用发布、传播任何违法、违规、侵权、低俗或危害国家安全的内容。</p>
<p style="margin-bottom: 8px; line-height: 1.6;">2. 您不得利用本应用从事任何干扰、破坏或攻击本应用系统或网络的行为。</p>
<p style="margin-bottom: 8px; line-height: 1.6;">3. 您不得利用本应用侵犯他人的知识产权、隐私权或其他合法权益。</p>
<h3 style="font-size: 14px; font-weight: bold; margin: 15px 0 10px;">四、服务内容与终止</h3>
<p style="margin-bottom: 8px; line-height: 1.6;">1. 本应用为您提供信息展示、数据填报、业务办理等服务，具体以应用内展示为准。</p>
<p style="margin-bottom: 8px; line-height: 1.6;">2. 本应用有权在您违反本协议或法律法规时，暂停或终止您的账号使用权限，且无需承担任何责任。</p>
<p style="margin-bottom: 8px; line-height: 1.6;">3. 您可随时注销账号，账号注销后，您的个人信息将按本应用《隐私政策》处理。</p>
<h3 style="font-size: 14px; font-weight: bold; margin: 15px 0 10px;">五、免责声明</h3>
<p style="margin-bottom: 8px; line-height: 1.6;">1. 本应用不保证服务不会中断，也不保证服务的绝对安全和无差错。</p>
<p style="margin-bottom: 8px; line-height: 1.6;">2. 因不可抗力、网络故障、第三方服务故障等原因导致您无法使用本应用的，本应用不承担责任。</p>
<p style="margin-bottom: 8px; line-height: 1.6;">3. 您因自身操作不当、账号泄露等原因造成的损失，由您自行承担。</p>
<h3 style="font-size: 14px; font-weight: bold; margin: 15px 0 10px;">六、法律适用与争议解决</h3>
<p style="margin-bottom: 8px; line-height: 1.6;">1. 本协议适用中华人民共和国法律。</p>
<p style="margin-bottom: 8px; line-height: 1.6;">2. 若您与本应用发生争议，应先友好协商解决；协商不成的，可向本应用运营方所在地人民法院提起诉讼。</p>`;

// 隐私政策内容
const privacyPolicy = `<h2 style="font-size: 16px; font-weight: bold; margin-bottom: 15px;">隐私政策</h2>
<p style="margin-bottom: 10px; line-height: 1.6;">本应用（以下简称"我们"）非常重视您的隐私保护，本《隐私政策》将说明我们如何收集、使用、存储和保护您的个人信息。</p>
<h3 style="font-size: 14px; font-weight: bold; margin: 15px 0 10px;">一、我们收集的信息</h3>
<p style="margin-bottom: 8px; line-height: 1.6;">1. <strong>账号信息</strong>：您注册/登录时提供的账号、密码等信息。</p>
<p style="margin-bottom: 8px; line-height: 1.6;">2. <strong>设备信息</strong>：设备型号、操作系统版本、设备标识符等，用于保障服务稳定和安全。</p>
<p style="margin-bottom: 8px; line-height: 1.6;">3. <strong>业务数据</strong>：您在使用本应用时填报的表单数据、业务信息等，用于为您提供服务。</p>
<p style="margin-bottom: 8px; line-height: 1.6;">4. <strong>网络信息</strong>：网络类型、IP地址等，用于优化服务体验。</p>
<h3 style="font-size: 14px; font-weight: bold; margin: 15px 0 10px;">二、我们如何使用您的信息</h3>
<p style="margin-bottom: 8px; line-height: 1.6;">1. 为您提供账号登录、数据填报、业务办理等核心服务。</p>
<p style="margin-bottom: 8px; line-height: 1.6;">2. 优化本应用功能和体验，进行故障排查和安全防护。</p>
<p style="margin-bottom: 8px; line-height: 1.6;">3. 经您同意后，向您推送业务相关通知或服务信息。</p>
<p style="margin-bottom: 8px; line-height: 1.6;">4. 遵守法律法规及监管要求，配合司法机关或行政机关的调查。</p>
<h3 style="font-size: 14px; font-weight: bold; margin: 15px 0 10px;">三、我们如何存储您的信息</h3>
<p style="margin-bottom: 8px; line-height: 1.6;">1. 您的个人信息将存储在中华人民共和国境内的安全服务器上。</p>
<p style="margin-bottom: 8px; line-height: 1.6;">2. 我们采取加密、访问控制等技术措施保护您的信息安全，防止信息泄露、篡改或丢失。</p>
<p style="margin-bottom: 8px; line-height: 1.6;">3. 您的账号注销后，我们将在合理期限内删除或匿名化处理您的个人信息，法律法规另有规定的除外。</p>
<h3 style="font-size: 14px; font-weight: bold; margin: 15px 0 10px;">四、我们如何共享您的信息</h3>
<p style="margin-bottom: 8px; line-height: 1.6;">1. 我们不会向第三方共享、出售或出租您的个人信息，除非获得您的明确同意。</p>
<p style="margin-bottom: 8px; line-height: 1.6;">2. 为提供服务所需，我们可能会向合作的技术服务商、支付机构等共享必要信息，且要求其严格遵守本政策并采取保密措施。</p>
<p style="margin-bottom: 8px; line-height: 1.6;">3. 法律法规或监管要求我们提供您信息的，我们将在合法范围内予以配合。</p>
<h3 style="font-size: 14px; font-weight: bold; margin: 15px 0 10px;">五、您的权利</h3>
<p style="margin-bottom: 8px; line-height: 1.6;">1. 您有权查询、更正或删除您的个人信息。</p>
<p style="margin-bottom: 8px; line-height: 1.6;">2. 您有权注销账号，注销后我们将按本政策处理您的信息。</p>
<p style="margin-bottom: 8px; line-height: 1.6;">3. 您有权撤回对我们收集、使用您信息的同意，但可能影响您使用本应用的部分功能。</p>
<h3 style="font-size: 14px; font-weight: bold; margin: 15px 0 10px;">六、政策更新</h3>
<p style="margin-bottom: 8px; line-height: 1.6;">1. 我们可能根据业务或法律法规变化更新本政策，更新后将在本应用内公示。</p>
<p style="margin-bottom: 8px; line-height: 1.6;">2. 若您继续使用本应用，即表示您同意更新后的隐私政策。</p>
<h3 style="font-size: 14px; font-weight: bold; margin: 15px 0 10px;">七、联系我们</h3>
<p style="margin-bottom: 8px; line-height: 1.6;">若您对本政策有任何疑问或建议，请通过应用内客服渠道联系我们。</p>`;

// 发送验证码（短信验证码方式，暂不使用）
const sendCode = () => {
  if (countdown.value > 0) return;
  if (!form.username) {
    uni.showToast({ title: '请输入账号', icon: 'none' });
    return;
  }  
  countdown.value = 60;
  const timer = setInterval(() => {
    countdown.value--;
    if (countdown.value <= 0) {
      clearInterval(timer);
    }
  }, 1000);
  
  uni.showToast({ title: '验证码已发送', icon: 'success' });
};

// 处理登录
const handleLogin = () => {
  if (!agree.value) {
    uni.showToast({ title: '请同意用户协议和隐私政策', icon: 'none' });
    return;
  }
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

  // 显示加载提示
  uni.showLoading({
    title: '登录中...',
    mask: true
  });

  // 调用登录接口
  const loginData = {
    username: form.username,
    password: form.password,
    code: form.code,
    uuid: form.uuid
  };

  uni.request({
    url: 'https://yiliao.admin.php7788.com/prod-api/login',
    method: 'POST',
    timeout: 10000,
    header: {
      'Content-Type': 'application/json'
    },
    data: loginData,
    success: (res) => {
      uni.hideLoading();

      if (res.statusCode === 200) {
        const data = res.data;
        // 根据后端返回的状态码判断登录是否成功
        if (data.code === 200 || data.code === 0) {
          // 登录成功，保存token
          if (data.token) {
            uni.setStorageSync('token', data.token);
          }
          // 记住密码
          if (rememberMe.value) {
            uni.setStorageSync('savedUsername', form.username);
            uni.setStorageSync('savedPassword', form.password);
            uni.setStorageSync('rememberMe', true);
          } else {
            uni.removeStorageSync('savedUsername');
            uni.removeStorageSync('savedPassword');
            uni.setStorageSync('rememberMe', false);
          }
          uni.showToast({ title: '登录成功', icon: 'success' });
          setTimeout(() => {
            uni.switchTab({
              url: '/pages/index/index'
            });
          }, 1000);
        } else {
          // 登录失败，显示错误信息
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
        // 刷新验证码
        getCode();
        form.code = '';
      }
    },
    fail: (err) => {
      uni.hideLoading();
      uni.showToast({
        title: '网络连接超时，请检查网络',
        icon: 'none',
        duration: 2000
      });
      console.error('登录请求失败:', err);
    }
  });
};

// 跳转到注册页
const goToRegister = () => {
  uni.navigateTo({
    url: '/pages/register/register'
  });
};

// 显示用户协议
const showAgreement = () => {
  modalTitle.value = '用户协议';
  modalContent.value = userAgreement;
  modalVisible.value = true;
};

// 显示隐私政策
const showPrivacy = () => {
  modalTitle.value = '隐私政策';
  modalContent.value = privacyPolicy;
  modalVisible.value = true;
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

/* 登录卡片 */
.login-card {
  background-color: #fff;
  margin: -60px 20px 20px;
  padding: 30px 25px;
  border-radius: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  position: relative;
  z-index: 2;
}

/* 登录方式切换 */
.login-tabs {
  display: flex;
  margin-bottom: 30px;
  border-bottom: 1px solid #f0f0f0;
}

.tab-item {
  flex: 1;
  padding: 15px 0;
  text-align: center;
  position: relative;
}

.tab-text {
  font-size: 16px;
  color: #999;
  font-weight: 500;
}

.tab-item.active .tab-text {
  color: #1890ff;
  font-weight: bold;
}

.tab-item.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 40px;
  height: 3px;
  background: linear-gradient(90deg, #1890ff, #36cfc9);
  border-radius: 2px;
}

/* 输入框组 */
.input-group {
  margin-bottom: 25px;
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

.code-btn {
  padding: 8px 15px;
  background: linear-gradient(135deg, #1890ff, #36cfc9);
  border-radius: 20px;
  margin-left: 10px;
}

.code-btn.disabled {
  background: #ccc;
}

.code-text {
  font-size: 13px;
  color: #fff;
  white-space: nowrap;
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
  margin-bottom: 20px;
  box-shadow: 0 4px 15px rgba(24, 144, 255, 0.3);
}

.login-btn::after {
  border: none;
}

/* 表单底部 */
.form-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 0 5px;
}

.remember-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
}

.toggle-switch {
  width: 40px;
  height: 22px;
  background-color: #ddd;
  border-radius: 11px;
  position: relative;
  transition: all 0.3s;
}

.toggle-switch.active {
  background: linear-gradient(135deg, #1890ff, #36cfc9);
}

.toggle-dot {
  width: 18px;
  height: 18px;
  background-color: #fff;
  border-radius: 50%;
  position: absolute;
  top: 2px;
  left: 2px;
  transition: all 0.3s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.toggle-switch.active .toggle-dot {
  left: 20px;
}

.toggle-text {
  font-size: 13px;
  color: #999;
  transition: all 0.3s;
}

.toggle-text.active {
  color: #1890ff;
}

.forgot-text {
  font-size: 13px;
  color: #1890ff;
}

/* 其他选项 */
.other-options {
  display: flex;
  justify-content: space-between;
  margin-bottom: 25px;
}

.option-text {
  font-size: 14px;
  color: #1890ff;
}

/* 协议同意 */
.agreement {
  display: flex;
  align-items: flex-start;
}

.checkbox-wrapper {
  padding: 2px;
}

.checkbox {
  width: 18px;
  height: 18px;
  border: 2px solid #ddd;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.checkbox.checked {
  background: linear-gradient(135deg, #1890ff, #36cfc9);
  border-color: transparent;
}

.agreement-text {
  font-size: 13px;
  color: #666;
  margin-left: 10px;
  line-height: 1.6;
  flex: 1;
}

.link {
  color: #1890ff;
}

/* 其他登录方式 */
.other-login {
  padding: 0 30px 40px;
}

.divider {
  display: flex;
  align-items: center;
  margin-bottom: 25px;
}

.divider-line {
  flex: 1;
  height: 1px;
  background-color: #e8e8e8;
}

.divider-text {
  font-size: 13px;
  color: #999;
  padding: 0 15px;
}

.login-icons {
  display: flex;
  justify-content: center;
}

.icon-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.icon-circle {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.icon-circle.wechat {
  background: linear-gradient(135deg, #07c160, #10b981);
}

.icon-label {
  font-size: 13px;
  color: #666;
}
</style>
