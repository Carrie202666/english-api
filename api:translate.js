export default async function handler(req, res) {
  // 只允许 POST 请求
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { chinese, userEnglish } = req.body;

  if (!chinese || !userEnglish) {
    return res.status(400).json({ error: 'Missing chinese or userEnglish' });
  }

  const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;

  if (!DEEPSEEK_API_KEY) {
    return res.status(500).json({ error: 'DeepSeek API key not configured' });
  }

  const systemPrompt = `你是一个英语教学专家。用户的英文翻译可能不完全和标准答案一样，你需要判断是否正确、是否地道自然。

判断标准：
1. 如果翻译正确且自然：返回 "✅ 正确且自然"
2. 如果正确但不够地道：返回 "⚠️ 正确但不够地道，更自然的说法是：[更好的表达]"
3. 如果错误：返回 "❌ 错误，正确说法是：[正确翻译]，原因是：[简短解释]"

只返回上面的反馈文字，不要加其他内容。`;

  const userPrompt = `中文句子：${chinese}\n用户的英文翻译：${userEnglish}`;

  try {
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 200
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('DeepSeek API error:', data);
      return res.status(500).json({ error: 'AI service error' });
    }

    const feedback = data.choices[0].message.content;
    return res.status(200).json({ success: true, feedback });

  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
}