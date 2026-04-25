/**
 * Color picker component for service identification
 */
import { SERVICE_COLORS } from '../constants';

export function ColorPicker({ value, onChange }) {
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 4 }}>
      {SERVICE_COLORS.map(c => (
        <button
          key={c}
          type="button"
          onClick={() => onChange(c)}
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: c,
            border: value === c ? '3px solid var(--text)' : '2px solid transparent',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          title={c}
        />
      ))}
    </div>
  );
}

export default ColorPicker;
