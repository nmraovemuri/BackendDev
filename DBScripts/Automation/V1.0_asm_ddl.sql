DROP TABLE IF EXISTS imp_users_accounts;

CREATE TABLE public.imp_users_accounts (
	user_id serial NOT NULL,
	first_name VARCHAR ( 50 ) NOT NULL,
	last_name VARCHAR ( 50 )  NOT NULL,
	password VARCHAR ( 150 ) NOT NULL,
	email_id VARCHAR ( 100 ) NOT NULL,
	email_id_verified bit(1) DEFAULT NULL,
	is_active bit(1) DEFAULT NULL,

	created_on TIMESTAMP NOT NULL,
        last_login TIMESTAMP, 

	CONSTRAINT imp_users_accounts_pkey PRIMARY KEY (user_id),
	CONSTRAINT email_id_u UNIQUE  (email_id)
);


DROP TABLE IF EXISTS imp_roles;

CREATE TABLE public.imp_roles(
   role_id serial ,
   role_name VARCHAR (255) NOT NULL,

   CONSTRAINT imp_roles_pkey PRIMARY KEY (role_id),
   CONSTRAINT role_name_u UNIQUE (role_name)
);

DROP TABLE IF EXISTS imp_account_roles;

CREATE TABLE public.imp_account_roles (
  user_id INT NOT NULL,
  role_id INT NOT NULL,
  grant_date TIMESTAMP,

  CONSTRAINT imp_account_roles_pkey PRIMARY KEY (user_id, role_id),
  CONSTRAINT role_id_fk FOREIGN KEY (role_id) REFERENCES imp_roles (role_id),
  CONSTRAINT user_id_fk FOREIGN KEY (user_id) REFERENCES imp_users_accounts (user_id)
);


DROP TABLE IF EXISTS imp_causes_mt;

CREATE TABLE public.imp_causes_mt (
  id serial NOT NULL,
  causes_item VARCHAR(255) DEFAULT NULL,
  description VARCHAR(255) DEFAULT NULL,
  is_active bit(1) DEFAULT NULL,

  created_by VARCHAR(255) DEFAULT NULL,
  created_on TIMESTAMP DEFAULT NULL,
  updated_by VARCHAR(255) DEFAULT NULL,
  updated_on TIMESTAMP DEFAULT NULL,

  CONSTRAINT imp_causes_mt_pkey PRIMARY KEY (id),
  CONSTRAINT causes_item_u UNIQUE  (causes_item)
);


DROP TABLE IF EXISTS imp_interests_mt;

CREATE TABLE public.imp_interests_mt (
  id serial NOT NULL,
  interest_item VARCHAR(255) DEFAULT NULL,
  description VARCHAR(255) DEFAULT NULL,
  is_active bit(1) DEFAULT NULL,

  created_by VARCHAR(255) DEFAULT NULL,
  created_on TIMESTAMP DEFAULT NULL,
  updated_by VARCHAR(255) DEFAULT NULL,
  updated_on TIMESTAMP DEFAULT NULL,

  CONSTRAINT imp_interests_mt_pkey PRIMARY KEY (id),
  CONSTRAINT interest_item_u UNIQUE  (interest_item)
); 


DROP TABLE IF EXISTS imp_skills_mt;

CREATE TABLE public.imp_skills_mt (
  id serial NOT NULL,
  skill_item VARCHAR(255) DEFAULT NULL,
  description VARCHAR(255) DEFAULT NULL,
  is_active bit(1) DEFAULT NULL,

  created_by VARCHAR(255) DEFAULT NULL,
  created_on TIMESTAMP DEFAULT NULL,
  updated_by VARCHAR(255) DEFAULT NULL,
  updated_on TIMESTAMP DEFAULT NULL,

  CONSTRAINT imp_skills_mt_pkey PRIMARY KEY (id),
  CONSTRAINT skill_item_u UNIQUE  (skill_item)
) ;


DROP TABLE IF EXISTS imp_mycauses;

CREATE TABLE public.imp_mycauses (
  user_id INT NOT NULL,
  causes_item_id INT NOT NULL,
  description VARCHAR(255) DEFAULT NULL,
  is_active bit(1) DEFAULT NULL, 

  created_by VARCHAR(255) DEFAULT NULL,
  created_on TIMESTAMP DEFAULT NULL,
  updated_by VARCHAR(255) DEFAULT NULL,
  updated_on TIMESTAMP DEFAULT NULL,
  
  CONSTRAINT imp_mycauses_pkey PRIMARY KEY (user_id, causes_item_id),
  CONSTRAINT user_id_fk FOREIGN KEY  (user_id) REFERENCES imp_users_accounts(user_id),
  CONSTRAINT causes_item_id_fk FOREIGN KEY  (causes_item_id) REFERENCES imp_causes_mt(id)
) ;


DROP TABLE IF EXISTS imp_myinterests;

CREATE TABLE public.imp_myinterests (
  user_id INT NOT NULL,
  interest_item_id INT NOT NULL,
  description VARCHAR(255) DEFAULT NULL,
  is_active bit(1) DEFAULT NULL,

  created_by VARCHAR(255) DEFAULT NULL,
  created_on TIMESTAMP DEFAULT NULL,
  updated_by VARCHAR(255) DEFAULT NULL,
  updated_on TIMESTAMP DEFAULT NULL,
  
  CONSTRAINT imp_myinterests_pkey PRIMARY KEY (user_id, interest_item_id),
  CONSTRAINT user_id_fk FOREIGN KEY  (user_id) REFERENCES imp_users_accounts(user_id),
  CONSTRAINT interest_item_id_fk FOREIGN KEY  (interest_item_id) REFERENCES imp_interests_mt(id)
) ;


DROP TABLE IF EXISTS imp_myskills;

CREATE TABLE public.imp_myskills (
  user_id INT NOT NULL,
  skill_item_id INT NOT NULL,
  description VARCHAR(255) DEFAULT NULL,
  is_active bit(1) DEFAULT NULL,

  created_by VARCHAR(255) DEFAULT NULL,
  created_on TIMESTAMP DEFAULT NULL,
  updated_by VARCHAR(255) DEFAULT NULL,
  updated_on TIMESTAMP DEFAULT NULL,
  
  CONSTRAINT imp_myskills_pkey PRIMARY KEY (user_id, skill_item_id),
  CONSTRAINT user_id_fk FOREIGN KEY  (user_id) REFERENCES imp_users_accounts(user_id),
  CONSTRAINT skill_item_id_fk FOREIGN KEY  (skill_item_id) REFERENCES imp_skills_mt(id)
) ;


DROP TABLE IF EXISTS imp_user_profiles;

CREATE TABLE public.imp_user_profiles (
  id serial NOT NULL,
  job_role VARCHAR(255),
  school_company VARCHAR(255),
  city VARCHAR(255),
  state VARCHAR(255),
  phone_number VARCHAR(255),

  phone_number_verified bit(1) DEFAULT NULL,
  is_active bit(1) DEFAULT NULL,
  description VARCHAR(255) DEFAULT NULL,

  user_id INT NOT NULL UNIQUE,

  created_by VARCHAR(255) DEFAULT NULL,
  created_on TIMESTAMP DEFAULT NULL,
  updated_by VARCHAR(255) DEFAULT NULL,
  updated_on TIMESTAMP DEFAULT NULL,
  
  CONSTRAINT imp_profiles_pkey PRIMARY KEY (id),
  CONSTRAINT user_id_fk FOREIGN KEY  (user_id) REFERENCES imp_users_accounts(user_id)
) ;
