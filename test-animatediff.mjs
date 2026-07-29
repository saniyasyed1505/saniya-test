import { Client } from "@gradio/client";
import fs from "fs";

async function run() {
  try {
    const app = await Client.connect("ByteDance/AnimateDiff-Lightning");
    const result = await app.predict("/generate_image", [
      "A futuristic cybernetic city at dusk", // string  in 'Prompt' Textbox component
      "ByteDance/AnimateDiff-Lightning-4step", // string  in 'Select stage to load' Dropdown component
      "Realistic", // string  in 'Base Model' Dropdown component
      "Motion Module", // string  in 'Motion Module' Dropdown component
      1, // number  in 'Batch Size' Number component
      1, // number  in 'Seed' Number component
      1, // number  in 'Steps' Number component
      1, // number  in 'Guidance Scale' Number component
    ]);
    console.log(result.data);
  } catch (e) {
    console.error(e);
  }
}
run();
