// 1. 날짜, 시간 만들고 
// 2. uuid 만들고
// 3. 파일, 폴더 만들고 
// 4. log 쓰고 

const {format} = require('date-fns');
const {v4:uuid} = require('uuid');
const fs = require('fs');
const fsPromises = require('fs').promises;
const path = require('path');

// 미들웨어 : 함수, express에서 자주 사용하는 기능
// winston, morgan : logger를 쓸 수 있는 model들
// API : 함수, 변수, 클래스, 객체, ... => 규칙, 규정, 만들어진 것을 설명하는 사용 설명서
// expressAPI : 정의해 놓은 것
// get : url로 데이터 읽어오기
// post : body로 데이터 읽어오기
// delete : 지울때 읽어오기
// use : 공통 코드 넣는 곳

const logEvents = async (message) => {
// logName을 추가로 받음 
//const logEvents = async (message, logName) => {
    const dateTime = `${format(new Date(), "yyyMMdd\tHH:mm:ss")}`;
    const logItem = `\n${dateTime}\t${uuid()}\t${message}`;
    // console.log(logItem);

    try {

      if (!fs.existsSync(path.join(__dirname, "..", "logs"))) {
        await fsPromises.mkdir(path.join(__dirname, "..", "logs"));
      }
      
      await fsPromises.appendFile(
        //path.join(__dirname, "logs", logName), // 'eventLog.txt가 아니라 logName
        path.join(__dirname, "..", "logs", 'eventLog.txt'), // 'eventLog.txt가 아니라 logName
        logItem
      );
    } catch (err) {
       console.log(err)
    }
  };
  // logEvents('hello test') // 테스트용
  module.exports = logEvents;
  