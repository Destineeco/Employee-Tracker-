
SELECT
    department.name AS departments,
    employee.first_name,
    employee.last_name,
    role.title
FROM
    employee
LEFT JOIN role ON employee.role_id = role.id
LEFT JOIN departments ON role.department_id = department.id
ORDER BY department.title, employee.last_name;
