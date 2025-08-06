import React, { useEffect, useState } from 'react';
import { auth, db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';

const MyMatches = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMatches = async () => {
      const user = auth.currentUser;

      if (!user) {
        console.warn("No user logged in.");
        setLoading(false);
        return;
      }

      try {
        const matchesRef = collection(db, 'users', user.uid, 'matches');
        const snapshot = await getDocs(matchesRef);

        const fetchedMatches = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setMatches(fetchedMatches);
      } catch (err) {
        console.error('Error fetching matches from Firestore:', err);
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
          {matches.map((breed) => (
            <div key={breed.id || breed.name} className="breed-card">
              <h3>{breed.name}</h3>
              {breed.image_url && (
                <img src={breed.image_url} alt={breed.name} width="200" />
              )}
              <p><strong>Temperament:</strong> {breed.temperament || 'N/A'}</p>
              <p><strong>Group:</strong> {breed.breed_group || 'N/A'}</p>
              <p><strong>Bred For:</strong> {breed.bred_for || 'N/A'}</p>
              <p><strong>Origin:</strong> {breed.origin || 'N/A'}</p>
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
