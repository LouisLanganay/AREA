/** @type {import('tailwindcss').Config} */
import tailwindcssAnimate from 'tailwindcss-animate';

const config = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: ['selector', "class"],
  theme: {
  	extend: {
  		fontFamily: {
  			sans: [
  				'Poppins',
  				'sans-serif'
  			]
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		scale: {
  			'101': '1.01'
  		},
  		colors: {
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			transparent: '#00000000',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			second: {
  				DEFAULT: 'hsl(var(--second))',
  				foreground: 'hsl(var(--second-foreground))',
  				bis: 'hsl(var(--second-bis))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
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
  			},
  			sidebar: {
  				DEFAULT: 'hsl(var(--sidebar-background))',
  				foreground: 'hsl(var(--sidebar-foreground))',
  				primary: 'hsl(var(--sidebar-primary))',
  				'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
  				accent: 'hsl(var(--sidebar-accent))',
  				'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
  				border: 'hsl(var(--sidebar-border))',
  				ring: 'hsl(var(--sidebar-ring))'
  			},
  			ringWidth: {
  				'1.5': '1.5px'
  			},
  			ringOffsetWidth: {
  				'3': '3px'
  			},
  			success: {
  				DEFAULT: 'hsl(var(--success))',
  				foreground: 'hsl(var(--success-foreground))'
  			},
  			premium: {
  				DEFAULT: 'hsl(var(--premium))',
  				foreground: 'hsl(var(--premium-foreground))',
  				bis: 'hsl(var(--premium-bis))'
  			}
  		},
  		backgroundImage: {
  			'border-gradient-ai': 'linear-gradient(90deg, rgba(56,189,248,0) 0%, hsl(var(--primary)) 32.29%, hsl(var(--second)) 67.19%, rgba(236,72,153,0) 100%)',
  			'text-gradient-ai': 'linear-gradient(90deg, hsl(var(--second)) 10%, hsl(var(--second-bis)) 30%, hsl(var(--primary)) 50%, hsl(var(--second)) 100%)',
  			'gradient-conic': 'conic-gradient(var(--tw-gradient-stops))'
  		},
  		boxShadow: {
  			'inset-sm': 'inset 0 1px 1px rgba(0,0,0,0.1)',
  			'inset-md': 'inset 0 2px 2px rgba(0,0,0,0.1)',
  			'inset-lg': 'inset 0 3px 1px rgba(0,0,0,0.1)'
  		},
  		keyframes: {
  			blob: {
  				'0%': {
  					transform: 'translate(0px, 0px) scale(1)'
  				},
  				'33%': {
  					transform: 'translate(30px, -50px) scale(1.1)'
  				},
  				'66%': {
  					transform: 'translate(-20px, 20px) scale(0.9)'
  				},
  				'100%': {
  					transform: 'translate(0px, 0px) scale(1)'
  				}
  			},
  			blob2: {
  				'0%': {
  					transform: 'translate(0px, 0px) scale(1)'
  				},
  				'20%': {
  					transform: 'translate(-30px, 20px) scale(1.1)'
  				},
  				'40%': {
  					transform: 'translate(15px, -25px) scale(0.95)'
  				},
  				'60%': {
  					transform: 'translate(-20px, -15px) scale(1.05)'
  				},
  				'80%': {
  					transform: 'translate(25px, 30px) scale(0.9)'
  				},
  				'100%': {
  					transform: 'translate(0px, 0px) scale(1)'
  				}
  			},
  			'border-beam': {
  				'100%': {
  					'offset-distance': '100%'
  				}
  			},
  			shine: {
  				'0%': {
  					'background-position': '0% 0%'
  				},
  				'50%': {
  					'background-position': '100% 100%'
  				},
  				to: {
  					'background-position': '0% 0%'
  				}
  			},
  			'border-spin': {
  				'100%': {
  					transform: 'rotate(360deg)'
  				}
  			},
  			'accordion-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			}
  		},
  		animation: {
  			blob: 'blob 7s infinite',
  			blob2: 'blob2 14s infinite',
  			'border-beam': 'border-beam calc(var(--duration)*1s) infinite linear',
  			shine: 'shine var(--duration) infinite linear',
  			'border-spin': 'border-spin 12s linear infinite',
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out'
  		},
  		utilities: {
  			'.animation-delay-2000': {
  				'animation-delay': '2s'
  			}
  		},
  		blur: {
  			'4xl': '64px',
  			'5xl': '80px',
  			'6xl': '96px',
  			'7xl': '128px',
  			'8xl': '160px'
  		}
  	}
  },
  plugins: [tailwindcssAnimate],
};

export default config;
