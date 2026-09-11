import { build } from 'vite';
import { Client } from 'ssh2';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function uploadDirectory(sftp, localDir, remoteDir) {
  return new Promise(async (resolve, reject) => {
    try {
      await new Promise(r => sftp.mkdir(remoteDir, () => r()));
      const items = fs.readdirSync(localDir);
      for (const item of items) {
        const localPath = path.join(localDir, item);
        const remotePath = `${remoteDir}/${item}`.replace(/\\/g, '/');
        const stat = fs.statSync(localPath);

        if (stat.isDirectory()) {
          await uploadDirectory(sftp, localPath, remotePath);
        } else {
          console.log(`[Upload] ${item} -> ${remotePath}`);
          await new Promise((res, rej) => {
            sftp.fastPut(localPath, remotePath, (err) => {
              if (err) rej(err);
              else res();
            });
          });
        }
      }
      resolve();
    } catch (err) {
      reject(err);
    }
  });
}

async function run() {
  console.log('⚡ 1. Building Vite with updated DnsGuide...');
  await build();
  console.log('✅ Build complete!');

  console.log('⚡ 2. Uploading bot and dist to VPS...');
  const conn = new Client();
  conn.on('ready', () => {
    const botB64 = Buffer.from(fs.readFileSync(path.join(__dirname, 'server/telegramBot.js'), 'utf8')).toString('base64');
    conn.exec(`echo "${botB64}" | base64 -d > /var/www/flatimo-mail/server/telegramBot.js`, (err, stream) => {
      stream.on('close', () => {
        conn.sftp(async (sftpErr, sftp) => {
          if (sftpErr) throw sftpErr;
          await uploadDirectory(sftp, path.join(__dirname, 'dist'), '/var/www/flatimo-mail/dist');
          conn.exec('pm2 reload flatimo-mail', (eErr, eStream) => {
            eStream.on('data', d => process.stdout.write(d));
            eStream.on('close', () => {
              console.log('\n🎉 VPS PM2 reloaded: Detailed DNS Guide active in both Web and Bot!');
              conn.end();
            });
          });
        });
      });
    });
  }).connect({
    host: '66.33.22.220',
    port: 45881,
    username: 'root',
    password: 'Vpsw8C0dJMe#!'
  });
}

run();
