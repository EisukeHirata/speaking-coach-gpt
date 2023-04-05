import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";
import { useState, useMemo } from "react";
import MicRecorder from "mic-recorder-to-mp3";

const Home = () => {
  const [audio, setAudio] = useState();
  const [transcript, setTranscript] = useState();
  const [loading, setLoading] = useState(false);

  const [isRecording, setIsRecording] = useState(false);
  const [blobURL, setBlobURL] = useState("");
  const [isBlocked, setIsBlocked] = useState(false);
  const [feedback, setFeedback] = useState("");

  const recorder = useMemo(() => new MicRecorder({ bitRate: 128 }), []);

  const startRecording = () => {
    if (isBlocked) {
      console.log("Permission Denied");
      setIsBlocked(true);
    } else {
      recorder
        .start()
        .then(() => {
          setIsRecording(true);
        })
        .catch((e) => console.error(e));
    }
  };

  const stopRecording = () => {
    setIsRecording(false);
    recorder
      .stop()
      .getMp3()
      .then(([buffer, blob]) => {
        const file = new File(buffer, "test.mp3", {
          type: blob.type,
          lastModified: Date.now(),
        });
        setBlobURL(URL.createObjectURL(file));
        // Convert to base64
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onloadend = function () {
          const base64data = reader.result;
          // Only send the base64 string
          const base64String = base64data.split(",")[1];
          setAudio(base64String);
        };
      });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setIsRecording(false);
    console.time("Whisper API");
    const whisperResponse = await fetch("/api/whisper", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ audio: audio }),
    });
    console.timeEnd("Whisper API");

    const whisperData = await whisperResponse.json();

    setTranscript(whisperData.modelOutputs[0].text);
    console.time("Generate API");
    const generateResponse = await fetch("/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(whisperData.modelOutputs[0].text),
    });
    console.timeEnd("Generate API");

    const generateData = await generateResponse.json();
    setFeedback(generateData.output);
    setLoading(false);
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Speaking Coach GPT</title>
        <meta
          name="description"
          content="Speaking Coach GPT.Record your English and give you feedback"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className={styles.banner}>
        <p>
          Follow me on{" "}
          <a
            href="https://twitter.com/EisukeHirata"
            target="_blank"
            rel="noopener noreferrer"
          >
            Twitter
          </a>
        </p>
      </div>

      <main className={styles.main}>
        <h1 className={styles.title}>Speaking Coach GPT</h1>

        <p className={styles.description}>
          {" "}
          Record your English and give you feedback{" "}
        </p>
        {isRecording ? (
          <p className={styles.warning}> Recording in progress... </p>
        ) : (
          <p className={styles.warning}>
            {" "}
            Requires browser microphone permission.{" "}
          </p>
        )}
        {isBlocked ? (
          <p className={styles.blocked}> Microphone access is blocked. </p>
        ) : null}

        <div className={styles.whispercontainer}>
          <div className={styles.allbuttons}>
            <button
              onClick={startRecording}
              disabled={isRecording}
              className={styles.recordbutton}
            >
              Record
            </button>
            <button
              onClick={stopRecording}
              disabled={!isRecording}
              className={styles.stopbutton}
            >
              Stop
            </button>
          </div>

          <div className={styles.audiopreview}>
            <audio src={blobURL} controls="controls" />
          </div>
          <div className={styles.loading}>
            {loading ? (
              <p>Loading... please wait.</p>
            ) : (
              <div>
                {" "}
                <p>Transcript:{transcript}</p>
                <p>{feedback}</p>
              </div>
            )}
          </div>
          <div className={styles.generatebuttonroot}>
            <button
              type="submit"
              className={styles.generatebutton}
              onClick={handleSubmit}
              disabled={!audio}
            >
              Generate
            </button>
          </div>
        </div>
      </main>

      <footer className={styles.footer}>
        <div className="bmc-btn-container">
          <a
            href="https://www.buymeacoffee.com/aghirata"
            target="_blank"
            className="bmc-btn"
            rel="noopener noreferrer"
          >
            <img
              src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png"
              alt="Buy me a coffee"
              width="150"
              height="50"
            />
          </a>
        </div>
      </footer>
    </div>
  );
};

export default Home;
