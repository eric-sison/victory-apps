export const ErrorMessages = {
  400: {
    INVALID_REQUEST: {
      full: "We couldn't process your request. Some information may be missing or incorrect. Please review your input and try again.",
      short:
        "We couldn't process your request. Please check your input and try again.",
    },
  },

  401: {
    AUTH_REQUIRED: {
      full: "Your session has expired or you're not signed in. Please log in and try again.",
      short: "Please log in to continue.",
    },

    INVALID_CREDENTIALS: {
      full: "The email or password you entered is incorrect. Please try again.",
      short: "The email or password you entered is incorrect.",
    },
  },

  403: {
    INSUFFICIENT_PERMISSIONS: {
      full: "You don't have permission to perform this action.",
      short: "You don’t have access to perform this action.",
    },
  },

  404: {
    RESOURCE_NOT_FOUND: {
      full: "We couldn't find what you're looking for. It may have been moved or no longer exists.",
      short: "We couldn’t find what you’re looking for.",
    },
  },

  409: {
    RESOURCE_CONFLICT: {
      full: "This action couldn't be completed because a similar item already exists or there's a conflict. Please review and try again.",
      short: "This action couldn’t be completed due to a conflict.",
    },
  },

  422: {
    VALIDATION_FAILED: {
      full: "Some of the information provided isn't valid. Please check your input and correct any errors.",
      short:
        "Some information provided is invalid. Please review and try again.",
    },
  },

  429: {
    TOO_MANY_REQUESTS: {
      full: "You've made too many requests in a short time. Please wait a moment and try again.",
      short: "Too many requests. Please try again shortly.",
    },
  },

  500: {
    SERVER_ERROR: {
      full: "Something went wrong on our end. Please try again later.",
      short: "Something went wrong. Please try again.",
    },
  },

  502: {
    BAD_GATEWAY: {
      full: "We're having trouble connecting to a service. Please try again in a moment.",
      short: "We’re having trouble connecting. Please try again.",
    },
  },

  503: {
    SERVICE_UNAVAILABLE: {
      full: "The service is temporarily unavailable. Please try again later.",
      short: "The service is temporarily unavailable.",
    },
  },

  504: {
    GATEWAY_TIMEOUT: {
      full: "The request is taking longer than expected. Please try again.",
      short: "The request timed out. Please try again.",
    },
  },
} as const;
