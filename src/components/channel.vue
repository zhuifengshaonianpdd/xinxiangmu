<template>
  <el-select v-model="nowid" placeholder="请选择" clearable>
    <el-option v-for="item in channelList" :key="item.id" :label="item.name" :value="item.id"></el-option>
  </el-select>
</template>

<script>
export default {
  name: 'Channel',
  props: {
    chid: {
      default: ''
    }
  },
  watch: {
    nowid (newV) {
      this.$emit('slt', newV)
    },
    chid (newV) {
      this.nowid = newV
    }
  },

  data () {
    return {
      channelList: [],
      nowid: ''
    }
  },
  created () {
    this.getChannelList()
  },
  methods: {
    getChannelList () {
      let pro = this.$http({
        url: '/mp/v1_0/channels',
        method: 'get'
      })
      pro
        .then(result => {
          this.channelList = result.data.data.channels
        })
        .catch(err => {
          return this.$message.error('获得频道失败：' + err)
        })
    }
  }
}
</script>

<style lang="less" scoped>
</style>
