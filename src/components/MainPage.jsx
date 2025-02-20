import React, { useState, useEffect } from 'react';
import './MainPage.css';
import '../styles.css';
import * as api from '../api.js';
import { formatDate } from '../util.js';

export default function MainPage({ user, eventsInProps, alreadyHasEvents, onFetchEvents, onSelectEvent }) {
  // State for events list
  const [events, setEvents] = useState(eventsInProps || []);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [fetchError, setFetchError] = useState('');

  // State for add event form
  const [name, setName] = useState('');
  const [details, setDetails] = useState('');
  const [timestamp, setTimestamp] = useState('');
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState('');

  async function fetchEvents() {
    setEvents([]);
    setLoadingEvents(true);
    setFetchError('');
    try {
      const token = await user.getIdToken();
      const eventsData = await api.getEvents(token);
      setEvents(eventsData.events);
      if (onFetchEvents) {
        onFetchEvents(eventsData.events);
      }
    } catch (err) {
      setFetchError(err.message);
    } finally {
      setLoadingEvents(false);
    }
  };

  async function handleAddEvent(e) {
    e.preventDefault();
    setAdding(true);
    setAddError('');
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
      setAddError(err.message);
    } finally {
      setAdding(false);
    }
  };

  async function handleRefreshEvents() {
    await fetchEvents();
  }

  useEffect(() => {
    if (!alreadyHasEvents) {
      fetchEvents();
    }
  }, []);

  return (
    <>
      <section className="add-event">
        <h2>Add event</h2>
        {addError && <p className="error">{addError}</p>}
        <form onSubmit={handleAddEvent}>
          <div>
            <label htmlFor="timestamp">Timestamp: </label>
            <input
              id="timestamp"
              type="datetime-local"
              value={timestamp}
              onChange={(e) => setTimestamp(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="name">Name: </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="details">Details: </label>
            <textarea
              id="details"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              rows={3}
              required
            />
          </div>
          <button type="submit" disabled={adding}>
            {adding ? "Loading..." : "Add"}
          </button>
        </form>
      </section>

      <section className="events-list">
        {loadingEvents && <p>Loading...</p>}
        {fetchError && <p className="error">{fetchError}</p>}
        {!loadingEvents && events.length === 0 && <p>No events found.</p>}
        {!loadingEvents && events.length > 0 && (
          <ul>
            {events.map((event) => (
              <li key={event.id}>
                <a href="#" onClick={() => onSelectEvent(event.id)}>
                  <span>{formatDate(event.timestamp)}</span>
                  <span>{' - '}</span>
                  <span>{event.name}</span>
                </a>
              </li>
            ))}
          </ul>
        )}
        {!loadingEvents && <button className="refresh-button" onClick={handleRefreshEvents}>
          Reload
        </button>}
      </section>
    </>
  );
};

const validateEvent = (event) => {
  const now = new Date();
  const lowerBound = now.getTime() - 5 * 60 * 1000; // 5 minutes ago
  const upperBound = now.getTime() + 48 * 60 * 60 * 1000 + 5 * 60 * 1000; // 48 hours 5 minutes ahead
  const eventTime = new Date(event.timestamp).getTime();
  if (eventTime < lowerBound || eventTime > upperBound) {
    throw new Error('Timestamp must be between 5 minutes ago and 48 hours 5 minutes ahead');
  }
};
