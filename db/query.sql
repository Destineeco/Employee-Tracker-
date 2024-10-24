SELECT
    department.name AS department,
    employee.first_name,
    employee.last_name,
    roles.title
FROM
    employee
LEFT JOIN role ON employee.role.id = role.id
LEFT JOIN department ON role.department_id = department.id
ORDER BY department.name, employee.last_name;
