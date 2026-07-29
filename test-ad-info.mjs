import { Client } from "@gradio/client";
async function run() {
  const app = await Client.connect("ByteDance/AnimateDiff-Lightning");
  console.log(JSON.stringify(await app.view_api(), null, 2));
}
run();
