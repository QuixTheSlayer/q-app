import {
	Chart as ChartJS,
	ArcElement,
	BarElement,
	CategoryScale,
	LinearScale,
	LineElement,
	PointElement,
	Legend,
	Tooltip,
} from "chart.js";
import { ChartNode } from "@/types/node.type";

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, LineElement, PointElement, Legend, Tooltip);

export { ChartJS };

/**
 * Builds the react-chartjs-2 `data`/`options` pair shared by the editor and
 * production render paths, so both stay in sync with a single source of
 * truth for how a ChartNode's fields map to Chart.js config.
 */
export function buildChartConfig(node: ChartNode) {
	const data = {
		labels: node.labels,
		datasets: node.datasets.map((dataset) => ({
			label: dataset.label,
			data: dataset.data,
			backgroundColor: dataset.backgroundColor,
			borderColor: dataset.borderColor,
			borderWidth: dataset.borderWidth,
		})),
	};

	const options = {
		responsive: true,
		maintainAspectRatio: false,
		plugins: {
			legend: {
				display: node.showLegend,
				position: node.legendPosition,
			},
		},
	};

	return { data, options };
}
