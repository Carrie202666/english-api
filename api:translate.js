export default async function handler(req, res) {
  // 只允许 POST 请求
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { chinese, userEnglish } = req.body;

  if (!chinese || !userEnglish) {
    return res.status(400).json({ error: 'Missing chinese or userEnglish' });
  }

  // 测试模式：返回固定回复
  return res.status(200).json({ 
    success: true, 
    feedback: `✅ 测试成功！\n中文：${chinese}\n你的英文：${userEnglish}\n（DeepSeek API 稍后配置）`
  });
}
