DROP TABLE IF EXISTS asm_product_cat_subcat;

CREATE TABLE asm_product_cat_subcat (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `product_id` int(55) NOT NULL,
  `category_id` int(55) NOT NULL,
  `subcat_id` int(55) NOT NULL,
  `create_date` datetime NOT NULL,
  `end_date` datetime NOT NULL,
  CONSTRAINT asm_product_cat_subcat_pk PRIMARY KEY (`id`),
  CONSTRAINT asm_product_cat_subcat_product_id_fk FOREIGN KEY (product_id) REFERENCES asm_products (`id`),
  CONSTRAINT asm_product_cat_subcat_category_id_fk FOREIGN KEY (category_id) REFERENCES asm_mt_category (`id`),
  CONSTRAINT asm_product_cat_subcat_subcat_id_fk FOREIGN KEY (subcat_id) REFERENCES asm_mt_subcategory (`id`)
) ;
