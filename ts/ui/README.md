# ProtoApp UI

This is the primary user-facing application for ProtoApp. It provides a modern, responsive interface built with React, TypeScript, and TailwindCSS.

## Features

- User authentication (login/logout)
- Messaging system
- Modern UI with responsive design

## Development

To start the development server:

```bash
cd ts/ui
npm install
npm run dev
```

The application will be available at http://localhost:5173

## Building for Production

```bash
npm run build
```

This will create optimized production files in the `dist` directory.

## Note

The API Workbench application (in `ts/api-workbench`) is now deprecated for user-facing features and should only be used for internal API testing.