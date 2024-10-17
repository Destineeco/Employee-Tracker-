import dotenv from 'dotenv';
import { Client } from 'pg';
import inquirer from 'inquirer';
import fs from 'fs';

// Load environment variables
dotenv.config();

// Create a PostgreSQL client
const db = new Client({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

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
      if (err) throw err;
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
    if (err) throw err;
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
if (err) throw err;
console.table(res.rows);
startApp();
});
}

