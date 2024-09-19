import { useEffect, useState } from "react";
import Groq from 'groq-sdk';

const API_KEY = "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";

// Validar que se pueda usar en el navegador
let recognition: any = null;
if ("webkitSpeechRecognition" in window) {
    // Se crea el speech Recognition si se puede usar
    recognition = new webkitSpeechRecognition();
    // continuous, Nos permite obtener múltiples resultados
    recognition.continuous = true;
    recognition.lang = "es-ES";
}

const useSpeechRecognition = () => {
    const [text, setText] = useState("");
    const [isListening, setIsListening] = useState(false);
    const [jsonResult, setJsonResult] = useState({ firstName: "", dni: "", birthDate: "", email: "" });
    const [error, setError] = useState("");

    useEffect(() => {
        // Si no se puede usar el speech recognition, no se hace nada
        if (!recognition) return;

        recognition.onresult = async (event: SpeechRecognitionEvent) => {
            const transcript = event.results[0][0].transcript;
            // console.log("onresult event: ", event);
            setText(transcript);
            // Procesar el texto mediante IA
            await processText(transcript);
        };

        // El audio se detiene automaticamente luego de unos segundos,
        // aunque el usuario no clickee para detenerlo, esto previene
        // que eso ocurra, solo se detendra el audio cuando el usuario clickee el boton
        recognition.onend = () => {
            if (isListening){
                recognition.start()
            }
        }

    }, [isListening]);

    const startListening = () => {
        setText("");
        setIsListening(true);
        recognition.start();
    };

    const stopListening = () => {
        setIsListening(false);
        recognition.stop();
    };

    // Proceso el texto que obtuve del audio para obtener un json
    const processText = async (text: string) => {
        try {
            const groq = new Groq({ apiKey: API_KEY, dangerouslyAllowBrowser: true });

            const APIBody = {
                "messages": [
                    {
                        "role": "system",
                        "content": 
                        `Devuelve un json como este\n{\n  "firstName": "${jsonResult.firstName}",\n  "dni": "${jsonResult.dni}",\n  "birthDate": "${jsonResult.birthDate}",\n  "email": "${jsonResult.email}"\n} Cambia los valores solo si el usuario dice explícitamente que lo haga. Mantén los valores actuales si el usuario solo menciona un dato sin indicación clara de cambio. Calcula la fecha de nacimiento a partir de la edad actual y el año si se proporcionan. Asegúrate de que el DNI tenga todos los dígitos juntos sin espacios ni comas. Si el usuario dice que se debe eliminar un campo, ponlo vacío.`
                    },
                    {
                        "role": "user",
                        "content": text
                    }
                ],
                "model": "llama3-70b-8192",
                "temperature": 1,
                "max_tokens": 2120,
                "top_p": 1,
                "stream": false,
                "response_format": {
                  "type": "json_object"
                },
                "stop": null
            };

            const chatCompletion = await groq.chat.completions.create(APIBody as any);

            const messageContent = chatCompletion.choices[0].message.content?.trim();

            // Extraer datos del JSON y calcular la fecha de nacimiento si es necesario
            const result = JSON.parse(messageContent || '{}');


                        // Actualizar jsonResult sin sobrescribir los campos que no están en el resultado
                        setJsonResult(prevResult => ({
                            ...prevResult,
                            firstName: result.firstName || prevResult.firstName,
                            dni: result.dni ? result.dni.replace(/\D/g, '') : prevResult.dni,
                            birthDate: result.birthDate || prevResult.birthDate,
                            email: result.email || prevResult.email
                        }));
        } catch (err) {
            console.error(err);
            setError("Failed to fetch. Please try again later.");
        }
    };

    return {
        text,
        isListening,
        startListening,
        stopListening,
        hasRecognitionSupport: !!recognition,
        jsonResult,
        error,
    };
};

export default useSpeechRecognition;
