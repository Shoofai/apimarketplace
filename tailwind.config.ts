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
  				'50': '#f3f1ff',
  				'100': '#e8e3fe',
  				'200': '#d4cbfd',
  				'300': '#b5a3fb',
  				'400': '#9171f8',
  				'500': '#7c4ff2',
  				'600': '#6c30e8',
  				'700': '#5b22c9',
  				'800': '#4c1da5',
  				'900': '#3f1a87',
  				'950': '#250e5c',
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			accent: {
  				'50': '#fffbeb',
  				'100': '#fef3c7',
  				'200': '#fde68a',
  				'300': '#fcd34d',
  				'400': '#fbbf24',
  				'500': '#f59e0b',
  				'600': '#d97706',
  				'700': '#b45309',
  				'800': '#92400e',
  				'900': '#78350f',
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
  			},
  			cta: {
  				'50': '#fffbeb',
  				'100': '#fef3c7',
  				'200': '#fde68a',
  				'300': '#fcd34d',
  				'400': '#fbbf24',
  				'500': '#f59e0b',
  				'600': '#d97706',
  				'700': '#b45309',
  				'800': '#92400e',
  				'900': '#78350f',
  				DEFAULT: 'hsl(var(--cta))',
  				foreground: 'hsl(var(--cta-foreground))'
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
  				'var(--font-heading)',
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
  				'clamp(0.75rem, 0.725rem + 0.125vw, 0.8125rem)',
  				{
  					lineHeight: '1.5',
  					letterSpacing: '0.01em'
  				}
  			],
  			sm: [
  				'clamp(0.875rem, 0.85rem + 0.125vw, 0.9375rem)',
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
  				'clamp(1.875rem, 1.5rem + 1vw, 2.5rem)',
  				{
  					lineHeight: '1.2',
  					letterSpacing: '-0.03em'
  				}
  			],
  			'5xl': [
  				'clamp(2.5rem, 2rem + 1.5vw, 3rem)',
  				{
  					lineHeight: '1.1',
  					letterSpacing: '-0.03em'
  				}
  			],
  			'6xl': [
  				'clamp(3rem, 2.5rem + 1.5vw, 3.5rem)',
  				{
  					lineHeight: '1.1',
  					letterSpacing: '-0.04em'
  				}
  			],
  			hero: [
  				'clamp(1.75rem, 4vw + 1.25rem, 4rem)',
  				{ lineHeight: '1.05', letterSpacing: '-0.03em' }
  			],
  			subhero: [
  				'clamp(1rem, 1.5vw + 0.75rem, 1.5rem)',
  				{ lineHeight: '1.5', letterSpacing: '-0.01em' }
  			]
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		boxShadow: {
  			glow: '0 0 40px rgba(124, 79, 242, 0.3)',
  			'glow-purple': '0 0 40px rgba(124, 79, 242, 0.3)',
  			'glow-cta': '0 0 40px rgba(245, 158, 11, 0.3)'
  		},
  		backgroundImage: {
  			'gradient-hero': 'linear-gradient(135deg, #3f1a87 0%, #5b22c9 50%, #7c4ff2 100%)',
  			'gradient-hero-dark': 'linear-gradient(135deg, #0d0a1a 0%, #1a1033 40%, #2d1b69 100%)',
  			'gradient-feature': 'linear-gradient(180deg, #6c30e8 0%, #7c4ff2 100%)',
  			'gradient-glow': 'radial-gradient(circle at 50% 0%, rgba(124, 79, 242, 0.15) 0%, transparent 70%)',
  			'gradient-cta': 'linear-gradient(to right, #f59e0b, #d97706)',
  			'gradient-tech': 'linear-gradient(to right, #7c4ff2, #9171f8)'
  		},
  		animation: {
  			'fade-in': 'fadeIn 0.5s ease-out',
  			'slide-up': 'slideUp 0.5s ease-out',
  			'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
  			float: 'float 6s ease-in-out infinite',
  			ticker: 'ticker 35s linear infinite',
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out'
  		},
  		keyframes: {
  			ticker: {
  				'0%': { transform: 'translateX(0)' },
  				'100%': { transform: 'translateX(-50%)' }
  			},
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
