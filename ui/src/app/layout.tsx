import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Backbone - NFT Reward System Builder',
  description: 'Production-ready NFT reward distribution system for Chia blockchain',
  keywords: ['chia', 'nft', 'reward', 'distribution', 'blockchain', 'merkle', 'trustless'],
  authors: [{ name: 'FlipThisCrypto' }],
  openGraph: {
    title: 'Backbone - NFT Reward System Builder',
    description: 'Build trustless NFT reward distribution systems on Chia',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-gradient-to-br from-backbone-50 to-backbone-100">
          <header className="border-b border-backbone-200 bg-white/80 backdrop-blur-sm">
            <div className="container mx-auto px-4 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-backbone-500 to-backbone-700 flex items-center justify-center">
                    <span className="text-white font-bold text-sm">B</span>
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-backbone-900">Backbone</h1>
                    <p className="text-sm text-backbone-600">NFT Reward System Builder</p>
                  </div>
                </div>
                <div className="text-sm text-backbone-600">
                  Production-Ready • Trustless • Scalable
                </div>
              </div>
            </div>
          </header>
          <main className="container mx-auto px-4 py-8">
            {children}
          </main>
          <footer className="border-t border-backbone-200 bg-white/50 mt-16">
            <div className="container mx-auto px-4 py-6 text-center text-sm text-backbone-600">
              <p>Built by <a href="https://github.com/FlipThisCrypto" className="font-medium hover:text-backbone-700">FlipThisCrypto</a> • Open Source • MIT License</p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  )
}