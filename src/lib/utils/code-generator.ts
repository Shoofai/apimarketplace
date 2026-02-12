/**
 * Generates code snippets for API requests in multiple languages.
 */

export interface CodeSnippetOptions {
  url: string;
  method: string;
  headers?: Record<string, string>;
  body?: any;
  apiKey?: string;
}

/**
 * Generates a cURL command.
 */
export function generateCurl(options: CodeSnippetOptions): string {
  const { url, method, headers = {}, body, apiKey } = options;

  let curl = `curl -X ${method} "${url}"`;

  // Add headers
  const allHeaders = { ...headers };
  if (apiKey) {
    allHeaders['X-API-Key'] = apiKey;
  }

  Object.entries(allHeaders).forEach(([key, value]) => {
    curl += ` \\\n  -H "${key}: ${value}"`;
  });

  // Add body
  if (body && ['POST', 'PUT', 'PATCH'].includes(method)) {
    curl += ` \\\n  -d '${JSON.stringify(body)}'`;
  }

  return curl;
}

/**
 * Generates JavaScript fetch code.
 */
export function generateJavaScriptFetch(options: CodeSnippetOptions): string {
  const { url, method, headers = {}, body, apiKey } = options;

  const allHeaders = { ...headers };
  if (apiKey) {
    allHeaders['X-API-Key'] = apiKey;
  }

  let code = `const response = await fetch("${url}", {\n`;
  code += `  method: "${method}",\n`;

  if (Object.keys(allHeaders).length > 0) {
    code += `  headers: ${JSON.stringify(allHeaders, null, 2).replace(/\n/g, '\n  ')},\n`;
  }

  if (body && ['POST', 'PUT', 'PATCH'].includes(method)) {
    code += `  body: JSON.stringify(${JSON.stringify(body, null, 2).replace(/\n/g, '\n    ')})\n`;
  }

  code += `});\n\nconst data = await response.json();\nconsole.log(data);`;

  return code;
}

/**
 * Generates JavaScript axios code.
 */
export function generateJavaScriptAxios(options: CodeSnippetOptions): string {
  const { url, method, headers = {}, body, apiKey } = options;

  const allHeaders = { ...headers };
  if (apiKey) {
    allHeaders['X-API-Key'] = apiKey;
  }

  let code = `const axios = require('axios');\n\n`;
  code += `axios({\n`;
  code += `  method: '${method.toLowerCase()}',\n`;
  code += `  url: '${url}',\n`;

  if (Object.keys(allHeaders).length > 0) {
    code += `  headers: ${JSON.stringify(allHeaders, null, 2).replace(/\n/g, '\n  ')},\n`;
  }

  if (body && ['POST', 'PUT', 'PATCH'].includes(method)) {
    code += `  data: ${JSON.stringify(body, null, 2).replace(/\n/g, '\n  ')}\n`;
  }

  code += `})\n.then(response => console.log(response.data))\n.catch(error => console.error(error));`;

  return code;
}

/**
 * Generates Python requests code.
 */
export function generatePythonRequests(options: CodeSnippetOptions): string {
  const { url, method, headers = {}, body, apiKey } = options;

  const allHeaders = { ...headers };
  if (apiKey) {
    allHeaders['X-API-Key'] = apiKey;
  }

  let code = `import requests\nimport json\n\n`;
  code += `url = "${url}"\n`;

  if (Object.keys(allHeaders).length > 0) {
    code += `headers = ${JSON.stringify(allHeaders, null, 2).replace(/"([^"]+)":/g, "'$1':").replace(/: "([^"]+)"/g, ": '$1'")}\n`;
  }

  if (body && ['POST', 'PUT', 'PATCH'].includes(method)) {
    code += `data = ${JSON.stringify(body, null, 2)}\n\n`;
    code += `response = requests.${method.toLowerCase()}(url, headers=headers, json=data)\n`;
  } else {
    code += `\nresponse = requests.${method.toLowerCase()}(url${Object.keys(allHeaders).length > 0 ? ', headers=headers' : ''})\n`;
  }

  code += `print(response.json())`;

  return code;
}

/**
 * Generates Go code.
 */
export function generateGo(options: CodeSnippetOptions): string {
  const { url, method, headers = {}, body, apiKey } = options;

  const allHeaders = { ...headers };
  if (apiKey) {
    allHeaders['X-API-Key'] = apiKey;
  }

  let code = `package main\n\nimport (\n  "bytes"\n  "encoding/json"\n  "fmt"\n  "net/http"\n)\n\n`;
  code += `func main() {\n`;
  code += `  url := "${url}"\n\n`;

  if (body && ['POST', 'PUT', 'PATCH'].includes(method)) {
    code += `  data := map[string]interface{}${JSON.stringify(body, null, 2).replace(/"/g, '"')}\n`;
    code += `  jsonData, _ := json.Marshal(data)\n\n`;
    code += `  req, _ := http.NewRequest("${method}", url, bytes.NewBuffer(jsonData))\n`;
  } else {
    code += `  req, _ := http.NewRequest("${method}", url, nil)\n`;
  }

  Object.entries(allHeaders).forEach(([key, value]) => {
    code += `  req.Header.Set("${key}", "${value}")\n`;
  });

  code += `\n  client := &http.Client{}\n`;
  code += `  resp, err := client.Do(req)\n`;
  code += `  if err != nil {\n    panic(err)\n  }\n`;
  code += `  defer resp.Body.Close()\n\n`;
  code += `  var result map[string]interface{}\n`;
  code += `  json.NewDecoder(resp.Body).Decode(&result)\n`;
  code += `  fmt.Println(result)\n`;
  code += `}`;

  return code;
}

/**
 * Generates Ruby code.
 */
export function generateRuby(options: CodeSnippetOptions): string {
  const { url, method, headers = {}, body, apiKey } = options;

  const allHeaders = { ...headers };
  if (apiKey) {
    allHeaders['X-API-Key'] = apiKey;
  }

  let code = `require 'net/http'\nrequire 'json'\n\n`;
  code += `uri = URI('${url}')\n`;

  if (body && ['POST', 'PUT', 'PATCH'].includes(method)) {
    code += `data = ${JSON.stringify(body, null, 2)}\n\n`;
    code += `req = Net::HTTP::${method.charAt(0) + method.slice(1).toLowerCase()}.new(uri)\n`;
    code += `req.body = data.to_json\n`;
  } else {
    code += `req = Net::HTTP::${method.charAt(0) + method.slice(1).toLowerCase()}.new(uri)\n`;
  }

  Object.entries(allHeaders).forEach(([key, value]) => {
    code += `req['${key}'] = '${value}'\n`;
  });

  code += `\nres = Net::HTTP.start(uri.hostname, uri.port, use_ssl: true) do |http|\n`;
  code += `  http.request(req)\n`;
  code += `end\n\n`;
  code += `puts JSON.parse(res.body)`;

  return code;
}

/**
 * Generates PHP code.
 */
export function generatePHP(options: CodeSnippetOptions): string {
  const { url, method, headers = {}, body, apiKey } = options;

  const allHeaders = { ...headers };
  if (apiKey) {
    allHeaders['X-API-Key'] = apiKey;
  }

  let code = `<?php\n\n$url = "${url}";\n\n`;

  if (body && ['POST', 'PUT', 'PATCH'].includes(method)) {
    code += `$data = ${JSON.stringify(body, null, 2)};\n\n`;
  }

  code += `$options = [\n`;
  code += `  'http' => [\n`;
  code += `    'method' => '${method}',\n`;
  code += `    'header' => [\n`;

  Object.entries(allHeaders).forEach(([key, value]) => {
    code += `      '${key}: ${value}',\n`;
  });

  code += `    ],\n`;

  if (body && ['POST', 'PUT', 'PATCH'].includes(method)) {
    code += `    'content' => json_encode($data)\n`;
  }

  code += `  ]\n];
\n\n$context = stream_context_create($options);\n`;
  code += `$response = file_get_contents($url, false, $context);\n`;
  code += `$result = json_decode($response, true);\n`;
  code += `print_r($result);\n\n?>`;

  return code;
}

/**
 * Generates C# code.
 */
export function generateCSharp(options: CodeSnippetOptions): string {
  const { url, method, headers = {}, body, apiKey } = options;

  const allHeaders = { ...headers };
  if (apiKey) {
    allHeaders['X-API-Key'] = apiKey;
  }

  let code = `using System;\nusing System.Net.Http;\nusing System.Text;\nusing System.Threading.Tasks;\nusing Newtonsoft.Json;\n\n`;
  code += `class Program\n{\n`;
  code += `  static async Task Main()\n  {\n`;
  code += `    using var client = new HttpClient();\n`;
  code += `    var url = "${url}";\n\n`;

  Object.entries(allHeaders).forEach(([key, value]) => {
    code += `    client.DefaultRequestHeaders.Add("${key}", "${value}");\n`;
  });

  if (body && ['POST', 'PUT', 'PATCH'].includes(method)) {
    code += `\n    var data = ${JSON.stringify(body, null, 4)};\n`;
    code += `    var json = JsonConvert.SerializeObject(data);\n`;
    code += `    var content = new StringContent(json, Encoding.UTF8, "application/json");\n\n`;
    code += `    var response = await client.${method.charAt(0) + method.slice(1).toLowerCase()}Async(url, content);\n`;
  } else {
    code += `\n    var response = await client.${method.charAt(0) + method.slice(1).toLowerCase()}Async(url);\n`;
  }

  code += `    var result = await response.Content.ReadAsStringAsync();\n`;
  code += `    Console.WriteLine(result);\n`;
  code += `  }\n}`;

  return code;
}

/**
 * Generates Java code.
 */
export function generateJava(options: CodeSnippetOptions): string {
  const { url, method, headers = {}, body, apiKey } = options;

  const allHeaders = { ...headers };
  if (apiKey) {
    allHeaders['X-API-Key'] = apiKey;
  }

  let code = `import java.net.http.*;\nimport java.net.URI;\nimport com.google.gson.Gson;\n\n`;
  code += `public class APIClient {\n`;
  code += `  public static void main(String[] args) throws Exception {\n`;
  code += `    HttpClient client = HttpClient.newHttpClient();\n\n`;

  code += `    HttpRequest.Builder requestBuilder = HttpRequest.newBuilder()\n`;
  code += `      .uri(URI.create("${url}"))\n`;
  code += `      .method("${method}", `;

  if (body && ['POST', 'PUT', 'PATCH'].includes(method)) {
    code += `HttpRequest.BodyPublishers.ofString(new Gson().toJson(${JSON.stringify(body)})))\n`;
  } else {
    code += `HttpRequest.BodyPublishers.noBody())\n`;
  }

  Object.entries(allHeaders).forEach(([key, value]) => {
    code += `      .header("${key}", "${value}")\n`;
  });

  code += `;\n\n`;
  code += `    HttpResponse<String> response = client.send(requestBuilder.build(),\n`;
  code += `      HttpResponse.BodyHandlers.ofString());\n\n`;
  code += `    System.out.println(response.body());\n`;
  code += `  }\n}`;

  return code;
}

/**
 * Map of available code generators.
 */
export const codeGenerators = {
  curl: { name: 'cURL', generate: generateCurl },
  'javascript-fetch': { name: 'JavaScript (fetch)', generate: generateJavaScriptFetch },
  'javascript-axios': { name: 'JavaScript (axios)', generate: generateJavaScriptAxios },
  python: { name: 'Python (requests)', generate: generatePythonRequests },
  go: { name: 'Go', generate: generateGo },
  ruby: { name: 'Ruby', generate: generateRuby },
  php: { name: 'PHP', generate: generatePHP },
  csharp: { name: 'C#', generate: generateCSharp },
  java: { name: 'Java', generate: generateJava },
};

/**
 * Generates code snippet for the given language.
 */
export function generateCodeSnippet(
  language: keyof typeof codeGenerators,
  options: CodeSnippetOptions
): string {
  const generator = codeGenerators[language];
  if (!generator) {
    throw new Error(`Unsupported language: ${language}`);
  }
  return generator.generate(options);
}
