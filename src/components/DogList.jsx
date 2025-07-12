import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './DogList.css';
import { useNavigate } from 'react-router-dom';

const DogList = () => {
  const [breeds, setBreeds] = useState([]);
  const [filterSize, setFilterSize] = useState('All');
  const [filterLifeSpan, setFilterLifeSpan] = useState('All');
  const [selectedTemperament, setSelectedTemperament] = useState('All');
  const [filterBreedGroup, setFilterBreedGroup] = useState('All');
  const [filterBredFor, setFilterBredFor] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);

  const [temperamentOptions, setTemperamentOptions] = useState([]);
  const [breedGroupOptions, setBreedGroupOptions] = useState([]);
  const [bredForOptions, setBredForOptions] = useState([]);

  console.log(bredForOptions);

  const navigate = useNavigate();
  const breedsPerPage = 9;

  useEffect(() => {
    const fetchBreeds = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_BASE}/api/dog-breeds`);
        setBreeds(res.data);

        const allTemperaments = res.data.flatMap(breed =>
          breed.temperament ? breed.temperament.split(',').map(t => t.trim()) : []
        );
        setTemperamentOptions([...new Set(allTemperaments)].sort());

        const allBreedGroups = res.data.map(b => b.breed_group).filter(Boolean);
        setBreedGroupOptions([...new Set(allBreedGroups)].sort());

        const allBredFors = res.data.map(b => b.bred_for).filter(Boolean);
        setBredForOptions([...new Set(allBredFors)].sort());
      } catch (err) {
        console.error('Error fetching dog breeds:', err);
      }
    };

    fetchBreeds();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [filterSize, filterLifeSpan, selectedTemperament, filterBreedGroup, filterBredFor]);

  const filteredBreeds = breeds.filter((breed) => {
    const sizeMatch = filterSize === 'All' || breed.size === filterSize;
    const lifeSpanMatch =
      filterLifeSpan === 'All' ||
      (filterLifeSpan === 'Short' && parseInt(breed.life_span) < 10) ||
      (filterLifeSpan === 'Medium' && parseInt(breed.life_span) >= 10 && parseInt(breed.life_span) <= 12) ||
      (filterLifeSpan === 'Long' && parseInt(breed.life_span) > 12);
    const temperamentMatch =
      selectedTemperament === 'All' ||
      breed.temperament?.toLowerCase().includes(selectedTemperament.toLowerCase());
    const breedGroupMatch = filterBreedGroup === 'All' || breed.breed_group === filterBreedGroup;
    const bredForMatch = filterBredFor === 'All' || breed.bred_for === filterBredFor;

    return sizeMatch && lifeSpanMatch && temperamentMatch && breedGroupMatch && bredForMatch;
  });

  const indexOfLast = currentPage * breedsPerPage;
  const indexOfFirst = indexOfLast - breedsPerPage;
  const currentBreeds = filteredBreeds.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredBreeds.length / breedsPerPage);

  return (
    <div className="page-wrapper">
      <div className="dog-list-page">
        <div className="page-header">
          <h2 className="page-title">Dog Breeds</h2>
          <p className="page-subtitle">
            Discover the perfect companion by exploring breeds below.
          </p>
        </div>

        <div className="quiz-section">
          <button className="start-quiz-btn" onClick={() => navigate('/quiz')}>
            🐾 Take the Personality Quiz
          </button>
        </div>

        <div className="filter-bar">
          <div className="filter-group">
            <label>
              <span>Size:</span>
              <select value={filterSize} onChange={(e) => setFilterSize(e.target.value)}>
                <option value="All">All</option>
                <option value="Small">Small</option>
                <option value="Medium">Medium</option>
                <option value="Large">Large</option>
              </select>
            </label>

            <label>
              <span>Life Span:</span>
              <select value={filterLifeSpan} onChange={(e) => setFilterLifeSpan(e.target.value)}>
                <option value="All">All</option>
                <option value="Short">Less than 10 years</option>
                <option value="Medium">10–12 years</option>
                <option value="Long">13+ years</option>
              </select>
            </label>

            <label>
              <span>Temperament:</span>
              <select value={selectedTemperament} onChange={(e) => setSelectedTemperament(e.target.value)}>
                <option value="All">All</option>
                {temperamentOptions.map((temp) => (
                  <option key={temp} value={temp}>{temp}</option>
                ))}
              </select>
            </label>

            <label>
              <span>Breed Group:</span>
              <select value={filterBreedGroup} onChange={(e) => setFilterBreedGroup(e.target.value)}>
                <option value="All">All</option>
                {breedGroupOptions.map((group) => (
                  <option key={group} value={group}>{group}</option>
                ))}
              </select>
            </label>

            {/* <label className="full-width">
              <span>Bred For:</span>
              <select value={filterBredFor} onChange={(e) => setFilterBredFor(e.target.value)}>
                <option value="All">All</option>
                {bredForOptions.map((role) => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </label> */}
          </div>

          <div className="filter-actions">
            <button
              className="filter-button reset"
              type="button"
              onClick={() => {
                setFilterSize("All");
                setFilterLifeSpan("All");
                setSelectedTemperament("All");
                setFilterBreedGroup("All");
                setFilterBredFor("All");
              }}
            >
              Reset
            </button>
          </div>
        </div>

        <div className="breed-list">
          {currentBreeds.map((breed) => (
            <div key={breed.id} className="breed-card">
              <h3>{breed.name}</h3>
              {breed.image_url && <img src={breed.image_url} alt={breed.name} width="200" />}
              <p><strong>Temperament:</strong> {breed.temperament || 'N/A'}</p>
              <p><strong>Breed Group:</strong> {breed.breed_group || 'N/A'}</p>
              <p><strong>Bred For:</strong> {breed.bred_for || 'N/A'}</p>
              <p><strong>Origin:</strong> {breed.origin || 'N/A'}</p>
              <button className="view-profile-btn" onClick={() => navigate(`/breed/${breed.id}`)}>
                View Profile →
              </button>
            </div>
          ))}
        </div>

        <div className="pagination">
          <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1}>
            ← Prev
          </button>

          <span>Page {currentPage} of {totalPages}</span>

          <button onClick={() => setCurrentPage(prev => (prev < totalPages ? prev + 1 : prev))} disabled={currentPage === totalPages}>
            Next →
          </button>
        </div>
      </div>
    </div>
  );
};

export default DogList;




