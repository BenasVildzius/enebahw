import React from 'react';
import './Header.css';
import SearchBar from '../ui/SearchBar';
import logo from '../../assets/icons/eneba.svg';
import ltFlag from '../../assets/icons/lt_flag.svg';
import cart from '../../assets/icons/cart.svg';
import user from '../../assets/icons/user.svg';
import heart from '../../assets/icons/heart.svg';

export default function Header({ query, setQuery, onSearch }) {
	return (
		<header className="site-header">
			<div className="header-inner">
				<div className="header-left">
					<img src={logo} alt="eneba" className="site-logo" />
				</div>

				<div className="header-center">
					<div className="search-wrapper">
						<SearchBar value={query} onChange={e => setQuery(e.target.value)} onSearch={onSearch} />
					</div>

						<div className="header-controls">
							<img src={ltFlag} alt="lt-flag" className="icon icon-globe" />
							<div className="region-text">EU | EUR</div>
						</div>
				</div>

				<div className="header-right">
					<img src={heart} alt="likes" className="icon icon-white" />
					<img src={cart} alt="cart" className="icon icon-white" />
					<img src={user} alt="user" className="icon icon-white" />
				</div>
			</div>
		</header>
	);
}
