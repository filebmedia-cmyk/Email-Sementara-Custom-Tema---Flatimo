import { simpleParser } from 'mailparser';
import { nanoid } from 'nanoid';

// Helper to extract OTP / Verification codes from text/html
function extractOtpAndLinks(text, html, subject) {
  const cleanSubject = subject || '';
  const cleanText = text || '';
  const cleanHtml = (html || '').replace(/<[^>]*>/g, ' ');
  const combined = `${cleanSubject} ${cleanText} ${cleanHtml}`;
  
  // 1. Priority keyword-based regex (e.g. "code is 123456", "OTP: 981245", "kode verifikasi: 123456")
  const keywordPatterns = [
    /(?:code|kode|otp|pin|verification code|kode verifikasi|confirm code|security code)\s*(?:is|adalah|:)?\s*([0-9]{4,8})/i,
    /(?:is|adalah)\s*([0-9]{4,8})/i,
    />\s*([0-9]{4,8})\s*</,
    /\b([0-9]{3}[-\s][0-9]{3})\b/
  ];

  let detectedOtp = null;

  for (const pattern of keywordPatterns) {
    const match = combined.match(pattern);
    if (match && match[1]) {
      const candidate = match[1].replace(/[-\s]/g, '');
      if (candidate.length >= 4 && candidate.length <= 8 && !['2024', '2025', '2026', '2027'].includes(candidate)) {
        detectedOtp = candidate;
        break;
      }
    }
  }

  // 2. Fallback: scan for any 4-8 digit standalone numbers
  if (!detectedOtp) {
    const otpMatches = combined.match(/\b([0-9]{4,8})\b/g) || [];
    const validOtps = otpMatches.filter(code => !['2024', '2025', '2026', '2027'].includes(code));
    if (validOtps.length > 0) {
      detectedOtp = validOtps[0];
    }
  }

  // 3. Extract verification / confirmation links (e.g. CapCut, TikTok, etc.)
  const linkMatches = (html || combined).match(/https?:\/\/[^\s"'<>]+/g) || [];
  const verificationLink = linkMatches.find(l => 
    l.toLowerCase().includes('verify') || 
    l.toLowerCase().includes('confirm') || 
    l.toLowerCase().includes('auth') || 
    l.toLowerCase().includes('token') ||
    l.toLowerCase().includes('capcut') ||
    l.toLowerCase().includes('tiktok')
  ) || (linkMatches.length > 0 ? linkMatches[0] : null);

  return {
    otp: detectedOtp || '',
    code: detectedOtp || '',
    verification_code: detectedOtp || '',
    verification_link: verificationLink || '',
    links: linkMatches
  };
}

export async function parseRawEmail(source, defaultRecipient = null) {
  try {
    const parsed = await simpleParser(source);

    // Extract recipients (TO and CC)
    const toRecipients = [];
    if (parsed.to) {
      const toList = Array.isArray(parsed.to) ? parsed.to : [parsed.to];
      toList.forEach(t => {
        if (t.value && Array.isArray(t.value)) {
          t.value.forEach(v => {
            if (v.address) toRecipients.push(v.address.toLowerCase());
          });
        } else if (t.text) {
          toRecipients.push(t.text.toLowerCase());
        }
      });
    }

    if (defaultRecipient && !toRecipients.includes(defaultRecipient.toLowerCase())) {
      toRecipients.push(defaultRecipient.toLowerCase());
    }

    // Process attachments
    const processedAttachments = (parsed.attachments || []).map(att => {
      let contentBase64 = '';
      if (att.content && Buffer.isBuffer(att.content)) {
        contentBase64 = att.content.toString('base64');
      }
      return {
        id: nanoid(8),
        filename: att.filename || 'attachment',
        contentType: att.contentType || 'application/octet-stream',
        size: att.size || (att.content ? att.content.length : 0),
        checksum: att.checksum || '',
        dataBase64: contentBase64,
        cid: att.cid || null
      };
    });

    const senderObj = {
      text: parsed.from ? parsed.from.text : 'Unknown',
      name: parsed.from && parsed.from.value && parsed.from.value[0] ? parsed.from.value[0].name : '',
      address: parsed.from && parsed.from.value && parsed.from.value[0] ? parsed.from.value[0].address : (parsed.from ? parsed.from.text : 'unknown@sender.com')
    };

    const textContent = parsed.text || '';
    const htmlContent = parsed.html || '';
    const subjectContent = parsed.subject || '(Tanpa Subjek)';

    const extracted = extractOtpAndLinks(textContent, htmlContent, subjectContent);

    return {
      id: nanoid(12),
      from: senderObj,
      toRecipients: toRecipients.length > 0 ? toRecipients : (defaultRecipient ? [defaultRecipient.toLowerCase()] : []),
      subject: subjectContent,
      text: textContent,
      html: htmlContent,
      textAsHtml: parsed.textAsHtml || htmlContent || textContent,
      body: textContent || htmlContent,
      content: textContent || htmlContent,
      otp: extracted.otp,
      code: extracted.code,
      verification_code: extracted.verification_code,
      verification_link: extracted.verification_link,
      links: extracted.links,
      date: parsed.date ? parsed.date.toISOString() : new Date().toISOString(),
      headers: Object.fromEntries(parsed.headers || []),
      attachments: processedAttachments,
      size: typeof source === 'string' ? Buffer.byteLength(source) : (source.length || 1024)
    };
  } catch (err) {
    console.error('[MailParser] Parsing error:', err);
    throw err;
  }
}
