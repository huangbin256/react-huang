-- --------- contact --------- --
CREATE TABLE contact
(
	id bigserial NOT NULL,
	"firstName" character varying(128),
	"lastName" character varying(128),
	"email" character varying(128),

	-- Timestamp data
	"cid" bigInt,
	"ctime" timestamp with time zone,
	"mid" bigInt,
	"mtime" timestamp with time zone,

	CONSTRAINT contact_pkey PRIMARY KEY (id)
);
-- --------- /contact --------- --