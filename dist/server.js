import inquirer from 'inquirer';
import connection from './connection.js';
import fs from 'fs';
const db = connection;
// Connects to the database
await db.connect();
// Read SQL queries from the file
const sqlQueries = fs.readFileSync('db/queries.sql', 'utf8').split(';').map(q => q.trim());
// Function to start the application
function startApp() {
    inquirer.prompt({
        name: 'action',
        type: 'list',
        message: 'What would you like to do?',
        choices: [
            'View all departments',
            'View all roles',
            'View all employees',
            'Add a department',
            'Add a role',
            'Add an employee',
            'Update an employee role',
            'Exit'
        ]
    }).then(answer => {
        switch (answer.action) {
            case 'View all departments':
                viewDepartments();
                break;
            case 'View all roles':
                viewRoles();
                break;
            case 'View all employees':
                viewEmployees();
                break;
            case 'Add a department':
                addDepartment();
                break;
            case 'Add a role':
                addRole();
                break;
            case 'Add an employee':
                addEmployee();
                break;
            case 'Update an employee role':
                updateEmployeeRole();
                break;
            case 'Exit':
                db.end();
                break;
        }
    });
}
// views all Departments
function viewDepartments() {
    db.query('SELECT * FROM departments', (err, res) => {
        if (err)
            throw err;
        console.table(res.rows);
        startApp();
    });
}
// View all roles
function viewRoles() {
    const query = `
    SELECT roles.id, roles.title, roles.salary, departments.name AS department
    FROM roles
    JOIN departments ON roles.department_id = departments.id`;
    db.query(query, (err, res) => {
        if (err)
            throw err;
        console.table(res.rows);
        startApp();
    });
}
// View all employees
function viewEmployees() {
    const query = `
SELECT employees.id, employees.first_name, employees.last_name, roles.title, departments.name AS department, roles.salary, manager.first_name AS manager_first_name, manager.last_name AS manager_last_name
FROM employees
JOIN roles ON employees.role_id = roles.id
JOIN departments ON roles.department_id = departments.id
LEFT JOIN employees manager ON employees.manager_id = manager.id`;
    db.query(query, (err, res) => {
        if (err)
            throw err;
        console.table(res.rows);
        startApp();
    });
}
// Add a department
function addDepartment() {
    inquirer
        .prompt([
        {
            name: 'departmentname',
            message: 'Enter the name of the department:',
        },
    ])
        .then((answer) => {
        db.query('INSERT INTO departments (name) VALUES ($1)', [answer.departmentName], (err, res) => {
            if (err)
                throw err;
            console.log(`Added department: ${answer.departmentName}`);
            startApp();
        });
    });
}
// Add a role
function addRole() {
    db.query('SELECT * FROM departments', (err, res) => {
        if (err)
            throw err;
        const departments = res.rows.map(({ id, name }) => ({
            name: name,
            value: id,
        }));
        inquirer
            .prompt([
            { name: 'roleTitle', message: 'Enter the role title:' },
            { name: 'roleSalary', message: 'Enter the salary for the role:' },
            {
                type: 'list',
                name: 'departmentId',
                message: 'Select the department:',
                choices: departments,
            },
        ])
            .then((answer) => {
            db.query('INSERT INTO roles (title, salary, department_id) VALUES ($1, $2, $3)', [answer.roleTitle, answer.roleSalary, answer.departmentId], (err, res) => {
                if (err)
                    throw err;
                console.log(`Added role: ${answer.roleTitle}`);
                startApp();
            });
        });
    });
}
// Add an employee
function addEmployee() {
    db.query('SELECT * FROM roles', (err, res) => {
        if (err)
            throw err;
        const roles = res.rows.map(({ id, title }) => ({ name: title, value: id }));
        db.query('SELECT * FROM employees', (err, res) => {
            if (err)
                throw err;
            const managers = res.rows.map(({ id, first_name, last_name }) => ({
                name: `${first_name} ${last_name}`,
                value: id,
            }));
            managers.unshift({ name: 'None', value: null });
            inquirer
                .prompt([
                { name: 'firstName', message: 'Enter the employee\'s first name:' },
                { name: 'lastName', message: 'Enter the employee\'s last name:' },
                {
                    type: 'list',
                    name: 'roleId',
                    message: 'Select the employee\'s role:',
                    choices: roles,
                },
                {
                    type: 'list',
                    name: 'managerId',
                    message: 'Select the employee\'s manager:',
                    choices: managers,
                },
            ])
                .then((answer) => {
                db.query('INSERT INTO employees (first_name, last_name, role_id, manager_id) VALUES ($1, $2, $3, $4)', [answer.firstName, answer.lastName, answer.roleId, answer.managerId], (err, res) => {
                    if (err)
                        throw err;
                    console.log(`Added employee: ${answer.firstName} ${answer.lastName}`);
                    startApp();
                });
            });
        });
    });
}
// Update an employee's role
function updateEmployeeRole() {
    db.query('SELECT * FROM employees', (err, res) => {
        if (err)
            throw err;
        const employees = res.rows.map(({ id, first_name, last_name }) => ({
            name: `${first_name} ${last_name}`,
            value: id,
        }));
        db.query('SELECT * FROM roles', (err, res) => {
            if (err)
                throw err;
            const roles = res.rows.map(({ id, title }) => ({ name: title, value: id }));
            inquirer
                .prompt([
                {
                    type: 'list',
                    name: 'employeeId',
                    message: 'Select the employee to update:',
                    choices: employees,
                },
                {
                    type: 'list',
                    name: 'newRoleId',
                    message: 'Select the new role:',
                    choices: roles,
                },
            ])
                .then((answer) => {
                db.query('UPDATE employees SET role_id = $1 WHERE id = $2', [answer.newRoleId, answer.employeeId], (err, res) => {
                    if (err)
                        throw err;
                    console.log('Employee role updated');
                    startApp();
                });
            });
        });
    });
}
// Start the app
startApp();
