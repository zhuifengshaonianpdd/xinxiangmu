<template>
  <div>
    <!--搜索卡片区-->
    <el-card class="box-card">
      <!--命名插槽，头部内容-->
      <div slot="header" class="clearfix">
        <span>全部图文</span>
      </div>
      <!--匿名插槽，内容主体-->
      <div class="text item">
        <!--el-form搜索表单区域-->
        <el-form ref="searchFormRef" :model="searchForm" label-width="100px">
          <el-form-item label="文章状态：">
            <el-radio v-model="searchForm.status" label>全部</el-radio>
            <el-radio v-model="searchForm.status" label="0">草稿</el-radio>
            <el-radio v-model="searchForm.status" label="1">待审核</el-radio>
            <el-radio v-model="searchForm.status" label="2">审核通过</el-radio>
            <el-radio v-model="searchForm.status" label="3">审核失败</el-radio>
            <el-radio v-model="searchForm.status" label="4">已删除</el-radio>
          </el-form-item>
          <el-form-item label="频道列表：">
           <channel @slt="selectHandler"></channel>
          </el-form-item>
          <el-form-item label="时间选择：">
            <el-date-picker
              v-model="timetotime"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              value-format="yyyy-MM-dd"
            ></el-date-picker>
          </el-form-item>
        </el-form>
      </div>
    </el-card>
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span>共找到{{tot}}条符合条件的内容</span>
      </div>
      <el-table :data="articleList" style="width: 100%" border>
        <el-table-column prop="cover.images[0]" label="图标">
          <img
            slot-scope="stData"
            :src="stData.row.cover.images[0]"
            alt="没有图标"
            width="150"
            height="100"
          />
        </el-table-column>
        <el-table-column prop="title" label="标题"></el-table-column>
        <el-table-column prop="status" label="状态">
          <template slot-scope="stData">
            <el-tag v-if="stData.row.status===0">草稿</el-tag>
            <el-tag v-else-if="stData.row.status===1" type="success">待审核</el-tag>
            <el-tag v-else-if="stData.row.status===2" type="info">审核通过</el-tag>
            <el-tag v-else-if="stData.row.status===3" type="warning">审核失败</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="pubdate" label="发布时间"></el-table-column>
        <el-table-column label="操作">
          <template slot-scope="stData">
            <el-button
              type="primary"
              size="mini"
              icon="el-icon-edit"
              @click="$router.push('/articleedit/'+stData.row.id)"
            >修改</el-button>
            <el-button
              type="danger"
              size="mini"
              icon="el-icon-delete"
              @click="del(stData.row.id)"
            >删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="searchForm.page"
        :page-sizes="[10, 20, 30, 40]"
        :page-size="searchForm.per_page"
        layout="total, sizes, prev, pager, next, jumper"
        :total="tot"
      ></el-pagination>
    </el-card>
  </div>
</template>

<script>
import Channel from '@/components/channel.vue'
export default {
  name: 'Article',
  components: {
    Channel
  },
  watch: {
    searchForm: {
      handler: function (newV, oldV) {
        this.getArticleList()
      },
      deep: true
    },
    timetotime: function (newV) {
      if (newV) {
        this.searchForm.begin_pubdate = newV[0]
        this.searchForm.end_pubdate = newV[1]
      } else {
        this.searchForm.begin_pubdate = ''
        this.searchForm.end_pubdate = ''
      }
      this.getArticleList()
    }
  },
  data () {
    return {
      articleList: [],
      tot: 0,
      timetotime: '',
      // 搜索表单数据对象
      searchForm: {
        begin_pubdate: '',
        end_pubdate: '',
        channel_id: '',
        status: '',
        page: 1,
        per_page: 10
      }
    }
  },
  created () {
    this.getArticleList()
  },
  methods: {
    selectHandler (id) {
      this.searchForm.channel_id = id
    },
    del (id) {
      this.$confirm('确认要删除该文章么?', '删除', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          let pro = this.$http({
            url: '/mp/v1_0/articles/' + id,
            method: 'delete'
          })
          pro
            .then(result => {
              this.getArticleList()
            })
            .catch(err => {
              return this.$message.error('删除文章失败：' + err)
            })
        })
        .catch(() => {})
    },
    handleSizeChange (val) {
      this.searchForm.per_page = val
    },
    handleCurrentChange (val) {
      this.searchForm.page = val
    },
    getArticleList () {
      let searchData = {}
      for (var i in this.searchForm) {
        if (this.searchForm[i] || this.searchForm[i] === 0) {
          searchData[i] = this.searchForm[i]
        }
      }
      let pro = this.$http({
        url: '/mp/v1_0/articles',
        method: 'get',
        params: searchData
      })
      pro
        .then(result => {
          this.articleList = result.data.data.results
          this.tot = result.data.data.total_count
        })
        .catch(err => {
          return this.$message.error('获得文章失败：' + err)
        })
    }
  }
}
</script>

<style lang="less" scoped>
.box-card {
  margin-bottom: 15px;
}
.el-pagination {
  margin-top: 15px;
}
</style>
