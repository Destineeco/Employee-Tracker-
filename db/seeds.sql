INSERT INTO departments (department_title) 
VALUES ('inbound'),
       ('outbound');

INSERT INTO roles (department_id, title, salary)
VALUES (1, 'unloader', 40000.00),
       (1, 'scanner', 30000.00),
       (1, 'driver', 50000.00),
       (2, 'loader', 40000.00),
       (2, 'scanner', 30000.00),
       (2, 'driver', 50000.00);
        
INSERT INTO employees ( first_name, last_name, role_id, manager_id) 
VALUES ('Nicole','Anders', 101, 10),
       ('Nick','Con', 102, 10),
       ('Cole','johnson', 103, 10).
       ('Rick','Owens', 201, 20),
       ('Jen','Rogers', 202, 20),
       ('Brandon','Williams', 203, 20);

