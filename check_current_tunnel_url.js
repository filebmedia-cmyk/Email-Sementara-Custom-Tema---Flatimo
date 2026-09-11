import { Client } from 'ssh2';

const conn = new Client();
conn.on('ready', () => {
  console.log('⚡ Inspecting live cloudflared tunnel logs on VPS...');
  conn.exec('pm2 restart cf-tunnel && sleep 3 && grep -o "https://.*trycloudflare.com" /root/.pm2/logs/cf-tunnel-error.log | tail -n 5', (err, stream) => {
    stream.on('data', d => process.stdout.write(d));
    stream.on('close', () => {
      conn.end();
    });
  });
}).connect({
  host: '66.33.22.220',
  port: 45881,
  username: 'root',
  password: 'Vpsw8C0dJMe#!'
});
