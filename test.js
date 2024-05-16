function myData(){
    try{
        // console.log('try');
        throw new Error('myError');
    }catch(err){
        console.log('err');
    }finally{
        console.log('무조건 실행');
    }
}

myData();

// await, async 처리와 전혀 상관없이 node가 error를 처리하는 방법
// try~catch 없이 error 처리
process.on('uncaughtException', ()=>{
    // 이벤트 처리
});