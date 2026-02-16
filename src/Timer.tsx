interface TimerProps {
    duration: number;
    setDuration: (duration: number) => void;
    progress: number | null;
    disabled?: boolean;
}

export function Timer({ duration, setDuration, progress, disabled }: TimerProps): preact.JSX.Element {
    if (progress !== null) {
        return <div>
            {Math.round(progress)}s / {duration}s
        </div>;
    }
    return <div>
        <input
            type="number"
            value={duration}
            onInput={e => setDuration(Number(e.currentTarget.value))}
            disabled={disabled}
        />
    </div>
}