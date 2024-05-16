const express = require('express');
const app = express();
const path = require('path');
const fs = require('fs').promises;

/* 포트 설정 */
app.set('port', process.env.PORT || 3000);

/* 공통 미들웨어 */ 
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use((req, res, next)=>{
    console.log( Date.now(), req.method, req.url );
    // logger 삽입
    next();
})

app.get('/', (req, res, next) => {  
    res.sendFile(path.join(__dirname,'views', '/index.html'));
});

// 필요한 데이터로 변경하여 사용 
app.get('/user', (req, res) => { 
    
});

app.get('/all-user', async (req, res) => {
    try{
        const datas = await fs.readFile(path.join(__dirname, 'model', 'users.json'));
        const users = await JSON.parse(datas);

        res.send( users )
    }catch{
        console.log('에러')
    }
});

app.get('/user/hong', async (req, res) => {
    try{
       
    }catch(error){
        console.log(error)
    }
});

// 와일드카드는 다른 라우터보다 항상 아래 위치해야함
// 위 hong보다 위에 있을 경우 와일드 카드가 실행됨
app.get('/user/:name',  async (req, res) => {
    res.sendFile(path.join(__dirname,'views', '/getUser.html'));
    // next()
});

app.post('/user', async (req, res) => {  
    let body = req.body;
    try{
        res.send('create');

        if(req.body) throw new Error('req.body undefined')
    }catch{
        console.log(error)
    }
});

app.delete('/user',  async (req, res) => {
    try{
        res.send('delete')
    }catch{
        
    }
});

app.put('/user',  async (req, res) => {  
    let body = req.body;
    try{
        res.send('update')
    }catch{
        
    }
});


// 그외의 라우트 처리 
app.use('/*', (req, res) => { 
    res.status(500).send('404');
    // 500을 보내지 않을 경우 처리는 된것임으로 200정상처리된 것처럼 실행됨 
    // 사용자를 속이는 것임 
});

// 실제로 express는 에러가 나면 에러를 처리해줌
// 문제는 고객에게 에러를 모두 표시하면 
// 보안등 문제가 발생할 수 있으니 에러를 별도로 처리함 
app.use((err, req, res, next)=>{
    console.error( err.message );
    res.send('잠시 후 다시 접속해주세요')
})

app.listen(app.get('port'), () => {
    console.log(app.get('port'), '번 포트에서 서버 실행 중 ..')
});