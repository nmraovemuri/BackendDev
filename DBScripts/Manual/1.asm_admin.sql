DROP TABLE IF EXISTS asm_admin;
CREATE TABLE asm_admin (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `email_id` varchar(55) NOT NULL,
  `password` varchar(200) NOT NULL,

  CONSTRAINT asm_admin_pk	PRIMARY KEY (`id`),
  CONSTRAINT asm_admin_email_id_u UNIQUE (`email_id`)
);
