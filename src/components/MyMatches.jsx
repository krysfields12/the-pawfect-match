import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { auth } from '../firebase';

const MyMatches = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMatches = async () => {
      const user = auth.currentUser;
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const userId = user.uid;
        const response = await axios.get(`http://localhost:8080/api/matches/${userId}`);
        setMatches(response.data);
      } catch (err) {
        console.error('Error fetching matches from backend:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, []);

  if (loading) {
    return <div className="quiz-results"><p>Loading your matches...</p></div>;
  }

  return (
    <div className="matches-page">
      <h2>Your Matches</h2>
      {matches.length > 0 ? (
        <div className="breed-list">
          {matches.map((breed, index) => (
            <div key={index} className="breed-card">
              <h3>{breed.name}</h3>
              {breed.image_url && <img src={breed.image_url} alt={breed.name} width="200" />}
              <p><strong>Temperament:</strong> {breed.temperament || 'N/A'}</p>
              <p><strong>Weight:</strong> {breed.weight || 'N/A'}</p>
              <p><strong>Height:</strong> {breed.height || 'N/A'}</p>
              <p><strong>Life Span:</strong> {breed.life_span || 'N/A'}</p>
            </div>
          ))}
        </div>
      ) : (
        <p>No matches found yet. Take the quiz to find your perfect match!</p>
      )}
    </div>
  );
};

export default MyMatches;
