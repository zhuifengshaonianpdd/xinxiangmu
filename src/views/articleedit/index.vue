<template>
  <el-card class="box-card">
    <div slot="header" class="clearfix">
      <span>修改文章</span>
    </div>
    <el-form ref="editFormRef" :model="editForm" label-width="100px" :rules="editFormRules">
      <el-form-item label="标题" prop="title">
        <el-input v-model="editForm.title"></el-input>
      </el-form-item>
      <el-form-item label="内容" prop="content">
        <!-- quill-editor最后编译变成许多html标签，它们身上没有data-v-xx的属性 -->
        <quill-editor v-model="editForm.content"></quill-editor>
      </el-form-item>
      <el-form-item label="封面">
        <!-- el-radio-group是el-radio单选按钮的父标签，可以统一设置v-model或change事件等 -->
        <el-radio-group v-model="editForm.cover.type">
          <el-radio :label="1">单图</el-radio>
          <el-radio :label="3">三图</el-radio>
          <el-radio :label="0">无图</el-radio>
          <el-radio :label="-1">自动</el-radio>
        </el-radio-group>
        <ul>
          <!-- 把item序号信息当做参数传递给showDialog,可以获得到的信息分别为 1 2 3 -->
          <li class="uploadbox" v-for="item in covernum" :key="item" @click="showDialog(item)">
            <span>点击图标选择图片</span>
            <img v-if="editForm.cover.images[item-1]" :src="editForm.cover.images[item-1]" alt>
            <div v-else class="el-icon-picture-outline"></div>
          </li>
        </ul>
      </el-form-item>

      <el-form-item label="频道" prop="channel_id">
        <!-- 当前父组件把channel_id信息当做参数传递给channel子组件 -->
        <channel :chid="editForm.channel_id" @slt="selectHandler"></channel>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="editarticle(false)">修改</el-button>
        <el-button @click="editarticle(true)">存入草稿</el-button>
      </el-form-item>
    </el-form>

    <!-- @close是对话框的关闭事件，任何条件关闭对话框，都会执行该事件 -->
    <el-dialog title="提示" :visible.sync="dialogVisible" width="60%" @close="clearImage">
      <!-- 标签切换效果 -->
      <el-tabs v-model="activeName" type="card">
        <el-tab-pane label="素材库" name="first">
          <!-- 素材图片列表展示 -->
          <ul>
            <li class="image-box" v-for="item in imageList" :key="item.id">
              <img :src="item.url" alt="没有图片" @click="clkImage">
            </li>
          </ul>
        </el-tab-pane>
        <el-tab-pane label="上传图片" name="second">
          <el-button type="primary">上传图片</el-button>
        </el-tab-pane>
      </el-tabs>

      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="imageOK">确 定</el-button>
      </span>
    </el-dialog>
  </el-card>
</template>

<script>
import Channel from '@/components/channel.vue'
// 导入富文本编辑器的css样式文件
// vue-quill-editor 是构建在quill基础之上的(是进一步的封装)
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'
// 导入富文本编辑器的组件模块
import { quillEditor } from 'vue-quill-editor'

export default {
  name: 'ArticleEdit',
  components: {
    Channel,
    // 富文本编辑器的组件模块做注册
    quillEditor
  },
  data () {
    return {
      xu: 0,
      materialUrl: '',
      activeName: 'first',
      querycdt: {
        collect: false,
        page: 1,
        per_page: 12
      },
      imageList: [],
      dialogVisible: false,
      editForm: {
        title: '',
        content: '',
        // 文章封面
        cover: {
          type: 0,
          images: []
        },
        channel_id: ''
      },
      // 表单校验规则
      editFormRules: {
        title: [
          { required: true, message: '标题必填' },
          // 后端要求title长度介于5-30个字符
          {
            min: 5,
            max: 30,
            message: '标题长度介于5-30个字符'
          }
        ],
        content: [{ required: true, message: '内容必填' }],
        channel_id: [{ required: true, message: '频道必选' }]
      }
    }
  },
  created () {
    // 获得频道
    this.getArticleById()
    this.getImageList()
  },
  computed: {
    aid () {
      return this.$route.params.aid
    },
    covernum () {
      if (this.editForm.cover.type > 0) {
        return this.editForm.cover.type
      }
      return 0
    }
  },
  methods: {
    clearImage () {
      let lis = document.querySelectorAll('.image-box')
      for (var i = 0; i < lis.length; i++) {
        lis[i].style.border = ''
      }
      this.materialUrl = ''
    },
    imageOK () {
      if (this.materialUrl) {
        this.editForm.cover.images[this.xu] = this.materialUrl
        this.dialogVisible = false // 关闭对话框
      } else {
        this.$message.error('咋地，一个都没有相中！')
      }
    },
    clkImage (evt) {
      let lis = document.querySelectorAll('.image-box')
      for (var i = 0; i < lis.length; i++) {
        lis[i].style.border = ''
      }
      evt.target.parentNode.style.border = '3px solid red'
      this.materialUrl = evt.target.src
    },
    getImageList () {
      let pro = this.$http({
        url: '/mp/v1_0/user/images',
        method: 'get',
        params: this.querycdt
      })
      pro
        .then(result => {
          this.imageList = result.data.data.results
        })
        .catch(err => {
          return this.$message.error('获得图片列表失败：' + err)
        })
    },
    showDialog (n) {
      this.xu = n - 1
      this.dialogVisible = true
    },
    selectHandler (id) {
      this.searchForm.channel_id = id
    },
    getArticleById () {
      // axios带着id请求服务器端
      let pro = this.$http({
        url: '/mp/v1_0/articles/' + this.aid,
        method: 'get'
      })
      pro
        .then(result => {
          this.editForm = result.data.data
        })
        .catch(err => {
          return this.$message.error('获取文章失败：' + err)
        })
    },
    // 修改文章
    // @flag: false修改   true草稿
    editarticle (flag) {
      // 表单整体校验
      this.$refs.editFormRef.validate(valid => {
        // 校验失败停止后续执行
        if (!valid) {
          return false
        }
        let pro = this.$http({
          url: '/mp/v1_0/articles/' + this.aid,
          method: 'put',
          data: this.editForm, // 表单数据
          params: { draft: flag } // 请求字符串数据
        })
        pro
          .then(result => {
            this.$message.success('修改文章成功！')
            // 跳转到列表页面
            this.$router.push({ name: 'article' })
          })
          .catch(err => {
            return this.$message.error('修改文章失败：' + err)
          })
      })
    }
  }
}
</script>

<style lang="less" scoped>
/*控制富文本编辑器的高度样式*/
// .ql-editor{height:200px;}  // 编译变为.ql-editor[data-v-494db270] { height: 200px; } 失效的

/*使用深度作用选择器
  /deep/深度作用选择器作用： 前边的会关联data-v-xx属性，而后边的不会关联
*/
.quill-editor /deep/ .ql-editor {
  height: 200px;
}
.image-box {
  list-style: none;
  width: 200px;
  height: 140px;
  background-color: #fff;
  margin: 10px;
  float: left;
  border: 1px solid #eee;
  cursor: pointer;
  box-sizing: border-box;
  img {
    width: 100%;
    height: 100%;
  }
}
.uploadbox {
  list-style: none;
  width: 200px;
  height: 200px;
  margin: 10px;
  float: left;
  cursor: pointer;
  border: 1px solid #eee;
  span {
    width: 200px;
    height: 50px;
    line-height: 50px;
    display: block;
    text-align: center;
  }
  div {
    width: 200px;
    height: 150px;
    font-size: 100px;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #fff;
  }
  img {
    width: 200px;
    height: 150px;
  }
}
</style>
