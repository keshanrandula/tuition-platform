/**
 * AI Controller to handle communication with OpenRouter API
 */

// System prompt to shape the AI's behavior as a tuition assistant
const SYSTEM_PROMPT = `You are 'TuteAI', a highly knowledgeable, friendly, and supportive AI Tutor for the Tuition Platform. 
Your goal is to help students understand their subjects (such as Mathematics, Biology, Physics, Chemistry, Computer Science, and Languages), explain complex academic concepts in a clear and simplified manner, help solve educational problems step-by-step, and guide them in their learning.
Keep your answers formatted in clean Markdown, using bolding, lists, or tables where appropriate to make the explanation easy to read. 
Always encourage the student, be polite, and maintain an educational, mentoring tone. If a student asks questions unrelated to education, learning, or general knowledge, politely remind them that you are here to assist with their studies, but try to answer briefly if it is harmless.`;

exports.handleChat = async (req, res) => {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid "messages" array containing chat history.',
      });
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    const model = process.env.OPENROUTER_MODEL || 'google/gemini-2.5-flash:free';

    // If API key is not configured or is the default placeholder, provide a demo response
    if (!apiKey || apiKey === 'your_openrouter_api_key_here') {
      const lastUserMessage = messages[messages.length - 1]?.content || '';
      let mockReply = '';

      if (lastUserMessage.toLowerCase().includes('photosynthesis')) {
        mockReply = `Hello! It looks like you haven't configured your OpenRouter API Key in the server's \`.env\` file yet. However, here is a demo response:

**Photosynthesis** is the process used by plants, algae, and certain bacteria to harness energy from sunlight and turn it into chemical energy.

* **Key Chemical Equation:**
  \`6CO2 + 6H2O + light energy -> C6H12O6 + 6O2\`

* **Main Stages:**
  1. **Light-dependent reactions:** Occurs in the thylakoid membranes where light is absorbed to split water and make ATP.
  2. **Calvin Cycle (Light-independent):** Occurs in the stroma, using carbon dioxide and ATP to synthesize glucose.

Please add your \`OPENROUTER_API_KEY\` in your \`server/.env\` file to receive real-time answers!`;
      } else if (lastUserMessage.toLowerCase().includes('equation') || lastUserMessage.toLowerCase().includes('quadratic')) {
        mockReply = `Hello! This is a demo response since your OpenRouter API Key is not yet configured:

A **Quadratic Equation** is a second-order polynomial equation in a single variable:

$$ax^2 + bx + c = 0$$

* **Quadratic Formula:**
  To solve for $x$, use the formula:
  \`x = (-b ± √(b² - 4ac)) / 2a\`

Please configure your \`OPENROUTER_API_KEY\` in the \`server/.env\` file to chat live with the Gemini model!`;
      } else {
        mockReply = `Hello! I am **TuteAI**, your personal AI assistant. 

Currently, the server's \`OPENROUTER_API_KEY\` is not configured. Once you add your key in \`server/.env\`, I will connect directly to the **Gemini 2.5 Flash** model via OpenRouter!

For now, you can try asking me about **photosynthesis** or **quadratic equations** to test my interactive markdown parsing and UI components!`;
      }

      // Simulate a small delay for realistic loading state
      await new Promise(resolve => setTimeout(resolve, 800));

      return res.status(200).json({
        success: true,
        data: {
          role: 'assistant',
          content: mockReply
        }
      });
    }

    // Insert the system prompt at the beginning of the messages list
    const requestMessages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...messages
    ];

    // Call OpenRouter API
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:3000', // Site URL
        'X-Title': 'Tuition Platform AI Assistant', // Site Title
      },
      body: JSON.stringify({
        model: model,
        messages: requestMessages,
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('OpenRouter API Error:', data);
      return res.status(response.status).json({
        success: false,
        message: data.error?.message || 'Error occurred while calling OpenRouter API.',
        error: data.error || data
      });
    }

    // Extract the AI's response text
    const aiMessage = data.choices?.[0]?.message;

    if (!aiMessage) {
      return res.status(500).json({
        success: false,
        message: 'Invalid response structure from AI provider.',
      });
    }

    return res.status(200).json({
      success: true,
      data: aiMessage,
    });

  } catch (error) {
    console.error('AI Controller Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while communicating with AI assistant.',
      error: error.message,
    });
  }
};
