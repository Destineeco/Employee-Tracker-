INSERT INTO department (name) 
VALUES ('inbound'),
       ('outbound');

INSERT INTO role (department_id, title, salary)
VALUES (1, 'unloader', 40000.00),
       (1, 'scan', 30000.00),
       (1, 'drive', 50000.00),
       (2, 'loader', 40000.00),
       (2, 'scanner', 30000.00),
       (2, 'driver', 50000.00);
        
INSERT INTO employee ( first_name, last_name, role_id, manager_id) 
VALUES ('Nicole','Anders', 1, 3),
       ('Nick','Con', 1, NULL),
       ('Cole','johnson', 1, 3),
       ('Rick','Owens', 2, 5),
       ('Jen','Rogers', 2, NULL),
       ('Brandon','Williams', 2, 5);

