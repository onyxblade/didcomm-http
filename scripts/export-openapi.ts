import { buildServer } from "../src/server.js";

async function main() {
  const server = await buildServer();
  await server.ready();
  const spec = server.swagger();
  process.stdout.write(JSON.stringify(spec, null, 2) + "\n");
  await server.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
