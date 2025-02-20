import React, { useState } from 'react';
import Auth from './components/Auth';
import MainPage from './components/MainPage';
import './App.css';
import './styles.css';

function App() {
  const [user, setUser] = useState(null);

  const handleSignIn = (user) => {
    setUser(user);
  };

  return (
    <div className="App">
      {!user && <Auth onSignIn={handleSignIn} />}
      {user && <MainPage user={user} />}
    </div>
  );
};

export default App;
