const Replicate = require('replicate');
const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN });

async function run() {
  console.log("Generating with SDXL...");
  const output = await replicate.run(
    "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
    {
      input: {
        prompt: "A professional photograph of the singer Dua Lipa holding brownies, highly detailed, exact likeness, 8k resolution, photorealistic",
        width: 1024,
        height: 1024,
        refine: "expert_ensemble_refiner",
        apply_watermark: false
      }
    }
  );
  console.log(output);
}
run();
