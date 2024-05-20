const bcrypt = require('bcrypt');

// 비동기처리(완료를 보증하지 않음)
console.log('1. 비동기처리')

// bcrypt.hash('12345', 10, function(err, data) {
//     //       비밀번호,10단계,
//     if(!err)console.log('2.',data);
//     console.log('3. 비동기처리')
// });


async function bcryptHash(){
    try {
        const data = await bcrypt.hash('12345', 10); // 다음 실행하지 말고 암호화가 완료 될때까지 대기하라
        console.log('2', data); // await이 빠지면 undefined
    } catch (err) {
        console.log(err);
    }
}

bcryptHash();
console.log('3');