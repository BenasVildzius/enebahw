import React from 'react';
import './SearchBar.css';

export default function SearchBar({ value = '', onChange = () => {}, onSearch = () => {} }) {
	return (
		<form className="searchbar" onSubmit={e => { e.preventDefault(); onSearch(e); }}>
			<span className="search-icon" aria-hidden>
				<img src="/src/assets/icons/search.svg" alt="search" className="icon icon-white search-icon-img" />
			</span>
			<input
				className="search-input"
				placeholder="Search games, titles, stores..."
				value={value}
				onChange={onChange}
			/>

			{value && (
				<button type="button" className="clear-btn" aria-label="clear" onClick={() => onChange({ target: { value: '' } })}>
					<svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
				</button>
			)}

		</form>
	);
}
