interface SegmentProps {
    name: string;
    setName: (name: string) => void;
    duration: number;
    setDuration: (duration: number) => void;
}

export function Segment({ name, setName, duration, setDuration }: SegmentProps): preact.JSX.Element {
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
    </div>
}
