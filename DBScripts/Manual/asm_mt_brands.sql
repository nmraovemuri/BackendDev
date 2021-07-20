DROP TABLE IF EXISTS asm_mt_brands;
CREATE TABLE asm_mt_brands (
  `id` int(25) NOT NULL AUTO_INCREMENT,
  `brand_name` varchar(250) NOT NULL,
  `feature_img` varchar(255) NOT NULL,
  `brand_description` varchar(500) NOT NULL,
  `status` int(2) NOT NULL,
  `created_date` int(11) NOT NULL,
  `updated_date` int(11) NOT NULL,
  CONSTRAINT asm_mt_brands_pk PRIMARY KEY (`id`),
  CONSTRAINT asm_mt_brands_brand_name_u UNIQUE (`brand_name`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;