async function test() {
  const response = await fetch("http://localhost:3000/api/assistant/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ 
      messages: [
        { role: "user", parts: [{ text: "hello" }] },
        { role: "assistant", parts: [{ text: "Hello!" }] },
        { role: "user", parts: [{ text: "give me 5 alumni" }] }
      ]
    })
  });

  if (!response.ok) {
    throw new Error(`Server returned ${response.status}`);
  }
  if (!response.body) throw new Error("No response body");

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let accumulatedText = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    
    const chunk = decoder.decode(value);
    const lines = chunk.split('\n');
    
    for (const line of lines) {
      if (line.startsWith('data: ') && line !== 'data: [DONE]') {
        try {
          const data = JSON.parse(line.slice(6));
          accumulatedText += data.text;
        } catch (e) {
          console.error("Error parsing event stream data", e.message);
        }
      }
    }
  }
  console.log("Success! Accumulated text:", accumulatedText);
}
test().catch(console.error);
