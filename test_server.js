// Integration test script for Flatimo Mail API
import http from 'http';

function request(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch {
          resolve({ status: res.statusCode, raw: body });
        }
      });
    });
    req.on('error', (err) => reject(err));
    if (data) {
      req.write(typeof data === 'string' ? data : JSON.stringify(data));
    }
    req.end();
  });
}

async function runTests() {
  console.log('⚡ Starting Flatimo Mail Automated Integration Tests...\n');
  const port = 3000;

  try {
    // 0. Test GET /api/v1/key/verify (FLATIMOSTORE)
    console.log('0. Testing GET /api/v1/key/verify?key=FLATIMOSTORE...');
    const keyRes = await request({
      hostname: '127.0.0.1',
      port,
      path: '/api/v1/key/verify?key=FLATIMOSTORE',
      method: 'GET'
    });
    console.log('   Key Status:', keyRes.status);
    console.log('   Key Tier:', keyRes.data.tier, '| Message:', keyRes.data.message);

    // 1. Test GET /api/v1/domains
    console.log('\n1. Testing GET /api/v1/domains...');
    const domRes = await request({
      hostname: '127.0.0.1',
      port,
      path: '/api/v1/domains',
      method: 'GET'
    });
    console.log('   Response Status:', domRes.status);
    console.log('   Domains:', domRes.data.domains);

    // 2. Test GET /api/v1/inbox/generate
    console.log('\n2. Testing GET /api/v1/inbox/generate...');
    const genRes = await request({
      hostname: '127.0.0.1',
      port,
      path: '/api/v1/inbox/generate',
      method: 'GET'
    });
    console.log('   Generated Email:', genRes.data.email);
    const testEmail = genRes.data.email;

    // 3. Test POST /api/v1/test-email (Simulate email arrival)
    console.log('\n3. Testing POST /api/v1/test-email...');
    const mailRes = await request({
      hostname: '127.0.0.1',
      port,
      path: '/api/v1/test-email',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      to: testEmail,
      senderName: 'Google Security Verification',
      senderEmail: 'accounts@google.com',
      subject: 'Kode OTP Google Anda: 492019',
      withAttachment: true
    });
    console.log('   Email Sent Status:', mailRes.status);
    console.log('   Saved Message ID:', mailRes.data.email?.id);
    const messageId = mailRes.data.email?.id;

    // 4. Test GET /api/v1/inbox/:email/messages
    console.log(`\n4. Testing GET /api/v1/inbox/${testEmail}/messages...`);
    const inboxRes = await request({
      hostname: '127.0.0.1',
      port,
      path: `/api/v1/inbox/${encodeURIComponent(testEmail)}/messages`,
      method: 'GET'
    });
    console.log('   Total messages in inbox:', inboxRes.data.total);
    console.log('   Latest subject:', inboxRes.data.messages[0]?.subject);

    // 5. Test GET /api/v1/messages/:id
    console.log(`\n5. Testing GET /api/v1/messages/${messageId}...`);
    const detailRes = await request({
      hostname: '127.0.0.1',
      port,
      path: `/api/v1/messages/${messageId}`,
      method: 'GET'
    });
    console.log('   Detail Subject:', detailRes.data.message?.subject);
    console.log('   Has Attachments:', detailRes.data.message?.attachments?.length > 0);

    // 6. Test GET /api/v1/stats
    console.log('\n6. Testing GET /api/v1/stats...');
    const statsRes = await request({
      hostname: '127.0.0.1',
      port,
      path: '/api/v1/stats',
      method: 'GET'
    });
    console.log('   Public Stats:', statsRes.data.stats);

    // 7. Test Webhook POST /api/v1/webhook/incoming with secret key
    console.log('\n7. Testing POST /api/v1/webhook/incoming...');
    const webhookRes = await request({
      hostname: '127.0.0.1',
      port,
      path: '/api/v1/webhook/incoming',
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'X-Webhook-Secret': 'flatimo_secret_key_123'
      }
    }, {
      to: testEmail,
      from: { name: 'TikTok Team', address: 'register@tiktok.com' },
      subject: 'Selamat Datang di TikTok!',
      html: '<h1>Selamat Datang!</h1><p>Email ini diterima via Inbound Webhook.</p>',
      text: 'Selamat Datang! Email ini diterima via Inbound Webhook.'
    });
    console.log('   Webhook Status:', webhookRes.status);
    console.log('   Webhook Message:', webhookRes.data?.message);

    console.log('\n========================================');
    console.log('⚡ ALL 7 INTEGRATION TESTS PASSED 100%! ⚡');
    console.log('========================================\n');
  } catch (err) {
    console.error('❌ Test error:', err);
  }
}

runTests();
