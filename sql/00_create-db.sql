DROP DATABASE IF EXISTS react_huang_db;
DROP USER IF EXISTS react_huang_user;
CREATE USER react_huang_user PASSWORD 'welcome';
CREATE DATABASE react_huang_db owner react_huang_user ENCODING = 'UTF-8';


-- create extension (as superuser)
\c react_huang_db
CREATE EXTENSION hstore;
CREATE EXTENSION pg_trgm;

\c react_huang_db react_huang_user