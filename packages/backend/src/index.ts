console.log("Backend package");

const server = Bun.serve({
  port: 3000,
  fetch(req) {
    return new Response("Hello from backend!");
  },
});

console.log(`Server listening on http://localhost:${server.port}`);
