<template>
  <view class="container">
    <!-- 头部 -->
    <view class="header">
      <text class="header-title">修改密码</text>
    </view>

    <!-- 密码表单 -->
    <view class="form-card">
      <view class="form-list">
        <!-- 原密码 -->
        <view class="form-item">
          <text class="form-label">原密码</text>
          <input 
            :type="showOldPassword ? 'text' : 'password'"
            v-model="pwdForm.oldPassword" 
            placeholder="请输入原密码" 
            class="form-input"
            maxlength="20"
          />
          <text class="eye-icon" @click="showOldPassword = !showOldPassword">
            {{ showOldPassword ? '👁️' : '👁️‍🗨️' }}
          </text>
        </view>
        
        <!-- 新密码 -->
        <view class="form-item">
          <text class="form-label">新密码</text>
          <input 
            :type="showNewPassword ? 'text' : 'password'"
            v-model="pwdForm.newPassword" 
            placeholder="请输入新密码" 
            class="form-input"
            maxlength="20"
          />
          <text class="eye-icon" @click="showNewPassword = !showNewPassword">
            {{ showNewPassword ? '👁️' : '👁️‍🗨️' }}
          </text>
        </view>
        
        <!-- 确认密码 -->
        <view class="form-item">
          <text class="form-label">确认密码</text>
          <input 
            :type="showConfirmPassword ? 'text' : 'password'"
            v-model="pwdForm.confirmPassword" 
            placeholder="请再次输入新密码" 
            class="form-input"
            maxlength="20"
          />
          <text class="eye-icon" @click="showConfirmPassword = !showConfirmPassword">
            {{ showConfirmPassword ? '👁️' : '👁️‍🗨️' }}
          </text>
        </view>
      </view>

      <!-- 密码提示 -->
      <view class="password-hint">
        <text class="hint-text">密码长度必须介于 5 和 20 之间</text>
      </view>

      <!-- 修改按钮 -->
      <button class="submit-btn" @click="updatePassword">确认修改</button>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue';

// 密码表单
const pwdForm = ref({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
});

// 密码显示状态
const showOldPassword = ref(false);
const showNewPassword = ref(false);
const showConfirmPassword = ref(false);

// 修改密码
const updatePassword = () => {
  // 表单验证
  if (!pwdForm.value.oldPassword) {
    uni.showToast({ title: '请输入原密码', icon: 'none' });
    return;
  }
  if (!pwdForm.value.newPassword) {
    uni.showToast({ title: '请输入新密码', icon: 'none' });
    return;
  }
  if (pwdForm.value.newPassword.length < 5 || pwdForm.value.newPassword.length > 20) {
    uni.showToast({ title: '密码长度必须介于 5 和 20 之间', icon: 'none' });
    return;
  }
  // 检查非法字符
  if (/[<>"'|\\]/.test(pwdForm.value.newPassword)) {
    uni.showToast({ title: '不能包含非法字符：< > " \' \\ |', icon: 'none' });
    return;
  }
  if (!pwdForm.value.confirmPassword) {
    uni.showToast({ title: '请确认新密码', icon: 'none' });
    return;
  }
  if (pwdForm.value.newPassword !== pwdForm.value.confirmPassword) {
    uni.showToast({ title: '两次输入的密码不一致', icon: 'none' });
    return;
  }

  uni.showLoading({ title: '修改中...', mask: true });

  const pwdData = {
    oldPassword: pwdForm.value.oldPassword,
    newPassword: pwdForm.value.newPassword
  };

  uni.request({
    url: 'https://yiliao.admin.php7788.com/prod-api/system/user/profile/updatePwd',
    method: 'PUT',
    timeout: 10000,
    header: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + uni.getStorageSync('token')
    },
    data: pwdData,
    success: (res) => {
      uni.hideLoading();
      if (res.statusCode === 200) {
        const data = res.data;
        if (data.code === 200 || data.code === 0) {
          uni.showToast({ title: '密码修改成功', icon: 'success' });
          // 清空密码表单
          pwdForm.value = {
            oldPassword: '',
            newPassword: '',
            confirmPassword: ''
          };
          // 延迟返回
          setTimeout(() => {
            uni.navigateBack();
          }, 1500);
        } else {
          uni.showToast({ title: data.msg || '修改失败', icon: 'none' });
        }
      }
    },
    fail: (err) => {
      uni.hideLoading();
      uni.showToast({ title: '修改失败', icon: 'none' });
      console.error('修改密码失败:', err);
    }
  });
};
</script>

<style scoped>
.container {
  min-height: 100vh;
  background-color: #f5f5f5;
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

/* 表单卡片 */
.form-card {
  background-color: white;
  margin: 15px;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}

/* 表单列表 */
.form-list {
  margin-bottom: 15px;
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

/* 密码提示 */
.password-hint {
  margin-bottom: 20px;
  padding-left: 5px;
}

.hint-text {
  font-size: 12px;
  color: #999;
}

/* 提交按钮 */
.submit-btn {
  width: 100%;
  height: 44px;
  line-height: 44px;
  background: linear-gradient(135deg, #1890ff, #36cfc9);
  color: #fff;
  font-size: 16px;
  font-weight: bold;
  border-radius: 22px;
  border: none;
}

.submit-btn::after {
  border: none;
}

.submit-btn:active {
  opacity: 0.9;
}
</style>
