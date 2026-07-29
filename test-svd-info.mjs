import { Client } from "@gradio/client";
async function run() {
  const app = await Client.connect("multimodalart/stable-video-diffusion");
  console.log(JSON.stringify(await app.view_api(), null, 2));
}
run();
