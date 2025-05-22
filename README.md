# Protoapp - Batteries Included

This repository is an opinionated fork of [adl-lang/protoapp] that is suitable
for building modern full-stack web applications. It uses [ADL] as the "typing
glue", enabling strong cross-language type-safety from the database to the user
interface.

[adl-lang/protoapp]: https://github.com/adl-lang/protoapp

The technology stack consists of:

- [postgresql] for the relational store
- [rust] + [poem] + [sqlx] for the application server
- [typescript] + [react] for the web user interface

[ADL]: https://github.com/adl-lang/adl
[postgresql]: https://www.postgresql.org
[rust]: https://www.rust-lang.org
[poem]: https://github.com/poem-web/poem
[sqlx]: https://github.com/launchbadge/sqlx
[typescript]: https://www.typescriptlang.org
[react]: https://react.dev

More information on ADL, the [API Workbench](./ts/api-workbench/README.md) and
the underlying tech stack can be found in the upstream
[README](https://github.com/adl-lang/protoapp/blob/master/README.md).

## ADL

[ADL] is a framework for building cross language data models. In this repo we
use ADL to define

- the relational [database schema](./adl/protoapp/db.adl)
- the client/server [http based API](./adl/protoapp/apis/ui.adl)
- the server [config file format](./adl/protoapp/config/server.adl)

From these, we generate:

- the [postgres SQL](./sql/adl-gen/adl-tables.latest.sql) for the db schema
- the rust [db schema binding](./rust/adl/src/db/schema.rs)
- the rust [api binding](./rust/adl/src/gen/protoapp/apis/ui.rs) (used
  [here](./rust/server/src/server/routing.rs))
- the typescript [api binding](./ts/adl/src/protoapp/apis/ui.ts) (used
  [here](./ts/ui/src/service/index.ts))

## Opinionated defaults

After forking or cloning this template, you are free to change any part of the
tooling and software architecture as you see fit.

The most opinionated part of the codebase is the `ts/ui` frontend project, which
implements a simple messaging app. Adding a new frontend of any project is as
easy as adding a new pnpm package and including `@protoapp/adl` as a workspace
dependency.

The current UI was generated with
[Vite](https://vite.dev/guide/#scaffolding-your-first-vite-project) and uses the
`react-ts` template. Additional patterns for testing, routing and components are
established for reference.

For example, the template uses:

- [shadcn/ui] for visual components
- [tailwindcss] for styling
- [storybook] for testing and iterating on the interface

[shadcn/ui]: https://ui.shadcn.com/docs
[tailwindcss]: https://tailwindcss.com/docs/styling-with-utility-classes
[storybook]: https://storybook.js.org/docs/get-started/why-storybook

## Local setup

Currently Linux and macOS are supported.

Install [docker] and [rust/cargo] for your platform. Then install deno, node,
pnpm, and adl into a repo local directory by sourcing the local setup script:

[docker]: https://www.docker.com
[rust/cargo]: https://rustup.rs

```bash
. deno/local-setup.sh
```

Check installed tool versions with:

```
deno --version
node --version
adlc show --version
```

## Development loop

When you've changed any ADL, regenerate rust/typescript/sql code with

```bash
deno task genadl
```

### Starting postgres

```bash
(cd platform/dev; docker compose up -d db)
```

### Running server tests

```bash
(
cd rust/server
export DB_CONNECTION_URL=postgresql://postgres:xyzzy@localhost:5432/appdb
cargo test -- --test-threads=1
)
```

### Starting the server

```bash
(
cd rust/server
export PROTOAPP_SERVER_CONFIG='{
  "http_bind_addr": "0.0.0.0:8080",
  "db": {
    "host": "localhost",
    "port": 5432,
    "dbname": "appdb",
    "user": "postgres",
    "password": "xyzzy"
  },
  "jwt_access_secret": "shouldbetrulysecretbutnotrightnow",
  "jwt_refresh_secret": "nottomentionthisone"
 }'
export RUST_LOG=info
cargo run --bin protoapp-server
)
```

This will create the db schema and/or apply any necessary migrations

### Creating test users

```bash
(
cd rust/server
export DB_CONNECTION_URL=postgresql://postgres:xyzzy@localhost:5432/appdb
cargo run --bin protoapp-tools -- create-user joe@test.com Joe xyzzy1
cargo run --bin protoapp-tools -- create-user --is-admin sarah@test.com Sarah abcdef
)
```

### Starting the UI in dev mode

```bash
(
cd ts/ui
# note pnpm is installed by local-setup.sh
pnpm install
pnpm run dev
)
```

### Starting the API Workbench in dev mode

```bash
(
cd ts/api-workbench
# note pnpm is installed by local-setup.sh
pnpm install
pnpm run dev
)
```

The web application will be accessible at: http://localhost:5173 The api
workbench will be accessible at: http://localhost:5174

## Forking

The following linux commands can be used to rename "protoapp" to "myproject" in a fork
of this repo:

```
git mv adl/{protoapp,myproject}
git mv rust/adl/src/gen/{protoapp,myproject}
git mv rust/server/src/bin/{protoapp,myproject}-server.rs
git mv rust/server/src/bin/{protoapp,myproject}-tools.rs
git mv ts/adl/src/{protoapp,myproject}
sed -i -e 's|protoapp|myproject|g'  $(git ls-files)
sed -i -e 's|Protoapp|MyProject|g'  $(git ls-files)
sed -i -e 's|PROTOAPP|MYPROJECT|g'  $(git ls-files)
deno task genadl
```

macos sed doesn't support multi file in place updates, so an alternative tool will
be required.
