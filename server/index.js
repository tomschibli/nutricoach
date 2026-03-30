import express from 'express';
import cors from 'cors';
import Anthropic from '@anthropic-ai/sdk';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: ['http://localhost:8080', 'http://localhost:5173', 'http://localhost:3000'] }));
app.use(express.json({ limit: '25mb' }));

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ─── Food Analysis ───────────────────────────────────────────────────────────

app.post('/api/analyze-food', async (req, res) => {
  const { image, mimeType, userProfile } = req.body;
  if (!image || !mimeType) return res.status(400).json({ error: 'image and mimeType required' });

  const allergenNote = userProfile?.allergies?.length
    ? `\n\nIMPORTANT: The user is allergic to: ${userProfile.allergies.join(', ')}. Flag any of these if present.`
    : '';

  const goalNote = userProfile?.goal
    ? `\nUser's goal: ${userProfile.goal.replace(/_/g, ' ')}. Tailor insights accordingly.`
    : '';

  try {
    const response = await anthropic.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'image', source: { type: 'base64', media_type: mimeType, data: image } },
            {
              type: 'text',
              text: `Analyze this food image. Return ONLY valid JSON (no markdown, no code blocks, no explanation).${allergenNote}${goalNote}

Return exactly this structure:
{
  "foodName": "specific food name",
  "description": "1-2 sentence description",
  "servingSize": "e.g. 1 bowl (350g)",
  "servings": 1,
  "confidence": "high",
  "nutrition": {
    "calories": 450,
    "protein": 28,
    "carbs": 52,
    "fat": 14,
    "fiber": 6,
    "sugar": 8,
    "sodium": 620,
    "saturatedFat": 4,
    "cholesterol": 75,
    "vitaminA": "15% DV",
    "vitaminC": "30% DV",
    "calcium": "12% DV",
    "iron": "18% DV"
  },
  "allergens": ["gluten", "dairy"],
  "healthScore": 7,
  "healthScoreReason": "Brief reason",
  "insights": ["Insight 1 specific to this food", "Insight 2", "Insight 3"],
  "mealType": "lunch"
}

If no food is visible, return: {"error": "No food detected", "foodName": null}`,
            },
          ],
        },
      ],
    });

    const text = response.content[0]?.type === 'text' ? response.content[0].text : '';
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return res.status(500).json({ error: 'Could not parse analysis response' });

    const analysis = JSON.parse(match[0]);
    if (analysis.error || !analysis.foodName) {
      return res.status(422).json({ error: analysis.error ?? 'No food detected in image' });
    }
    res.json({ analysis });
  } catch (err) {
    console.error('Food analysis error:', err.message);
    res.status(500).json({ error: 'Analysis failed. Please try again.' });
  }
});

// ─── Streaming Chat ──────────────────────────────────────────────────────────

app.post('/api/chat', async (req, res) => {
  const { messages, system } = req.body;
  if (!messages?.length) return res.status(400).json({ error: 'messages required' });

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const systemPrompt = system || `You are CedricCoach, a premium AI nutrition and fitness coach. You provide personalized, evidence-based advice to help users achieve their health goals. Be encouraging, specific, and actionable. Keep responses concise and warm. Use emojis appropriately.`;

  try {
    const stream = anthropic.messages.stream({
      model: 'claude-opus-4-6',
      max_tokens: 2048,
      thinking: { type: 'adaptive' },
      system: systemPrompt,
      messages: messages.slice(-20), // last 20 messages for context window management
    });

    for await (const event of stream) {
      if (
        event.type === 'content_block_delta' &&
        event.delta.type === 'text_delta'
      ) {
        res.write(`data: ${JSON.stringify({ text: event.delta.text })}\n\n`);
      }
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (err) {
    console.error('Chat stream error:', err.message);
    res.write(`data: ${JSON.stringify({ error: 'Chat failed: ' + err.message })}\n\n`);
    res.end();
  }
});

// ─── Health check ────────────────────────────────────────────────────────────

app.get('/health', (_, res) => res.json({ status: 'ok', model: 'claude-opus-4-6' }));

app.listen(PORT, () => {
  console.log(`🥗 CedricCoach API running on http://localhost:${PORT}`);
  console.log(`   API key: ${process.env.ANTHROPIC_API_KEY ? '✓ set' : '✗ missing'}`);
});
