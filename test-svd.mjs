import { Client } from "@gradio/client";
import fs from "fs";

async function run() {
  try {
    const fetch = (await import('node-fetch')).default;
    console.log("Downloading image...");
    const res = await fetch("https://image.pollinations.ai/prompt/rain+falls+upward+while+people+walk+normally?nologo=true");
    const buffer = await res.arrayBuffer();
    const imageBlob = new Blob([buffer], { type: 'image/jpeg' });
    
    console.log("Connecting to Gradio...");
    const app = await Client.connect("multimodalart/stable-video-diffusion");
    
    console.log("Generating video...");
    const result = await app.predict("/video", [
      imageBlob, // Blob in 'Upload your image' Image component
      0, // numeric value in 'Seed' Slider component
      true, // boolean in 'Randomize seed' Checkbox component
      127, // numeric value in 'Motion bucket id' Slider component
      6, // numeric value in 'Frames per second' Slider component
    ]);
    console.log("Video output:", result.data);
  } catch (err) {
    console.error(err);
  }
}
run();
