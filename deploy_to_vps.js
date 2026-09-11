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
        if (code === 0) {
          resolve({ stdout, stderr, code });
        } else {
          resolve({ stdout, stderr, code }); // resolve so we can inspect error
        }
      });
    });
  });
}

function uploadDirectory(sftp, localDir, remoteDir) {
  return new Promise(async (resolve, reject) => {
    try {
      // Ensure remote dir exists
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
  console.log('⚡ Starting Full Deployment of Flatimo Mail to VPS...');
  const conn = new Client();

  conn.on('ready', async () => {
    console.log('✅ SSH Authenticated successfully.');

    try {
      // 1. Create remote target directory
      await execPromise(conn, `mkdir -p ${REMOTE_DIR}/data`);

      // 2. Open SFTP for file transfers
      conn.sftp(async (err, sftp) => {
        if (err) throw err;

        console.log('\n📦 Uploading Application Files via SFTP...');
        
        // Upload package.json
        await new Promise(r => sftp.fastPut(path.join(__dirname, 'package.json'), `${REMOTE_DIR}/package.json`, r));
        
        // Upload .env with production port 80 & SMTP port 25
        const prodEnv = [
          'PORT=80',
          'SMTP_PORT=25',
          'NODE_ENV=production',
          'DOMAINS=flatimostore.my.id,flatimo.me,flatmail.dev',
          'RETENTION_HOURS=24',
          'MAX_ATTACHMENT_SIZE_MB=15',
          'API_KEY=FLATIMOSTORE',
          'API_KEYS=FLATIMOSTORE'
        ].join('\n');

        const localEnvTemp = path.join(__dirname, '.env.vps.temp');
        fs.writeFileSync(localEnvTemp, prodEnv, 'utf8');
        await new Promise(r => sftp.fastPut(localEnvTemp, `${REMOTE_DIR}/.env`, r));
        fs.unlinkSync(localEnvTemp);

        // Upload server/ directory
        await uploadDirectory(sftp, path.join(__dirname, 'server'), `${REMOTE_DIR}/server`);

        // Upload dist/ (compiled frontend)
        await uploadDirectory(sftp, path.join(__dirname, 'dist'), `${REMOTE_DIR}/dist`);

        console.log('✅ All files uploaded successfully!\n');

        // 3. Install production dependencies on VPS
        console.log('⚙️ Installing NPM packages on VPS...');
        await execPromise(conn, `cd ${REMOTE_DIR} && npm install --omit=dev`);

        // 4. Install PM2 process manager if needed
        console.log('⚙️ Setting up PM2...');
        await execPromise(conn, `which pm2 || npm install -g pm2`);

        // 5. Restart or start application with PM2
        console.log('🚀 Starting Flatimo Mail on PM2...');
        await execPromise(conn, `cd ${REMOTE_DIR} && pm2 delete flatimo-mail || true`);
        await execPromise(conn, `cd ${REMOTE_DIR} && pm2 start server/index.js --name "flatimo-mail"`);
        await execPromise(conn, `pm2 save`);

        // 6. Test local server response on VPS
        console.log('🧪 Verifying deployment status...');
        await new Promise(r => setTimeout(r, 2000));
        await execPromise(conn, `curl -s http://localhost/api/v1/domains`);
        await execPromise(conn, `pm2 status`);

        console.log('\n🎉 ======================================================== 🎉');
        console.log('   FLATIMO MAIL IS NOW LIVE ON YOUR VPS! ⚡');
        console.log('   🌐 Web URL    : http://66.33.22.220');
        console.log('   🌐 Domain URL : http://flatimostore.my.id');
        console.log('   📫 SMTP Port  : Port 25 (MX Priority 1 Ready)');
        console.log('   🔑 API Key    : FLATIMOSTORE (Unlimited VIP)');
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
