import { Client } from "@gradio/client";
async function run() {
  try {
    const app = await Client.connect("ali-vilab/modelscope-text-to-video-synthesis");
    const result = await app.predict("/generate_video", [
      "A futuristic cybernetic city at dusk", // prompt
      10, // steps
      1, // seed
    ]);
    console.log(result.data);
  } catch (e) {
    console.error(e);
  }
}
run();
