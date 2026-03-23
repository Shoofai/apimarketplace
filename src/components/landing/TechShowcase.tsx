'use client';

import { motion, useInView } from 'framer-motion';
import { useRef, useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const codeExamples: Record<string, string> = {
  javascript: `// LukeAPI SDK – JavaScript
import { LukeAPI } from '@lukeapi/sdk';

const api = new LukeAPI({ key: process.env.LUKEAPI_KEY });

const res = await api.call('stripe', {
  method: 'charges.create',
  params: { amount: 2000, currency: 'usd' }
});

console.log(res.data);`,

  typescript: `// LukeAPI SDK – TypeScript
import { LukeAPI, ChargeResponse } from '@lukeapi/sdk';

const api = new LukeAPI({ key: process.env.LUKEAPI_KEY! });

const res = await api.call<ChargeResponse>('stripe', {
  method: 'charges.create',
  params: { amount: 2000, currency: 'usd' }
});

console.log(res.data.id);`,

  python: `# LukeAPI SDK – Python
from lukeapi import LukeAPI

api = LukeAPI(key=os.environ["LUKEAPI_KEY"])

res = api.call("stripe",
    method="charges.create",
    params={"amount": 2000, "currency": "usd"}
)

print(res.data)`,

  go: `// LukeAPI SDK – Go
client := lukeapi.New(os.Getenv("LUKEAPI_KEY"))

res, err := client.Call("stripe", lukeapi.Params{
    Method: "charges.create",
    Params: map[string]any{
        "amount":   2000,
        "currency": "usd",
    },
})

fmt.Println(res.Data)`,

  ruby: `# LukeAPI SDK – Ruby
require 'lukeapi'

api = LukeAPI::Client.new(key: ENV['LUKEAPI_KEY'])

res = api.call('stripe',
  method: 'charges.create',
  params: { amount: 2000, currency: 'usd' }
)

puts res.data`,

  java: `// LukeAPI SDK – Java
var api = new LukeAPI(System.getenv("LUKEAPI_KEY"));

var res = api.call("stripe", Map.of(
    "method", "charges.create",
    "params", Map.of(
        "amount", 2000,
        "currency", "usd"
    )
));

System.out.println(res.getData());`,

  csharp: `// LukeAPI SDK – C#
var api = new LukeAPIClient(
    Environment.GetEnvironmentVariable("LUKEAPI_KEY"));

var res = await api.CallAsync("stripe", new {
    Method = "charges.create",
    Params = new { Amount = 2000, Currency = "usd" }
});

Console.WriteLine(res.Data);`,

  php: `// LukeAPI SDK – PHP
$api = new LukeAPI\\Client(getenv('LUKEAPI_KEY'));

$res = $api->call('stripe', [
    'method' => 'charges.create',
    'params' => [
        'amount'   => 2000,
        'currency' => 'usd',
    ],
]);

echo $res->data;`,

  kotlin: `// LukeAPI SDK – Kotlin
val api = LukeAPI(key = System.getenv("LUKEAPI_KEY"))

val res = api.call("stripe", mapOf(
    "method" to "charges.create",
    "params" to mapOf(
        "amount" to 2000,
        "currency" to "usd"
    )
))

println(res.data)`,

  swift: `// LukeAPI SDK – Swift
let api = LukeAPI(
    key: ProcessInfo.processInfo.environment["LUKEAPI_KEY"]!)

let res = try await api.call("stripe", params: [
    "method": "charges.create",
    "params": ["amount": 2000, "currency": "usd"]
])

print(res.data)`,

  rust: `// LukeAPI SDK – Rust
let api = LukeAPI::new(std::env::var("LUKEAPI_KEY")?);

let res = api.call("stripe", serde_json::json!({
    "method": "charges.create",
    "params": {
        "amount": 2000,
        "currency": "usd"
    }
})).await?;

println!("{:?}", res.data);`,
};

const tabLabels: Record<string, string> = {
  javascript: 'JavaScript',
  typescript: 'TypeScript',
  python: 'Python',
  go: 'Go',
  ruby: 'Ruby',
  java: 'Java',
  csharp: 'C#',
  php: 'PHP',
  kotlin: 'Kotlin',
  swift: 'Swift',
  rust: 'Rust',
};

export default function TechShowcase() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });
  const [copiedLang, setCopiedLang] = useState<string | null>(null);

  const copyToClipboard = (lang: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedLang(lang);
    setTimeout(() => setCopiedLang(null), 2000);
  };

  return (
    <section ref={ref}>
      {/* Inner strip: always dark so heading/subheading and code block stay legible when band forces section transparent (light mode) */}
      <div className="bg-gray-900 dark:bg-gray-950 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            className="mb-12 text-center"
          >
            <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-4 py-1.5 text-sm font-medium text-purple-300">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" /></svg>
              11 Languages · AI-Generated
            </span>
            <h2 className="section-heading mb-6 text-white">
              One SDK. Every Language.
            </h2>
            <p className="section-subheading mx-auto max-w-3xl text-gray-300 dark:text-gray-400">
              Describe what you want to build. Our AI generates production-ready, typed SDK code instantly.
            </p>
          </motion.div>

          {/* Code Examples */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ delay: 0.2 }}
          >
            <Tabs defaultValue="javascript" className="w-full">
              <TabsList className="mb-4 w-full justify-start overflow-x-auto flex-nowrap">
                {Object.keys(codeExamples).map((lang) => (
                  <TabsTrigger key={lang} value={lang} className="shrink-0">
                    {tabLabels[lang]}
                  </TabsTrigger>
                ))}
              </TabsList>

              {Object.entries(codeExamples).map(([lang, code]) => (
                <TabsContent key={lang} value={lang}>
                  <div className="relative overflow-hidden rounded-xl border border-gray-600 bg-gray-800 shadow-2xl ring-1 ring-white/5 dark:border-gray-700 dark:bg-gray-900 dark:ring-white/10">
                    <div className="flex items-center justify-between border-b border-gray-700 bg-gray-800/50 px-4 py-3 backdrop-blur dark:border-gray-600">
                      <span className="text-sm font-medium text-gray-400 dark:text-gray-500">
                        {tabLabels[lang]}
                      </span>
                      <button
                        onClick={() => copyToClipboard(lang, code)}
                        className="flex items-center gap-2 rounded px-2 py-1 text-sm text-gray-400 transition-colors hover:bg-gray-700 hover:text-white dark:text-gray-500 dark:hover:bg-gray-700"
                      >
                        {copiedLang === lang ? (
                          <>
                            <Check className="h-4 w-4" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="h-4 w-4" />
                            Copy
                          </>
                        )}
                      </button>
                    </div>
                    <pre className="overflow-x-auto p-4">
                      <code className="text-sm text-gray-300 dark:text-gray-400">{code}</code>
                    </pre>
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
