//@ts-check

import RPClient from '../src'

const rpc = new RPClient({
    beforeRequest(config){
        config.headers['xx'] = 11
        console.log('REST beforeResponse', config.url)
        return config
    },
    beforeResponse(){
        console.log('REST beforeResponse')
    }
})

//teste 01: get com parâmetros
//rest.get('http://get.param/:p1/:p2/ok', {p1:1, p2:2})

//teste 02: get com query
//rest.get('http://get.query/', {p1:1, p2:2})

//teste 03: get com parâmetros e query
//rest.get('http://get.param.and.query/:p1')

//teste 04: get com parâmetros e query
// let form = new FormData()
// form.append('p1', 1)
// form.append('p2', 2)
// rest.post('http://get.param.and.query/:p1', form)
//     .then(res => {
//         console.log(res)
//     })
//     .catch(err => {
//         console.warn(err)
//     })

function doRenew(){
    console.log('doRenew')
    rpc.request({
        url: 'http://localhost:8080/renew',
        method: 'post',
        prevent: true
    })
    .then((result)=>{
        console.log('renew ok', result)
    })
    .catch(err => {
        console.warn('renew error', err)
    })
}

// teste 05: método api
let renew = true
let api = rpc.api({
    beforeRequest(config){
        config.headers['yy'] = 12
        console.log('API beforeResponse')
        return config
    },
    beforeResponse(){
        if (renew){
            renew = false
            doRenew()

        } else {
            console.log('API beforeResponse')
        }
    }
    
})
api.get('http://localhost:8080/api1/:p1', {p1:10})
    .then(res => {
        console.log('api1 ok', res)
    })
    .catch(err => {
        console.warn('api1 error', err)
    })

rpc.get('http://localhost:8080/api2/:p1')
    .then(res => {
        console.log('api2 ok', res)
    })
    .catch(err => {
        console.warn('api2 error', err)
    })