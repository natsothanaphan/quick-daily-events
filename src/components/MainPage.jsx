import React, { useState, useEffect } from 'react';
import './MainPage.css';
import api from '../api.js';
import { alertAndLogErr, formatDate } from '../utils.js';

const MainPage = ({ user, eventsInProps, alreadyHasEvents, onFetchEvents, onSelectEvent }) => {
  const [events, setEvents] = useState(eventsInProps || []);
  const [loadingEvents, setLoadingEvents] = useState(false);

  const [name, setName] = useState('');
  const [details, setDetails] = useState('');
  const [timestamp, setTimestamp] = useState('');
  const [adding, setAdding] = useState(false);

  const fetchEvents = async () => {
    setEvents([]);
    setLoadingEvents(true);
    try {
      const token = await user.getIdToken();
      const eventsData = await api.getEvents(token);
      setEvents(eventsData.events);
      onFetchEvents(eventsData.events);
    } catch (err) {
      alertAndLogErr(err);
    } finally {
      setLoadingEvents(false);
    }
  };

  const handleAddEvent = async (e) => {
    e.preventDefault();
    setAdding(true);
    try {
      const token = await user.getIdToken();
      const eventPayload = {
        timestamp: new Date(timestamp).toISOString(),
        name,
        details,
      };
      validateEvent(eventPayload);
      await api.addEvent(token, eventPayload);

      setName('');
      setDetails('');
      setTimestamp('');
      fetchEvents();
    } catch (err) {
      alertAndLogErr(err);
    } finally {
      setAdding(false);
    }
  };

  const handleRefreshEvents = () => fetchEvents();

  useEffect(() => {
    if (!alreadyHasEvents) fetchEvents();
  }, []);

  return (
    <>
      <div className='add-event'>
        <h2>Add event</h2>
        <form onSubmit={handleAddEvent}>
          <div>
            <label htmlFor='.timestamp'>Timestamp: </label>
            <input id='.timestamp' type='datetime-local' value={timestamp}
              onChange={(e) => setTimestamp(e.target.value)} required />
          </div>
          <div>
            <label htmlFor='name'>Name: </label>
            <input id='name' type='text' value={name}
              onChange={(e) => setName(e.target.value)} required />
          </div>
          <div>
            <label htmlFor='.details'>Details: </label>
            <textarea id='.details' value={details}
              rows={3} onChange={(e) => setDetails(e.target.value)} required />
          </div>
          <button type='submit' disabled={adding}>{adding ? 'Loading...' : 'Add'}</button>
        </form>
      </div>
      <div className='events-list'>
        {loadingEvents && <p>Loading...</p>}
        {!loadingEvents && events.length === 0 && <p>No events found.</p>}
        {!loadingEvents && events.length > 0 && <ul>{events.map((event) => (
          <li key={event.id}><a href='#' onClick={() => onSelectEvent(event.id)}>
            <span>{formatDate(event.timestamp)}</span>
            <span>{' - '}</span>
            <span>{event.name}</span>
          </a></li>))}
        </ul>}
        {!loadingEvents && <button className='refresh-button' onClick={handleRefreshEvents}>
          Reload
        </button>}
      </div>
    </>
  );
};

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const validateEvent = (event) => {
  const now = new Date();
  const lowerBound = now.getTime() - 5 * MINUTE;
  const upperBound = now.getTime() + 48 * HOUR + 5 * MINUTE;
  const eventTime = new Date(event.timestamp).getTime();
  if (eventTime < lowerBound || eventTime > upperBound) throw new Error('Timestamp must be between 5 minutes ago and 48 hours 5 minutes ahead');
};

export default MainPage;
