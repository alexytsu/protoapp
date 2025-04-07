# API Workbench

## Purpose

The API Workbench provides a developer-focused interface for testing and debugging the Protoapp API endpoints. It allows:

- Testing various API endpoints
- Viewing request/response payloads
- Authentication testing

Deploying the API Workbench to production environments is NOT recommended. Operational workflows or administrative actions
should be built into the React app in `ts/ui` or deployed as a standalone frontend application.

## Development

```bash
cd ts/api-workbench
npm install
npm run dev
```

The application will be available at http://localhost:5173

## Usage

After logging in, you'll be directed to the API Workbench interface where you can select and test various API endpoints.

## Building for Production

```bash
npm run build
```
