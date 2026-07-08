fetch('http://localhost:3000/graphql', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: '{ products { id name price } }' })
}).then(r=>r.json()).then(o => console.dir(o, {depth: null})).catch(console.error);
