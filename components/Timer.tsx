
const Timer = (props:{ secondsElasped: number }) => {
    const secondsElasped = props.secondsElasped || 0;
	return (
		<div
			style={{
				color: "#000000",
				fontSize: 14,
			}}
		>
			{secondsElasped !== undefined ?
				`${Math.floor(secondsElasped / 60)
				.toString()
				.padStart(2, "0")}:${String(Math.round(secondsElasped % 60)).padStart(2,"0")}`
			: "--:--"}
		</div>
	);
};

export default Timer;