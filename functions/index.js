require('dotenv').config({ path: ['.env', '.env.default'] });
const { initializeApp } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
const { setGlobalOptions } = require('firebase-functions/v2');
const { onRequest } = require('firebase-functions/v2/https');
const logger = require('firebase-functions/logger');
const express = require('express');

setGlobalOptions({ region: 'asia-southeast1' });
initializeApp();
const db = getFirestore();

const app = express();
app.use(express.json());

const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }
  const idToken = authHeader.split('Bearer ')[1];
  try {
    const decodedToken = await getAuth().verifyIdToken(idToken);
    req.uid = decodedToken.uid;
    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};
app.use(authenticate);

app.get('/api/ping', (req, res) => {
  res.send('pong');
});

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
app.post('/api/events', async (req, res) => {
  try {
    const { timestamp, name, details } = req.body;
    if (!(timestamp && name && details)) return res.status(400).json({ error: 'Missing required fields: timestamp, name, details' });
    const eventDate = new Date(timestamp);
    if (isNaN(eventDate.getTime())) return res.status(400).json({ error: 'Invalid timestamp format' });
    eventDate.setSeconds(0, 0); // round to minute
    const now = new Date();
    const minAllowed = new Date(now.getTime() - 5 * MINUTE);
    const maxAllowed = new Date(now.getTime() + 48 * HOUR + 5 * MINUTE);
    if (eventDate < minAllowed || eventDate > maxAllowed) return res.status(400).json({ error: 'Timestamp must be between 5 minutes ago and 48 hours 5 minutes ahead' });

    const eventData = {
      timestamp: eventDate, name, details,
      createdAt: FieldValue.serverTimestamp(),
    };
    const eventRef = await db
      .collection('users').doc(req.uid)
      .collection('events').add(eventData);
    return res.status(201).json({ id: eventRef.id, ...eventData });
  } catch (error) {
    logger.error('Error adding event:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/api/events', async (req, res) => {
  try {
    const now = new Date();
    const lowerTimestamp = new Date(now.getTime() - 12 * HOUR - 5 * MINUTE);
    const upperTimestamp = new Date(now.getTime() + 12 * HOUR + 5 * MINUTE);

    const eventsSnapshot = await db
      .collection('users').doc(req.uid)
      .collection('events')
      .where('timestamp', '>=', lowerTimestamp).where('timestamp', '<=', upperTimestamp)
      .orderBy('timestamp', 'desc').get();
    const events = eventsSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id, ...data,
        timestamp: data.timestamp.toDate(),
        createdAt: data.createdAt.toDate(),
      };
    });
    return res.status(200).json({ events });
  } catch (error) {
    logger.error('Error retrieving events:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

exports.app = onRequest(app);
