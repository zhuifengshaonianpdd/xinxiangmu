import Vue from 'vue'
import axios from 'axios'
import JSONbig from 'json-bigint'
axios.defaults.baseURL = 'http://ttapi.research.itcast.cn/'
Vue.prototype.$http = axios
axios.interceptors.request.use(function (config) {
  let userinfo = window.sessionStorage.getItem('userinfo')
  if (userinfo) {
    let token = JSON.parse(userinfo).token
    config.headers.Authorization = 'Bearer ' + token
  }
  return config
}, function (error) {
  return Promise.reject(error)
})
axios.defaults.transformResponse = [function (data) {
  if (data) {
    return JSONbig.parse(data)
  }
  return data
}]
