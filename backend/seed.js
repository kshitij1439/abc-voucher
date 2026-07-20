require('dotenv').config();
const bcrypt = require('bcryptjs');
const sequelize = require('./config/db');
const { User } = require('./models');

const seedUsers = async () => {
  try {
    // Connect and sync
    await sequelize.authenticate();
    console.log('Database connected.');
    await sequelize.sync({ force: true }); // WARNING: This drops all tables
    console.log('Tables created.');

    const salt = await bcrypt.genSalt(10);

    const users = [
      {
        name: 'Rahul Sharma',
        email: 'employee@abc.com',
        password: await bcrypt.hash('password123', salt),
        role: 'employee',
        department: 'Engineering',
        employeeId: 'EMP-001',
      },
      {
        name: 'Priya Mehta',
        email: 'director@abc.com',
        password: await bcrypt.hash('password123', salt),
        role: 'director',
        department: 'Management',
        employeeId: 'DIR-001',
      },
      {
        name: 'Ankit Verma',
        email: 'accounts@abc.com',
        password: await bcrypt.hash('password123', salt),
        role: 'accounts',
        department: 'Finance',
        employeeId: 'ACC-001',
      },
    ];

    await User.bulkCreate(users);
    console.log('Seed users created successfully:');
    console.log('  Employee:  employee@abc.com / password123');
    console.log('  Director:  director@abc.com / password123');
    console.log('  Accounts:  accounts@abc.com / password123');

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seedUsers();
