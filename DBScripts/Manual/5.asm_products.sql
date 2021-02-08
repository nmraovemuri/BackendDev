DROP TABLE IF EXISTS asm_products;

CREATE TABLE asm_products (
  `id` int(25) NOT NULL AUTO_INCREMENT,
  `product_name` varchar(250) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  `product_img` varchar(255) NOT NULL,
  `description_fst` longtext CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  `description_snd` longtext CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  `status` int(2) NOT NULL,
  `gst_slab_id` int(2) NOT NULL, 
  `subcat_id` int(55) NOT NULL,
  `created_date` int(11) NOT NULL,
  `updated_date` int(11) NOT NULL,
  CONSTRAINT asm_products_pk PRIMARY KEY (`id`),
  CONSTRAINT asm_products_product_name_u UNIQUE (`product_name`),
  CONSTRAINT asm_products_subcat_id_fk FOREIGN KEY (subcat_id) REFERENCES asm_mt_subcategory (`id`),
  CONSTRAINT asm_products_gst_slab_fk FOREIGN KEY (gst_slab_id) REFERENCES asm_mt_tax (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;