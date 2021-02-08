DROP TABLE IF EXISTS asm_product_stock;
CREATE TABLE asm_product_stock (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `bill_no` varchar(55) NOT NULL,
  `product_id` int(25) NOT NULL,
  `product_name` varchar(255) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  `user_id` int(25) NOT NULL,
  `price` varchar(250) NOT NULL,
  `quantity` bigint(255) NOT NULL,
  `weight_type` varchar(25) DEFAULT NULL,
  `status` int(2) NOT NULL,
  `create_date` datetime NOT NULL,
  `end_date` datetime NOT NULL,
  CONSTRAINT asm_product_stock_pk PRIMARY KEY (`id`),
  CONSTRAINT asm_product_stock_product_id_fk FOREIGN KEY (product_id) REFERENCES asm_products (`id`)
  
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
