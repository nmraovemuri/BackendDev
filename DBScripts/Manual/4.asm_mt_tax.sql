DROP TABLE IF EXISTS asm_mt_tax;

CREATE TABLE asm_mt_tax (
  `id` int(2) NOT NULL AUTO_INCREMENT,
  `gst_slab` DECIMAL(5,2) NOT NULL,
  `sgst` DECIMAL(5,2) NOT NULL,
  `cgst` DECIMAL(5,2) NOT NULL,
  `description` TEXT ,
  `status` int(2) NOT NULL,
  
  `created_date` int(11) NOT NULL,
  `updated_date` int(11) NOT NULL,

  CONSTRAINT asm_mt_tax_pk PRIMARY KEY (`id`),
  CONSTRAINT asm_mt_tax_gst_slab_u UNIQUE (`gst_slab`)
  
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

