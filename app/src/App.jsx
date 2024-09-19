import { useState } from 'react';
import './App.css';
import Groq from 'groq-sdk';

const API_KEY = "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";

function App() {
  const [tweet, setTweet] = useState("");
  const [firstName, setFirstName] = useState("");
  const [dni, setDni] = useState("");
  const [error, setError] = useState("");

  async function callOpenAiAPI(){
    console.log("Calling the Groq API");

    const groq = new Groq({ apiKey: API_KEY, dangerouslyAllowBrowser: true });

    const APIBody = {
      "messages": [
        {
          "role": "system",
          "content": "Return a JSON object with the first name and dni extracted from the tweet content. Example: {\"firstName\": \"\", \"dni\": \"\"}"
        },
        {
          "role": "user",
          "content": tweet
        }
      ],
      "model": "llama3-70b-8192",
      "temperature": 1,
      "max_tokens": 64,
      "top_p": 1,
      "stream": false
    };

    try {
      const chatCompletion = await groq.chat.completions.create(APIBody);

      const messageContent = chatCompletion.choices[0].message.content.trim();
      const parsedContent = JSON.parse(messageContent);

      setFirstName(parsedContent.firstName);
      setDni(parsedContent.dni);

    } catch (err) {
      console.error(err);
      setError("Failed to fetch. Please try again later.");
    }
  }

  return (
    <>
      <div>
        <textarea
          onChange={(e) => setTweet(e.target.value)}
          placeholder='Paste your tweet here!'
          cols={50}
          rows={10}
        />
      </div>
      <div>
        <button onClick={callOpenAiAPI}>Capture data and send to Inputs</button>
        {error && <p>{error}</p>}
      </div>
      <div>
        <input
          type="text"
          placeholder="First Name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
        />
      </div>
      <div>
        <input
          type="number"
          placeholder="DNI"
          value={dni}
          onChange={(e) => setDni(e.target.value)}
        />
      </div>
    </>
  );
}

export default App;
