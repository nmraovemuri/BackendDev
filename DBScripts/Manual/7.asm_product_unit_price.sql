DROP TABLE IF EXISTS asm_product_unit_price;
CREATE TABLE asm_product_unit_price (
  `id` int(10) NOT NULL AUTO_INCREMENT,
  `product_id` int(25) NOT NULL,
  `product_img` VARCHAR(250),
  `unit_id` int(10) NOT NULL,
  `mrp` bigint(10) NOT NULL,
  `sale_price` bigint(10) NOT NULL,
  `stock_status` int(5) NOT NULL,
  `status` int(2) NOT NULL,
  `created_date` int(11) NOT NULL,
  `updated_date` int(11) NOT NULL,
  CONSTRAINT asm_product_unit_price_pk PRIMARY KEY (`id`),
  CONSTRAINT asm_product_unit_price_product_id_fk FOREIGN KEY (product_id) REFERENCES asm_products (`id`),
  CONSTRAINT asm_product_unit_price_unit_id_fk  FOREIGN KEY (unit_id)  REFERENCES asm_mt_units (`id`)

) ENGINE=InnoDB DEFAULT CHARSET=latin1;
