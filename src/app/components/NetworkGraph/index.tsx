import ForceGraph2D from 'react-force-graph-2d';
import { Person } from '@/app/types';

interface NetworkGraphProps {
	data: Person[];
	myUserId: string;
}

const NetworkGraph: React.FC<NetworkGraphProps> = ({ data, myUserId }) => {
	const exploreFriends = (userId: string, visitedNodes: Set<string>, links: { source: string; target: string; }[], depth: number) => {
		if (visitedNodes.has(userId) || depth <= 0) {
			return;
		}

		visitedNodes.add(userId);

		const user = data.find(person => person.id === userId);

		if (user) {
			user.friends.forEach((friendId) => {
				links.push({ source: userId, target: friendId });
				exploreFriends(friendId, visitedNodes, links, depth - 1);
			});
		}
	};

	const getLinks = (data: Person[], myUserId: string) => {
		const links: { source: string; target: string; }[] = [];
		const visitedNodes = new Set<string>();

		exploreFriends(myUserId, visitedNodes, links, 2);

		const filteredData = data.filter(person => visitedNodes.has(person.id) || links.some(link => link.target === person.id));

		return { links, filteredData };
	};

	const { links, filteredData } = getLinks(data, myUserId);

	return (
		<div className="border-2">
			<ForceGraph2D
				graphData={{nodes: filteredData, links}}
				nodeCanvasObject={(node, ctx, globalScale) => {
					if (!node) return;
					const label = (node as Person)?.forename || 'Unknown';
					const fontSize = 12 / globalScale;
					ctx.font = `${fontSize}px Sans-Serif`;
					ctx.fillStyle = 'black';
					if (node.x !== undefined && node.y !== undefined) {
						ctx.fillText(label, node.x, node.y);
					}
				}}
			/>
		</div>
	);
};

export default NetworkGraph;
