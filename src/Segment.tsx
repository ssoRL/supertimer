interface SegmentProps {
    name: string;
    setName: (name: string) => void;
    duration: number;
    setDuration: (duration: number) => void;
    /** Omit to hide the delete button. */
    onDelete?: () => void;
}

export function Segment({ name, setName, duration, setDuration, onDelete }: SegmentProps): preact.JSX.Element {
    return <div className="segment">
        <input
            type="text"
            value={name}
            onInput={e => setName(e.currentTarget.value)}
        />
        <input
            type="number"
            value={duration}
            onInput={e => setDuration(Number(e.currentTarget.value))}
        />
        <button
            className="delete-segment"
            title={`Delete ${name}`}
            aria-label={`Delete ${name}`}
            onClick={onDelete}
            style={{ visibility: onDelete ? 'visible' : 'hidden' }}
        >
            ×
        </button>
    </div>
}
