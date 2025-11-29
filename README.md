# dotnet-entra-msal-js-api

A demonstration project showing how to integrate .NET 8 Razor Pages with Azure Entra ID (formerly Azure AD) authentication, and a React application using MSAL.js to call protected API endpoints.

## Project Structure

```
src/
├── RazorPagesApp/          # .NET 8 Razor Pages application with Entra ID auth
│   ├── Controllers/        # API controllers with dual authentication
│   └── Pages/              # Razor pages
└── react-msal-client/      # React + TypeScript application with MSAL.js
```

## Features

- **.NET Razor Pages App**:
  - Cookie-based authentication for Razor pages (traditional web login)
  - JWT Bearer token authentication for API endpoints (for SPA clients)
  - Protected API endpoint that can be called from React app

- **React MSAL Client**:
  - MSAL.js integration for Entra ID authentication
  - Acquires access tokens to call protected .NET API
  - Login/logout functionality with popup

## Prerequisites

- .NET 8 SDK
- Node.js 18+
- Azure Entra ID tenant and app registration

## Azure Entra ID Configuration

### App Registration Setup

1. Go to [Azure Portal](https://portal.azure.com) → Azure Active Directory → App registrations
2. Create a new registration:
   - Name: `DotNet-React-MSAL-App`
   - Supported account types: Choose based on your requirements
   - Redirect URI: Add both:
     - `http://localhost:5000/signin-oidc` (Web platform - for .NET app)
     - `http://localhost:5173` (Single-page application - for React app)

3. Configure Authentication:
   - Add `http://localhost:5173` as a SPA redirect URI
   - Enable ID tokens and Access tokens under Implicit grant

4. Configure API permissions:
   - Add `Microsoft Graph` → `User.Read` (delegated)

5. Expose an API:
   - Set Application ID URI (e.g., `api://your-client-id`)
   - Add a scope (e.g., `api://your-client-id/.default`)

6. Copy these values:
   - Application (client) ID
   - Directory (tenant) ID
   - Application ID URI

## Configuration

### .NET Application (`src/RazorPagesApp/appsettings.json`)

```json
{
  "AzureAd": {
    "Instance": "https://login.microsoftonline.com/",
    "Domain": "yourdomain.onmicrosoft.com",
    "TenantId": "your-tenant-id",
    "ClientId": "your-client-id",
    "CallbackPath": "/signin-oidc"
  }
}
```

### React Application (`src/react-msal-client/src/authConfig.ts`)

Update the following values:

```typescript
export const msalConfig: Configuration = {
  auth: {
    clientId: "your-client-id",
    authority: "https://login.microsoftonline.com/your-tenant-id",
    // ...
  }
};

export const loginRequest = {
  scopes: ["api://your-client-id/.default"],
};

export const apiConfig = {
  weatherEndpoint: "http://localhost:5000/api/weather",
};
```

## Running the Applications

### .NET Application

```bash
cd src/RazorPagesApp
dotnet run
```

The app will start at `http://localhost:5000`

### React Application

```bash
cd src/react-msal-client
npm install
npm run dev
```

The app will start at `http://localhost:5173`

## API Endpoints

| Endpoint | Auth Type | Description |
|----------|-----------|-------------|
| `/api/weather` | Bearer Token | Protected endpoint for React app (MSAL.js) |
| `/api/weather/internal` | Cookie Auth | Protected endpoint for Razor pages |

## Usage

1. **Razor Pages Login**: Navigate to `http://localhost:5000`, click "Sign in" to authenticate with Entra ID using cookies
2. **React App Login**: Navigate to `http://localhost:5173`, click "Sign In with Entra ID" to authenticate using MSAL.js popup
3. **Call API from React**: After signing in, click "Fetch Weather Data" to call the protected API with Bearer token

## Technologies

- .NET 8
- ASP.NET Core Razor Pages
- Microsoft.Identity.Web
- React 18
- TypeScript
- MSAL.js (@azure/msal-browser, @azure/msal-react)
- Vite