const query = `What is the world like?`;
const key = process.env.HUGGING_FACE_API_KEY;;

async function main() {
  const payload = {
    "inputs": query,
  };
  const response = await fetch(
    "https://api-inference.huggingface.co/models/gpt2",
    {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + key,
      },
      method: "POST",
      body: JSON.stringify(payload),
    }
  );

  console.log(response);
  const result = await response.json();
  console.log(result[0].generated_text);
}

main();