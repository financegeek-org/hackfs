const go = async () => {

  const apiKey = await Lit.Actions.decryptAndCombine({
    accessControlConditions,
    ciphertext,
    dataToEncryptHash,
    authSig: null,
    chain: 'ethereum',
  });
  const payload = {
    "inputs": query,
  };
  const response = await fetch(
    "https://api-inference.huggingface.co/models/gpt2",
    {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + apiKey,
      },
      method: "POST",
      body: JSON.stringify(payload),
    }
  );
  //console.log(response);
  const result = await response.json();
  console.log(result[0].generated_text);
  Lit.Actions.setResponse({ response: result[0].generated_text });
};

go();