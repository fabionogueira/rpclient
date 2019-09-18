// @ts-check

import utils from './utils'
import EventManager from './event-mananger'

// eslint-disable-next-line
import API from './api'

/**
 * @typedef {Object<string, any>} TypeRequestOptions
 * @property {string} url
 * @property {string} method
 * @property {any} [data]
 * @property {FormData} [form]
 * @property {Object<string, any>} [headers]
 * @property {string} [requestType]
 * @property {string} [responseType]
 * @property {number} [timeout]
 * @property {boolean} [prevent]
 * @property {string} [cache]
 * @property {boolean} [download]
 * @property {function} [beforeRequest]
 * @property {function} [beforeResponse]
*/

class Request extends EventManager{
    /**
     * @param {API} api
     * @param {TypeRequestOptions} options 
     */
    constructor(api, options){
        super()

        /** @type {TypeRequestOptions} */
        this._options = Object.assign({
            data: {},
            form: null,
            headers: {},
            requestType: 'json',
            responseType: 'json',
            timeout: 10000,
            prevent: false,
            cache: null,
            download: false,
            beforeRequest(/*config*/){},
            beforeResponse(/* error, response*/){}
        }, options)

        /** @type {API} */
        this._api = api
        this._count = 3
    }

    /**
     * @returns {API}
     */
    getAPI(){
        return this._api
    }

    /**
     * @returns {TypeRequestOptions}
     */
    getOptions(){
        return this._options
    }

    /**
     * @returns {Promise}
     */
    send(){
        return new Promise((resolve, reject) => {
            this._send(resolve, reject)
        })
    }

    /**
     * @param {Function} resolve 
     * @param {Function} reject 
     */
    _send(resolve, reject){
        let api = this.getAPI()
        let rpc = api.getRPC()
        let preventRequest = rpc.getPrevent() 
        let restOptions = rpc.getOptions()
        let apiOptions = api.getOptions()
        let requestOptions = this.getOptions()
        let next = () => {
            this._send(resolve, reject)
        }
        let onUnlocked = (error, instance) => {
            instance.off('unlocked', onUnlocked)

            if (error){
                return reject({
                    status: error.status,
                    statusText: error.statusText,
                    response: null,
                    preventResponse: error.response
                })
            }

            this._send(resolve, reject)
        }
        
        // se as requisições estão bloqueadas, normalmente pq depende de resposta de outra que ainda não retornou
        if (preventRequest && preventRequest !== this){
            console.log('rest locked, wait for ', `[${preventRequest.getOptions().url}]`)
            return preventRequest.on('unlocked', onUnlocked)
        }

        if (requestOptions.prevent){
            //a partir daqui, qualquer requisição irá aguardar esta retornar
            rpc.setPrevent(this)
        }
        
        requestOptions = restOptions.beforeRequest(requestOptions)    || requestOptions     
        requestOptions = apiOptions.beforeRequest(requestOptions)     || requestOptions     
        requestOptions = requestOptions.beforeRequest(requestOptions) || requestOptions
        
        this._request(requestOptions, (error, response) => {
            if (error && response && (response.status == 0 || response.status >= 500)) {
                if (--this._count > 0 && !error.timeout) {
                    return setTimeout(()=>{next()}, 400)
                }
            }

            response = restOptions.beforeResponse(error, response, requestOptions)    || response
            response = apiOptions.beforeResponse(error, response, requestOptions)     || response
            response = requestOptions.beforeResponse(error, response, requestOptions) || response

            preventRequest = rpc.getPrevent()
            if (preventRequest && preventRequest !== this){
                console.log('rest locked, wait for ', `[${preventRequest.getOptions().url}]`)
                return preventRequest.on('unlocked', onUnlocked)
            }

            if (preventRequest == this){
                //a partir daqui todas as requisições pendentes estão liberadas
                rpc.setPrevent(null, error)
            }

            if (error){
                reject(error)

            } else {
                resolve(response)
            }

        })
    }

    _request(config, onResponse) {
        let xhr = new XMLHttpRequest()

        xhr.onreadystatechange = function() {
            let responseHeaders, responseData, response
            let error = null

            if (this.readyState == 4){
                // By Axios
                // Prepare the response
                responseHeaders = utils.parseHeaders(xhr.getAllResponseHeaders())
                responseData = utils.parseResponseData(config, xhr, responseHeaders)
                response = {
                    data: responseData,
                    // IE sends 1223 instead of 204 (https://github.com/axios/axios/issues/201)
                    status: xhr.status === 1223 ? 204 : xhr.status,
                    statusText: xhr.status === 1223 ? 'No Content' : xhr.statusText,
                    headers: responseHeaders,
                    config: config,
                    request: xhr
                };

                if (response.status == 0 || response.status >= 400) {
                    xhr['error'] = true

                    //para evitar que seja respondido duas vezes, pois entra aqui e em ontimeout quando ocorre timeout
                    return setTimeout(()=>{
                        if (xhr['istimeout']){
                            return
                        }
                        
                        error = {
                            status: response.status,
                            statusText: response.statusText || 'failed',
                            response
                        }

                        onResponse(error, response, xhr)
                    }, 1)
                }
                
                onResponse(error, response, xhr)
            }
        }

        xhr.onerror = function() {
            if (xhr['error']){
                return
            }

            console.log('xhr.onerror')

            onResponse({
                status: 0,
                statusText: 'error',
                response: null
            })
        }

        xhr.ontimeout = function handleTimeout() {
            xhr['istimeout'] = true

            onResponse({
                status: 0,
                statusText: `timeout of ${config.timeout}ms exceeded`,
                response: null,
                timeout: true
            })
        }
        
        if (config.download){
            xhr.responseType = 'blob'
        }
        
        xhr.open(config.method, encodeURI(config.url), !(config.async === false))
        xhr.timeout = config.timeout;

        Object.keys(config.headers).forEach(key => {
            xhr.setRequestHeader(key, config.headers[key])
        })

        xhr.send(config.form || JSON.stringify(config.data))
    }
   
}

export default Request