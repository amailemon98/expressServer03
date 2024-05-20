const bcrypt = require('bcrypt');

// 비동기처리(완료를 보증하지 않음)
console.log('1. 비동기처리')

// bcrypt.hash('12345', 10, function(err, data) {
//     //       비밀번호,10단계,
//     if(err)console.log(err);
//     else console.log(data);

//     bcrypt.compare('12345', data, function(err, result) {
//         // result === true
//         console.log('result:',result);
//     });
// });


// bcrypt.hash('12345', 10)
// .then(function(hash) {
//     console.log(hash);
// })
// .catch(function(error){
//     console.log(error);
// })



const bcrypt_pr = new Promise((resolve, reject)=>{
    bcrypt.hash('12345', 10, (err, data)=>{
        if(err) reject(err)
        else resolve(data)
    })
})

bcrypt_pr.then(data=>console.log(data))
.catch(function(error){
    console.log(error);
})

console.log('3');

// Promise -> 순서를 금방 알 수 있다는 장점
