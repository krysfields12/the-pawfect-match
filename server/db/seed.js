// server/db/seed.js
import axios from 'axios';
import pool from './index.js';

const API_KEY = 'live_CVyUDu3ScKnCBiljmOBnSHUX5Zc4TKep7Aj4EXWm8iX7wlYLNQIA5BoGw5yQu9pF';

const getSizeCategory = (weightMetric) => {
  if (!weightMetric) return null;

  const parts = weightMetric.split(' - ').map(s => parseInt(s.trim()));
  const avg = parts.length === 2 ? (parts[0] + parts[1]) / 2 : parts[0];

  if (isNaN(avg)) return null;

  if (avg < 10) return 'Small';
  if (avg <= 25) return 'Medium';
  return 'Large';
};

const seedDogBreeds = async () => {
  try {
    await pool.query('DELETE FROM dog_breeds');

    // Fetch from TheDogAPI
    const response = await axios.get('https://api.thedogapi.com/v1/breeds', {
      headers: {
        'x-api-key': API_KEY,
      },
    });

    const breeds = response.data;

    for (const breed of breeds) {
      const { 
        id: api_id, 
        name, 
        image, 
        temperament, 
        life_span, 
        weight, 
        height,
        breed_group,
        bred_for,
        origin,
       } = breed;

      const image_url = image?.url || null;
      const size = getSizeCategory(weight?.metric);

      await pool.query(
        `INSERT INTO dog_breeds (api_id, name, image_url, temperament, life_span, weight, height, breed_group, bred_for, origin, size)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [
          api_id,
          name,
          image_url,
          temperament || null,
          life_span || null,
          weight.metric || null,
          height.metric || null,
          breed_group || null,
          bred_for || null,
          origin || null,
          size,
        ]
      );
    }

    console.log('Dog breeds successfully seeded with Axios!');
  } catch (err) {
    console.error('Error seeding dog breeds:', err.message);
  } finally {
    pool.end();
  }
};

seedDogBreeds();
