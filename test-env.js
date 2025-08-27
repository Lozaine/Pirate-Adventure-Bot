require('dotenv').config();

console.log('DATABASE_URL loaded:', process.env.DATABASE_URL ? 'YES' : 'NO');
if (process.env.DATABASE_URL) {
    console.log('URL starts with:', process.env.DATABASE_URL.substring(0, 20) + '...');
    console.log('URL length:', process.env.DATABASE_URL.length);
}
