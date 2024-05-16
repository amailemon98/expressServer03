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

//  js에서 db에 직접 연결하는 방식
const mariadb = require('mariadb'); //npm i mariadb 드라이버 가져오기
const pool = mariadb.createPool({
    host: '127.0.0.1',
    user: 'root',
    port: 'yourPortNum',
    password: 'yourPassword',
    database: 'yourDB',
    connectionLimit: 5
}) //몇명이나 접속할 수 있을지 세팅


/* 포트 설정 */
app.set('port', process.env.PORT || 3000);

/* 공통 미들웨어 */ 
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // (쿼리스트링) qs, queryString // true면 사용
// app.use(logEvents("hello test"));
// app.use(morgan('combined'))

// create database mydb
// app.use(async (req,res,next)=>{
//     const conn = await pool.getConnection(); // pool 5개중에 1개
//     if (conn){
//         console.log('데이터베이스 초기화 완료');
//     }else {
//         console.log('데이터베이스 초기화 불가'); 
//     }
//     next();
// })
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

// java : ibatis, mybatis
// javascript : ibatis(html 형태), sequelize(js 형태), ...
// js을 sql으로 만들어 주기
app.get('/all-user', async (req, res) => {
    try{
        // const datas = await fs.readFile(path.join(__dirname, 'model', 'users.json'));
        // const users = await JSON.parse(datas);
        // error
        conn = await pool.getConnection();
        if(conn){ // 5명 안에 들었으면
            const sql = `SELECT * FROM users;`;
            const rows = await conn.query(sql);
            // console.log( rows );
            res.send(rows);
        }else{
            console.log('잠시 후 다시 접속해주세요');
        }
        // res.send( 'all-user' )
    }catch{
        console.log('에러')
    }
});

app.get('/user/hong', async (req, res, next) => {
    let conn;
    const id = req.url.slice(req.url.lastIndexOf('/') + 1);
    try{
       conn = await pool.getConnection(); // pool을 얻어옴, db를 open 했다는 의미 (꼭 닫아야 함!!)
       const sql = `SELECT * FROM users WHERE user_id = '${id}';`;
    //    const sql = `SELECT * FROM users WHERE user_id = '${'kim'}';`;

        if(id !== 'hong')next('route') // hong과 같지 않으면 다음을 처리

       if(conn){
        const rows = await conn.query(sql);
        console.log(rows);
        if(rows.length){
            return res.send(rows)
        }else{
            return res.send('데이터를 찾을 수 없습니다.')
        }
        
       }else{
        throw new Error('잠시 후에 다시 접속하세요');
        // 104번 라인에서 pool을 얻지 못할때 처리
       }
    }catch(error){
        console.log(error)
    }finally{
        // 오류가 나던, 정상처리하던 항상 실행됨
        // 비동기 처리 : 무조건 실행, 순서를 지키지 못할 수도 있음
        // await, async 목적은 비동기 처리하되 순서대로 처리하라
        if(conn)conn.close();
    }
});

// 와일드카드는 다른 라우터보다 항상 아래 위치해야함
// 위 hong보다 위에 있을 경우 와일드 카드가 실행됨
// localhost:3000/user/kim
// localhost:3000/user/kim/1 //kim { name: 'kim', id: '1' }
// localhost:3000/user/1/kim //1 { name: '1', id: 'kim' } // express는 뒤바뀐것을 모른다.
// localhost:3000/user/park
// localhost:3000/user/1
// localhost:3000/user/2

app.get('/user/:name',  async (req, res) => {
// app.get('/user/:id',  async (req, res) => { //구분 불가능한 라우터
    // res.sendFile(path.join(__dirname,'views', '/getUser.html'));
    // next()
    const {name} = req.params;
    // console.log(name, req.params);
    
    let conn;
    try{
       conn = await pool.getConnection(); 
       const sql = `SELECT * FROM users WHERE user_id = '${name}';`;

       if(conn){
        const rows = await conn.query(sql);
        console.log(rows);
        if(rows.length){
            return res.send(rows)
        }else{
            return res.send('데이터를 찾을 수 없습니다.')
        }
        
       }else{
        throw new Error('잠시 후에 다시 접속하세요');
       }
    }catch(error){
        console.log(error)
    }finally{
        if(conn)conn.close();
    }
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