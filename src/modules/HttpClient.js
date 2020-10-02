const axios = require('axios')

class HttpClient {
  constructor (baseURL) {
    this.instance = axios.create({
      baseURL
    })

    this._initialiseResponseInterceptor()
  }

  _initialiseResponseInterceptor () {
    this.instance.interceptors.response.use(
      this._handleResponse,
      this._handleError
    )
  }

  _handleResponse ({ data }) {
    return data
  }

  _handleError (error) {
    Promise.reject(error)
  }
}

module.exports = HttpClient
