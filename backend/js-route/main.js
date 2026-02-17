fetch('http://localhost:5173/test')
  .then(response => response.text())
  .then(data => {
    console.log(data); // This should log "This is from Flask server!"
  })
  .catch(error => {
    console.error('Error fetching data:', error);
  });