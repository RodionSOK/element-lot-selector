import { useApi } from '../../api/TransportContext'
import { cn } from '../../lib/cn'
import './TransportSwitcher.css'

export function TransportSwitcher() {
  const { transport, setTransport } = useApi()

  return (
    <div className="transport-switcher">
      {(['rest', 'rpc'] as const).map((option) => (
        <button
          key={option}
          onClick={() => setTransport(option)}
          className={cn(
            'transport-switcher__option',
            transport === option && 'transport-switcher__option--active',
          )}
        >
          {option === 'rest' ? 'REST' : 'JSON-RPC'}
        </button>
      ))}
    </div>
  )
}
