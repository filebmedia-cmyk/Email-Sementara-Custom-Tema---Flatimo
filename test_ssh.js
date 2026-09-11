import { Client } from 'ssh2';

const conn = new Client();

console.log('⚡ Connecting to VPS 66.33.22.220:45881...');

conn.on('ready', () => {
  console.log('✅ SSH Connection Ready!');
  conn.exec('uname -a && node -v || echo "Node not installed"', (err, stream) => {
    if (err) throw err;
    stream.on('close', (code, signal) => {
      console.log(`Command closed with code ${code}`);
      conn.end();
    }).on('data', (data) => {
      console.log('STDOUT:\n' + data);
    }).stderr.on('data', (data) => {
      console.log('STDERR: ' + data);
    });
  });
}).on('error', (err) => {
  console.error('❌ SSH Error:', err.message);
}).connect({
  host: '66.33.22.220',
  port: 45881,
  username: 'root',
  password: 'Vpsw8C0dJMe#!',
  readyTimeout: 30000
});
