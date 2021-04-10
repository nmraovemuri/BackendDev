DROP TABLE IF EXISTS asm_customer_order_details;
CREATE TABLE asm_customer_order_details (
  `id`			int(25)		NOT NULL AUTO_INCREMENT,
  `order_id`		int(25)		NOT NULL,
  `product_id`		int(25)		NOT NULL,
  `product_name`	varchar(250)	NOT NULL,
  `unit_value`		varchar(20)	NOT NULL,
  `unit_type`		varchar(10)	NOT NULL,
  `mrp`			DECIMAL(10,2)	NOT NULL,
  `sale_price`		DECIMAL(10,2)	NOT NULL,
  `quantity`		int(5)		NOT NULL,
  `gst_slab`		DECIMAL(5,2)	NOT NULL,
  `discount_amount`	DECIMAL(8,2)	NOT NULL,
  `discount_percentage`	int(5)		NOT NULL,
  `total_amount`	DECIMAL(10,2)	NOT NULL,
  
  CONSTRAINT asm_cutomer_order_details_pk PRIMARY KEY (`id`),
  CONSTRAINT asm_cutomer_order_details_order_id__fk FOREIGN KEY (`order_id`) REFERENCES asm_customer_order_master (`id`),
  CONSTRAINT asm_cutomer_order_details_product_id__fk FOREIGN KEY (`product_id`) REFERENCES asm_products (`id`)
) ;