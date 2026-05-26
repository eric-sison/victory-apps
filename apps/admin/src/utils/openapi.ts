// utils/openapi.ts
import { z } from "@hono/zod-openapi";

export const jsonBody = <T extends z.ZodType>(schema: T) => ({
  body: {
    content: { "application/json": { schema } },
    required: true as const,
  },
});

export const jsonResponse = <T extends z.ZodType>(
  schema: T,
  description: string,
  example?: z.infer<T>,
) => ({
  content: {
    "application/json": {
      schema,
      ...(example && { example }),
    },
  },
  description,
});

export const ErrorResponseSchema = z
  .object({
    status: z.number(),
    message: z.string(),
    code: z.string().optional(),
  })
  .openapi("ErrorResponse");

export const ErrorMessages = {
  400: "Bad request. Missing or invalid parameters.",
  401: "Unauthorized. Missing or invalid authentication.",
  403: "Forbidden. Insufficient permissions.",
  404: "Not found. Resource does not exist.",
  409: "Conflict. Resource already exists.",
  422: "Unprocessable. Request body failed validation.",
  429: "Rate limited. Too many requests, try again later.",
  500: "Internal server error. Something went wrong.",
  502: "Bad gateway. Upstream returned an invalid response.",
  503: "Service unavailable. Server is temporarily down.",
  504: "Gateway timeout. Upstream did not respond in time.",
} as const;

export const commonErrors = {
  400: jsonResponse(ErrorResponseSchema, ErrorMessages[400], {
    status: 400,
    message: ErrorMessages[400],
  }),
  401: jsonResponse(ErrorResponseSchema, ErrorMessages[401], {
    status: 401,
    message: ErrorMessages[401],
  }),
  403: jsonResponse(ErrorResponseSchema, ErrorMessages[403], {
    status: 403,
    message: ErrorMessages[403],
  }),
  404: jsonResponse(ErrorResponseSchema, ErrorMessages[404], {
    status: 404,
    message: ErrorMessages[404],
  }),
  409: jsonResponse(ErrorResponseSchema, ErrorMessages[409], {
    status: 409,
    message: ErrorMessages[409],
  }),
  422: jsonResponse(ErrorResponseSchema, ErrorMessages[422], {
    status: 422,
    message: ErrorMessages[422],
  }),
  429: jsonResponse(ErrorResponseSchema, ErrorMessages[429], {
    status: 429,
    message: ErrorMessages[429],
  }),
  500: jsonResponse(ErrorResponseSchema, ErrorMessages[500], {
    status: 500,
    message: ErrorMessages[500],
  }),
  502: jsonResponse(ErrorResponseSchema, ErrorMessages[502], {
    status: 502,
    message: ErrorMessages[502],
  }),
  503: jsonResponse(ErrorResponseSchema, ErrorMessages[503], {
    status: 503,
    message: ErrorMessages[503],
  }),
  504: jsonResponse(ErrorResponseSchema, ErrorMessages[504], {
    status: 504,
    message: ErrorMessages[504],
  }),
} as const;
