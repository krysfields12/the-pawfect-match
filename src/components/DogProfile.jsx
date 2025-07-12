import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './DogProfile.css';

const DogProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [breed, setBreed] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBreed = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_BASE}/api/dog-breeds/${id}`);
        setBreed(res.data);
      } catch (err) {
        console.error("Error fetching breed profile:", err);
        setError("Failed to load dog breed information");
      }
    };
    fetchBreed();
  }, [id]);

  if (error) {
    return <div className="dog-profile"><h2>Error</h2><p>{error}</p></div>;
  }

  if (!breed) {
    return <p>Loading...</p>;
  }

  return (
    <div className="dog-profile">
      <h1 className="dog-name">{breed.name}</h1>
      {breed.image_url && (
        <img
          className="dog-image"
          src={breed.image_url}
          alt={breed.name}
        />
      )}
      <div className="dog-details">
        <p><strong>Temperament:</strong> {breed.temperament || 'N/A'}</p>
        <p><strong>Breed Group:</strong> {breed.breed_group || 'N/A'}</p>
        <p><strong>Bred For:</strong> {breed.bred_for || 'N/A'}</p>
        <p><strong>Origin:</strong> {breed.origin || 'N/A'}</p>
        <p><strong>Life Span:</strong> {breed.life_span || 'N/A'}</p>
        <p><strong>Weight:</strong> {breed.weight || 'N/A'}</p>
        <p><strong>Height:</strong> {breed.height || 'N/A'}</p>
        <p><strong>Size:</strong> {breed.size || 'N/A'}</p>
      </div>
      <button className="back-button" onClick={() => navigate('/')}>
        ← Back to Dog List
      </button>
    </div>
  );
};

export default DogProfile;

