import express from 'express';
import inquirer from 'inquirer';
import { pool, connectToDb } from './connection.js'; // Import the connection
import dotenv from 'dotenv';
dotenv.config(); // Load environment variables from .env file
const app = express();
const PORT = process.env.PORT || 3000;
// Start the application
async function startApp() {
    const { action } = await inquirer.prompt({
        name: 'action',
        type: 'list',
        message: 'What would you like to do?',
        choices: [
            'View all department',
            'View all role',
            'View all employee',
            'Add a department',
            'Add a role',
            'Add an employee',
            'Update an employee role',
            'Exit'
        ],
    });
    switch (action) {
        case 'View all department':
            await viewdepartment();
            break;
        case 'View all role':
            await viewrole();
            break;
        case 'View all employee':
            await viewemployee();
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
            await pool.end(); // Use the exported pool to close the connection
            console.log('Goodbye!');
            return;
    }
    // Restart the application
    startApp();
}
// View all department
async function viewdepartment() {
    const res = await pool.query('SELECT * FROM department'); // Use the exported pool
    console.table(res.rows);
}
// View all role
async function viewrole() {
    const query = `
        SELECT role.id, role.title, role.salary, department.name AS department
        FROM role
        JOIN department ON role.department_id = department.id`;
    const res = await pool.query(query); // Use the exported pool
    console.table(res.rows);
}
// View all employee
async function viewemployee() {
    const query = `
        SELECT employee.id, employee.first_name, employee.last_name, role.title,
               department.name AS department, role.salary,
               manager.first_name AS manager_first_name,
               manager.last_name AS manager_last_name
        FROM employee
        JOIN role ON employee.role_id = role.id
        JOIN department ON role.department_id = department.id
        LEFT JOIN employee manager ON employee.manager_id = manager.id`;
    const res = await pool.query(query); // Use the exported pool
    console.table(res.rows);
}
// Add a department
async function addDepartment() {
    const { departmentName } = await inquirer.prompt({
        name: 'departmentName',
        message: 'Enter the name of the department:',
    });
    await pool.query('INSERT INTO department (name) VALUES ($1)', [departmentName]); // Use the exported pool
    console.log(`Added department: ${departmentName}`);
}
// Add a role
async function addRole() {
    const departmentRes = await pool.query('SELECT * FROM department'); // Use the exported pool
    const department = departmentRes.rows.map(({ id, name }) => ({
        name,
        value: id,
    }));
    const { roleTitle, rolealary, departmentId } = await inquirer.prompt([
        { name: 'roleTitle', message: 'Enter the role title:' },
        { name: 'rolealary', message: 'Enter the salary for the role:' },
        {
            type: 'list',
            name: 'departmentId',
            message: 'Select the department:',
            choices: department,
        },
    ]);
    await pool.query('INSERT INTO role (title, salary, department_id) VALUES ($1, $2, $3)', [roleTitle, rolealary, departmentId]);
    console.log(`Added role: ${roleTitle}`);
}
// Add an employee
async function addEmployee() {
    const roleRes = await pool.query('SELECT * FROM role');
    const role = roleRes.rows.map(({ id, title }) => ({ name: title, value: id }));
    const employeeRes = await pool.query('SELECT * FROM employee');
    const managers = employeeRes.rows.map(({ id, first_name, last_name }) => ({
        name: `${first_name} ${last_name}`,
        value: id,
    }));
    managers.unshift({ name: 'None', value: null });
    const { firstName, lastName, roleId, managerId } = await inquirer.prompt([
        { name: 'firstName', message: 'Enter the employee\'s first name:' },
        { name: 'lastName', message: 'Enter the employee\'s last name:' },
        {
            type: 'list',
            name: 'roleId',
            message: 'Select the employee\'s role:',
            choices: role,
        },
        {
            type: 'list',
            name: 'managerId',
            message: 'Select the employee\'s manager:',
            choices: managers,
        },
    ]);
    await pool.query('INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ($1, $2, $3, $4)', [firstName, lastName, roleId, managerId] // Use the exported pool
    );
    console.log(`Added employee: ${firstName} ${lastName}`);
}
// Update an employee's role
async function updateEmployeeRole() {
    const employeeRes = await pool.query('SELECT * FROM employee'); // Use the exported pool
    const employee = employeeRes.rows.map(({ id, first_name, last_name }) => ({
        name: `${first_name} ${last_name}`,
        value: id,
    }));
    const roleRes = await pool.query('SELECT * FROM role'); // Use the exported pool
    const role = roleRes.rows.map(({ id, title }) => ({ name: title, value: id }));
    const { employeeId, newRoleId } = await inquirer.prompt([
        {
            type: 'list',
            name: 'employeeId',
            message: 'Select the employee to update:',
            choices: employee,
        },
        {
            type: 'list',
            name: 'newRoleId',
            message: 'Select the new role:',
            choices: role,
        },
    ]);
    await pool.query('UPDATE employee SET role_id = $1 WHERE id = $2', [newRoleId, employeeId] // Use the exported pool
    );
    console.log('Employee role updated');
}
// Initialize database and start the application
(async () => {
    await connectToDb(); // Connect to the database
    startApp(); // Start the interactive app
})();
