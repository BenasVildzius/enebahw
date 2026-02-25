import React from 'react';
import GameCard from './GameCard';
import './GameGrid.css';

export default function GameGrid({ games = [] }) {
	return (
		<section className="game-grid">
			{games.map(g => (
				<GameCard key={g.id || g.name} game={g} />
			))}
		</section>
	);
}
