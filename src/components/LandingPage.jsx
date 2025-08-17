
import React, { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useTheme } from '../contexts/ThemeContext'
import Chart from 'chart.js/auto'

function LandingPage() {
  const { theme, toggleTheme } = useTheme()
  const heroChartRef = useRef(null)
  const roiChartRef = useRef(null)

  useEffect(() => {
    // Hero Chart
    if (heroChartRef.current) {
      const ctx = heroChartRef.current.getContext('2d')
      const randomWalk = (n = 50, start = 68000) => {
        const d = [start]
        for (let i = 1; i < n; i++) {
          d.push(d[i - 1] + (Math.random() - 0.5) * 120)
        }
        return d
      }

      new Chart(ctx, {
        type: 'line',
        data: {
          labels: Array.from({ length: 60 }, (_, i) => i),
          datasets: [{
            data: randomWalk(60, 68300),
            tension: 0.35,
            fill: true,
            borderWidth: 2,
            pointRadius: 0,
            borderColor: 'rgba(10,132,255,1)',
            backgroundColor: 'rgba(10,132,255,.12)'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false }, tooltip: { enabled: false } },
          scales: {
            x: { display: false },
            y: { display: false }
          },
          animation: { duration: 1500 }
        }
      })
    }

    // ROI Chart
    if (roiChartRef.current) {
      const ctx = roiChartRef.current.getContext('2d')
      new Chart(ctx, {
        type: 'line',
        data: {
          labels: Array.from({ length: 24 }, (_, i) => `M${i + 1}`),
          datasets: [{
            label: 'Projected',
            data: Array.from({ length: 24 }, (_, i) => 1000 * Math.pow(1.08, i / 12) + 200 * i),
            borderColor: 'rgba(16,185,129,1)',
            backgroundColor: 'rgba(16,185,129,.12)',
            tension: 0.35,
            pointRadius: 0,
            fill: true
          }]
        },
        options: {
          responsive: true,
          plugins: { legend: { display: false } },
          scales: {
            x: { ticks: { color: '#9CA3AF' } },
            y: { ticks: { color: '#9CA3AF' } }
          }
        }
      })
    }
  }, [])

  return (
    <div className="bg-white text-gray-900 dark:bg-[#0A0F1A] dark:text-gray-100">
      {/* Navigation */}
      <nav className="fixed top-0 inset-x-0 z-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mt-4 mb-3 glass rounded-2xl shadow-glow">
            <div className="flex h-16 items-center justify-between px-4">
              <Link to="/" className="flex items-center gap-3">
                <svg className="w-9 h-9" viewBox="0 0 64 64" fill="none">
                  <circle cx="32" cy="32" r="28" fill="#0A84FF" opacity=".14"/>
                  <path d="M16 34c8-6 14-14 16-24 2 10 8 18 16 24-8 6-14 14-16 24-2-10-8-18-16-24z" fill="#10B981"/>
                  <path d="M24 24h16M20 32h24M24 40h16" stroke="#0A84FF" strokeWidth="2.5" strokeLinecap="round"/>
                </svg>
                <span className="text-lg sm:text-xl font-extrabold tracking-tight">
                  <span className="text-brand-500">CRYPTO</span> TRADE <span className="text-emerald-500">PRO</span>
                </span>
              </Link>

              <div className="hidden md:flex items-center gap-8">
                <a href="#features" className="hover:text-brand-500 transition">Features</a>
                <a href="#trading" className="hover:text-brand-500 transition">Trading</a>
                <a href="#pricing" className="hover:text-brand-500 transition">Pricing</a>
                <a href="#faq" className="hover:text-brand-500 transition">FAQ</a>
              </div>

              <div className="flex items-center gap-3">
                <Link to="/auth/login" className="px-4 py-2 rounded-lg border border-brand-500 text-brand-600 hover:bg-brand-500 hover:text-white transition font-medium">
                  User Login
                </Link>
                <Link to="/admin/login" className="px-4 py-2 rounded-lg bg-brand-500 text-white hover:bg-brand-600 transition font-semibold">
                  Admin Access
                </Link>
                <button 
                  onClick={toggleTheme}
                  className="ml-1 p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5"
                >
                  {theme === 'dark' ? '☀️' : '🌙'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="pt-36 pb-20 hero-gradient relative overflow-hidden">
        <div className="pointer-events-none absolute -top-20 -right-24 w-[38rem] h-[38rem] rounded-full bg-brand-500/20 blur-3xl animate-blob"></div>
        <div className="pointer-events-none absolute top-40 -left-20 w-[28rem] h-[28rem] rounded-full bg-emerald-500/20 blur-3xl animate-blob" style={{animationDelay: '6s'}}></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-6">
              <p className="inline-flex items-center gap-2 text-xs font-semibold tracking-wide uppercase px-3 py-1 rounded-full glass">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Live Markets • 24/7
              </p>
              <h1 className="mt-5 text-4xl sm:text-5xl font-extrabold leading-tight">
                Trade smarter. <span className="text-brand-500">Invest</span> confidently.
              </h1>
              <p className="mt-4 text-lg text-gray-600 dark:text-gray-300 max-w-xl">
                Professional cryptocurrency trading platform with real-time data, advanced analytics, and secure simulation environment.
              </p>

              <div className="mt-7 flex flex-col sm:flex-row gap-3">
                <Link to="/auth/register" className="px-6 py-3 rounded-xl bg-brand-500 text-white hover:bg-brand-600 transition shadow-glow font-semibold">
                  Start Trading Free
                </Link>
                <a href="#features" className="px-6 py-3 rounded-xl border border-brand-500 text-brand-600 hover:bg-brand-50 dark:hover:bg-white/5 transition font-semibold">
                  Explore Features
                </a>
              </div>

              <dl className="mt-10 grid grid-cols-3 gap-5">
                <div className="glass rounded-xl p-4 text-center">
                  <dt className="text-xs uppercase tracking-wider text-gray-500">Active Traders</dt>
                  <dd className="mt-2 text-2xl font-extrabold">15,420</dd>
                </div>
                <div className="glass rounded-xl p-4 text-center">
                  <dt className="text-xs uppercase tracking-wider text-gray-500">Crypto Pairs</dt>
                  <dd className="mt-2 text-2xl font-extrabold">150+</dd>
                </div>
                <div className="glass rounded-xl p-4 text-center">
                  <dt className="text-xs uppercase tracking-wider text-gray-500">Uptime</dt>
                  <dd className="mt-2 text-2xl font-extrabold">99.99%</dd>
                </div>
              </dl>
            </div>

            <div className="lg:col-span-6">
              <div className="relative">
                <div className="absolute -top-6 right-6 w-12 h-12 rounded-full bg-gradient-to-br from-brand-500 to-emerald-500 animate-float-slow shadow-glow"></div>

                <div className="glass rounded-3xl p-4 shadow-glow">
                  <div className="grid sm:grid-cols-5 gap-3">
                    <div className="sm:col-span-2 bg-black/5 dark:bg-white/5 rounded-2xl p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">Order Book</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400">BTC/USDT</span>
                      </div>
                      <div className="mt-2 space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-red-400">68,320</span><span>0.512</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-red-400">68,310</span><span>0.884</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-emerald-400">68,340</span><span>0.213</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-emerald-400">68,355</span><span>1.003</span>
                        </div>
                      </div>
                    </div>

                    <div className="sm:col-span-3 bg-white dark:bg-[#0B1324] rounded-2xl p-3 border border-black/5 dark:border-white/5">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-xs font-semibold">BTC/USDT</div>
                        <div className="text-xs text-gray-500">1h</div>
                      </div>
                      <canvas ref={heroChartRef} height="160"></canvas>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Crypto Ticker */}
      <section className="py-3 border-y border-black/5 dark:border-white/5 bg-white/60 dark:bg-white/5 backdrop-blur">
        <div className="max-w-7xl mx-auto overflow-hidden px-4">
          <div className="flex gap-8 animate-marquee whitespace-nowrap text-sm font-medium">
            <div className="flex items-center gap-2"><span className="text-gray-500">BTC</span><span>$68,355</span><span className="text-emerald-500">+1.2%</span></div>
            <div className="flex items-center gap-2"><span className="text-gray-500">ETH</span><span>$3,210</span><span className="text-red-500">-0.4%</span></div>
            <div className="flex items-center gap-2"><span className="text-gray-500">SOL</span><span>$182.4</span><span className="text-emerald-500">+2.1%</span></div>
            <div className="flex items-center gap-2"><span className="text-gray-500">XRP</span><span>$0.62</span><span className="text-emerald-500">+0.7%</span></div>
            <div className="flex items-center gap-2"><span className="text-gray-500">BNB</span><span>$598.3</span><span className="text-emerald-500">+0.9%</span></div>
            <div className="flex items-center gap-2"><span className="text-gray-500">ADA</span><span>$0.52</span><span className="text-red-500">-0.3%</span></div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-extrabold">Professional Trading Tools</h2>
            <p className="mt-3 text-gray-600 dark:text-gray-300">Advanced features for both simulation and real-world trading experience.</p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <article className="group rounded-2xl p-6 border border-black/5 dark:border-white/5 bg-white/60 dark:bg-white/5 backdrop-blur hover:shadow-glow transition">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-500 to-emerald-500 text-white grid place-items-center shadow-glow">📊</div>
              <h3 className="mt-4 font-semibold text-xl">Real‑Time Data</h3>
              <p className="mt-2 text-gray-600 dark:text-gray-300">Live cryptocurrency prices, charts, and market depth with millisecond updates.</p>
            </article>

            <article className="group rounded-2xl p-6 border border-black/5 dark:border-white/5 bg-white/60 dark:bg-white/5 backdrop-blur hover:shadow-glow transition">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-500 to-emerald-500 text-white grid place-items-center shadow-glow">🔐</div>
              <h3 className="mt-4 font-semibold text-xl">Secure Environment</h3>
              <p className="mt-2 text-gray-600 dark:text-gray-300">Safe simulation environment with separate user and admin authentication systems.</p>
            </article>

            <article className="group rounded-2xl p-6 border border-black/5 dark:border-white/5 bg-white/60 dark:bg-white/5 backdrop-blur hover:shadow-glow transition">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-500 to-emerald-500 text-white grid place-items-center shadow-glow">⚡</div>
              <h3 className="mt-4 font-semibold text-xl">Futures Trading</h3>
              <p className="mt-2 text-gray-600 dark:text-gray-300">Advanced futures contracts with leverage and margin trading capabilities.</p>
            </article>

            <article className="group rounded-2xl p-6 border border-black/5 dark:border-white/5 bg-white/60 dark:bg-white/5 backdrop-blur hover:shadow-glow transition">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-500 to-emerald-500 text-white grid place-items-center shadow-glow">📰</div>
              <h3 className="mt-4 font-semibold text-xl">Market News</h3>
              <p className="mt-2 text-gray-600 dark:text-gray-300">Curated cryptocurrency news and market analysis to inform your trading decisions.</p>
            </article>

            <article className="group rounded-2xl p-6 border border-black/5 dark:border-white/5 bg-white/60 dark:bg-white/5 backdrop-blur hover:shadow-glow transition">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-500 to-emerald-500 text-white grid place-items-center shadow-glow">🛠️</div>
              <h3 className="mt-4 font-semibold text-xl">Admin Control</h3>
              <p className="mt-2 text-gray-600 dark:text-gray-300">Comprehensive admin panel for user management, balance control, and platform oversight.</p>
            </article>

            <article className="group rounded-2xl p-6 border border-black/5 dark:border-white/5 bg-white/60 dark:bg-white/5 backdrop-blur hover:shadow-glow transition">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-500 to-emerald-500 text-white grid place-items-center shadow-glow">📱</div>
              <h3 className="mt-4 font-semibold text-xl">Responsive Design</h3>
              <p className="mt-2 text-gray-600 dark:text-gray-300">Mobile-first design with dark/light theme support for trading on any device.</p>
            </article>
          </div>
        </div>
      </section>

      {/* Portfolio Growth Section */}
      <section id="trading" className="py-20 bg-gradient-to-b from-white to-brand-50/40 dark:from-[#0A0F1A] dark:to-[#0B1324]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-extrabold">Simulate professional trading</h2>
              <p className="mt-3 text-gray-600 dark:text-gray-300">
                Practice with realistic market conditions and virtual balances before risking real capital.
              </p>

              <div className="mt-8 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white text-sm font-bold">✓</div>
                  <span>$10,000 virtual starting balance</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white text-sm font-bold">✓</div>
                  <span>Real-time market data integration</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white text-sm font-bold">✓</div>
                  <span>Risk-free learning environment</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white text-sm font-bold">✓</div>
                  <span>Advanced order types and analytics</span>
                </div>
              </div>

              <Link to="/auth/register" className="mt-6 inline-block px-6 py-3 rounded-xl bg-emerald-500 text-white hover:bg-emerald-600 transition font-semibold">
                Start Trading Simulation
              </Link>
            </div>

            <div className="bg-white dark:bg-[#0B1324] border border-black/5 dark:border-white/5 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold">Portfolio Performance</span>
                <span className="text-sm text-emerald-400">+24.5%</span>
              </div>
              <canvas ref={roiChartRef} height="220"></canvas>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold">Choose your trading plan</h2>
          <p className="mt-2 text-gray-600 dark:text-gray-300">Start free and upgrade when you're ready for advanced features.</p>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-2xl border border-black/5 dark:border-white/5 p-6">
              <h3 className="font-semibold text-lg">Beginner</h3>
              <p className="mt-1 text-sm text-gray-500">Perfect for learning and simulation</p>
              <div className="mt-5 text-4xl font-extrabold">Free</div>
              <ul className="mt-5 space-y-2 text-sm text-gray-600 dark:text-gray-300 text-left">
                <li>• $10,000 virtual balance</li>
                <li>• Basic market data</li>
                <li>• 5 crypto pairs</li>
                <li>• Community support</li>
              </ul>
              <Link to="/auth/register" className="mt-6 inline-block w-full px-4 py-2 rounded-lg bg-brand-500 text-white hover:bg-brand-600">
                Get Started
              </Link>
            </div>

            <div className="rounded-2xl border-2 border-brand-500 p-6 shadow-glow">
              <h3 className="font-semibold text-lg">Pro Trader</h3>
              <p className="mt-1 text-sm text-gray-500">Advanced features for serious traders</p>
              <div className="mt-5 text-4xl font-extrabold">$29<span className="text-base font-bold">/mo</span></div>
              <ul className="mt-5 space-y-2 text-sm text-gray-600 dark:text-gray-300 text-left">
                <li>• Unlimited virtual balance</li>
                <li>• Real-time market data</li>
                <li>• 150+ crypto pairs</li>
                <li>• Advanced analytics</li>
                <li>• Priority support</li>
              </ul>
              <Link to="/auth/register" className="mt-6 inline-block w-full px-4 py-2 rounded-lg bg-brand-500 text-white hover:bg-brand-600">
                Upgrade to Pro
              </Link>
            </div>

            <div className="rounded-2xl border border-black/5 dark:border-white/5 p-6">
              <h3 className="font-semibold text-lg">Enterprise</h3>
              <p className="mt-1 text-sm text-gray-500">Custom solutions for institutions</p>
              <div className="mt-5 text-4xl font-extrabold">Custom</div>
              <ul className="mt-5 space-y-2 text-sm text-gray-600 dark:text-gray-300 text-left">
                <li>• Custom integration</li>
                <li>• Dedicated support</li>
                <li>• White-label options</li>
                <li>• Admin management tools</li>
              </ul>
              <a href="#contact" className="mt-6 inline-block w-full px-4 py-2 rounded-lg border border-brand-500 text-brand-600 hover:bg-brand-50 dark:hover:bg-white/5">
                Contact Sales
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-16">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-3xl font-extrabold text-center">Frequently Asked Questions</h2>
          <div className="mt-8 space-y-4">
            <details className="group rounded-xl border border-black/5 dark:border-white/5 p-4">
              <summary className="cursor-pointer font-semibold">Is this a real cryptocurrency exchange?</summary>
              <p className="mt-2 text-gray-600 dark:text-gray-300">CryptoTrade Pro is a simulation platform designed for learning and practice. All trading is done with virtual balances in a risk-free environment.</p>
            </details>
            <details className="group rounded-xl border border-black/5 dark:border-white/5 p-4">
              <summary className="cursor-pointer font-semibold">How does the admin system work?</summary>
              <p className="mt-2 text-gray-600 dark:text-gray-300">Admins have separate authentication and can manage users, adjust balances, post announcements, and monitor platform analytics without users being aware of the simulation nature.</p>
            </details>
            <details className="group rounded-xl border border-black/5 dark:border-white/5 p-4">
              <summary className="cursor-pointer font-semibold">Can I withdraw my virtual profits?</summary>
              <p className="mt-2 text-gray-600 dark:text-gray-300">No, withdrawals are disabled as this is a simulation environment. The platform is designed for learning and practicing trading strategies.</p>
            </details>
            <details className="group rounded-xl border border-black/5 dark:border-white/5 p-4">
              <summary className="cursor-pointer font-semibold">Is the market data real?</summary>
              <p className="mt-2 text-gray-600 dark:text-gray-300">Yes, we integrate with real cryptocurrency market data APIs to provide authentic price movements and trading conditions.</p>
            </details>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-black/5 dark:border-white/5 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2">
                <svg className="w-8 h-8" viewBox="0 0 64 64" fill="none">
                  <circle cx="32" cy="32" r="28" fill="#0A84FF" opacity=".14"/>
                  <path d="M16 34c8-6 14-14 16-24 2 10 8 18 16 24-8 6-14 14-16 24-2-10-8-18-16-24z" fill="#10B981"/>
                </svg>
                <span className="font-extrabold">CRYPTOTRADE PRO</span>
              </div>
              <p className="mt-3 text-sm text-gray-500">Professional crypto trading simulation platform.</p>
            </div>
            <div>
              <h4 className="font-semibold">Platform</h4>
              <ul className="mt-3 space-y-2 text-sm text-gray-600 dark:text-gray-300">
                <li><a href="#features" className="hover:text-brand-500">Features</a></li>
                <li><a href="#pricing" className="hover:text-brand-500">Pricing</a></li>
                <li><a href="#" className="hover:text-brand-500">API</a></li>
                <li><a href="#" className="hover:text-brand-500">Documentation</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold">Company</h4>
              <ul className="mt-3 space-y-2 text-sm text-gray-600 dark:text-gray-300">
                <li><a href="#" className="hover:text-brand-500">About</a></li>
                <li><a href="#" className="hover:text-brand-500">Blog</a></li>
                <li><a href="#" className="hover:text-brand-500">Careers</a></li>
                <li><a href="#" className="hover:text-brand-500">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold">Legal</h4>
              <ul className="mt-3 space-y-2 text-sm text-gray-600 dark:text-gray-300">
                <li><a href="#" className="hover:text-brand-500">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-brand-500">Terms of Service</a></li>
                <li><a href="#" className="hover:text-brand-500">Disclaimer</a></li>
              </ul>
            </div>
          </div>
          <p className="mt-10 text-xs text-gray-500">&copy; {new Date().getFullYear()} CryptoTrade Pro. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage
