interface TimerProps {
    duration: number;
    setDuration: (duration: number) => void;
    remainder: number | null;
}

export function Timer({ duration, setDuration, remainder }: TimerProps): preact.JSX.Element {
    return <div>
        <input
            type="number"
            value={duration}
            onInput={e => setDuration(Number(e.currentTarget.value))}
        />
    </div>
}