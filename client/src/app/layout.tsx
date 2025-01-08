import './globals.css'
import { Inter } from 'next/font/google'
import { ThemeProvider } from "@/components/theme-provider"
import Link from 'next/link'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Estimation Vending Machine',
  description: 'Automated estimation system for Solution Architects',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <body className={`${inter.className} min-h-screen bg-background antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <div className="relative min-h-screen bg-[#0A0A0B] overflow-hidden">
            {/* Subtle dot matrix pattern */}
            <div className="absolute inset-0 bg-[radial-gradient(#ffffff15_1px,transparent_1px)] [background-size:32px_32px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,black_70%,transparent_100%)]" />
            
            {/* Gradient overlays */}
            <div className="absolute inset-0 bg-gradient-to-tr from-background via-background/95 to-background/90" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_50%_200px,#1E293B40,transparent)]" />
            
            {/* Enterprise corner accents */}
            <div className="absolute top-0 right-0 w-[1000px] h-[300px] bg-primary/5 blur-[100px] -z-10" />
            <div className="absolute bottom-0 left-0 w-[1000px] h-[300px] bg-primary/5 blur-[100px] -z-10" />
            
            {/* Enterprise geometric accents */}
            <div className="absolute top-20 left-10 w-[300px] h-[300px] bg-[radial-gradient(circle_at_center,#1E293B20_0%,transparent_70%)] -z-10" />
            <div className="absolute bottom-20 right-10 w-[300px] h-[300px] bg-[radial-gradient(circle_at_center,#1E293B20_0%,transparent_70%)] -z-10" />
            
            {/* Subtle top accent bar */}
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
            
            <div className="relative">
              <div className="container mx-auto py-8 px-4">
                {/* Admin Button */}
                <div className="absolute top-4 right-4 z-50">
                  <Link 
                    href="/admin" 
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
                  >
                    Admin Panel
                  </Link>
                </div>
                
                <header className="relative mb-12 text-center">
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-32 h-32 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
                  <h1 className="relative text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/80 mt-8 mb-3">
                    Estimation Vending Machine
                  </h1>
                  <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                    Streamlined estimation process for Solution Architects. Select your requirements and get instant estimates.
                  </p>
                </header>
                <main className="relative">
                  {/* Enterprise section divider */}
                  <div className="absolute -top-6 inset-x-0 h-px bg-gradient-to-r from-transparent via-border/50 to-transparent" />
                  {children}
                </main>
              </div>
            </div>
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
