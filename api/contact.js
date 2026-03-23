module.exports = async (req, res) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const {
        company, name, email, phone,
        inquiry_type, contact_method, preferred_time, message,
        recaptcha_token
    } = req.body || {};

    // --- 必須バリデーション ---
    if (!name || !email || !phone || !inquiry_type) {
        return res.status(400).json({ error: '必須項目が不足しています。' });
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
        return res.status(400).json({ error: '有効なメールアドレスを入力してください。' });
    }

    // --- reCAPTCHA v3 サーバー側検証 ---
    const RECAPTCHA_SECRET = process.env.RECAPTCHA_SECRET_KEY;

    if (RECAPTCHA_SECRET) {
        if (!recaptcha_token) {
            return res.status(400).json({ error: 'reCAPTCHA認証が必要です。' });
        }

        try {
            const recaptchaRes = await fetch(
                `https://www.google.com/recaptcha/api/siteverify?secret=${RECAPTCHA_SECRET}&response=${recaptcha_token}`,
                { method: 'POST' }
            );
            const recaptchaData = await recaptchaRes.json();

            console.log('reCAPTCHA result:', JSON.stringify(recaptchaData));
            if (!recaptchaData.success) {
                console.warn('reCAPTCHA failed:', recaptchaData);
                return res.status(400).json({ error: 'reCAPTCHA認証に失敗しました。ページを更新して再度お試しください。' });
            }
        } catch (err) {
            console.error('reCAPTCHA verification error:', err);
            return res.status(500).json({ error: 'reCAPTCHA検証中にエラーが発生しました。' });
        }
    }

    // --- Resend でメール送信 ---
    const RESEND_API_KEY = process.env.RESEND_API_KEY;

    if (!RESEND_API_KEY) {
        console.error('RESEND_API_KEY is not set');
        return res.status(500).json({ error: 'サーバー設定エラー: APIキーが設定されていません。' });
    }

    const inquiryLabels = {
        service: 'サービス加入を検討している',
        issue: '別のサービスを導入しているが、活用に課題がある',
        info: 'まだ検討段階ではないが、情報を集めたい'
    };
    const contactLabels = { tel: '電話', email: 'メール' };

    const inquiryLabel = inquiryLabels[inquiry_type] || inquiry_type || '未選択';
    const contactLabel = contactLabels[contact_method] || contact_method || '未選択';
    const escapedMessage = (message || '').replace(/\n/g, '<br>');

    const tableRow = (label, value) =>
        `<tr><td style="padding:8px;border:1px solid #ddd;background:#f5f5f5;width:140px;"><strong>${label}</strong></td><td style="padding:8px;border:1px solid #ddd;">${value}</td></tr>`;

    const tableHTML = `
        <table style="border-collapse:collapse;width:100%;max-width:600px;">
            ${tableRow('会社名', company || '未記入')}
            ${tableRow('お名前', name)}
            ${tableRow('メール', email)}
            ${tableRow('電話番号', phone || '未記入')}
            ${tableRow('お問い合わせ内容', inquiryLabel)}
            ${tableRow('希望返答手段', contactLabel)}
            ${tableRow('対応可能時間帯', preferred_time || '未記入')}
            ${tableRow('詳細', escapedMessage || '未記入')}
        </table>`;

    try {
        // 1. 管理者への通知メール
        const adminResponse = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${RESEND_API_KEY}`,
            },
            body: JSON.stringify({
                from: 'hitokiwa <contact@hito-kiwa.co.jp>',
                to: ['matsuo.ac@gmail.com', 'hitokiwa.info@gmail.com'],
                subject: `【お問い合わせ】${name}様より`,
                html: `
                    <h2 style="color:#1a3a5c;">新しいお問い合わせがありました</h2>
                    ${tableHTML}
                `,
            }),
        });

        // 2. ユーザーへの自動返信メール
        const userResponse = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${RESEND_API_KEY}`,
            },
            body: JSON.stringify({
                from: 'hitokiwa <contact@hito-kiwa.co.jp>',
                to: [email],
                subject: `【hitokiwa】お問い合わせありがとうございます`,
                html: `
                    <p>${name} 様</p>
                    <p>この度はhitokiwaへお問い合わせいただき、誠にありがとうございます。</p>
                    <p>以下の内容でお問い合わせを受け付けいたしました。<br>
                    担当者より折り返しご連絡させていただきますので、今しばらくお待ちください。</p>
                    <hr style="border:1px solid #ddd;margin:20px 0;">
                    ${tableHTML}
                    <hr style="border:1px solid #ddd;margin:20px 0;">
                    <p style="color:#666;font-size:0.9em;">※このメールは自動送信されています。返信はしないでください。</p>
                    <p><strong>hitokiwa（ヒトキワ）</strong><br>
                    TEL: 03-6897-6289<br>
                    Email: contact@hito-kiwa.co.jp</p>
                `,
            }),
        });

        const adminData = await adminResponse.json();
        const userData = await userResponse.json();

        if (adminResponse.ok && userResponse.ok) {
            return res.status(200).json({ message: '送信に成功しました。' });
        } else {
            console.error('Resend API Error:', { admin: adminData, user: userData });
            return res.status(500).json({ error: 'メール送信に失敗しました。時間をおいて再度お試しください。' });
        }

    } catch (error) {
        console.error('Server Error:', error);
        return res.status(500).json({ error: 'サーバーエラーが発生しました。' });
    }
};
