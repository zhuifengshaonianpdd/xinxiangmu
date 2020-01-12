<template>
  <div>
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span>发表文章</span>
      </div>
      <div class="text item">
        <el-form ref="addFormRef" :model="addForm" label-width="120px" :rules="addFormRules">
          <el-form-item label="标题：" prop="title">
            <el-input v-model="addForm.title"></el-input>
          </el-form-item>
          <el-form-item label="内容：" prop="content">
            <quillEditor v-model="addForm.content"></quillEditor>
          </el-form-item>
          <el-form-item label="封面：">
            <el-radio-group v-model="addForm.cover.type">
              <el-radio :label="1">单图</el-radio>
              <el-radio :label="3">三图</el-radio>
              <el-radio :label="0">无图</el-radio>
              <el-radio :label="-1">自动</el-radio>
            </el-radio-group>
            <ul>
                  <li class="uploadbox" v-for="item in covernum" :key="item"
                  @click="showDialog()">
                      <span>点击图标选择图片</span>
                      <div class="el-icon-picture-outline"></div>
                  </li>
              </ul>
          </el-form-item>
          <el-form-item label="频道：" prop="channel_id">
            <channel @slt="selectHandler"></channel>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="addarticle(false)">发布</el-button>
            <el-button @click="addarticle(true)">存入草稿</el-button>
          </el-form-item>
        </el-form>
         <el-dialog title="提示" :visible.sync="dialogVisible" width="60%">
          <!-- 标签切换效果 -->
          <el-tabs v-model="activeName" type="card">
          <el-tab-pane label="素材库" name="first">
            <!-- 素材图片列表展示 -->
          <ul>
        <li class="image-box" v-for="item in imageList" :key="item.id">
          <img :src="item.url" alt="没有图片"  @click="clkImage" >
        </li>
      </ul>
    </el-tab-pane>
        <el-tab-pane label="上传图片" name="second">
             <el-button type="primary">上传图片</el-button>
         </el-tab-pane>
  </el-tabs>

  <span slot="footer" class="dialog-footer">
    <el-button @click="dialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="dialogVisible = false">确 定</el-button>
  </span>
</el-dialog>
      </div>
    </el-card>
  </div>
</template>

<script>
import Channel from '@/components/channel.vue'
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'
import { quillEditor } from 'vue-quill-editor'
// 引入富文本编辑器
export default {
  name: 'ArticleAdd',
  computed: {
    covernum () {
      if (this.addForm.cover.type > 0) {
        return this.addForm.cover.type
      }
      return 0
    }
  },
  components: {
    quillEditor,
    Channel
  },
  data () {
    return {
      dialogVisible: false,
      activeName: 'first',
      imageList: [],
      querycdt: {
        collect: false,
        page: 1,
        per_page: 12
      },
      addForm: {
        title: '',
        content: '',
        cover: {
          type: 0,
          images: []
        },
        channel_id: ''
      },
      addFormRules: {
        title: [
          { required: true, message: '标题必填' },
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
    this.getImageList()
  },
  methods: {
    clkImage (evt) {
      let lis = document.querySelectorAll('.image-box')
      for (var i = 0; i < lis.length; i++) {
        lis[i].style.border = ''
      }
      let nowli = evt.target.parentNode
      nowli.style.border = '5px solid orange'
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
    showDialog () {
      this.dialogVisible = true
    },
    selectHandler (id) {
      this.addForm.channel_id = id
    },
    addarticle (flag) {
      this.$refs.addFormRef.validate(valid => {
        if (!valid) {
          return false
        }
        let pro = this.$http({
          url: '/mp/v1_0/articles',
          method: 'post',
          data: this.addForm,
          params: { draft: flag }
        })
        pro
          .then(result => {
            this.$message.success('发布文章成功！')
            this.$router.push({ name: 'article' })
          })
          .catch(err => {
            return this.$message.error('发布文章失败' + err)
          })
      })
    }
  }
}
</script>

<style lang="less" scoped>
.quill-editor /deep/ .ql-editor {
  height: 200px;
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
  img{
    width: 200px;
    height: 150px;
  }
}
.image-box {
  list-style: none;
  width: 200px;
  height: 140px;
  background-color: #fff;
  margin: 10px;
  float: left;
  border: 1px solid #eee;
  cursor:pointer;
  box-sizing:border-box;
  img {
    width: 100%;
    height: 100%;
  }
}
</style>
