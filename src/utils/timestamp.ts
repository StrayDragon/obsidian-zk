function pad2(value: number): string {
	return value.toString().padStart(2, "0");
}

export function formatLocalTimestamp(date: Date = new Date()): string {
	const yyyy = date.getFullYear();
	const mm = pad2(date.getMonth() + 1);
	const dd = pad2(date.getDate());
	const hh = pad2(date.getHours());
	const min = pad2(date.getMinutes());
	const sec = pad2(date.getSeconds());
	return `${yyyy}${mm}${dd}${hh}${min}${sec}`;
}

