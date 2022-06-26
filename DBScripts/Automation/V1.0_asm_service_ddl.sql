DROP TABLE IF EXISTS asm_admin;
CREATE TABLE asm_admin (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `email_id` varchar(55) NOT NULL,
  `password` varchar(200) NOT NULL,

  CONSTRAINT asm_admin_pk	PRIMARY KEY (`id`),
  CONSTRAINT asm_admin_email_id_u UNIQUE (`email_id`)
);


DROP TABLE IF EXISTS asm_mt_category;
CREATE TABLE asm_mt_category (
  `id` int(25) NOT NULL AUTO_INCREMENT,
  `category_name` varchar(250) NOT NULL,
  `feature_img` varchar(255) NOT NULL,
  `category_description` varchar(500) NOT NULL,
  `status` int(2) NOT NULL,
  `create_date` datetime NOT NULL,
  `updated_date` datetime NOT NULL,
  CONSTRAINT asm_mt_category_pk PRIMARY KEY (`id`),
  CONSTRAINT asm_mt_category_category_name_u UNIQUE (`category_name`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS asm_mt_subcategory;
CREATE TABLE asm_mt_subcategory (
  `id` int(25) NOT NULL AUTO_INCREMENT,
  `sub_category_name` varchar(250) NOT NULL,
  `category_id` int(25) NOT NULL,
  `status` int(2) NOT NULL,
  `create_date` datetime NOT NULL,
  `updated_date` datetime NOT NULL,
  `sc_img_1` varchar(250) NOT NULL,
  `sc_img_2` varchar(250) NOT NULL,
  CONSTRAINT asm_mt_subcategory_pk PRIMARY KEY (`id`),
  CONSTRAINT asm_mt_subcategory_sub_category_name_u UNIQUE (`sub_category_name`),
  CONSTRAINT asm_mt_subcategory_category_id_fk FOREIGN KEY (category_id) REFERENCES asm_mt_category (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS asm_mt_weight;
CREATE TABLE asm_mt_weight (
  `id` int(25) NOT NULL AUTO_INCREMENT,
  `weight` varchar(250) NOT NULL,
  `type` varchar(250) NOT NULL,
  `status` int(2) NOT NULL,
  `create_date` datetime NOT NULL,
  `end_date` datetime NOT NULL,
  CONSTRAINT asm_mt_weight_pk PRIMARY KEY (`id`),
  CONSTRAINT asm_mt_weight_weight_u UNIQUE (`weight`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS asm_products;

CREATE TABLE asm_products (
  `id` int(25) NOT NULL AUTO_INCREMENT,
  `product_name` varchar(250) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  `product_img` varchar(255) NOT NULL,
  `description_fst` longtext CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  `description_snd` longtext CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  `description_trd` longtext CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  `status` int(2) NOT NULL,
  `create_date` datetime NOT NULL,
  `end_date` datetime NOT NULL,
  CONSTRAINT asm_products_pk PRIMARY KEY (`id`),
  CONSTRAINT asm_products_product_name_u UNIQUE (`product_name`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS asm_product_weight_price;

CREATE TABLE asm_product_weight_price (
  `id` int(25) NOT NULL AUTO_INCREMENT,
  `product_id` int(25) NOT NULL,
  `price` bigint(55) NOT NULL,
  `weight_id` int(25) NOT NULL,
  `stock_status` int(11) NOT NULL,
  `offer` bigint(55) NOT NULL,
  `status` int(2) NOT NULL,
  `create_date` datetime NOT NULL,
  `end_date` datetime NOT NULL,
  CONSTRAINT asm_product_weight_price_pk PRIMARY KEY (`id`),
  CONSTRAINT asm_product_weight_price_product_id_fk FOREIGN KEY (product_id) REFERENCES asm_products (`id`),
  CONSTRAINT asm_product_weight_price_weight_id_fk  FOREIGN KEY (weight_id)  REFERENCES asm_mt_weight (`id`)

) ENGINE=InnoDB DEFAULT CHARSET=latin1;

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
