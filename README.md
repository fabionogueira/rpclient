#usage

``` bash
npm install rpclient

```

``` javascript

import RPClient from 'rpclient'

const rpc = new RPClient({
    //todas as requisições passarão por aqui antes de serem enviadas
    beforeRequest(config){
        config.headers['x-custom-head'] = 'value'

        //isso faz com que a requisição assuma essa configuração
        return config
    },

    //todas as respostas passarão por aqui
    beforeResponse(error, response, config){
        //posso modificar a resposta e retornar aqui
        return response
    }
})

//exemplo 01
rpc.get('http://get.param/:p1/:p2', {p1:1, p2:2, q:'xpto'})
//GET http://get.param/1/2/?q=xpto

//exemplo 02
let form = new FormData()
form.append('name', 'myname')
form.append('id', 2)
rpc.put('http://put.form/:id', form) //form pode ser HTMLFormElement
    .then(res => {
        console.log(res)
    })
    .catch(err => {
        console.warn(err)
    })

//exemplo 03
let loginApi = rpc.api({
    beforeRequest(config){
        //posso modificar a requisição aqui, aina que já tenha sido modificada no RPClient
    }    
})
loginApi.post('http://login.api', {username:'myuser', password:'mypass'})
    .then(res => {
        console.log(res)
    })
    .catch(err => {
        console.warn(err)
    })

//exemplo 04
rpc.get('http://my.api.search', {q:'n=argument'})
    .then(res => {
        console.log('api2 ok', res)
    })
    .catch(err => {
        console.warn('api2 error', err)
    })


//exemplo 05
//renovando token expirado
let access_token = 'xYowlkjunlakuh987yap34jnf0987yb0q98ht097yb0397yb097y6bn-028nuv98npouiboiuhoiuhs'
let renew_token = 'rkijnlkjnlasfa-alkjnaf897yaoisuy09iknoab987y-9a8upasjfçlkjs.npaiushdboiu'

const rpc = new RPClient({
    beforeRequest(config){
        config.headers['Authentication'] = access_token
        return config
    },

    beforeResponse(error){
        let config
        let data = error ? error.data : {} //considerendo que esse seja o formato da resposta de erro da sua api
        
        //considerando que este seja o formato de resposta quando o token expirar
        if (data.code == 'TokenExpiredError'){
            config = {
                url: `http://my.api/renew/`,
                method: 'put',
                prevent: true, //todas as outras requisições ficam pendentes desta, inclusive a atual que retornou esse erro, esta será reenviada
                data: {
                    renew_token
                }
            }
            
            rpc.request(config)
                .then((result)=>{
                    access_token = result.data.access_token
                    renew_token = result.data.renew_token
                    console.log('renew ok')
                })
                .catch(err => {
                    console.warn('renew error', err)
                    //bom lugar para chamar tela de autenticação
                })
        }
    }
})


```