import { z } from "zod";
import type { ApiError } from "@/lib/domain/types";
import { logger } from "@/lib/logger";

export class ApiClientError extends Error {
  constructor(
    public code: string,
    message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = "ApiClientError";
  }
}

export async function fetcher<T extends z.ZodType>(
  url: string,
  schema: T,
  options?: RequestInit & { signal?: AbortSignal }
): Promise<z.infer<T>> {
  const controller = new AbortController();
  const signal = options?.signal || controller.signal;

  let response: Response;
  try {
    response = await fetch(url, {
      ...options,
      signal,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
      cache: "no-store", // Ensure no caching mistakes
    });
  } catch (fetchError) {
    // Handle network errors (connection refused, timeout, etc.)
    const errorMessage =
      fetchError instanceof Error
        ? fetchError.message
        : "Network request failed";
    const isConnectionError =
      errorMessage.includes("ERR_CONNECTION_REFUSED") ||
      errorMessage.includes("Failed to fetch") ||
      errorMessage.includes("NetworkError") ||
      errorMessage.includes("network") ||
      errorMessage.includes("ECONNREFUSED");

    if (isConnectionError) {
      throw new ApiClientError(
        "CONNECTION_ERROR",
        "Cannot connect to server. Please ensure the dev server is running.",
        { originalError: errorMessage }
      );
    }

    throw new ApiClientError("NETWORK_ERROR", errorMessage, { originalError: fetchError });
  }

  if (!response.ok) {
    let errorData: ApiError | undefined;
    let errorMessage = `Request failed with status ${response.status}`;

    try {
      const json = await response.json();
      if (json.error) {
        errorData = json.error;
        errorMessage = json.error.message || errorMessage;
      }
    } catch {
      // If response is not JSON, try to get text
      try {
        const text = await response.text();
        if (text) {
          errorMessage = text;
        }
      } catch {
        // Ignore parse errors
      }
    }

    throw new ApiClientError(
      errorData?.code || `HTTP_${response.status}`,
      errorMessage,
      errorData?.details
    );
  }

  const json = await response.json();

  // Validate response with better error messages
  try {
    const parsed = schema.parse(json);
    return parsed;
  } catch (validationError) {
    logger.error("API response validation error:", validationError);
    if (validationError instanceof z.ZodError) {
      throw new ApiClientError(
        "VALIDATION_ERROR",
        `Invalid API response: ${validationError.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join(", ")}`,
        validationError.errors
      );
    }
    throw validationError;
  }
}

export async function apiGet<T extends z.ZodType>(
  url: string,
  schema: T,
  params?: Record<string, string | number | undefined>
): Promise<z.infer<T>> {
  const searchParams = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });
  }

  const fullUrl = searchParams.toString() ? `${url}?${searchParams.toString()}` : url;
  return fetcher(fullUrl, schema);
}

export async function apiPost<T extends z.ZodType>(
  url: string,
  schema: T,
  body?: unknown
): Promise<z.infer<T>> {
  return fetcher(url, schema, {
    method: "POST",
    body: body ? JSON.stringify(body) : undefined,
  });
}

export async function apiPut<T extends z.ZodType>(
  url: string,
  schema: T,
  body?: unknown
): Promise<z.infer<T>> {
  return fetcher(url, schema, {
    method: "PUT",
    body: body ? JSON.stringify(body) : undefined,
  });
}

export async function apiDelete<T extends z.ZodType>(url: string, schema: T): Promise<z.infer<T>> {
  return fetcher(url, schema, {
    method: "DELETE",
  });
}
