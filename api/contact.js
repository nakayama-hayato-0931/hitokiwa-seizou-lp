module.exports = async (req, res) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight request
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { company, name, email, phone, inquiry_type, contact_method, preferred_time, message } = req.body || {};

    // 簡単なバリデーション
    if (!name || !email) {
        return res.status(400).json({ error: '必須項目が不足しています。' });
    }

    const RESEND_API_KEY = process.env.RESEND_API_KEY;

    if (!RESEND_API_KEY) {
        console.error('RESEND_API_KEY is not set');
        return res.status(500).json({ error: 'サーバー設定エラー: APIキーが設定されていません。' });
    }

    try {
        const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${RESEND_API_KEY}`,
            },
            body: JSON.stringify({
                from: 'hitokiwa <onboarding@resend.dev>',
                to: ['n.hayato.0931@gmail.com'],
                subject: `【お問い合わせ】${name}様より`,
                html: `
          <h3>新しいお問い合わせがありました</h3>
          <p><strong>会社名:</strong> ${company || '未記入'}</p>
          <p><strong>お名前:</strong> ${name}</p>
          <p><strong>メールアドレス:</strong> ${email}</p>
          <p><strong>電話番号:</strong> ${phone || '未記入'}</p>
          <p><strong>お問い合わせ内容:</strong> ${inquiry_type || '未選択'}</p>
          <p><strong>希望返答手段:</strong> ${contact_method || '未選択'}</p>
          <p><strong>対応可能な時間帯:</strong> ${preferred_time || '未記入'}</p>
          <p><strong>お問い合わせ詳細:</strong><br>${(message || '').replace(/\n/g, '<br>')}</p>
        `,
            }),
        });

        const data = await response.json();

        if (response.ok) {
            return res.status(200).json({ message: '送信に成功しました。', id: data.id });
        } else {
            console.error('Resend API Error:', data);
            return res.status(500).json({ error: 'メール送信に失敗しました。' });
        }
    } catch (error) {
        console.error('Server Error:', error);
        return res.status(500).json({ error: 'サーバーエラーが発生しました。' });
    }
};
