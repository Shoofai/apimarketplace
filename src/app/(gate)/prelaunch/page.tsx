import Link from 'next/link';
import { getSiteMode } from '@/lib/settings/site-mode';
import { getPlatformName } from '@/lib/settings/platform-name';
import { WaitlistSignupForm } from '@/components/prelaunch/WaitlistSignupForm';
import {
  Wrench,
  ArrowRight,
  Zap,
  Shield,
  Code2,
  TrendingUp,
  Star,
  Activity,
  CheckCircle2,
  Twitter,
  Github,
  Linkedin,
  Mail,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  const name = await getPlatformName();
  return {
    title: `${name} — Coming Soon`,
    robots: { index: false, follow: false },
  };
}

export default async function PrelaunchPage() {
  const [{ mode, message }, name] = await Promise.all([getSiteMode(), getPlatformName()]);
  const isMaintenance = mode === 'maintenance';

  if (isMaintenance) {
    return (
      <div className="relative min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-950 via-indigo-950 to-violet-950 overflow-hidden px-4">
        <div className="pointer-events-none absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-indigo-600/20 blur-3xl" />
        <div className="relative z-10 w-full max-w-md text-center space-y-6">
          <div className="flex justify-center">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <Wrench className="h-8 w-8 text-white" />
            </div>
          </div>
          <div className="space-y-3">
            <h1 className="text-4xl font-bold tracking-tight text-white">We&apos;ll be back soon</h1>
            <p className="text-lg text-indigo-200/70 leading-relaxed">
              {message ?? 'We are performing scheduled maintenance. Check back in a few minutes.'}
            </p>
          </div>
          <Link href="/login" className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors">
            Sign in to your account
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-violet-950 overflow-hidden">
      {/* Background grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            'linear-gradient(rgba(99,102,241,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.15) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* Glow orbs */}
      <div className="pointer-events-none absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-indigo-600/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-20 w-[500px] h-[500px] rounded-full bg-violet-600/20 blur-3xl" />
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full bg-indigo-500/10 blur-3xl" />

      {/* Nav */}
      <nav className="relative z-20 flex items-center justify-between px-6 py-5 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center">
            <Zap className="h-4 w-4 text-white" />
          </div>
          <span className="text-white font-bold text-lg">{name}</span>
        </div>
        <div className="flex items-center gap-6">
          <Link href="/pricing" className="hidden sm:block text-sm text-indigo-300/70 hover:text-indigo-200 transition-colors">Pricing</Link>
          <Link href="/blog" className="hidden sm:block text-sm text-indigo-300/70 hover:text-indigo-200 transition-colors">Blog</Link>
          <Link href="/about" className="hidden sm:block text-sm text-indigo-300/70 hover:text-indigo-200 transition-colors">About</Link>
          <Link href="/login" className="text-sm text-indigo-300 hover:text-white transition-colors font-medium">
            Sign in →
          </Link>
        </div>
      </nav>

      {/* Two-section hero */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-8 pb-20 lg:pt-12 lg:pb-32 grid lg:grid-cols-2 gap-16 items-center">

        {/* ── LEFT: Copy + Form ── */}
        <div className="space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/30 rounded-full px-4 py-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-400" />
            </span>
            <span className="text-indigo-300 text-sm font-medium">Private beta — limited spots</span>
          </div>

          {/* Headline */}
          <div className="space-y-4">
            <h1 className="text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.08]">
              The API Platform{' '}
              <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                Built for the AI Era
              </span>
            </h1>
            <p className="text-xl text-indigo-200/70 leading-relaxed max-w-lg">
              {message ??
                'Discover, integrate, and monetize APIs in one place. AI-generated code snippets, one-click subscriptions, and enterprise-grade governance — launching soon.'}
            </p>
          </div>

          {/* Feature bullets */}
          <ul className="space-y-3">
            {[
              { icon: Code2, text: 'AI-generated code for any endpoint in seconds' },
              { icon: TrendingUp, text: 'One-click monetization for API providers' },
              { icon: Shield, text: 'Enterprise governance & rate limiting built in' },
              { icon: Activity, text: 'Real-time health monitoring & SLA tracking' },
            ].map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-indigo-200/80">
                <span className="flex-shrink-0 h-6 w-6 rounded-md bg-indigo-500/20 flex items-center justify-center">
                  <Icon className="h-3.5 w-3.5 text-indigo-400" />
                </span>
                <span className="text-sm">{text}</span>
              </li>
            ))}
          </ul>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent" />

          {/* Waitlist form */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 space-y-4">
            <div className="space-y-1">
              <h2 className="text-white font-semibold text-base">Get early access</h2>
              <p className="text-indigo-300/70 text-sm">Join the waitlist and be first to know when we launch.</p>
            </div>
            <WaitlistSignupForm dark />
          </div>

          {/* Bottom links */}
          <div className="flex items-center gap-6 text-sm">
            <Link
              href="/early-access"
              className="inline-flex items-center gap-1.5 text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
            >
              Have an invite code?
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <span className="text-indigo-700">·</span>
            <Link href="/login" className="text-indigo-500 hover:text-indigo-400 transition-colors">
              Sign in to your account
            </Link>
          </div>

          {/* Provider CTA */}
          <div className="border border-indigo-500/20 bg-indigo-500/5 rounded-xl px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-indigo-200">Building an API?</p>
              <p className="text-xs text-indigo-400/70 mt-0.5">Join as a provider — get paid in minutes once we launch.</p>
            </div>
            <Link
              href="/early-access"
              className="shrink-0 inline-flex items-center gap-1.5 bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/30 text-indigo-300 hover:text-indigo-200 text-xs font-medium px-4 py-2 rounded-lg transition-colors"
            >
              Request provider access
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>

        {/* ── RIGHT: Illustration ── */}
        <div className="relative hidden lg:flex items-center justify-center">
          <ApiMarketplaceIllustration />
        </div>
      </div>

      {/* Platform capabilities strip */}
      <div className="relative z-10 border-t border-white/5 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-wrap gap-8 items-center justify-center lg:justify-between">
          {[
            { label: 'AI-generated SDK code', value: '< 2 min' },
            { label: 'Languages supported', value: '10+' },
            { label: 'Compliance-ready', value: 'SOC 2' },
            { label: 'Uptime SLA', value: '99.9%' },
          ].map(({ label, value }) => (
            <div key={label} className="text-center">
              <div className="text-2xl font-bold text-white">{value}</div>
              <div className="text-xs text-indigo-400/70 mt-0.5">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-8 space-y-5">
          {/* Top row: page links + social icons */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <nav className="flex flex-wrap items-center justify-center text-xs text-indigo-400/60">
              <Link href="/pricing" className="px-3 py-1 hover:text-indigo-300 transition-colors">Pricing</Link>
              <Link href="/about" className="px-3 py-1 hover:text-indigo-300 transition-colors">About</Link>
              <Link href="/blog" className="px-3 py-1 hover:text-indigo-300 transition-colors">Blog</Link>
              <Link href="/changelog" className="px-3 py-1 hover:text-indigo-300 transition-colors">Changelog</Link>
              <Link href="/status" className="px-3 py-1 hover:text-indigo-300 transition-colors">Status</Link>
              <Link href="/contact" className="px-3 py-1 hover:text-indigo-300 transition-colors">Contact</Link>
            </nav>
            <div className="flex items-center gap-4">
              {process.env.NEXT_PUBLIC_TWITTER_URL && (
                <a href={process.env.NEXT_PUBLIC_TWITTER_URL} target="_blank" rel="noopener noreferrer" aria-label="Twitter / X" className="text-indigo-500/50 hover:text-indigo-300 transition-colors">
                  <Twitter className="h-4 w-4" />
                </a>
              )}
              {process.env.NEXT_PUBLIC_GITHUB_URL && (
                <a href={process.env.NEXT_PUBLIC_GITHUB_URL} target="_blank" rel="noopener noreferrer" aria-label="GitHub" className="text-indigo-500/50 hover:text-indigo-300 transition-colors">
                  <Github className="h-4 w-4" />
                </a>
              )}
              {process.env.NEXT_PUBLIC_LINKEDIN_URL && (
                <a href={process.env.NEXT_PUBLIC_LINKEDIN_URL} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="text-indigo-500/50 hover:text-indigo-300 transition-colors">
                  <Linkedin className="h-4 w-4" />
                </a>
              )}
              <Link href="/contact" aria-label="Email us" className="text-indigo-500/50 hover:text-indigo-300 transition-colors">
                <Mail className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Bottom row: copyright + legal */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-white/5 pt-5">
            <p className="text-xs text-indigo-500/50">
              © {new Date().getFullYear()} {name}. All rights reserved.
            </p>
            <nav className="flex flex-wrap items-center justify-center text-xs text-indigo-400/50">
              <Link href="/legal/privacy" className="px-3 py-1 hover:text-indigo-300 transition-colors">Privacy Policy</Link>
              <Link href="/legal/terms" className="px-3 py-1 hover:text-indigo-300 transition-colors">Terms of Service</Link>
              <Link href="/legal/cookies" className="px-3 py-1 hover:text-indigo-300 transition-colors">Cookie Policy</Link>
              <Link href="/legal/acceptable-use" className="px-3 py-1 hover:text-indigo-300 transition-colors">Acceptable Use</Link>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Illustration: API Marketplace product mockup
───────────────────────────────────────────── */
function ApiMarketplaceIllustration() {
  const apis = [
    {
      name: 'OpenAI Compatible',
      category: 'AI & ML',
      badge: 'bg-violet-500/20 text-violet-300',
      dot: 'bg-green-400',
      latency: '42ms',
      stars: 4.9,
      users: '12.4k',
      color: 'from-violet-500/20 to-fuchsia-500/10',
      border: 'border-violet-500/20',
    },
    {
      name: 'Stripe Payments',
      category: 'Finance',
      badge: 'bg-blue-500/20 text-blue-300',
      dot: 'bg-green-400',
      latency: '88ms',
      stars: 4.8,
      users: '38.1k',
      color: 'from-blue-500/20 to-indigo-500/10',
      border: 'border-blue-500/20',
    },
    {
      name: 'Google Maps',
      category: 'Geolocation',
      badge: 'bg-emerald-500/20 text-emerald-300',
      dot: 'bg-green-400',
      latency: '63ms',
      stars: 4.7,
      users: '24.7k',
      color: 'from-emerald-500/20 to-teal-500/10',
      border: 'border-emerald-500/20',
    },
    {
      name: 'Twilio SMS',
      category: 'Communications',
      badge: 'bg-red-500/20 text-red-300',
      dot: 'bg-amber-400',
      latency: '110ms',
      stars: 4.6,
      users: '9.3k',
      color: 'from-red-500/20 to-orange-500/10',
      border: 'border-red-500/20',
    },
  ];

  return (
    <div className="relative w-full max-w-[520px]">
      <div className="absolute inset-0 bg-indigo-500/10 blur-2xl rounded-3xl scale-105" />

      <div className="relative bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl shadow-black/50">
        {/* Browser bar */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10 bg-white/[0.03]">
          <span className="h-2.5 w-2.5 rounded-full bg-red-500/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-green-500/70" />
          <div className="flex-1 mx-3 bg-white/5 border border-white/10 rounded-md px-3 py-1 text-xs text-indigo-300/50 font-mono">
            app.lukeapi.com/marketplace
          </div>
        </div>

        {/* App header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-md bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center">
              <Zap className="h-3 w-3 text-white" />
            </div>
            <span className="text-white text-sm font-semibold">Marketplace</span>
          </div>
          <div className="bg-indigo-500/20 border border-indigo-500/30 rounded-md px-2 py-1 text-xs text-indigo-300">
            2,400+ APIs
          </div>
        </div>

        {/* Search bar */}
        <div className="px-4 py-3 border-b border-white/5">
          <div className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 flex items-center gap-2">
            <svg className="h-4 w-4 text-indigo-400/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span className="text-indigo-400/40 text-sm">Search 2,400+ APIs...</span>
          </div>
        </div>

        {/* API cards */}
        <div className="p-4 grid grid-cols-2 gap-3">
          {apis.map((api) => (
            <div
              key={api.name}
              className={`bg-gradient-to-br ${api.color} border ${api.border} rounded-xl p-3 space-y-2.5 group cursor-pointer hover:scale-[1.02] transition-transform duration-200`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-white text-xs font-semibold truncate">{api.name}</p>
                  <span className={`inline-block mt-1 text-[10px] px-1.5 py-0.5 rounded-md font-medium ${api.badge}`}>
                    {api.category}
                  </span>
                </div>
                <span className={`h-2 w-2 rounded-full ${api.dot} flex-shrink-0 mt-1 shadow-lg`} />
              </div>
              <div className="flex items-center justify-between text-[10px] text-white/50">
                <span className="flex items-center gap-1">
                  <Star className="h-2.5 w-2.5 fill-amber-400 text-amber-400" />
                  {api.stars}
                </span>
                <span>{api.latency}</span>
                <span>{api.users} users</span>
              </div>
              <div className="bg-white/10 rounded-md py-1 text-center text-[10px] text-white/70 font-medium group-hover:bg-white/20 transition-colors">
                Integrate →
              </div>
            </div>
          ))}
        </div>

        {/* Code snippet */}
        <div className="mx-4 mb-4 bg-slate-950/60 border border-white/5 rounded-xl p-3">
          <div className="flex items-center gap-2 mb-2">
            <Code2 className="h-3.5 w-3.5 text-indigo-400" />
            <span className="text-xs text-indigo-400 font-medium">AI-Generated SDK</span>
            <span className="ml-auto flex items-center gap-1 text-[10px] text-green-400">
              <CheckCircle2 className="h-3 w-3" /> Ready to copy
            </span>
          </div>
          <pre className="text-[10px] leading-relaxed font-mono text-indigo-300/70 overflow-hidden">
            <span className="text-violet-400">import</span>{' '}
            <span className="text-amber-300">{'{ LukeAPI }'}</span>{' '}
            <span className="text-violet-400">from</span>{' '}
            <span className="text-green-300">&apos;lukeapi&apos;</span>
            {'\n\n'}
            <span className="text-indigo-400/50">{'// One line to any API'}</span>
            {'\n'}
            <span className="text-blue-300">const</span>
            {' result = '}
            <span className="text-yellow-300">await</span>
            {' api.call('}
            <span className="text-green-300">&apos;openai&apos;</span>
            {')'}
          </pre>
        </div>
      </div>

      {/* Floating badges */}
      <div className="absolute -top-4 -right-4 bg-green-500/20 border border-green-500/30 backdrop-blur-sm rounded-xl px-3 py-2 flex items-center gap-2 shadow-lg">
        <Activity className="h-4 w-4 text-green-400" />
        <span className="text-green-300 text-xs font-medium">99.9% uptime</span>
      </div>
      <div className="absolute -bottom-4 -left-4 bg-violet-500/20 border border-violet-500/30 backdrop-blur-sm rounded-xl px-3 py-2 flex items-center gap-2 shadow-lg">
        <TrendingUp className="h-4 w-4 text-violet-400" />
        <span className="text-violet-300 text-xs font-medium">+340% MoM growth</span>
      </div>
    </div>
  );
}
