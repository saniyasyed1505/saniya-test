import { Client } from "@gradio/client";

async function run() {
  const app = await Client.connect("facebook/MusicGen");
  const api = await app.view_api();
  console.log(JSON.stringify(api.named_endpoints['/predict_batched'], null, 2));
}

run();
