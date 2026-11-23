interface FixedWidthNumberProps {
	value: number;
	decimals?: number;
}

// Each character sits in its own fixed-width cell so the number doesn't
// jitter as digits change (Orbitron's digits are proportional, e.g. "1" is
// much narrower than "0").
export function FixedWidthNumber({ value, decimals = 2 }: FixedWidthNumberProps): preact.JSX.Element {
	return <div className="fixed-width-number">
		{value.toFixed(decimals).split('').map((char, i) =>
			<span key={i} className={char === '.' ? 'decimal' : 'digit'}>{char}</span>
		)}
	</div>;
}
