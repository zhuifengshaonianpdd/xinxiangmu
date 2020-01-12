<template>
     <el-card class="box-card">
    <!--命名插槽，头部内容设置-->
    <div slot="header" class="clearfix">
      <span>账户信息</span>
    </div>
    <!--匿名插槽，卡片主体内容-->
    <div class="text item cardbody">
      <div id="lt">
        <el-form ref="accountFormRef" :model="accountForm" label-width="100px" :rules="accountFormRules">
          <el-form-item label="用户名：" prop="name">
            <el-input v-model="accountForm.name"></el-input>
          </el-form-item>
          <el-form-item label="手机号码：">
            <el-input v-model="accountForm.mobile" disabled></el-input>
          </el-form-item>
          <el-form-item label="邮箱：" prop="email">
            <el-input v-model="accountForm.email"></el-input>
          </el-form-item>
          <el-form-item label="简介：">
            <el-input type="textarea" v-model="accountForm.intro"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="editAccount()">更新账户</el-button>
          </el-form-item>
        </el-form>
      </div>
      <div id="rt">
        <el-upload action = ""
            :show-file-list="false"
            :http-request="httpRequest">
            <img v-if="accountForm.photo" :src="accountForm.photo" class="avatar" width="260" height="260">
            <i v-else class="el-icon-plus avatar-uploader-icon"></i>
        </el-upload>
      </div>
    </div>
  </el-card>
</template>

<script>
import bus from '@/utils/bus.js'
export default {
  name: 'Account',
  data () {
    return {
      accountForm: {
        // 各个成员来自api参考【2.4 编辑用户资料】
        id: '', // id
        name: '', // 名称
        mobile: '', // 手机号码
        email: '', // 邮箱
        intro: '', // 简介
        photo: ''
      },
      accountFormRules: {
        name: [
          { required: true, message: '名字必填' },
          // 后端要求title长度介于1-7个字符
          {
            min: 1,
            max: 7,
            message: '名字长度介于1-7个字符之间'
          }
        ],
        email: [
          { required: true, message: '邮箱必填' },
          { type: 'email', message: '邮箱格式不正确' }
        ]
      }
    }
  },
  created () {
    // 获取账户信息
    this.getAccountInfo()
  },
  methods: {
    httpRequest (resource) {
      let pic = resource.file
      let fd = new FormData()
      fd.append('photo', pic)
      let pro = this.$http({
        url: '/mp/v1_0/user/photo',
        method: 'patch',
        data: fd
      })
      pro
        .then(result => {
          bus.$emit('upAccountPhoto', result.data.data.photo)
          this.$message.success('头像更新成功')
          this.accountForm.photo = result.data.data.photo
        })
        .catch(err => {
          return this.$message.error('头像更新失败' + err)
        })
    },
    editAccount () {
      // 校验表单
      this.$refs.accountFormRef.validate(valid => {
        if (!valid) { return false }
        // axios带着更新好的账户信息请求服务器端存储
        // get(获取)/post(添加)/put(修改)/delete(删除)
        // patch(修改)
        // put: 对“全部”表单域项目进行修改
        // patch: 对“部分”表单域项目进行修改
        // get“请求字符串”参数通过params传递，params设置参数会在url地址中体现 ?x=y&x=y....
        // 其他请求方式传递的参数都是data(浏览器地址栏看不见该参数)
        let pro = this.$http({
          url: '/mp/v1_0/user/profile',
          method: 'patch',
          data: this.accountForm
        })
        pro
          .then(result => {
            // console.log(result)
            // 成功提示
            bus.$emit('upAccountName', this.accountForm.name)
            this.$message.success('更新成功！')
          })
          .catch(err => {
            return this.$message.error('更新账户信息失败：' + err)
          })
      })
    },
    getAccountInfo () {
      let pro = this.$http({
        url: '/mp/v1_0/user/profile',
        method: 'get'
      })
      pro
        .then(result => {
          // console.log(result)
          // 把获得好的账户信息赋予给 accountForm
          this.accountForm = result.data.data
        })
        .catch(err => {
          return this.$message.error('获得账户信息失败：' + err)
        })
    }
  }
}
</script>

<style lang="less" scoped>
.cardbody {
  display: flex;
  justify-content: space-between;
  #lt {
    width: 40%
  }
  #rt {
    width: 30%
  }
}
</style>
