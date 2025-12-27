import bcrypt from 'bcrypt';

const password = 'password123';
const saltRounds = 10;

const hash = await bcrypt.hash(password, saltRounds);

console.log('Hash:', hash);

// Test immediately
const match = await bcrypt.compare(password, hash);
console.log('Match:', match); // true
