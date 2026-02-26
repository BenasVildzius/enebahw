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
			// Coerce response to an array — some edge cases (HTML error pages, objects)
			// can make `res.data` not an array and crash the UI. Log unexpected payloads.
			if (Array.isArray(res.data)) {
				setGames(res.data);
			} else {
				console.error('Unexpected /list response, expected array:', res.data);
				setGames([]);
			}
		} catch (err) {
			console.error(err);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => { fetchList(''); }, []);

	// Live search: debounce input and fetch as user types
	useEffect(() => {
		const t = setTimeout(() => {
			// only run fetch when query has something or when cleared (empty -> fetch all)
			fetchList(q);
		}, 300);
		return () => clearTimeout(t);
	}, [q]);

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
