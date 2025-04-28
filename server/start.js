const { spawn } = require('child_process');

// Set environment variables explicitly
process.env.PORT = 8080;

// Start the server using node directly (not nodemon)
const server = spawn('node', ['server.js'], {
  stdio: 'inherit',
  env: process.env
});

console.log(`Starting server on port ${process.env.PORT}`);

// Handle process exit
server.on('close', (code) => {
  console.log(`Server process exited with code ${code}`);
});
