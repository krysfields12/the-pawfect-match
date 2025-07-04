import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const DogProfile = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [ breed, setBreed ] = useState(null);
    const [ error, SetError ] = useState(null);

    useEffect(() => {
        const fetchBreed = async() => {
            try {
                const res = await axios.get(`http://localhost:8080/api/dog-breeds/${id}`);
                setBreed(res.data);
            } catch(err) {
                console.error("Error fetching breed profile:", err);
                SetError("Failed to load dog breed information")
            }
        }
        fetchBreed();
    }, [id]);


    if (error) {
        return <div><h2>Error</h2><p>{error}</p></div>;
    }

    if (!breed) {
        return <p>Loading...</p>;
    }

    return (
        <div>
        <h1>{breed.name}</h1>
        {breed.image_url && <img src={breed.image_url} alt={breed.name} width="300" />}
        <p><strong>Temperament:</strong> {breed.temperament || 'N/A'}</p>
        <p><strong>Breed Group:</strong> {breed.breed_group || 'N/A'}</p>
        <p><strong>Bred For:</strong> {breed.bred_for || 'N/A'}</p>
        <p><strong>Origin:</strong> {breed.origin || 'N/A'}</p>
        <p><strong>Life Span:</strong> {breed.life_span || 'N/A'}</p>
        <p><strong>Weight:</strong> {breed.weight || 'N/A'}</p>
        <p><strong>Height:</strong> {breed.height || 'N/A'}</p>
        <p><strong>Size:</strong> {breed.size || 'N/A'}</p>
        
        <button onClick={() => navigate('/')}>← Back to Dog List</button>
        </div>
    );
};

export default DogProfile;