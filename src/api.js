// @ts-check

import Request from './request'

// eslint-disable-next-line
import RPClient from '.'

/**
 * @typedef {Object<string, any>} TypeSendOptions
 * @property {string} url
 * @property {string} method 
 * @property {any} [data]
 * @property {any} [form]
 * @property {boolean} [prevent]
 * @property {function} [beforeSend] 
 * @property {function} [beforeResponse]
 * @property {function} [onResponse]
*/

/**
 * @typedef {Object<string, any>} TypeApiOptions
 * @property {function} [beforeRequest] 
 * @property {function} [beforeResponse]
*/

class API{
    /**
     * @param {RPClient} rpclient
     * @param {TypeApiOptions} options 
     */
    constructor(rpclient, options){
        /** @type {TypeApiOptions} */
        this._options = Object.assign({
            beforeRequest(/*config*/){},
            beforeResponse(/* error, response*/){}
        }, options)

        this._rpc = rpclient
        this._listeners = {}
    }

    /**
     * @returns {RPClient}
     */
    getRPC(){
        return this._rpc
    }

    /**
     * @returns {TypeApiOptions}
     */
    getOptions(){
        return this._options
    }

    /**
     * @param {string} url 
     * @param {*} params 
     * @returns {Promise}
     */
    async get(url, params){
        return this.request({
            url,
            method: 'get',
            data: params
        })
    }

    /**
     * @param {string} url 
     * @param {*} data 
     * @returns {Promise}
     */
    async post(url, data){
        let form = (data && (data instanceof FormData) || data.nodeName == 'FORM') ? data : null
        
        data = form ? {} : data
        
        return this.request({
            url,
            method: 'post',
            data,
            form
        })
    }

    /**
     * @param {string} url 
     * @param {*} data 
     * @returns {Promise}
     */
    async put(url, data){
        let form = (data && (data instanceof FormData) || data.nodeName == 'FORM') ? data : null
        
        data = form ? {} : data
        
        return this.request({
            url,
            method: 'put',
            data,
            form
        })
    }

    /**
     * @param {string} url 
     * @param {*} data 
     * @returns {Promise}
     */
    async delete(url, data){
        return this.request({
            url,
            method: 'delete',
            data
        })
    }

    /**
     * @param {string} url
     * @returns {Promise}
     */
    async download(url){
        return this.request({
            url,
            method: 'get',
            download: true
        })
    }

    /**
     * @param {import('./request').TypeRequestOptions} options 
     * @returns {Promise}
     */
    async request(options){
        let i, a, q1, q2
        let f = null
        
        options = Object.assign({}, options)
        options.data = JSON.parse(JSON.stringify(options.data || {}))
        options.headers = JSON.parse(JSON.stringify(options.headers || {}))

        if (!options.requestType){
            options.requestType = 'json'
        }

        if (options.requestType == 'json' && !options.headers['Content-Type']){
            options.headers['Content-Type'] = 'application/json'
        }

        // options.cache = `restclient.${utils.hash(JSON.stringify(options))}`

        if (options.form){
            f =  (options.form instanceof FormData) ? options.form : new FormData()
            
            //@ts-ignore
            if (options.form.nodeName == 'FORM'){
                //@ts-ignore
                for (i=0; i<options.form.length; i++){
                    f.append(options.form[i].name, options.form[i].value)
                }
            }
        } 
        
        options.url = options.url.replace(/\/:\w*/g, p => {
            let v

            p = p.substring(2) // exclui /:
            v = options.data[p]
            delete (options.data[p])

            return `/${v || ''}`
        })

        //prepara os dados para envio na url caso seja get
        if (options.method == 'get'){
            a = options.url.split('?')
            q1 = q2 = a[1] || ''
            Object.keys(options.data).forEach(key => {
                q2 += `&${key}=${options.data[key]}`
                delete(options.data[key])
            })
            if (q1 != q2){
                a[0] += (a[0][a[0].length-1] == '/' ? '' : '/')
                options.url = `${a[0]}?${q2}`.replace('?&', '?')
            }
        }
        
        if (f){
            for (i in options.data){
                f.append(i, options.data[i])
            }

            options.data = {}
            options.form = f
        }


        return new Request(this, options)
    }

}

export default API