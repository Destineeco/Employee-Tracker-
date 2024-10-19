import express from 'express';
import inquirer from 'inquirer';
import fs from 'fs';
import path from 'path';
import { client, connectDb } from './connection.js'; // Import the connection
import dotenv from 'dotenv';
dotenv.config(); // Load environment variables from .env file
const app = express();
const PORT = process.env.PORT || 3000;
// Function to initialize the database schema
async function initDb() {
    const schemaPath = path.join('db', 'schema.sql');
    try {
        const schema = fs.readFileSync(schemaPath, 'utf8');
        await client.query(schema); // Use the exported client to execute the schema SQL
        console.log('Database schema initialized successfully.');
    }
    catch (error) {
        console.error('Error initializing database schema:', error);
    }
}
// Start the application
async function startApp() {
    const { action } = await inquirer.prompt({
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
        ],
    });
    switch (action) {
        case 'View all departments':
            await viewDepartments();
            break;
        case 'View all roles':
            await viewRoles();
            break;
        case 'View all employees':
            await viewEmployees();
            break;
        case 'Add a department':
            await addDepartment();
            break;
        case 'Add a role':
            await addRole();
            break;
        case 'Add an employee':
            await addEmployee();
            break;
        case 'Update an employee role':
            await updateEmployeeRole();
            break;
        case 'Exit':
            await client.end(); // Use the exported client to close the connection
            console.log('Goodbye!');
            return;
    }
    // Restart the application
    startApp();
}
// View all Departments
async function viewDepartments() {
    const res = await client.query('SELECT * FROM departments'); // Use the exported client
    console.table(res.rows);
}
// View all roles
async function viewRoles() {
    const query = `
        SELECT roles.id, roles.title, roles.salary, departments.name AS department
        FROM roles
        JOIN departments ON roles.department_id = departments.id`;
    const res = await client.query(query); // Use the exported client
    console.table(res.rows);
}
// View all employees
async function viewEmployees() {
    const query = `
        SELECT employees.id, employees.first_name, employees.last_name, roles.title,
               departments.name AS department, roles.salary,
               manager.first_name AS manager_first_name,
               manager.last_name AS manager_last_name
        FROM employees
        JOIN roles ON employees.role_id = roles.id
        JOIN departments ON roles.department_id = departments.id
        LEFT JOIN employees manager ON employees.manager_id = manager.id`;
    const res = await client.query(query); // Use the exported client
    console.table(res.rows);
}
// Add a department
async function addDepartment() {
    const { departmentName } = await inquirer.prompt({
        name: 'departmentName',
        message: 'Enter the name of the department:',
    });
    await client.query('INSERT INTO departments (name) VALUES ($1)', [departmentName]); // Use the exported client
    console.log(`Added department: ${departmentName}`);
}
// Add a role
async function addRole() {
    const departmentsRes = await client.query('SELECT * FROM departments'); // Use the exported client
    const departments = departmentsRes.rows.map(({ id, name }) => ({
        name,
        value: id,
    }));
    const { roleTitle, roleSalary, departmentId } = await inquirer.prompt([
        { name: 'roleTitle', message: 'Enter the role title:' },
        { name: 'roleSalary', message: 'Enter the salary for the role:' },
        {
            type: 'list',
            name: 'departmentId',
            message: 'Select the department:',
            choices: departments,
        },
    ]);
    await client.query('INSERT INTO roles (title, salary, department_id) VALUES ($1, $2, $3)', [roleTitle, roleSalary, departmentId] // Use the exported client
    );
    console.log(`Added role: ${roleTitle}`);
}
// Add an employee
async function addEmployee() {
    const rolesRes = await client.query('SELECT * FROM roles'); // Use the exported client
    const roles = rolesRes.rows.map(({ id, title }) => ({ name: title, value: id }));
    const employeesRes = await client.query('SELECT * FROM employees'); // Use the exported client
    const managers = employeesRes.rows.map(({ id, first_name, last_name }) => ({
        name: `${first_name} ${last_name}`,
        value: id,
    }));
    managers.unshift({ name: 'None', value: null }); // Add option for no manager
    const { firstName, lastName, roleId, managerId } = await inquirer.prompt([
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
    ]);
    await client.query('INSERT INTO employees (first_name, last_name, role_id, manager_id) VALUES ($1, $2, $3, $4)', [firstName, lastName, roleId, managerId] // Use the exported client
    );
    console.log(`Added employee: ${firstName} ${lastName}`);
}
// Update an employee's role
async function updateEmployeeRole() {
    const employeesRes = await client.query('SELECT * FROM employees'); // Use the exported client
    const employees = employeesRes.rows.map(({ id, first_name, last_name }) => ({
        name: `${first_name} ${last_name}`,
        value: id,
    }));
    const rolesRes = await client.query('SELECT * FROM roles'); // Use the exported client
    const roles = rolesRes.rows.map(({ id, title }) => ({ name: title, value: id }));
    const { employeeId, newRoleId } = await inquirer.prompt([
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
    ]);
    await client.query('UPDATE employees SET role_id = $1 WHERE id = $2', [newRoleId, employeeId] // Use the exported client
    );
    console.log('Employee role updated');
}
// Initialize database and start the application
(async () => {
    await connectDb(); // Connect to the database
    await initDb(); // Initialize the schema
    startApp(); // Start the interactive app
})();
