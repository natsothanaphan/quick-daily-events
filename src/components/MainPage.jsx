import React, { useState, useEffect } from 'react';
import './MainPage.css';
import '../styles.css';
import * as api from '../api.js';

export default function MainPage({ user }) {
  const [ping, setPing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePing = async () => {
    setLoading(true);
    setError('');
    try {
      const token = await user.getIdToken();
      const data = await api.ping(token);
      setPing(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handlePing();
  }, []);

  return (
    <>
      <h1>Main Page</h1>
      {loading && <p>Loading...</p>}
      {error && <p className="error">{error}</p>}
      {ping && <p>{ping}</p>}
    </>
  );
};
