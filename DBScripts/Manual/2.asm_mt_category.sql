DROP TABLE IF EXISTS asm_mt_category;
CREATE TABLE asm_mt_category (
  `id` int(25) NOT NULL AUTO_INCREMENT,
  `category_name` varchar(250) NOT NULL,
  `feature_img` varchar(255) NOT NULL,
  `category_description` varchar(500) NOT NULL,
  `status` int(2) NOT NULL,
  `created_date` int(11) NOT NULL,
  `updated_date` int(11) NOT NULL,
  CONSTRAINT asm_mt_category_pk PRIMARY KEY (`id`),
  CONSTRAINT asm_mt_category_category_name_u UNIQUE (`category_name`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;