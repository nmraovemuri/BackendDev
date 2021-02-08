DROP DATABASE IF EXISTS asm_service; 

create DATABASE asm_service;

#grant all on asmservice.* to asmuser@'%' identified by 'passw0rd';
#--GRANT ALL PRIVILEGES ON *.* TO profileservice'@'localhost' IDENTIFIED BY 'passw0rd' WITH GRANT OPTION;

flush privileges;