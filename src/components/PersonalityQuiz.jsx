import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const PersonalityQuiz = () => {
  const [answers, setAnswers] = useState({
    activityLevel: '',
    livingSpace: '',
    allergyFriendly: '',
    wantsGuardDog: '',
    groomingNeeds: '',
    barkingTolerance: ''
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setAnswers({ ...answers, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('User answers:', answers);
    navigate('/results', { state: { answers } });
  };

  return (
    <div className="quiz-container">
      <h2>Find Your Perfect Dog Match 🐾</h2>
      <form onSubmit={handleSubmit} className="quiz-form">
        <label>
          How active are you?
          <select name="activityLevel" onChange={handleChange} required>
            <option value="">Select</option>
            <option value="Low">Low</option>
            <option value="Moderate">Moderate</option>
            <option value="High">High</option>
          </select>
        </label>

        <label>
          What’s your living space like?
          <select name="livingSpace" onChange={handleChange} required>
            <option value="">Select</option>
            <option value="Apartment">Apartment</option>
            <option value="Small House">Small House</option>
            <option value="Large House">Large House</option>
          </select>
        </label>

        <label>
          Are you allergic to pet dander?
          <select name="allergyFriendly" onChange={handleChange} required>
            <option value="">Select</option>
            <option value="Yes">Yes</option>
            <option value="No">No</option>
          </select>
        </label>

        <label>
          Do you want a guard dog?
          <select name="wantsGuardDog" onChange={handleChange} required>
            <option value="">Select</option>
            <option value="Yes">Yes</option>
            <option value="No">No</option>
          </select>
        </label>

        <label>
          How much time can you spend grooming?
          <select name="groomingNeeds" onChange={handleChange} required>
            <option value="">Select</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
        </label>

        <label>
          How tolerant are you of barking?
          <select name="barkingTolerance" onChange={handleChange} required>
            <option value="">Select</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
        </label>

        <button type="submit">Show My Matches →</button>
      </form>
    </div>
  );
};

export default PersonalityQuiz;
