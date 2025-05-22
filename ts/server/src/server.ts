import { app } from "./app";

async function main() {
  app.listen(8080);

  await new Promise<void>(() => {
    // never
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
