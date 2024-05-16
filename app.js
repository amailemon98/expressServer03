const express = require('express');
const app = express();
const path = require('path');
const fs = require('fs').promises;
const fsExit = require('fs');
const logEvents = require('./middleware/logEvents.js'); // js
// json과 js는 확장자를 붙여주는게 확실하다. 생략하게 되면 js인지 json인지 혼돈할 수 있다.
// const morgan = require('morgan');

// 1. js 모양이 같다.
// localStorage 에 저장
// json 데이터 사용하기
// database 사용하기

// 2. next(0)로 라우터 제어해보기
// 3. localhost:3000/user?name=kim&age=30 (쿼리스트링)

/* 포트 설정 */
app.set('port', process.env.PORT || 3000);

/* 공통 미들웨어 */ 
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // (쿼리스트링) qs, queryString // true면 사용
// app.use(logEvents("hello test"));
// app.use(morgan('combined'))
app.use(async(req, res, next)=>{
    const filePath = path.join(__dirname, 'model', 'users.json');
    //파일이 존재하는지 확인

    // Sync 붙은 코드 사용
    if(!fsExit.existsSync(filePath)){
        // 파일이 없으면 빈 배열로 초기화
        fs.writeFile(filePath, '[]')
    }
    next(); // 다음 콜백 처리
});
app.use((req, res, next)=>{
    console.log( Date.now(), req.method, req.url );
    logEvents(`${req.method}, ${req.url}`)
    // logger 삽입
    next();
})

app.get('/', (req, res, next) => {  
    res.sendFile(path.join(__dirname,'views', '/index.html'));
});

// 필요한 데이터로 변경하여 사용 
app.get('/user', (req, res) => { 
    res.send('user')
});

app.get('/all-user', async (req, res) => {
    try{
        const datas = await fs.readFile(path.join(__dirname, 'model', 'users.json'));
        const users = await JSON.parse(datas);
        // console.log(datas.toString());
        // // let users = !datas ? [] : await JSON.parse(datas);

        // users = await JSON.parse(datas);

        // error
        res.send( users )
        // res.send( 'all-user' )
    }catch{
        console.log('에러')
    }
});

app.get('/user/hong', async (req, res, next) => {
// app.get('/user/:name', async (req, res) => {
    try{
        // res.send(`${req.url}`); //Error [ERR_HTTP_HEADERS_SENT]: Cannot set headers after they are sent to the client
        console.log('/user/hong');
        next('route'); // 다음 것도 실행하고 싶을때 
    }catch(error){
        console.log(error)
    }
});

// 와일드카드는 다른 라우터보다 항상 아래 위치해야함
// 위 hong보다 위에 있을 경우 와일드 카드가 실행됨
// js는 오버라이드 개념이 없다.
app.get('/user/:name',  async (req, res) => {
    console.log('/user/:name');
    res.sendFile(path.join(__dirname,'views', '/getUser.html'));
    // next()
});

app.post('/user', async (req, res) => {  
    let body = req.body;
    try{
        res.send('create');

        // if(req.body) throw new Error('req.body undefined')
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