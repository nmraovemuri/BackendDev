DROP TABLE IF EXISTS asm_mt_units;
CREATE TABLE asm_mt_units (
  `id` int(10) NOT NULL AUTO_INCREMENT,
  `unit_value` varchar(250) NOT NULL,
  `unit_type` varchar(250) NOT NULL,
  `status` int(2) NOT NULL,
  `created_date` int(11) NOT NULL,
  `updated_date` int(11) NOT NULL,
  CONSTRAINT asm_mt_units_pk PRIMARY KEY (`id`),
  CONSTRAINT asm_mt_units_unit_value_unit_type_u UNIQUE (`unit_value`, `unit_type`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;