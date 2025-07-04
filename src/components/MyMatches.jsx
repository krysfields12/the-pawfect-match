import React, { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

const MyMatches = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMatches = async () => {
      if (!auth.currentUser) {
        setLoading(false);
        return;
      }

      try {
        const userDoc = doc(db, 'users', auth.currentUser.uid);
        const docSnap = await getDoc(userDoc);
        if (docSnap.exists()) {
          setMatches(docSnap.data().matches || []);
        }
      } catch (err) {
        console.error("Error fetching user matches:", err);
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
              <p><strong>Group:</strong> {breed.breed_group || 'N/A'}</p>
              <p><strong>Bred For:</strong> {breed.bred_for || 'N/A'}</p>
              <p><strong>Origin:</strong> {breed.origin || 'N/A'}</p>
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


