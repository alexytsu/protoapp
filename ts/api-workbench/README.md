# API Workbench

## DEPRECATED FOR USER-FACING FEATURES

This application is now intended for internal API testing only. User-facing features have been moved to the main UI application in `ts/ui`.

## Purpose

The API Workbench provides a developer-focused interface for testing and debugging the ProtoApp API endpoints. It allows:

- Testing various API endpoints
- Viewing request/response payloads
- Authentication testing

## Development

```bash
cd ts/api-workbench
npm install
npm run dev
```

The application will be available at http://localhost:5173

## Usage

After logging in, you'll be directed to the API workbench interface where you can select and test various API endpoints.

## Building for Production

```bash
npm run build
```