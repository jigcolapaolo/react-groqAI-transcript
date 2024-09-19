import React from "react";
import useSpeechRecognition from "../hooks/useSpeechRecognitionHook";

export const Main = () => {
  const {
    text,
    startListening,
    stopListening,
    isListening,
    hasRecognitionSupport,
    jsonResult,
    error,
  } = useSpeechRecognition();

  const handleClick = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }

  return (
    <div>
      {hasRecognitionSupport ? (
        <>
          <div>
            <button onClick={handleClick}>
              {isListening ? "Listening..." : "Start listening"}
            </button>
          </div>

          <div>{text}</div>
          <div>
            <h3>Extracted Data:</h3>
            {error && <p>{error}</p>}
            <form>
              <div>
                <label htmlFor="firstName">First Name:</label>
                <input
                  type="text"
                  id="firstName"
                  value={jsonResult.firstName}
                  readOnly
                />
              </div>
              <div>
                <label htmlFor="dni">DNI:</label>
                <input type="text" id="dni" value={jsonResult.dni} readOnly />
              </div>
              <div>
                <label htmlFor="dob">Date of Birth:</label>
                <input
                  type="date"
                  id="dob"
                  value={jsonResult.birthDate}
                  readOnly
                />
              </div>
              <div>
                <label htmlFor="email">Email:</label>
                <input
                  type="email"
                  id="email"
                  value={jsonResult.email}
                  readOnly
                />
              </div>
            </form>
          </div>
        </>
      ) : (
        <h1>Your browser has no speech recognition support</h1>
      )}
    </div>
  );
};

export default Main;
