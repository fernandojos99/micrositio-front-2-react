/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
  	extend: {
  		colors: {
  			background: 'hsl(var(--background))',
  			theme: {
  				bg: {
  					primary: 'var(--theme-bg-primary)',
  					secondary: 'var(--theme-bg-secondary)',
  					tertiary: 'var(--theme-bg-tertiary)',
  				},
  				text: {
  					primary: 'var(--theme-text-primary)',
  					secondary: 'var(--theme-text-secondary)',
  					tertiary: 'var(--theme-text-tertiary)',
  					muted: 'var(--theme-text-muted)',
  				},
  				border: 'var(--theme-border)',
  				'border-hover': 'var(--theme-border-hover)',
  				accent: 'var(--theme-accent)',
  				'accent-2': 'var(--theme-accent-2)',
  				'accent-foreground': 'var(--theme-accent-foreground)',
  				'accent-soft': 'var(--theme-accent-soft)',
					success: 'var(--theme-success)',
					'success-soft': 'var(--theme-success-soft)',
					warning: 'var(--theme-warning)',
					'warning-soft': 'var(--theme-warning-soft)',
					danger: 'var(--theme-danger)',
					'danger-soft': 'var(--theme-danger-soft)',
					info: 'var(--theme-info)',
					'info-soft': 'var(--theme-info-soft)',
  			},
  			primary: {
  				purple: '#864080',
  				yellow: '#FFD00F',
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				purple: '#9336FF',
  				red: '#802D4A',
  				orange: '#FF5822',
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			tertiary: {
  				green: '#AFD136'
  			},
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		animation: {
  			'bounce-slow': 'bounce 3s infinite',
  			'bounce-medium': 'bounce 2s infinite',
  			'bounce-fast': 'bounce 1s infinite'
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
};