//@ts-check

const utils = {
    hash(s) {
        let h, o
        let a = 1
        let c = 0
        
        if (s) {
            a = 0;
            for (h = s.length - 1; h >= 0; h--) {
                o = s.charCodeAt(h);
                a = (a << 6 & 268435455) + o + (o << 14);
                c = a & 266338304;
                a = c !== 0 ? a ^ c >> 21 : a;
            }
        }
    
        return String(a)
    },

    parseHeaders(str){
        let obj = {}
    
        str.split('\n').forEach(ln => {
            let a = ln.split(':')
            let k = a[0].trim()
            let v = a[1]
    
            if (k){
                obj[k.toLowerCase()] = v ? v.trim().toLowerCase() : null
            }
        })
    
        return obj
    },

    parseResponseData(config, request, responseHeaders){
        let contentType = responseHeaders['content-type'] || ''
    
        if (config.responseType === 'text'){
            return request.responseText
        }
    
        if (contentType.includes('application/json') && request.responseType != 'blob'){
            return JSON.parse(request.responseText)
        }
    
        return request.responseType == 'blob' ? {} : request.responseText
    },

    getValue(item1, item2, _default){
        if (typeof (item1) == 'function'){
            return item1()
        }

        if (item1){
            return item1 == undefined ? _default : item1
        }

        if (typeof (item2) == 'function'){
            return item2()
        }

        return item2 == undefined ? _default : item2
    }
}

export default utils