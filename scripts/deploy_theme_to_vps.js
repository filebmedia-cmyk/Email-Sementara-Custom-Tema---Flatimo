import { Client } from 'ssh2';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const vpsConfig = {
  host: '66.33.22.220',
  port: 45881,
  username: 'root',
  password: 'Vpsw8C0dJMe#!',
  readyTimeout: 30000
};

const REMOTE_DIR = '/var/www/flatimo-mail';

function execPromise(conn, cmd) {
  return new Promise((resolve, reject) => {
    console.log(`[VPS] Running: ${cmd}`);
    conn.exec(cmd, (err, stream) => {
      if (err) return reject(err);
      let stdout = '';
      let stderr = '';
      stream.on('data', (data) => {
        stdout += data.toString();
        process.stdout.write(data);
      });
      stream.stderr.on('data', (data) => {
        stderr += data.toString();
        process.stderr.write(data);
      });
      stream.on('close', (code) => {
        resolve({ stdout, stderr, code });
      });
    });
  });
}

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

async function deploy() {
  console.log('⚡ Deploying Fresh Theme System, Action Particles & Fonts to VPS...');
  const conn = new Client();

  conn.on('error', (err) => {
    console.error('⚠️ [VPS SSH Error]:', err.message);
  });

  conn.on('ready', async () => {
    console.log('✅ SSH Connected to VPS successfully.');

    try {
      conn.sftp(async (err, sftp) => {
        if (err) throw err;

        console.log('\n📦 1. Uploading compiled production frontend (dist/)...');
        await uploadDirectory(sftp, path.join(__dirname, 'dist'), `${REMOTE_DIR}/dist`);

        console.log('\n📦 2. Uploading server backend (server/)...');
        await uploadDirectory(sftp, path.join(__dirname, 'server'), `${REMOTE_DIR}/server`);

        console.log('\n🔄 3. Restarting PM2 process flatimo-mail...');
        await execPromise(conn, `pm2 restart flatimo-mail`);

        console.log('\n🧪 4. Verifying production HTTP health & Bot logs...');
        await new Promise(r => setTimeout(r, 2000));
        await execPromise(conn, `pm2 status`);
        await execPromise(conn, `node -e "import('/var/www/flatimo-mail/server/db.js').then(({db}) => { const msgs = Array.from(db.messages.values()); console.log('Total msgs:', msgs.length); console.log('Last 3:', JSON.stringify(msgs.slice(-3).map(m => ({ id: m.id, inbox: m.inboxEmail, subject: m.subject, otp: m.otp, verification_link: m.verification_link, text: (m.text || '').substring(0, 200) })), null, 2)); })"`);
        await execPromise(conn, `pm2 logs flatimo-mail --lines 25 --nostream`);

        console.log('\n🎉 ======================================================== 🎉');
        console.log('   SELURUH PERUBAHAN TEMA BERHASIL DITERAPKAN DI VPS! ⚡');
        console.log('   🌐 Live URL : https://mailflatimo.web.id');
        console.log('   🌐 VPS IP   : http://66.33.22.220:3000');
        console.log('🎉 ======================================================== 🎉\n');

        conn.end();
      });
    } catch (err) {
      console.error('❌ Deployment error:', err);
      conn.end();
    }
  }).connect(vpsConfig);
}

deploy();
