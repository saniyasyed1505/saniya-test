import { Client } from "@gradio/client";

async function run() {
  const app = await Client.connect("facebook/MusicGen");
  console.log("Generating music...");
  const result = await app.predict("/predict_batched", [
    "Epic cinematic orchestral music",
    null,
  ]);
  console.log("Music output:", result.data);
}

run();
