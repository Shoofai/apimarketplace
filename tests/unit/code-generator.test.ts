import { describe, it, expect } from 'vitest';
import { generateCodeSnippet } from '@/lib/utils/code-generator';

describe('Code Snippet Generator', () => {
  const options = {
    method: 'POST',
    url: 'https://api.example.com/users',
    headers: { 'Content-Type': 'application/json' },
    body: { name: 'John Doe', email: 'john@example.com' },
    apiKey: 'test_key_123',
  };

  it('should generate cURL snippet', () => {
    const curl = generateCodeSnippet('curl', options);
    expect(curl).toContain('curl');
    expect(curl).toContain('POST');
    expect(curl).toContain('https://api.example.com/users');
    expect(curl).toContain('test_key_123');
  });

  it('should generate JavaScript Fetch snippet', () => {
    const js = generateCodeSnippet('javascript-fetch', options);
    expect(js).toContain('fetch');
    expect(js).toContain('POST');
    expect(js).toContain('await');
  });

  it('should generate Python snippet', () => {
    const python = generateCodeSnippet('python', options);
    expect(python).toContain('import requests');
    expect(python).toContain('requests.post');
  });

  it('should generate Go snippet', () => {
    const go = generateCodeSnippet('go', options);
    expect(go).toContain('http.NewRequest');
    expect(go).toContain('POST');
  });

  it('should handle GET requests without body', () => {
    const getOptions = { ...options, method: 'GET', body: undefined };
    const curl = generateCodeSnippet('curl', getOptions);
    expect(curl).toContain('GET');
    expect(curl).not.toContain('--data');
  });
});
