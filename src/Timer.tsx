interface TimerProps {
    name: string;
    setName: (name: string) => void;
    duration: number;
    setDuration: (duration: number) => void;
}

export function Timer({ name, setName, duration, setDuration }: TimerProps): preact.JSX.Element {
    return <div className="timer">
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
    </div>
}