import React, { useState } from 'react';
import Auth from './components/Auth';
import MainPage from './components/MainPage';
import DetailsPage from './components/DetailsPage';
import './App.css';
import './styles.css';

function App() {
  const [user, setUser] = useState(null);
  const [events, setEvents] = useState([]);
  const [eventId, setEventId] = useState(null);

  const handleSignIn = (user) => {
    setUser(user);
  };

  const handleFetchEvents = (events) => {
    setEvents(events);
  };

  const handleSelectEvent = (eventId) => {
    setEventId(eventId);
  };

  const handleBack = () => {
    setEventId(null);
  };

  return (
    <div className="App">
      {!user && <Auth onSignIn={handleSignIn} />}
      {user && !eventId && <MainPage user={user}
        onFetchEvents={handleFetchEvents} onSelectEvent={handleSelectEvent} />}
      {user && eventId && <DetailsPage user={user}
        events={events} eventId={eventId} onBack={handleBack} />}
    </div>
  );
};

export default App;
