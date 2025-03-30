const WebSocket = require('ws');
const http = require('http');
const express = require('express');
const cors = require('cors');
const { spawn } = require('child_process');

const app = express();
app.use(cors());

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// État global des métadonnées
let currentMetadata = {
  title: 'Web Radio',
  artist: 'Various Artists',
  album: 'Unknown Album',
  startedAt: Date.now()
};

// Fonction pour mettre à jour les métadonnées
function updateMetadata(newMetadata) {
  currentMetadata = {
    ...newMetadata,
    startedAt: Date.now()
  };

  // Envoyer les nouvelles métadonnées à tous les clients connectés
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(currentMetadata));
    }
  });
}

// Connexion WebSocket
wss.on('connection', (ws) => {
  console.log('Client connecté');

  // Envoyer les métadonnées actuelles au nouveau client
  ws.send(JSON.stringify(currentMetadata));

  ws.on('close', () => {
    console.log('Client déconnecté');
  });
});

// Route pour obtenir les métadonnées actuelles via HTTP
app.get('/metadata', (req, res) => {
  res.json(currentMetadata);
});

// Fonction pour parser les métadonnées Icecast
function parseIcecastMetadata(metadata) {
  const parts = metadata.split(' - ');
  return {
    title: parts[1] || metadata,
    artist: parts[0] || 'Various Artists',
    album: 'Unknown Album'
  };
}

// Fonction pour récupérer les métadonnées depuis Icecast
function pollIcecastMetadata() {
  const url = 'http://51.75.200.205:8000/status-json.xsl';
  
  fetch(url)
    .then(response => response.json())
    .then(data => {
      if (data.icestats && data.icestats.source) {
        const source = data.icestats.source;
        if (source.title) {
          const metadata = parseIcecastMetadata(source.title);
          updateMetadata(metadata);
        }
      }
    })
    .catch(error => {
      console.error('Erreur lors de la récupération des métadonnées:', error);
    });
}

// Démarrer le polling des métadonnées
setInterval(pollIcecastMetadata, 5000);

// Démarrer le serveur
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
}); 