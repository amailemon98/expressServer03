CREATE DATABASE IF NOT EXISTS linksdb;

USE mydb;
 
CREATE TABLE users (
  id INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY ,
  user_name VARCHAR(100) NOT NULL,
  user_id VARCHAR(100) NOT NULL,
  user_pwd VARCHAR(60) NOT NULL,
  user_phone VARCHAR(14) NOT NULL,
  user_email VARCHAR(30) NOT NULL,
  created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP 
) ;

-- drop table users

DESCRIBE users;
DESC users;

INSERT INTO users (user_name, user_id, user_pwd, user_email, user_phone) 
  VALUES ('이길동', 'lee', '12345', 'lee@gmail.com', '01011111111'),
  ('김길동', 'kim', '12345', 'kim@gmail.com', '01011111111'),
  ('고길동', 'goo', '12345', 'goo@gmail.com', '01011111111');

SELECT * FROM users;

SELECT * FROM users WHERE id = 1
SELECT * FROM users WHERE user_id = 'hong';
SELECT * FROM users WHERE user_id = 'kim' and id = 1;
SELECT * FROM users WHERE user_id = 'kim' or id = 1;

/user/kim?name=kim&id=1

DELETE FROM users WHERE id=1

UPDATE users SET 
  user_name = '김길동',   
  user_pwd = '12345',   
  user_email = 'kim@example.com',   
  user_phone = '01022223333' 
  WHERE user_id = 'kim' and user_pwd = '12345';

 