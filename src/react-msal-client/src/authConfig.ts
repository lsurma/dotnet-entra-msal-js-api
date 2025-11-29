import type { Configuration } from "@azure/msal-browser";
import { LogLevel } from "@azure/msal-browser";

/**
 * MSAL configuration for Azure Entra ID authentication
 * Update these values with your Azure AD app registration details
 */
export const msalConfig: Configuration = {
  auth: {
    clientId: "your-client-id", // Application (client) ID from Azure portal
    authority: "https://login.microsoftonline.com/your-tenant-id", // Replace with your tenant ID
    redirectUri: window.location.origin, // This should match the redirect URI in Azure portal
    postLogoutRedirectUri: window.location.origin,
  },
  cache: {
    cacheLocation: "sessionStorage", // This configures where your cache will be stored
    storeAuthStateInCookie: false, // Set this to "true" if you are having issues on IE11 or Edge
  },
  system: {
    loggerOptions: {
      loggerCallback: (level, message, containsPii) => {
        if (containsPii) {
          return;
        }
        switch (level) {
          case LogLevel.Error:
            console.error(message);
            return;
          case LogLevel.Info:
            console.info(message);
            return;
          case LogLevel.Verbose:
            console.debug(message);
            return;
          case LogLevel.Warning:
            console.warn(message);
            return;
          default:
            return;
        }
      },
    },
  },
};

/**
 * Scopes for the API access
 * The scope should match the API you are calling
 */
export const loginRequest = {
  scopes: ["api://your-client-id/.default"], // Update with your API scope
};

/**
 * API endpoint configuration
 */
export const apiConfig = {
  weatherEndpoint: "http://localhost:5000/api/weather", // Update with your API endpoint
};
