const fixedWidthStyle: preact.JSX.CSSProperties = {
	textTransform: 'full-width',
	letterSpacing: '-25%',
};

interface FixedWidthNumberProps {
	value: number;
}

export function FixedWidthNumber({ value }: FixedWidthNumberProps): preact.JSX.Element {
	const [beforeDecimal, afterDecimal] = value.toFixed(2).split('.');

	return <div className="fixed-width-number">
		<span className="number" style={fixedWidthStyle}>{beforeDecimal}</span>
		<span className="decimal">.</span>
		<span className="number" style={fixedWidthStyle}>{afterDecimal}</span>
	</div>;
}
