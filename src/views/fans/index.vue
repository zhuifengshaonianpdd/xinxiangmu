<template>
   <el-card class="box-card">
    <div slot="header" class="clearfix">
      <span>粉丝统计</span>
    </div>
    <div id="main" ref="main2" style="width: 600px;height:400px;"></div>
  </el-card>
</template>

<script>
import echarts from 'echarts'
export default {
  name: 'Fans',
  mounted () {
    this.paintPic()
  },
  data () {
    return {
      myChart: null // 接收echarts图表对象
    }
  },
  methods: {
    paintPic () {
      let dv = this.$refs.main2
      this.myChart = echarts.init(dv)
      let option = {
        title: {
          text: '某站点用户访问来源',
          subtext: '纯属虚构',
          left: 'center'
        },
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b} : {c} ({d}%)'
        },
        legend: {
          orient: 'vertical',
          left: 'left',
          data: ['直接访问', '邮件营销', '联盟广告', '视频广告', '搜索引擎']
        },
        series: [
          {
            name: '访问来源',
            type: 'pie',
            radius: '55%',
            center: ['50%', '60%'],
            data: [
              { value: 335, name: '直接访问' },
              { value: 310, name: '邮件营销' },
              { value: 234, name: '联盟广告' },
              { value: 135, name: '视频广告' },
              { value: 1548, name: '搜索引擎' }
            ],
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            }
          }
        ]
      }
      this.myChart.setOption(option)
      this.getFansStat()
    },
    getkeys (obj) {
      var keys1 = []
      for (var p1 in obj) {
        if (obj.hasOwnProperty(p1)) { keys1.push(p1) }
      }
      return keys1
    },
    getFansStat () {
      // axios发起请求(该接口不稳定，会提示404，多尝试即可)
      let pro = this.$http({
        url: '/mp/v1_0/statistics/followers',
        method: 'get'
      })
      pro
        .then(result => {
          // 把粉丝数据封装为option的样子
          // age:{le18:57,le23:71……}
          // 1. 把legend的data数据通过result组织
          let keys = this.getkeys(result.data.data.age)

          // 2. 把series的data数据通过result组织
          let dataObj = []
          let ages = result.data.data.age
          for (var k in ages) {
            // 把 成员的key和value获得出来填充到dataObj里边
            dataObj.push({ value: ages[k], name: k })
          }

          let opt = {
            legend: {
              // data: ['le18', 'le23', 'le30', 'le40', 'le50']
              data: keys
            },
            series: [
              {
                data: dataObj
              }
            ]
          }
          // echarts图表对象调用setOption()
          this.myChart.setOption(opt)
        })
        .catch(err => {
          return this.$message.error('获得粉丝统计数据失败：' + err)
        })
    }
  }
}
</script>

<style lang="less" scoped>
</style>
