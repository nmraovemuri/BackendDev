DROP TABLE IF EXISTS asm_mt_subcategory;
CREATE TABLE asm_mt_subcategory (
  `id` int(25) NOT NULL AUTO_INCREMENT,
  `sub_category_name` varchar(250) NOT NULL,
  `category_id` int(25) NOT NULL,
  `status` int(2) NOT NULL,
  `created_date` int(11) NOT NULL,
  `updated_date` int(11) NOT NULL,
  CONSTRAINT asm_mt_subcategory_pk PRIMARY KEY (`id`),
  CONSTRAINT asm_mt_subcategory_sub_category_name_u UNIQUE (`sub_category_name`),
  CONSTRAINT asm_mt_subcategory_category_id_fk FOREIGN KEY (category_id) REFERENCES asm_mt_category (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;