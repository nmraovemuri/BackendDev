DROP TABLE IF EXISTS asm_customers;

CREATE TABLE asm_customers (
  `customer_id` INT(25) NOT NULL AUTO_INCREMENT,
  `first_name`  VARCHAR(100) NOT NULL,
  `last_name`	VARCHAR(100) NOT NULL,
  `email_id`	VARCHAR(100) NOT NULL,
  `mobile`	VARCHAR(15) NOT NULL,
  `password`	VARCHAR(250) NOT NULL,
  `email_id_verified` bit(1) DEFAULT NULL,
  `is_active`	bit(1)	DEFAULT NULL,
  `created_on`	TIMESTAMP NOT NULL,
  `last_login`	TIMESTAMP NULL, 
  CONSTRAINT asm_customers_pk PRIMARY KEY (`customer_id`),
  CONSTRAINT asm_customers_email_id_u UNIQUE (`email_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;