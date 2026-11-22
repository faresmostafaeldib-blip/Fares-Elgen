module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { question } = req.body || {};

    if (!question || !question.trim()) {
      return res.status(400).json({ error: "اكتب السؤال أولاً" });
    }

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" +
        process.env.GEMINI_API_KEY,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: question }] }]
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(500).json({ error: "تعذر الحصول على الإجابة" });
    }

    const answer =
      data.candidates?.[0]?.content?.parts?.[0]?.text;

    return res.status(200).json({ answer: answer || "لم أتمكن من الإجابة" });
  } catch (error) {
    return res.status(500).json({ error: "حدث خطأ في الاتصال" });
  }
};
