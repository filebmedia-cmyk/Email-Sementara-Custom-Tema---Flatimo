export default async function handler(req, res) {
  try {
    const { default: app } = await import('../server/app.js');
    return app(req, res);
  } catch (err) {
    console.error('[Vercel Boot Crash]', err);
    return res.status(500).json({
      error: 'CRASH_ON_BOOT',
      message: err.message,
      stack: err.stack
    });
  }
}
