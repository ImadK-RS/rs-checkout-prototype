import { Pencil } from 'lucide-react'
import type { ReactNode } from 'react'

type Props = {
  step: number
  title: string
  active: boolean
  completed: boolean
  summary?: ReactNode
  onEdit?: () => void
  children?: ReactNode
}

export function CheckoutSection({
  step,
  title,
  active,
  completed,
  summary,
  onEdit,
  children,
}: Props) {
  return (
    <section
      className={`checkout-section ${active ? 'is-active' : ''} ${completed && !active ? 'is-complete' : ''}`}
    >
      <div className="section-heading">
        <h2>
          {step}. {title}
        </h2>
      </div>

      {active && <div className="section-body-wrap step-enter">{children}</div>}

      {!active && completed && summary && (
        <div className="section-summary-card">
          <div className="section-summary-body">{summary}</div>
          {onEdit && (
            <button
              type="button"
              className="icon-btn edit-pencil"
              aria-label={`Edit ${title}`}
              onClick={onEdit}
            >
              <Pencil size={20} strokeWidth={2.25} />
            </button>
          )}
        </div>
      )}
    </section>
  )
}
