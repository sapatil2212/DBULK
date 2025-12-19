/**
 * Utility functions for making authenticated API calls
 */

type ApiOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: any;
  headers?: Record<string, string>;
  includeAuth?: boolean;
};

/**
 * Makes an authenticated API request
 */
export async function apiRequest<T = any>(url: string, options: ApiOptions = {}): Promise<T> {
  const {
    method = 'GET',
    body,
    headers = {},
    includeAuth = true,
  } = options;

  // Get the auth token if we need to include authentication
  let authHeaders: Record<string, string> = {};
  if (includeAuth) {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      console.error('No auth token found in localStorage');
      throw new Error('Authentication required. Please login first.');
    }
    authHeaders = {
      'Authorization': `Bearer ${token}`
    };
  }

  const requestOptions: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders,
      ...headers,
    },
    credentials: 'include', // Include cookies in the request
  };

  if (body && method !== 'GET') {
    requestOptions.body = JSON.stringify(body);
  }

  console.log('API Request:', { url, method, hasAuth: !!authHeaders });
  
  const response = await fetch(url, requestOptions);
  const data = await response.json();

  console.log('API Response:', { status: response.status, ok: response.ok, data });

  if (!response.ok) {
    // Extract error message from various possible response formats
    let errorMessage = 'An error occurred with the API request';
    if (data?.error?.message) {
      errorMessage = data.error.message;
    } else if (data?.message) {
      errorMessage = data.message;
    } else if (typeof data === 'string') {
      errorMessage = data;
    } else if (data?.error && typeof data.error === 'string') {
      errorMessage = data.error;
    }
    console.error('API Error:', { status: response.status, errorMessage, data });
    throw new Error(errorMessage);
  }

  return data.data as T;
}
