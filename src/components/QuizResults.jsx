import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { auth, db } from '../firebase';
import {
  doc,
  collection,
  addDoc,
  getDocs,
  deleteDoc
} from 'firebase/firestore';

const QuizResults = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const answers = state?.answers;
  const [breeds, setBreeds] = useState([]);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  console.log(breeds);
  
  const hasFetched = useRef(false)

  useEffect(() => {
    if (!answers || hasFetched.current) {
      if (!answers) navigate('/quiz');
      return;
    }

    const fetchAndMatch = async () => {
      hasFetched.current = true; // mark as called

      try {
        const res = await axios.get(`${import.meta.env.VITE_API_BASE}/api/dog-breeds`);
        setBreeds(res.data);

        const scoredMatches = res.data.map((breed) => {
          let score = 0;

          if (
            answers.activityLevel === 'High' &&
            (breed.size === 'Large' || breed.temperament?.includes('Energetic'))
          ) score++;
          else if (
            answers.activityLevel === 'Moderate' &&
            breed.size !== 'Large'
          ) score++;
          else if (
            answers.activityLevel === 'Low' &&
            breed.size === 'Small'
          ) score++;

          if (answers.livingSpace === 'Apartment' && breed.size === 'Small') score++;
          else if (answers.livingSpace === 'Small House' && breed.size !== 'Large') score++;

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

        // 🔐 Save to Firestore
        const user = auth.currentUser;
        if (!user) {
          console.warn("No user signed in.");
          setLoading(false);
          return;
        }

        const matchesRef = collection(db, 'users', user.uid, 'matches');

        // 🧹 Delete existing matches before saving
        const existingDocs = await getDocs(matchesRef);
        await Promise.all(
          existingDocs.docs.map((docSnap) =>
            deleteDoc(doc(db, 'users', user.uid, 'matches', docSnap.id))
          )
        );

        //Save new matches
        const cleanedMatches = topMatches.map((match) => {
          const cleaned = {};
          for (const [key, value] of Object.entries(match)) {
            if (value !== undefined) {
              cleaned[key] =
                typeof value === 'string' ? value.replace(/\\/g, '').trim() : value;
            }
          }
          return cleaned;
        });

        await Promise.all(cleanedMatches.map((match) => addDoc(matchesRef, match)));
      } catch (err) {
        console.error('Error in fetchAndMatch:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAndMatch();
  }, [answers, navigate]);

  return (
    <div>
      <h2>Your Perfect Dog Matches 🐶</h2>

      {loading ? (
        <p>Loading your matches...</p>
      ) : matches.length > 0 ? (
        <div className="breed-list">
          {matches.map((breed) => (
            <div key={breed.id || breed.name} className="breed-card">
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

