import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { auth, db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';

const QuizResults = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const answers = state?.answers;
  const [breeds, setBreeds] = useState([]);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  console.log(breeds);

  useEffect(() => {
    if (!answers) {
      navigate('/quiz');
      return;
    }

    const fetchAndMatch = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/dog-breeds`);
        setBreeds(res.data);

        const scoredMatches = res.data.map((breed) => {
          let score = 0;

          if (
            answers.activityLevel === 'High' &&
            (breed.size === 'Large' || breed.temperament?.includes('Energetic'))
          ) score++;
          else if (
            answers.activityLevel === 'Moderate' &&
            breed.size != 'Large'
          ) score++;
          else if (
            answers.activityLevel === 'Low' &&
            breed.size === 'Small'
          ) score++;

          if (
            answers.livingSpace === 'Apartment' &&
            breed.size === 'Small'
          ) score++;
          else if (
            answers.livingSpace === 'Small House' &&
            breed.size !== 'Large'
          ) score++;

          if (
            answers.allergyFriendly === 'Yes' &&
            (breed.breed_group === 'Toy' || breed.breed_group === 'Non-Sporting')
          ) score++;

          if (
            answers.wantsGuardDog === 'Yes' &&
            (breed.temperament?.includes('Protective') || breed.bred_for?.toLowerCase().includes('guard'))
          ) score++;

          if (
            answers.groomingNeeds === 'Low' &&
            !breed.bred_for?.toLowerCase().includes('companion')
          ) score++;

          if (
            answers.barkingTolerance === 'Low' &&
            !breed.temperament?.toLowerCase().includes('vocal')
          ) score++;

          return { ...breed, score };
        });

        const topMatches = scoredMatches
          .filter(b => b.score > 0)
          .sort((a, b) => b.score - a.score)
          .reverse()
          .slice(0, 3);

        setMatches(topMatches);
        setLoading(false);
        //Save to Firestore if user is logged in
        const currentUser = auth.currentUser;
        if (currentUser) {
          const userRef = doc(db, 'users', currentUser.uid);
          await setDoc(userRef, { matches: topMatches }, { merge: true });
        }

      } catch (err) {
        console.error('Error fetching breeds for quiz results:', err);
        setLoading(false);
      }
    };

    fetchAndMatch();
  }, [answers, navigate]);

  return (
  <div className="quiz-results">
    <h2>Your Perfect Dog Matches 🐶</h2>

    {loading ? (
      <p>Loading your matches...</p>
    ) : !answers ? (
      <p>Redirecting to quiz...</p>
    ) : matches.length > 0 ? (
      <div className="breed-list">
        {matches.map((breed) => (
          <div key={breed.id} className="breed-card">
            <h3>{breed.name}</h3>
            {breed.image_url && <img src={breed.image_url} alt={breed.name} width="200" />}
            <p><strong>Temperament:</strong> {breed.temperament || 'N/A'}</p>
            <p><strong>Group:</strong> {breed.breed_group || 'N/A'}</p>
            <p><strong>Bred For:</strong> {breed.bred_for || 'N/A'}</p>
            <p><strong>Origin:</strong> {breed.origin || 'N/A'}</p>
            <button onClick={() => navigate(`/breed/${breed.id}`)}>View Profile →</button>
          </div>
        ))}
      </div>
    ) : (
      <p>No matches found. Try adjusting your answers.</p>
    )}

    {!loading && (
      <button onClick={() => navigate('/quiz')} className="reset-button">
        Retake Quiz
      </button>
    )}
  </div>
);

};

export default QuizResults;

