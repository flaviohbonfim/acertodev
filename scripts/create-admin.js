const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const readline = require('readline');
const User = require('../models/User').default;
require('dotenv').config({ path: '.env.local' });

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Conectado.');
    
    const rl = readline.createInterface({ 
      input: process.stdin, 
      output: process.stdout 
    });
    
    const name = await new Promise(resolve => rl.question('Nome do admin: ', resolve));
    const email = await new Promise(resolve => rl.question('Email do admin: ', resolve));
    const password = await new Promise(resolve => rl.question('Senha do admin: ', resolve));
    
    rl.close();
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('Usuário com este email já existe.');
      return;
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({ 
      name, 
      email, 
      password: hashedPassword, 
      role: 'admin' 
    });

    console.log('Usuário admin criado com sucesso!');
  } catch (error) {
    console.error('Erro ao criar usuário admin:', error);
  } finally {
    await mongoose.disconnect();
  }
};

createAdmin();
