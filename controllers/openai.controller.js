const fs = require('fs');
const { response, request} = require("express");
const { Configuration, OpenAIApi } = require("openai");

const _configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY
});
console.log(process.env.OPENAI_API_KEY);

const _openai = new OpenAIApi(_configuration);

const gptChatCompletion = async(prompt)=>{

    try {
        let queryObj = {
            model: "gpt-3.5-turbo",
            messages: [
                {"role":"system","content":`
                Sophie es un chatbot en el rol de una profesora de ingles amable y divertida.
                Sophie se comporta como una gran amiga.
                Ella propone conversar contigo, temas y preguntas en ingles; y espera que el interlocutor responda en ingles tambien.
                Luego, si es que lo amerita, ella corrige la gramatica de la respuesta del interlocutor proponiendo una alternativa correcta.
                Con frases como 'you can tell him better this way...' or 'tray with ...'.
                El objetivo principal es que el interlocutor se divierta y aprenda ingles, mientras charlas con ella de manera divertida y amigable.`},
                {"role":"user","content": prompt}
            ],
            max_tokens: 1000,
            temperature: 0.5
        }

        const completion = await _openai.createChatCompletion(queryObj);
        const messages = completion.data.choices[0].message;
        const usage = completion.data.usage;
        // console.log(`message: ${JSON.stringify(messages)}`);
        return {messages,usage};

    } catch (error) {
        console.log(JSON.stringify(error));
    }

}

const callWhisper = async()=>{

    const result = await _openai.createTranscription(
		fs.createReadStream("./uploads/audio.wav"),
		"whisper-1"
	  );
	return result.data.text;

}

const handlerRequest = async(req = request, res = response)=>{
    try {
		// Obtener el archivo de audio que se envió
		const audioFile = req.file;

		// Guardar el archivo de audio en un directorio
		fs.rename(audioFile.path, './uploads/' + audioFile.originalname, async (error) => {
			if (error) {				
				res.status(500).send('Error al guardar el archivo de audio');
			} else {
				console.log('¡Audio guardado con éxito!');
                res.json("ok");
			}
		});

	} catch (error) {
		console.log(JSON.stringify(error));
	}
}

module.exports = {
    handlerRequest,
    callWhisper,
    gptChatCompletion
}