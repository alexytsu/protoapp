import { app } from "./app";

async function main() {
  console.log("starting server...");
  app.listen(8080);
  console.log("listening on port 8080...");

  await new Promise<void>(() => {
    // never
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
