const express = require('express');
const app = express();
const path = require('path');
const fs = require('fs').promises;
const fsex = require('fs');

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
    try{
        res.send('user error test');

        // 처리만 하고 주석
        // if(req.body) throw new Error('req.body undefined');
    }catch(error){
        console.log(error)
    }
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

// localhost:3000/user/hong
// params로 걸러내지 못함 
// app.get('/user/hong', async (req, res, next) => {
//     // const {user_id} = req.params;
//     const user_id = req.url.slice(req.url.lastIndexOf('/')+1);
//     console.log(user_id)
//     try{
//         const datas = await fs.readFile(path.join(__dirname, 'model', 'users.json'));
//         const users = await JSON.parse(datas);

//         const findUser = users.find( user=>user.user_id === user_id)
         
//         res.send(findUser)
//     }catch(error){
//         console.log(error);
//         res.send(error);
//         // 고객에게 error를 표시하는 것은 정상적이지 않음 
//         // 보안에도 취약함 
//     }
// });

// 와일드카드는 다른 라우터보다 항상 아래 위치해야함
// 위 hong보다 위에 있을 경우 와일드 카드가 실행됨
// 2개가 공존할 수는 없음 
app.get('/user/:id', async (req, res) => {
    const {id} = req.params; 
    console.log(id)
    try{
        const datas = await fs.readFile(path.join(__dirname, 'model', 'users.json'));
        const users = await JSON.parse(datas);

        const findUser = users.find( user=>user.user_id === id)
        
        res.send(findUser)
    }catch(error){
        error.message = '파일을 찾을 수 없습니다.'
        res.send(error.message);
        throw error;
    }
});



let maxlength = 0;
// login : id, pwd => 추가해보기
app.post('/login-user', async (req, res, next)=>{}) 

// register : 모든 데이터를 다 넘겨줘야함
app.post('/create-user', async (req, res, next)=>{ 
    const filePath = path.join(__dirname, 'model', 'users.json');

    // 파일이 존재하는지 확인
    if (!fsex.existsSync(filePath)) {
        // 파일이 없으면 빈 배열로 초기화
        fs.writeFile(filePath, '[]');
    }  
    next();
}, async (req, res, next) => {  
    let body = req.body;
    // let { user_pwd, user_id } = req.body;
    console.log( body )
    // console.log(  user_pwd, user_id )
    try{
        const datas = await fs.readFile(path.join(__dirname, 'model', 'users.json'));       const users = await JSON.parse(datas); 

        // const findUser = users.find(user=> user.user_id ===  user_id && user.user_pwd === user_pwd)
        const findUser = users.find(user=> user.user_id ===  body.user_id && user.user_pwd === body.user_pwd)
        // console.log('findUser', findUser)

        if( findUser ){
            next();
        }

        for( item of users ){
            // if(users.length < item.id){
            //     maxlength = item.id
            // }else{
            //     maxlength = users.length;
            // }

            maxlength =  users.length < item.id ? item.id : users.length; 
        }
        
         body.id = maxlength + 1; 
        // res.send( maxlength );
        // express deprecated res.send(status): Use res.sendStatus(status) instead app.js:105:14
        // // 숫자를 send하면 status 코드인줄 알고 error
        // res.send( ""+maxlength );

        users.push(body);

        await fs.writeFile(path.join(__dirname, 'model', 'users.json'),
              JSON.stringify(users, null, "  "),
              error => {
                if( error ) throw error; 
            }
        )

        res.send('정상등록')
    }catch(error){
        console.log(error)
    }
}, (req, res)=>{
    // throw new Error('아이디 또는 비밀번호를 확인하세요')
    res.send('아이디 또는 비밀번호를 확인하세요') 
});

app.delete('/user', async (req, res) => {
    try{

        const { user_id, user_pwd }= req.body;
        const datas = await fs.readFile(path.join(__dirname, 'model', 'users.json'));       
        const users = await JSON.parse(datas); 
         
        const findUser = users.find(user=> user.user_id === user_id && user.user_pwd === user_pwd)
        const filterUser = users.filter(user=> user.id !== findUser.id );

        if( findUser && filterUser.length === users.length - 1){
            await fs.writeFile(path.join(__dirname, 'model', 'users.json'),
                JSON.stringify(filterUser, null, "  "),
                error => {
                    if( error ) throw error; 
                }
            ) // writeFile end

            res.send('정상삭제')
        }// if end 
        else{
            res.send('데이터를 찾을 수 없습니다.');
            throw new Error('데이터를 찾을 수 없습니다.');
        }
 
    }catch(error){
        console.log(error)
    }
});

app.delete('/user/:id', async (req, res) => {
    const { id } = req.params;  

    try{
        const datas = await fs.readFile(path.join(__dirname, 'model', 'users.json'));       
        const users = await JSON.parse(datas); 

        const findUser = users.filter(user=> user.id ===  +id ); 
        const filterUser = users.filter(user=> user.id !==  +id ); 
        if( findUser && filterUser.length === users.length - 1){
            await fs.writeFile(path.join(__dirname, 'model', 'users.json'),
                JSON.stringify(filterUser, null, "  "),
                error => {
                    if( error ) throw error; 
                }
            ) // writeFile end

            res.send('정상삭제')
        }// if end 
        else{
            throw new Error('데이터를 찾을 수 없습니다.');
        }

        // error를 발생시키지 않고 send() 해도 되겠지만 
    }catch(error){
        console.log(error);
        res.send('데이터를 찾을 수 없습니다.')   
    }
});

app.put('/user', async (req, res) => {  
    try{

        const body = req.body;
        const datas = await fs.readFile(path.join(__dirname, 'model', 'users.json'));       
        const users = await JSON.parse(datas); 
         
        const findUser = users.find(user=> user.user_id === body.user_id && user.user_pwd === body.user_pwd);
        
        if( findUser ){
            const filterUser = users.filter(user=> user.id !== findUser.id );
            filterUser.push( body ) 

            await fs.writeFile(path.join(__dirname, 'model', 'users.json'),
                JSON.stringify(filterUser, null, "  "),
                error => {
                    if( error ) throw error; 
                }
            ) // writeFile end
            res.send('수정완료')
        }else{
            throw new Error('데이터를 찾을 수 없습니다.');
        }

        // error를 발생시키지 않고 send() 해도 되겠지만 
    }catch(error){
        console.log(error);
        res.send('데이터를 찾을 수 없습니다.')   
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