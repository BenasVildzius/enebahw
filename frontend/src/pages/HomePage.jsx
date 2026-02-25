import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Header from '../components/layout/Header';
import GameGrid from '../components/game/GameGrid';

const API_BASE = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE || 'http://localhost:4000';

export default function HomePage() {
	const [q, setQ] = useState('');
	const [games, setGames] = useState([]);
	const [loading, setLoading] = useState(false);

	const fetchList = async (search) => {
		setLoading(true);
		try {
			const url = search ? `${API_BASE}/list?search=${encodeURIComponent(search)}` : `${API_BASE}/list`;
			const res = await axios.get(url);
			setGames(res.data || []);
		} catch (err) {
			console.error(err);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => { fetchList(''); }, []);

	const onSearch = () => fetchList(q);

	return (
		<div>
			<Header query={q} setQuery={setQ} onSearch={onSearch} />

			<main className="page">
				<div className="results-row" style={{margin:'8px 0 12px 4px', color:'var(--text-light)'}}>
					Results found: {games.length}
				</div>

				{loading ? (
					<div style={{padding:20, color:'#ddd'}}>Loading...</div>
				) : (
					<GameGrid games={games} />
				)}
			</main>
		</div>
	);
}
