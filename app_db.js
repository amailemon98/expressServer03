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

// js에서 db에 직접 연결하는 방식
// npm i mariadb 드라이버 가져옴
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
        conn = await pool.getConnection(); // pool을 얻을 때까지 기다린다.
        if(conn){ // 5명 안에 들었으면
            const sql = `SELECT * FROM users;`; //내용을 다 보여달라
            const rows = await conn.query(sql); //실행해 달라
            // console.log( rows );
            res.send(rows);
        }else{
            console.log('잠시 후 다시 접속해주세요');
        }
        // res.send( 'all-user' )
    }catch{
        console.log('에러')
    }finally{
        if(conn) conn.close();
    }
});



// 와일드카드는 다른 라우터보다 항상 아래 위치해야함
// 위 hong보다 위에 있을 경우 와일드 카드가 실행됨
// localhost:3000/user/kim?name=kim&id=1
// app.get('/user/hong',  async (req, res) => { // 이렇게 하면 각각 처리할 수 있게 만들어 줘야 한다.
app.get('/user/:name',  async (req, res) => {
    const {name} = req.params;
    const findData = req.query;
    // console.log(req.url); // /user/kim?name=kim&id=1
    // console.log(name, req.params); // kim { name: 'kim' } 
    // console.log(req.query); // qs, queryString // { name: 'kim', id: '1' }
    // res.send(`${req.url}`)
    
    let conn;
    try{
       conn = await pool.getConnection(); 
    //    const sql = `SELECT * FROM users WHERE user_id = '${findData.name}' and id = ${findData.id};`;
       const sql = `SELECT * FROM users WHERE user_id = '${findData.name}' or id = ${findData.id};`;

       if(conn){
        const rows = await conn.query(sql);
        console.log(rows);
        if(rows.length){
            return res.send(rows);
        }else{
            return res.send('데이터를 찾을 수 없습니다.');
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

// login
app.post('/login-user', async (req, res) => {  

    let {user_id, user_pwd} = req.body;
    // console.log( user_id, user_pwd)
    // const sql1 = `SELECT * FROM users WHERE user_id = '${user_id}' and user_pwd = '${user_pwd}';`
    const sql1 = `SELECT count(*) as count FROM users WHERE user_id = '${user_id}' and user_pwd ='${user_pwd}';`;
    let conn;
    try{
        conn = await pool.getConnection(); 
        if(conn){
            
            const rows =  await conn.query(sql1);
            console.log(rows); //[ { count: 0n } ]

            const count = rows[0].count.toString();
            console.log(count); //[ { count: 0n } ]

            // if(rows.length){
            if(count >= 1){
                res.send('login');
            }else{
                res.send('아이디 또는 비밀번호를 확인하세요.')
            }
            }

    }catch(error){
        console.log(error)
    }finally{
        if(conn) conn.close();
    }
});

// create
app.post('/create-user', async (req, res) => {  
    let {user_name, user_id, user_pwd, user_phone, user_email} = req.body;
    console.log(user_name, user_id, user_pwd, user_phone, user_email);
    let conn;

    const sql1 = ` SELECT count(*) as count FROM users WHERE user_id = '${user_id}';`

    // 비밀번호를 암호화 시켜서 user_pwd 대신에 hash_pwd 저장하는 과정이 필요
    const sql2 = `  INSERT INTO 
                    users (user_name, user_id, user_pwd, user_email, user_phone) 
                    VALUES ('${user_name}', '${user_id}', '${user_pwd}', '${user_email}', '${user_phone}')
                 `
    
    //비동기 처리 : 완료를 보증하지 않고 무조건 실행 (병렬처리처럼 보임)
    try{
        conn = await pool.getConnection(); //없으면 올때까지 대기
        // 대기
        if(conn){
            const rows1 = await conn.query(sql1)
            console.log(rows1); //[ { count: 0n } ]

            if(rows1[0].count.toString() === '0'){
                const rows = await conn.query(sql2);
                console.log(rows);
                // OkPacket { affectedRows: 1, insertId: 9n, warningStatus: 0 }

                if(rows.affectedRows ){
                    res.send('create');
                }else{
                    res.send('데이터를 확인하세요.');
                }
            }else{
                // res.send('아이디 또는 비밀번호를 확인하세요')
                res.send('이미 사용되고 있는 아이디 입니다.')
            }

        }else{
            res.send('잠시 후에 다시 처리해주세요.')
        }
        
        
    }catch{
        console.log(error)
    }finally{
        if(conn) conn.close();
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