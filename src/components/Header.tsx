import { Lock } from 'lucide-react'

export function Header() {
  return (
    <header className="site-header">
      <div className="site-header-inner">
        <div className="brand">
          <p className="logo" aria-label="richersounds">
            <span>richer</span>
            <span className="logo-accent">sounds</span>
          </p>
          <p className="tagline">Experience Better</p>
        </div>

        <div className="header-help">
          <p className="help-title">
            Need help? <strong>0333 900 0093</strong>
          </p>
          <p className="help-hours">
            Mon–Fri 9am–6pm · Sat 10am–5pm · Sun 11am–4pm
          </p>
          <p className="secure-note">
            <Lock size={14} strokeWidth={2} aria-hidden />
            richersounds.com is secure and your personal details are protected.
          </p>
        </div>
      </div>
    </header>
  )
}
