const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors({
  origin: "https://faresmostafaeldib-blip.github.io"
}));

app.use(express.json({ limit: "1mb" }));

app.get("/", (req, res) => {
  res.send("Fares Elgen AI is running!");
});

app.post("/api/solve", async (req, res) => {
  try {
    const { question } = req.body;

    if (!question || typeof question !== "string") {
      return res.status(400).json({
        error: "Please enter a question"
      });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        error: "Gemini API key is missing"
      });
    }

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" +
      process.env.GEMINI_API_KEY,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: "أنت مساعد تعليمي لمنصة Fares Elgen. حل السؤال التالي بدقة، واشرح خطوات الحل باللغة العربية بطريقة بسيطة ومناسبة للطالب:\n" + question
            }]
          }]
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data.error?.message || "Gemini request failed"
      });
    }

    const answer =
      data.candidates?.[0]?.content?.parts
        ?.map(part => part.text || "")
        .join("\n");

    if (!answer) {
      return res.status(502).json({
        error: "No answer received from Gemini"
      });
    }

    res.json({ answer });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Server error"
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Fares Elgen started on port " + PORT);
});
