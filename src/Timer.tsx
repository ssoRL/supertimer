interface TimerProps {
    name: string;
    setName: (name: string) => void;
    duration: number;
    setDuration: (duration: number) => void;
    progress: number | null;
    disabled?: boolean;
}

export function Timer({ name, setName, duration, setDuration, progress, disabled }: TimerProps): preact.JSX.Element {
    if (progress !== null) {
        return <div className="timer">
            {name}: {Math.round(progress)}s / {duration}s
        </div>;
    }
    return <div className="timer">
        <input
            type="text"
            value={name}
            onInput={e => setName(e.currentTarget.value)}
            disabled={disabled}
        />
        <input
            type="number"
            value={duration}
            onInput={e => setDuration(Number(e.currentTarget.value))}
            disabled={disabled}
        />
    </div>
}