import { Client } from 'ssh2';

const conn = new Client();
conn.on('ready', () => {
  conn.exec('ip addr && netstat -tlpn || ss -tlpn', (err, stream) => {
    stream.on('data', (d) => process.stdout.write(d));
    stream.on('close', () => conn.end());
  });
}).connect({
  host: '66.33.22.220',
  port: 45881,
  username: 'root',
  password: 'Vpsw8C0dJMe#!'
});
