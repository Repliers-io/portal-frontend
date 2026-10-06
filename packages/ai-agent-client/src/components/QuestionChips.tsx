import { type QuestionOption } from '../config/questions'

interface QuestionChipsProps {
  options: QuestionOption[]
  onQuestionSelect: (option: QuestionOption) => void
}

export function QuestionChips({
  options,
  onQuestionSelect
}: QuestionChipsProps) {
  if (!options || options.length === 0) return null

  return (
    <div
      style={{
        zIndex: 1000,
        gap: '0.5rem',
        top: '0.5rem',
        left: '0.5rem',
        right: '0.5rem',
        display: 'flex',
        flexWrap: 'wrap',
        position: 'absolute',
        justifyContent: 'center'
      }}
    >
      {options.map((option, index) => (
        <button
          key={index}
          onClick={() => onQuestionSelect(option)}
          style={{
            border: 'none',
            color: '#fff',
            fontSize: '0.8rem',
            cursor: 'pointer',
            borderRadius: '25px',
            padding: '0.5rem 0.8rem',
            transition: 'transform 0.2s ease',
            backdropFilter: 'blur(12px)',
            background: 'rgba(0,0,0, 0.15)',
            boxShadow:
              '0 8px 20px rgba(0, 0, 0, 0.08), 0 2px 6px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)'
          }}
        >
          {option.message}
        </button>
      ))}
    </div>
  )
}
