DROP TABLE IF EXISTS asm_customer_billing_address;

CREATE TABLE asm_customer_billing_address (
  `id`			int(25)		NOT NULL AUTO_INCREMENT,
  `first_name`		VARCHAR(100)	NOT NULL,
  `last_name`		VARCHAR(100)	NOT NULL,
  `mobile`		VARCHAR(15)		NOT NULL,
  `email_id`		VARCHAR(150)	NOT NULL,
  `addr_field1`		VARCHAR(150)	NULL,
  `addr_field2`		VARCHAR(150)	NULL,
  `addr_field3`		VARCHAR(150)	NULL,
  `addr_field4`		VARCHAR(150)	NULL,
  `addr_field5`		VARCHAR(150)	NULL,
  `addr_field6`		VARCHAR(150)	NULL,
  `city`		VARCHAR(150)	NOT NULL,
  `state`		VARCHAR(150)	NOT NULL,
  `country`		VARCHAR(150)	NOT NULL,
  `pin_code`		VARCHAR(150)	NOT NULL,
 
  `customer_id`		INT(25)		NOT NULL,
  `created_date`	int(11)		NOT NULL,
  `updated_date`	int(11)		NOT NULL,
  CONSTRAINT asm_customer_billing_address_pk PRIMARY KEY (`id`),
  CONSTRAINT asm_customer_billing_address_customer_id__fk FOREIGN KEY (customer_id) REFERENCES asm_customers (`customer_id`)
) ;