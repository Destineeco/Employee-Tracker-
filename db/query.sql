SELECT
    departments.name AS departments,
    employees.first_name,
    employees.last_name,
    roles.title
FROM
    employee
LEFT JOIN role ON employee.role_id = role.id
LEFT JOIN departments ON role.department_id = department.id
ORDER BY department.title, employee.last_name;
