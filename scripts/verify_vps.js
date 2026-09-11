import { Client } from 'ssh2';

const conn = new Client();
conn.on('ready', () => {
  conn.exec('curl -s http://127.0.0.1/api/v1/domains && pm2 list', (err, stream) => {
    stream.on('data', (d) => process.stdout.write(d));
    stream.on('close', () => conn.end());
  });
}).connect({
  host: '66.33.22.220',
  port: 45881,
  username: 'root',
  password: 'Vpsw8C0dJMe#!'
});
