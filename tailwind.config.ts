import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
  	extend: {
  		colors: {
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			primary: {
  				'50': '#EFF6FF',
  				'100': '#DBEAFE',
  				'200': '#BFDBFE',
  				'300': '#60A5FA',
  				'400': '#3B82F6',
  				'500': '#3B82F6',
  				'600': '#2563EB',
  				'700': '#1E3A8A',
  				'800': '#1E40AF',
  				'900': '#0A0E27',
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			accent: {
  				'100': '#F3E8FF',
  				'200': '#E9D5FF',
  				'300': '#A78BFA',
  				'400': '#8B5CF6',
  				'500': '#8B5CF6',
  				'600': '#7C3AED',
  				'700': '#6D28D9',
  				'800': '#5B21B6',
  				'900': '#4C1D95',
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			success: {
  				'100': '#D1FAE5',
  				'300': '#6EE7B7',
  				'500': '#10B981',
  				'700': '#047857',
  				'900': '#064E3B'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		fontFamily: {
  			sans: [
  				'var(--font-sans)',
  				'ui-sans-serif',
  				'system-ui',
  				'sans-serif'
  			],
  			heading: [
  				'var(--font-space-grotesk)',
  				'var(--font-sans)',
  				'ui-sans-serif',
  				'system-ui',
  				'sans-serif'
  			],
  			mono: [
  				'var(--font-mono)',
  				'ui-monospace',
  				'Monaco',
  				'Consolas',
  				'monospace'
  			]
  		},
  		fontSize: {
  			xs: [
  				'clamp(0.75rem, 0.7rem + 0.25vw, 0.875rem)',
  				{
  					lineHeight: '1.5',
  					letterSpacing: '0.01em'
  				}
  			],
  			sm: [
  				'clamp(0.875rem, 0.8rem + 0.375vw, 1rem)',
  				{
  					lineHeight: '1.5',
  					letterSpacing: '0em'
  				}
  			],
  			base: [
  				'clamp(1rem, 0.9rem + 0.5vw, 1.125rem)',
  				{
  					lineHeight: '1.6',
  					letterSpacing: '0em'
  				}
  			],
  			lg: [
  				'clamp(1.125rem, 1rem + 0.625vw, 1.25rem)',
  				{
  					lineHeight: '1.6',
  					letterSpacing: '-0.01em'
  				}
  			],
  			xl: [
  				'clamp(1.25rem, 1.1rem + 0.75vw, 1.5rem)',
  				{
  					lineHeight: '1.5',
  					letterSpacing: '-0.01em'
  				}
  			],
  			'2xl': [
  				'clamp(1.5rem, 1.3rem + 1vw, 1.875rem)',
  				{
  					lineHeight: '1.4',
  					letterSpacing: '-0.02em'
  				}
  			],
  			'3xl': [
  				'clamp(1.875rem, 1.6rem + 1.375vw, 2.25rem)',
  				{
  					lineHeight: '1.3',
  					letterSpacing: '-0.02em'
  				}
  			],
  			'4xl': [
  				'clamp(2.25rem, 1.9rem + 1.75vw, 3rem)',
  				{
  					lineHeight: '1.2',
  					letterSpacing: '-0.03em'
  				}
  			],
  			'5xl': [
  				'clamp(3rem, 2.5rem + 2.5vw, 3.75rem)',
  				{
  					lineHeight: '1.1',
  					letterSpacing: '-0.03em'
  				}
  			],
  			'6xl': [
  				'clamp(3.75rem, 3rem + 3.75vw, 4.5rem)',
  				{
  					lineHeight: '1.05',
  					letterSpacing: '-0.04em'
  				}
  			]
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		boxShadow: {
  			glow: '0 0 40px rgba(59, 130, 246, 0.3)',
  			'glow-purple': '0 0 40px rgba(139, 92, 246, 0.3)'
  		},
  		backgroundImage: {
  			'gradient-hero': 'linear-gradient(135deg, #1E3A8A 0%, #8B5CF6 100%)',
  			'gradient-feature': 'linear-gradient(180deg, #3B82F6 0%, #8B5CF6 100%)',
  			'gradient-glow': 'radial-gradient(circle at 50% 0%, rgba(59, 130, 246, 0.15) 0%, transparent 70%)'
  		},
  		animation: {
  			'fade-in': 'fadeIn 0.5s ease-out',
  			'slide-up': 'slideUp 0.5s ease-out',
  			'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
  			float: 'float 6s ease-in-out infinite',
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out'
  		},
  		keyframes: {
  			fadeIn: {
  				'0%': {
  					opacity: '0'
  				},
  				'100%': {
  					opacity: '1'
  				}
  			},
  			slideUp: {
  				'0%': {
  					transform: 'translateY(20px)',
  					opacity: '0'
  				},
  				'100%': {
  					transform: 'translateY(0)',
  					opacity: '1'
  				}
  			},
  			float: {
  				'0%, 100%': {
  					transform: 'translateY(0px)'
  				},
  				'50%': {
  					transform: 'translateY(-20px)'
  				}
  			},
  			'accordion-down': {
  				from: { height: '0' },
  				to: { height: 'var(--radix-accordion-content-height)' }
  			},
  			'accordion-up': {
  				from: { height: 'var(--radix-accordion-content-height)' },
  				to: { height: '0' }
  			}
  		}
  	}
  },
  plugins: [
    require('tailwindcss-animate'),
    (() => {
      try {
        return require('@tailwindcss/typography');
      } catch {
        return () => {};
      }
    })(),
  ],
};

export default config;
