<template>
  <div class="login-container">
    <div class="login-box">
      <el-form ref="loginFormRef" :model="loginForm" :rules="loginFormRules">
        <img src="./logo_index.png" alt />
        <el-form-item prop="mobile">
          <el-input v-model="loginForm.mobile" placeholder="请输入手机号码">
            <i slot="prefix" class="iconfont icon-iconfontshouji"></i>
          </el-input>
        </el-form-item>
        <el-form-item prop="code">
          <el-input v-model="loginForm.code" placeholder="请输入验证码">
            <i slot="prefix" class="iconfont icon-yanzhengma"></i>
          </el-input>
        </el-form-item>
        <el-form-item style="text-align:left;" prop="xieyi">
          <el-checkbox v-model="loginForm.xieyi" style="margin-right:10px;"></el-checkbox>
          <span>
            我已阅读并同意
            <a href="#">用户协议</a>和
            <a href="#">隐私条款</a>
          </span>
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            style="width:100%;"
            @click="login()"
            :disabled="isLoading"
            :loading="isLoading"
          >登录</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
import './gt.js'

import '@/assets/iconfont/iconfont.css'

export default {
  name: '',

  data () {
    var xieyiTest = function (rule, value, callback) {
      value ? callback() : callback(new Error('请遵守协议！'))
    }

    return {
      isLoading: false,

      loginForm: {
        capObj: null,
        mobile: '18435925122',
        code: '246810',
        xieyi: true
      },
      loginFormRules: {
        mobile: [
          { required: true, message: '手机号必填' },
          { pattern: /^1[35789]\d{9}$/, message: '手机号码格式不对' }
        ],
        code: [{ required: true, message: '验证码必填' }],
        xieyi: [
          {
            validator: xieyiTest
          }
        ]
      }
    }
  },
  methods: {
    login () {
      this.$refs.loginFormRef.validate(valid => {
        if (!valid) {
          return false
        }
        if (this.capObj) {
          return this.capObj.verify()
        }
        this.isLoading = true

        let pro = this.$http({
          url: '/mp/v1_0/captchas/' + this.loginForm.mobile,
          method: 'get'
        })
        pro
          .then(result => {
            console.log(result)
            let { data } = result.data
            window.initGeetest(
              {
                gt: data.gt,
                challenge: data.challenge,
                offline: !data.success,
                new_captcha: true,
                product: 'bind'
              },
              captchaObj => {
                captchaObj
                  .onReady(() => {
                    captchaObj.verify()
                    this.isLoading = false
                    this.capObj = captchaObj
                  })
                  .onSuccess(() => {
                    this.loginAct()
                  })
                  .onError(() => {})
              }
            )
          })
          .catch(err => {
            return this.$message.error('获取密钥失败' + err)
          })
      })
    },
    loginAct () {
      // 服务器端账号真实校验
      let pro = this.$http({
        url: '/mp/v1_0/authorizations',
        method: 'POST',
        data: this.loginForm
      })
      pro
        .then(result => {
          // console.log(result) // 【data】  status statusText headers config request
          // 客户端浏览器把服务器端返回的秘钥等相关信息通过 sessionStorage 做记录，表明是登录状态
          window.sessionStorage.setItem(
            'userinfo',
            JSON.stringify(result.data.data)
          )
          // 进入后台系统
          this.$router.push({ name: 'home' })
        })
        .catch(err => {
          // 通过弹出框把错误显示出来
          // console.log('手机号码或验证码错误:' + err)
          // this.$message({
          //   type: 'error',
          //   message: '手机号码或验证码错误:' + err,
          //   duration:1000
          // })
          // 上下效果一致
          this.$message.error('手机号码或验证码错误:' + err)
        })
    }
  }
}
</script>

<style lang="less" scoped>
.login-container {
  height: 100%;
  background-color: gray;
  display: flex;
  justify-content: center;
  align-items: center;
  background-image: url("./login_bg.jpg");
  background-size: cover;
  .login-box {
    width: 410px;
    height: 345px;
    background-color: #fff;
    display: flex;
    justify-content: center;
    align-items: center;
    .el-form {
      width: 75%;
      text-align: center;
      img {
        width: 65%;
        margin: 20px auto;
      }
    }
  }
}
</style>
