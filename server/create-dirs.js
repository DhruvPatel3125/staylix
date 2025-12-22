const fs = require('fs');
const path = require('path');

const dirs = [
  path.join(__dirname, 'uploads/hotels'),
  path.join(__dirname, 'uploads/rooms')
];

dirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Created: ${dir}`);
  } else {
    console.log(`Already exists: ${dir}`);
  }
});
