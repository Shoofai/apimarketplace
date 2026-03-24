import { NextResponse } from 'next/server';

/**
 * Safely parse JSON from a Request body.
 * Returns the parsed object, or a NextResponse error if parsing fails.
 */
export async function safeParseBody<T = Record<string, unknown>>(
  request: Request
): Promise<T | NextResponse> {
  try {
    const body = await request.json();
    if (typeof body !== 'object' || body === null) {
      return NextResponse.json(
        { error: 'Request body must be a JSON object' },
        { status: 400 }
      );
    }
    return body as T;
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON in request body' },
      { status: 400 }
    );
  }
}

/**
 * Type guard to check if safeParseBody returned an error response.
 */
export function isErrorResponse(result: unknown): result is NextResponse {
  return result instanceof NextResponse;
}
