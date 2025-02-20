import React from 'react';
import './DetailsPage.css';
import '../styles.css';
import { formatDate } from '../util.js';

export default function DetailsPage({ user, events, eventId, onBack }) {
  const event = events.find(e => e.id === eventId);

  return (
    <>
      {!event && <p className="error">Not found</p>}
      {event && <div className="event-info">
        <h1>{event.name}</h1>
        <p>{formatDate(event.timestamp)}</p>
        <pre>{event.details}</pre>
      </div>}
      <button className="back-button" onClick={onBack}>Back</button>
    </>
  );
};
