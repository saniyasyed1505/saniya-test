import { Client } from "@gradio/client";
async function run() {
  try {
    const app = await Client.connect("ByteDance/AnimateDiff-Lightning");
    const result = await app.predict("/generate_image", [
      "A futuristic cybernetic city at dusk", // prompt
      "epiCRealism", // base model
      "", // motion
      "4", // steps
    ]);
    console.log(result.data[0]);
  } catch (e) {
    console.error(e);
  }
}
run();
