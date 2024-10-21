DROP DATABASE IF EXISTS employees_db;
CREATE DATABASE employees_db;

\c employees_db;


CREATE TABLE departments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(30) UNIQUE NOT NULL 
);

CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    title VARCHAR(30) UNIQUE NOT NULL,
    salary DECIMAL NOT NULL, 
    department_id INTEGER NOT NULL REFERENCES department(id)
);

CREATE TABLE employees (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(30) NOT NULL,
    last_name VARCHAR(30) NOT NULL,
    role_id INTEGER NOT NULL REFERENCES role(id), 
    manager_id INTEGER REFERENCES employee(id) 
);


