const ping = async (token) => {
  console.log('api ping start', {});
  const resp = await fetch(`/api/ping`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!resp.ok) {
    const errData = await resp.json();
    console.log('api ping error', { errData });
    throw new Error(errData.error || 'Failed api ping');
  }
  const data = await resp.text();
  console.log('api ping done', { data });
  return data;
};

const addEvent = async (token, event) => {
  console.log('api addEvent start', event);
  const resp = await fetch(`/api/events`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(event),
  });
  if (!resp.ok) {
    const errData = await resp.json();
    console.log('api addEvent error', { errData });
    throw new Error(errData.error || 'Failed to add event');
  }
  const data = await resp.json();
  console.log('api addEvent done', { data });
  return data;
};

const getEvents = async (token) => {
  console.log('api getEvents start');
  const resp = await fetch(`/api/events`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!resp.ok) {
    const errData = await resp.json();
    console.log('api getEvents error', { errData });
    throw new Error(errData.error || 'Failed to get events');
  }
  const data = await resp.json();
  console.log('api getEvents done', { data });
  return data;
};

export default{
  ping, addEvent, getEvents,
};
