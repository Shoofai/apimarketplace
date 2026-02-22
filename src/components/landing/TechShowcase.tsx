'use client';

import { motion, useInView } from 'framer-motion';
import { useRef, useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const codeExamples = {
  javascript: `// AI-generated integration code
import { APIMarketplace } from '@apimp/sdk';

const client = new APIMarketplace({
  apiKey: process.env.APIMP_KEY
});

// Call any API with unified interface
const response = await client.call('stripe', {
  method: 'charges.create',
  params: {
    amount: 2000,
    currency: 'usd',
    source: 'tok_visa'
  }
});

console.log(response.data);`,

  python: `# AI-generated integration code
from apimp import APIMarketplace

client = APIMarketplace(
    api_key=os.environ['APIMP_KEY']
)

# Call any API with unified interface
response = client.call('stripe', 
    method='charges.create',
    params={
        'amount': 2000,
        'currency': 'usd',
        'source': 'tok_visa'
    }
)

print(response.data)`,

  go: `// AI-generated integration code
package main

import (
    "github.com/apimp/go-sdk"
    "os"
)

func main() {
    client := apimp.NewClient(
        os.Getenv("APIMP_KEY"),
    )
    
    // Call any API with unified interface
    response, err := client.Call("stripe", map[string]interface{}{
        "method": "charges.create",
        "params": map[string]interface{}{
            "amount": 2000,
            "currency": "usd",
            "source": "tok_visa",
        },
    })
}`,

  ruby: `# AI-generated integration code
require 'apimp'

client = APIMarketplace::Client.new(
  api_key: ENV['APIMP_KEY']
)

# Call any API with unified interface
response = client.call('stripe',
  method: 'charges.create',
  params: {
    amount: 2000,
    currency: 'usd',
    source: 'tok_visa'
  }
)

puts response.data`,
};

const technologies = [
  { name: 'Next.js', category: 'Framework' },
  { name: 'React 18', category: 'UI Library' },
  { name: 'TypeScript', category: 'Language' },
  { name: 'Supabase', category: 'Backend' },
  { name: 'PostgreSQL', category: 'Database' },
  { name: 'Stripe', category: 'Payments' },
  { name: 'Cloudflare', category: 'CDN' },
  { name: 'OpenAI', category: 'AI' },
];

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
            <h2 className="section-heading mb-6 text-white">
              Built with Modern Tech
            </h2>
            <p className="section-subheading mx-auto max-w-3xl text-gray-300 dark:text-gray-400">
              Production-grade infrastructure. Enterprise security. Developer-friendly APIs.
            </p>
          </motion.div>

        {/* Code Examples */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ delay: 0.2 }}
          className="mb-16"
        >
          <Tabs defaultValue="javascript" className="w-full">
            <TabsList className="mb-4 w-full justify-start overflow-x-auto">
              <TabsTrigger value="javascript">JavaScript</TabsTrigger>
              <TabsTrigger value="python">Python</TabsTrigger>
              <TabsTrigger value="go">Go</TabsTrigger>
              <TabsTrigger value="ruby">Ruby</TabsTrigger>
            </TabsList>

            {Object.entries(codeExamples).map(([lang, code]) => (
              <TabsContent key={lang} value={lang}>
                  <div className="relative overflow-hidden rounded-xl border border-gray-600 bg-gray-800 shadow-2xl ring-1 ring-white/5 dark:border-gray-700 dark:bg-gray-900 dark:ring-white/10">
                    <div className="flex items-center justify-between border-b border-gray-700 bg-gray-800/50 px-4 py-3 backdrop-blur dark:border-gray-600">
                    <span className="text-sm font-medium text-gray-400 dark:text-gray-500">
                      {lang.charAt(0).toUpperCase() + lang.slice(1)}
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

        {/* Tech Stack – animated ticker */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h3 className="mb-8 text-center text-2xl font-bold text-white">Powered By</h3>
          <div className="relative overflow-hidden">
            <div className="flex w-max animate-ticker gap-4 [@media(prefers-reduced-motion:reduce)]:animate-none">
              {[...technologies, ...technologies].map((tech, index) => (
                <div
                  key={`${tech.name}-${index}`}
                  className="group relative flex min-w-[140px] shrink-0 overflow-hidden rounded-xl border border-gray-700 bg-gray-800 p-6 text-center transition-all hover:-translate-y-1 hover:border-gray-600 hover:shadow-lg dark:border-gray-700 dark:bg-gray-900"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                  <div className="relative">
                    <div className="mb-2 text-lg font-bold text-white">{tech.name}</div>
                    <div className="text-sm text-gray-400 dark:text-gray-500">{tech.category}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
        </div>
      </div>
    </section>
  );
}
