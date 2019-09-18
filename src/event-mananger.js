//@ts-check

export default class EventManager {
    constructor(){
        this._listeners = {}
    }

    /**
     * @param {string} event 
     * @param {Function} callback 
     * @returns {EventManager}
     */
    on(event, callback){
        let a = this._listeners[event]

        if (!a){
            a = this._listeners[event] = []
        }

        a.push(callback)

        return this
    }

    /**
     * @param {string} event 
     * @param {Function} callback 
     * @returns {EventManager}
     */
    off(event, callback){
        let a = this._listeners[event]

        if (a){
            a.forEach((fn, index) => {
                if (callback == fn) a.splice(index, 1)
            })
        }

        return this
    }

    /**
     * @param {string} event 
     * @param {*} [data] 
     * @returns {EventManager}
     */
    dispatch(event, data){
        let a = this._listeners[event]

        if (a){
            a = a.slice(0)
            a.forEach(callback => {
                if (callback) callback(data, this)
            })
        }

        return this
    }
}