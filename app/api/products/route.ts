export async function GET(request: Request) {
  // Hardcoded list of sample products/templates relevant to the AI SaaS project
  const sampleProducts = [
    {
      id: "prod_1",
      name: "Cyberpunk Cityscape Package",
      type: "IMAGE",
      description: "Generate highly detailed futuristic cityscapes at dusk.",
      priceCredits: 10
    },
    {
      id: "prod_2",
      name: "Cinematic Drone Flythrough",
      type: "VIDEO",
      description: "A 5-second 4K video mimicking a drone flying through a scenic landscape.",
      priceCredits: 50
    },
    {
      id: "prod_3",
      name: "Anime Character Portrait",
      type: "IMAGE",
      description: "High quality 2D anime-style portraits with vibrant colors.",
      priceCredits: 5
    }
  ];

  return Response.json(sampleProducts);
}
