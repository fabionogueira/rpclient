// @ts-check

import API from './api'

// eslint-disable-next-line
import Request from './request'

/**
 * @typedef {Object<string, any>} TypeRestOptions
 * @property {function} [beforeRequest] 
 * @property {function} [beforeResponse]
*/

class RPClient{
    /**
     * @param {TypeRestOptions} [options] 
     */
    constructor(options){
        this._options = Object.assign({
            beforeRequest(/*config*/){},
            beforeResponse(/* error, response*/){}
        }, options)

        /** @type {Request} */
        this._prevent = null
    }

    /**
     * @returns {TypeRestOptions}
     */
    getOptions(){
        return this._options
    }

    /**
     * @param {string} url 
     * @param {*} [data]
     * @returns {Promise}
     */
    get(url, data = null){
        let api = new API(this, {})
        return api.get(url, data)
    }

    /**
     * @param {string} url 
     * @param {*} data 
     * @returns {Promise}
     */
    post(url, data){
        let api = new API(this, {})  
        return api.post(url, data)
    }

    /**
     * @param {string} url 
     * @param {*} data 
     * @returns {Promise}
     */
    put(url, data){
        let api = new API(this, {})
        return api.put(url, data)
    }

    /**
     * @param {string} url 
     * @param {*} data 
     * @returns {Promise}
     */
    delete(url, data){
        let api = new API(this, {})
        return api.delete(url, data)
    }

    /**
     * @param {import('./api').TypeSendOptions} options 
     * @returns {Promise}
     */
    request(options){
        let api = new API(this, {})
        return api.request(options)
    }

    /**
     * @param {TypeRestOptions} options 
     * @returns {API}
     */
    api(options){
        let api = new API(this, options)
        return api
    }

    /**
     * @returns {Request}
     */
    getPrevent(){
        return this._prevent
    }

    /**
     * @param {Request} request 
     * @param {*} [error]
     */
    setPrevent(request, error = null){
        let prevent = this._prevent

        if (!request && this._prevent){
            this._prevent = null
            prevent.dispatch('unlocked', error)
        }

        this._prevent = request
    }
}

export default RPClient