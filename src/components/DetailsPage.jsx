import React from 'react';
import './DetailsPage.css';
import { formatDate } from '../utils.js';

const DetailsPage = ({ user, events, eventId, onBack }) => {
  const event = events.find((e) => e.id === eventId);
  return (
    <>
      {!event && <p>Not found</p>}
      {event && <div className='event-info'>
        <h1>{event.name}</h1>
        <p>{formatDate(event.timestamp)}</p>
        <pre>{event.details}</pre>
      </div>}
      <button className='back-button' onClick={onBack}>Back</button>
    </>
  );
};

export default DetailsPage;
