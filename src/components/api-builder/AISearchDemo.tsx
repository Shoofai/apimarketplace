'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Sparkles, Star, Check, ArrowRight, Code2, Copy, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

/* ------------------------------------------------------------------ */
/*  Demo data — queries, results, and multi-language code snippets     */
/* ------------------------------------------------------------------ */

const EXAMPLE_QUERIES = [
  'send payment notifications',
  'authenticate users with OAuth',
  'resize images on the fly',
  'send transactional emails',
  'process natural language',
];

interface DemoResult {
  name: string;
  rating: string;
  tier: string;
  type: string;
}

const DEMO_RESULTS: Record<string, DemoResult> = {
  'send payment notifications': { name: 'Stripe Webhooks API', rating: '4.9', tier: 'Free tier', type: 'REST' },
  'authenticate users with OAuth': { name: 'Auth0 Identity API', rating: '4.8', tier: 'Free tier', type: 'REST' },
  'resize images on the fly': { name: 'Cloudinary Transform API', rating: '4.7', tier: '$9/mo', type: 'REST' },
  'send transactional emails': { name: 'Resend Email API', rating: '4.9', tier: 'Free tier', type: 'REST' },
  'process natural language': { name: 'Claude AI API', rating: '4.9', tier: 'Pay-per-use', type: 'REST' },
};

/**
 * Per-query, per-language code snippets.
 * Each language shows idiomatic code with the correct import style,
 * client pattern, and language conventions.
 */
type LangKey = 'TypeScript' | 'Python' | 'Go' | 'Java' | 'Rust' | 'Swift' | 'Ruby' | 'PHP' | 'C#' | 'Kotlin' | 'Dart';

const DEMO_CODE: Record<string, Record<LangKey, string>> = {
  'send payment notifications': {
    TypeScript: `import { StripeWebhooks } from './client';

const stripe = new StripeWebhooks(apiKey);

await stripe.webhooks.listen({
  event: 'payment_intent.succeeded',
  handler: async (event) => {
    await notify(event.data.amount);
  },
});`,
    Python: `from client import StripeWebhooks

stripe = StripeWebhooks(api_key)

stripe.webhooks.listen(
    event="payment_intent.succeeded",
    handler=lambda e: notify(e.data.amount),
)`,
    Go: `client := stripe.NewWebhooks(apiKey)

err := client.Listen("payment_intent.succeeded",
    func(event stripe.Event) error {
        return notify(event.Data.Amount)
    },
)`,
    Java: `var stripe = new StripeWebhooks(apiKey);

stripe.webhooks().listen(
    "payment_intent.succeeded",
    event -> notify(event.getData().getAmount())
);`,
    Rust: `let stripe = StripeWebhooks::new(api_key);

stripe.webhooks().listen(
    "payment_intent.succeeded",
    |event| notify(&event.data.amount),
).await?;`,
    Swift: `let stripe = StripeWebhooks(apiKey: apiKey)

try await stripe.webhooks.listen(
    event: .paymentIntentSucceeded
) { event in
    await notify(event.data.amount)
}`,
    Ruby: `stripe = StripeWebhooks.new(api_key)

stripe.webhooks.listen(
  event: 'payment_intent.succeeded'
) do |event|
  notify(event.data.amount)
end`,
    PHP: `$stripe = new StripeWebhooks($apiKey);

$stripe->webhooks()->listen(
    'payment_intent.succeeded',
    fn ($event) => notify($event->data->amount)
);`,
    'C#': `var stripe = new StripeWebhooks(apiKey);

await stripe.Webhooks.ListenAsync(
    "payment_intent.succeeded",
    async (evt) => await Notify(evt.Data.Amount)
);`,
    Kotlin: `val stripe = StripeWebhooks(apiKey)

stripe.webhooks.listen(
    event = "payment_intent.succeeded"
) { event ->
    notify(event.data.amount)
}`,
    Dart: `final stripe = StripeWebhooks(apiKey);

await stripe.webhooks.listen(
  event: 'payment_intent.succeeded',
  handler: (event) async {
    await notify(event.data.amount);
  },
);`,
  },
  'authenticate users with OAuth': {
    TypeScript: `import { Auth0Client } from './client';

const auth = new Auth0Client(apiKey);

const { user, token } = await auth.authorize({
  provider: 'google',
  scope: ['openid', 'profile', 'email'],
  redirectUri: '/callback',
});`,
    Python: `from client import Auth0Client

auth = Auth0Client(api_key)

user, token = auth.authorize(
    provider="google",
    scope=["openid", "profile", "email"],
    redirect_uri="/callback",
)`,
    Go: `auth := auth0.NewClient(apiKey)

user, token, err := auth.Authorize(auth0.Options{
    Provider:    "google",
    Scope:       []string{"openid", "profile"},
    RedirectURI: "/callback",
})`,
    Java: `var auth = new Auth0Client(apiKey);

var result = auth.authorize(AuthOptions.builder()
    .provider("google")
    .scope(List.of("openid", "profile"))
    .redirectUri("/callback")
    .build());`,
    Rust: `let auth = Auth0Client::new(api_key);

let (user, token) = auth.authorize(
    AuthOptions::builder()
        .provider("google")
        .scope(&["openid", "profile"])
        .redirect_uri("/callback")
        .build()
).await?;`,
    Swift: `let auth = Auth0Client(apiKey: apiKey)

let (user, token) = try await auth.authorize(
    provider: .google,
    scope: [.openid, .profile, .email],
    redirectUri: "/callback"
)`,
    Ruby: `auth = Auth0Client.new(api_key)

user, token = auth.authorize(
  provider: 'google',
  scope: %w[openid profile email],
  redirect_uri: '/callback'
)`,
    PHP: `$auth = new Auth0Client($apiKey);

[$user, $token] = $auth->authorize([
    'provider' => 'google',
    'scope' => ['openid', 'profile'],
    'redirect_uri' => '/callback',
]);`,
    'C#': `var auth = new Auth0Client(apiKey);

var (user, token) = await auth.AuthorizeAsync(
    provider: "google",
    scope: ["openid", "profile", "email"],
    redirectUri: "/callback"
);`,
    Kotlin: `val auth = Auth0Client(apiKey)

val (user, token) = auth.authorize(
    provider = "google",
    scope = listOf("openid", "profile"),
    redirectUri = "/callback"
)`,
    Dart: `final auth = Auth0Client(apiKey);

final result = await auth.authorize(
  provider: 'google',
  scope: ['openid', 'profile', 'email'],
  redirectUri: '/callback',
);`,
  },
  'resize images on the fly': {
    TypeScript: `import { Cloudinary } from './client';

const img = new Cloudinary(apiKey);

const result = await img.transform({
  url: 'https://example.com/photo.jpg',
  width: 800,
  height: 600,
  format: 'webp',
});`,
    Python: `from client import Cloudinary

img = Cloudinary(api_key)

result = img.transform(
    url="https://example.com/photo.jpg",
    width=800, height=600,
    format="webp",
)`,
    Go: `img := cloudinary.New(apiKey)

result, err := img.Transform(cloudinary.Opts{
    URL:    "https://example.com/photo.jpg",
    Width:  800,
    Height: 600,
    Format: "webp",
})`,
    Java: `var img = new Cloudinary(apiKey);

var result = img.transform(TransformOptions.builder()
    .url("https://example.com/photo.jpg")
    .width(800).height(600)
    .format("webp")
    .build());`,
    Rust: `let img = Cloudinary::new(api_key);

let result = img.transform(
    TransformOpts::new("https://example.com/photo.jpg")
        .width(800).height(600)
        .format("webp")
).await?;`,
    Swift: `let img = Cloudinary(apiKey: apiKey)

let result = try await img.transform(
    url: "https://example.com/photo.jpg",
    width: 800, height: 600,
    format: .webp
)`,
    Ruby: `img = Cloudinary.new(api_key)

result = img.transform(
  url: 'https://example.com/photo.jpg',
  width: 800, height: 600,
  format: 'webp'
)`,
    PHP: `$img = new Cloudinary($apiKey);

$result = $img->transform([
    'url' => 'https://example.com/photo.jpg',
    'width' => 800, 'height' => 600,
    'format' => 'webp',
]);`,
    'C#': `var img = new Cloudinary(apiKey);

var result = await img.TransformAsync(
    url: "https://example.com/photo.jpg",
    width: 800, height: 600,
    format: "webp"
);`,
    Kotlin: `val img = Cloudinary(apiKey)

val result = img.transform(
    url = "https://example.com/photo.jpg",
    width = 800, height = 600,
    format = "webp"
)`,
    Dart: `final img = Cloudinary(apiKey);

final result = await img.transform(
  url: 'https://example.com/photo.jpg',
  width: 800, height: 600,
  format: 'webp',
);`,
  },
  'send transactional emails': {
    TypeScript: `import { Resend } from './client';

const email = new Resend(apiKey);

await email.send({
  from: 'hello@yourapp.com',
  to: user.email,
  subject: 'Welcome aboard!',
  html: template.render({ name: user.name }),
});`,
    Python: `from client import Resend

email = Resend(api_key)

email.send(
    from_addr="hello@yourapp.com",
    to=user.email,
    subject="Welcome aboard!",
    html=template.render(name=user.name),
)`,
    Go: `email := resend.New(apiKey)

err := email.Send(resend.Message{
    From:    "hello@yourapp.com",
    To:      user.Email,
    Subject: "Welcome aboard!",
    HTML:    template.Render(user.Name),
})`,
    Java: `var email = new Resend(apiKey);

email.send(EmailMessage.builder()
    .from("hello@yourapp.com")
    .to(user.getEmail())
    .subject("Welcome aboard!")
    .html(template.render(user.getName()))
    .build());`,
    Rust: `let email = Resend::new(api_key);

email.send(Message::new()
    .from("hello@yourapp.com")
    .to(&user.email)
    .subject("Welcome aboard!")
    .html(&template.render(&user.name))
).await?;`,
    Swift: `let email = Resend(apiKey: apiKey)

try await email.send(
    from: "hello@yourapp.com",
    to: user.email,
    subject: "Welcome aboard!",
    html: template.render(name: user.name)
)`,
    Ruby: `email = Resend.new(api_key)

email.send(
  from: 'hello@yourapp.com',
  to: user.email,
  subject: 'Welcome aboard!',
  html: template.render(name: user.name)
)`,
    PHP: `$email = new Resend($apiKey);

$email->send([
    'from' => 'hello@yourapp.com',
    'to' => $user->email,
    'subject' => 'Welcome aboard!',
    'html' => $template->render($user->name),
]);`,
    'C#': `var email = new Resend(apiKey);

await email.SendAsync(
    from: "hello@yourapp.com",
    to: user.Email,
    subject: "Welcome aboard!",
    html: template.Render(user.Name)
);`,
    Kotlin: `val email = Resend(apiKey)

email.send(
    from = "hello@yourapp.com",
    to = user.email,
    subject = "Welcome aboard!",
    html = template.render(user.name)
)`,
    Dart: `final email = Resend(apiKey);

await email.send(
  from: 'hello@yourapp.com',
  to: user.email,
  subject: 'Welcome aboard!',
  html: template.render(name: user.name),
);`,
  },
  'process natural language': {
    TypeScript: `import { Claude } from './client';

const ai = new Claude(apiKey);

const response = await ai.messages.create({
  model: 'claude-sonnet-4-20250514',
  messages: [{ role: 'user', content: prompt }],
  max_tokens: 1024,
});`,
    Python: `from client import Claude

ai = Claude(api_key)

response = ai.messages.create(
    model="claude-sonnet-4-20250514",
    messages=[{"role": "user", "content": prompt}],
    max_tokens=1024,
)`,
    Go: `ai := claude.New(apiKey)

resp, err := ai.Messages.Create(claude.Request{
    Model:    "claude-sonnet-4-20250514",
    Messages: []claude.Msg{{Role: "user", Content: prompt}},
    MaxTokens: 1024,
})`,
    Java: `var ai = new Claude(apiKey);

var response = ai.messages().create(
    MessageRequest.builder()
        .model("claude-sonnet-4-20250514")
        .message("user", prompt)
        .maxTokens(1024)
        .build());`,
    Rust: `let ai = Claude::new(api_key);

let response = ai.messages().create(
    MessageRequest::builder()
        .model("claude-sonnet-4-20250514")
        .message(Role::User, prompt)
        .max_tokens(1024)
        .build()
).await?;`,
    Swift: `let ai = Claude(apiKey: apiKey)

let response = try await ai.messages.create(
    model: "claude-sonnet-4-20250514",
    messages: [.user(prompt)],
    maxTokens: 1024
)`,
    Ruby: `ai = Claude.new(api_key)

response = ai.messages.create(
  model: 'claude-sonnet-4-20250514',
  messages: [{ role: 'user', content: prompt }],
  max_tokens: 1024
)`,
    PHP: `$ai = new Claude($apiKey);

$response = $ai->messages()->create([
    'model' => 'claude-sonnet-4-20250514',
    'messages' => [['role' => 'user', 'content' => $prompt]],
    'max_tokens' => 1024,
]);`,
    'C#': `var ai = new Claude(apiKey);

var response = await ai.Messages.CreateAsync(
    model: "claude-sonnet-4-20250514",
    messages: [new("user", prompt)],
    maxTokens: 1024
);`,
    Kotlin: `val ai = Claude(apiKey)

val response = ai.messages.create(
    model = "claude-sonnet-4-20250514",
    messages = listOf(Message("user", prompt)),
    maxTokens = 1024
)`,
    Dart: `final ai = Claude(apiKey);

final response = await ai.messages.create(
  model: 'claude-sonnet-4-20250514',
  messages: [Message(role: 'user', content: prompt)],
  maxTokens: 1024,
);`,
  },
};

const SDK_LANGUAGES: LangKey[] = ['TypeScript', 'Python', 'Go', 'Java', 'Rust', 'Swift', 'Ruby', 'PHP', 'C#', 'Kotlin', 'Dart'];

type DemoPhase = 'idle' | 'typing' | 'searching' | 'found' | 'generating' | 'done';

export default function AISearchDemo() {
  const [phase, setPhase] = useState<DemoPhase>('idle');
  const [queryIndex, setQueryIndex] = useState(0);
  const [typedText, setTypedText] = useState('');
  const [sdkLang, setSdkLang] = useState<LangKey>('TypeScript');
  const [showLangPicker, setShowLangPicker] = useState(false);
  const [codeLines, setCodeLines] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const currentQuery = EXAMPLE_QUERIES[queryIndex];
  const result = DEMO_RESULTS[currentQuery];
  const code = useMemo(() => DEMO_CODE[currentQuery]?.[sdkLang] ?? '', [currentQuery, sdkLang]);
  const totalLines = code.split('\n').length;

  // Auto-play the demo on mount and loop
  useEffect(() => {
    const timer = setTimeout(() => {
      if (phase === 'idle') startDemo();
    }, 1200);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, queryIndex]);

  function startDemo() {
    setPhase('typing');
    setTypedText('');
    setCodeLines(0);
    typeQuery(0);
  }

  function typeQuery(charIndex: number) {
    if (charIndex <= currentQuery.length) {
      setTypedText(currentQuery.slice(0, charIndex));
      setTimeout(() => typeQuery(charIndex + 1), 35 + Math.random() * 25);
    } else {
      setPhase('searching');
      setTimeout(() => setPhase('found'), 800);
      setTimeout(() => {
        setPhase('generating');
        revealCode(0);
      }, 1800);
    }
  }

  function revealCode(line: number) {
    if (line <= totalLines) {
      setCodeLines(line);
      setTimeout(() => revealCode(line + 1), 60);
    } else {
      setPhase('done');
      setTimeout(() => {
        setPhase('idle');
        setQueryIndex((i) => (i + 1) % EXAMPLE_QUERIES.length);
      }, 4000);
    }
  }

  function handleManualRestart() {
    setPhase('idle');
    setQueryIndex((i) => (i + 1) % EXAMPLE_QUERIES.length);
  }

  /** When user switches language mid-demo, instantly show all lines */
  function handleLanguageChange(lang: LangKey) {
    setSdkLang(lang);
    setShowLangPicker(false);
    if (phase === 'done' || phase === 'generating') {
      const newCode = DEMO_CODE[currentQuery]?.[lang] ?? '';
      setCodeLines(newCode.split('\n').length);
    }
  }

  /** CTA deep-links to marketplace search with the current demo query */
  const searchUrl = `/marketplace?q=${encodeURIComponent(currentQuery)}`;

  const visibleCode = code.split('\n').slice(0, codeLines).join('\n');

  return (
    <div className="flex h-[340px] sm:h-[400px] lg:h-[min(480px,70vh)] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white p-4 sm:p-5 shadow-xl ring-1 ring-gray-200/50 dark:border-gray-600 dark:bg-gradient-to-b dark:from-gray-800/90 dark:to-gray-800/50 dark:shadow-[0_8px_30px_rgb(0,0,0,0.2),0_0_50px_-8px_rgba(139,92,246,0.3)] dark:ring-white/5">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-1 flex-col"
      >
        {/* Search input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            ref={inputRef}
            type="text"
            readOnly
            value={typedText}
            placeholder="What do you want to build?"
            className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none dark:border-gray-600 dark:bg-gray-800/60 dark:text-white dark:placeholder:text-gray-500"
          />
          {phase === 'typing' && (
            <span className="absolute right-3 top-1/2 h-4 w-0.5 -translate-y-1/2 animate-pulse bg-primary-500" />
          )}
          {phase === 'searching' && (
            <motion.div
              className="absolute right-3 top-1/2 -translate-y-1/2"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            >
              <Sparkles className="h-4 w-4 text-primary-500" />
            </motion.div>
          )}
        </div>

        {/* Found result */}
        <AnimatePresence>
          {(phase === 'found' || phase === 'generating' || phase === 'done') && result && (
            <motion.div
              initial={{ opacity: 0, y: -8, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-2 overflow-hidden"
            >
              <div className="flex items-center gap-2 sm:gap-3 rounded-lg border border-primary-200/50 bg-primary-50/50 px-2.5 py-1.5 sm:py-2.5 dark:border-primary-500/20 dark:bg-primary-500/5">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary-100 dark:bg-primary-500/20">
                  <Sparkles className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{result.name}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-0.5">
                      <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                      {result.rating}
                    </span>
                    <span className="text-gray-300 dark:text-gray-600">/</span>
                    <span>{result.tier}</span>
                    <span className="text-gray-300 dark:text-gray-600">/</span>
                    <span>{result.type}</span>
                  </div>
                </div>
                <Check className="h-4 w-4 shrink-0 text-emerald-500" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* SDK code generation */}
        <AnimatePresence>
          {(phase === 'generating' || phase === 'done') && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-2 flex min-h-0 flex-1 flex-col overflow-hidden"
            >
              {/* Language selector bar */}
              <div className="flex items-center justify-between rounded-t-lg border border-b-0 border-gray-700 bg-gray-900 px-3 py-1.5 dark:border-gray-600 dark:bg-black/60">
                <div className="relative">
                  <button
                    onClick={() => setShowLangPicker(!showLangPicker)}
                    className="flex items-center gap-1.5 text-xs font-medium text-primary-400 hover:text-primary-300 transition-colors"
                  >
                    <Code2 className="h-3 w-3" />
                    {sdkLang}
                    <ChevronDown className="h-3 w-3" />
                  </button>
                  {showLangPicker && (
                    <div className="absolute left-0 top-full z-10 mt-1 max-h-40 w-32 overflow-y-auto rounded-md border border-gray-600 bg-gray-800 py-1 shadow-lg">
                      {SDK_LANGUAGES.map((lang) => (
                        <button
                          key={lang}
                          className={`w-full px-3 py-1 text-left text-xs ${
                            lang === sdkLang
                              ? 'bg-primary-500/20 text-primary-400'
                              : 'text-gray-300 hover:bg-gray-700'
                          }`}
                          onClick={() => handleLanguageChange(lang)}
                        >
                          {lang}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-gray-500">AI-generated</span>
                  {phase === 'done' && (
                    <button className="text-gray-400 hover:text-white transition-colors">
                      <Copy className="h-3 w-3" />
                    </button>
                  )}
                </div>
              </div>

              {/* Code block */}
              <div className="min-h-0 flex-1 overflow-hidden rounded-b-lg border border-gray-700 bg-gray-950 p-3 dark:border-gray-600 dark:bg-black/40">
                <pre className="text-[10px] sm:text-xs font-mono leading-relaxed text-gray-300 whitespace-pre overflow-x-auto">
                  <code>{visibleCode}</code>
                  {phase === 'generating' && (
                    <span className="inline-block h-3.5 w-1.5 animate-pulse bg-primary-400 ml-0.5 align-middle" />
                  )}
                </pre>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom bar */}
        <div className="mt-auto shrink-0 pt-2">
          {phase === 'done' ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-between gap-3"
            >
              <Button
                variant="cta"
                size="sm"
                className="gap-1.5 shadow-glow-cta shrink-0"
                onClick={() => { window.location.href = searchUrl; }}
              >
                Try it yourself
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
              <span className="text-xs text-muted-foreground text-right">
                API to production in <span className="font-semibold text-primary-600 dark:text-primary-400">2 min</span>
              </span>
            </motion.div>
          ) : phase === 'idle' ? (
            <div className="flex items-center justify-center">
              <button
                onClick={handleManualRestart}
                className="text-xs text-muted-foreground hover:text-primary-500 transition-colors"
              >
                Click to see the magic
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-1.5">
              <motion.div
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="h-1.5 w-1.5 rounded-full bg-primary-500"
              />
              <span className="text-xs text-muted-foreground">
                {phase === 'typing' ? 'Searching with AI...' : phase === 'searching' ? 'Finding the best API...' : 'Generating typed SDK...'}
              </span>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
