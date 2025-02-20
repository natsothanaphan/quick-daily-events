import React from 'react';
import './DetailsPage.css';
import '../styles.css';

export default function DetailsPage({ user, events, eventId, onBack }) {
  const event = events.find(e => e.id === eventId);

  return (
    <>
      <h1>Event</h1>
      {!event && <p className="error">Not found</p>}
      {event && <div className="event-info">
        <p>
          <strong>Name:</strong> {event.name}
        </p>
        <p>
          <strong>Timestamp:</strong> {new Date(event.timestamp).toLocaleString()}
        </p>
        <p>
          <strong>Details:</strong>
        </p>
        <p>{event.details}</p>
      </div>}
      <button onClick={onBack}>Back</button>
    </>
  );
};
