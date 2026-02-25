import { useState, useEffect } from "react";
import axios from "axios";

function App() {
  const [games, setGames] = useState([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    axios.get(`http://localhost:3001/list?search=${query}`)
      .then(res => setGames(res.data));
  }, [query]);

  return (
    <div>
      <h1>Game Search</h1>
      <input
        placeholder="Search games..."
        value={query}
        onChange={e => setQuery(e.target.value)}
      />

      <ul>
        {games.map(g => (
          <li key={g.id}>{g.title}</li>
        ))}
      </ul>
    </div>
  );
}

export default App;
