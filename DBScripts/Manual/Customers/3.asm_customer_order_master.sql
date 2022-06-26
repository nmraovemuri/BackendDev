DROP TABLE IF EXISTS asm_customer_order_master;
CREATE TABLE asm_customer_order_master(
	`id`		int(25)		NOT NULL AUTO_INCREMENT,
	`total_items`	int(5)		NOT NULL,
	`total_amount`	DECIMAL(10,2)	NOT NULL,
	`status`	VARCHAR(20)	NOT NULL,
	`customer_id`	INT(25)		NOT NULL,
	`created_date`	int(11)		NOT NULL,
	`updated_date`	int(11)		NULL,
	`source_app` 	VARCHAR(5)  NULL,

CONSTRAINT asm_customer_order_master_pk PRIMARY KEY (`id`),
CONSTRAINT asm_customer_order_master_customer_id_fk FOREIGN KEY (`customer_id`) REFERENCES asm_customers (`customer_id`)
);