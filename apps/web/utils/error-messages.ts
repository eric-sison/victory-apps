export const ErrorMessages = {
  400: {
    INVALID_REQUEST:
      "We couldn't process your request. Some information may be missing or incorrect. Please review your input and try again.",
  },

  401: {
    AUTH_REQUIRED: "Your session has expired or you're not signed in. Please log in and try again.",
    INVALID_CREDENTIALS: "The email or password you entered is incorrect. Please try again.",
  },

  403: {
    INSUFFICIENT_PERMISSIONS: "You don't have permission to perform this action.",
  },

  404: {
    RESOURCE_NOT_FOUND:
      "We couldn't find what you're looking for. It may have been moved or no longer exists.",
  },

  409: {
    RESOURCE_CONFLICT:
      "This action couldn't be completed because a similar item already exists or there's a conflict. Please review and try again.",
  },

  422: {
    VALIDATION_FAILED:
      "Some of the information provided isn't valid. Please check your input and correct any errors.",
  },

  429: {
    TOO_MANY_REQUESTS: "You've made too many requests in a short time. Please wait a moment and try again.",
  },

  500: {
    SERVER_ERROR: "Something went wrong on our end. Please try again later.",
  },

  502: {
    BAD_GATEWAY: "We're having trouble connecting to a service. Please try again in a moment.",
  },

  503: {
    SERVICE_UNAVAILABLE: "The service is temporarily unavailable. Please try again later.",
  },

  504: {
    GATEWAY_TIMEOUT: "The request is taking longer than expected. Please try again.",
  },
} as const
