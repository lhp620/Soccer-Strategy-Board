
import React, { useState, useRef, useEffect } from 'react';
import Toolbar from './Toolbar';
import SoccerField from './SoccerField';
import AdSense from './AdSense';
import { AD_CONFIG } from './adConfig';
import './App.css';

function App() {
  const [players, setPlayers] = useState([]);
  const [playerCounters, setPlayerCounters] = useState({ team1: 1, team2: 1 });
  const [selectedTeam, setSelectedTeam] = useState('team1');
  const [mode, setMode] = useState('normal'); // 'normal', 'draw', 'ball'
  const [lines, setLines] = useState([]);
  const [ball, setBall] = useState(null);
  const fileInputRef = useRef(null);
  const [savedTemplates, setSavedTemplates] = useState([]);

  const teamColors = {
    team1: '#1e40af', // Darker Blue for Home team
    team2: '#dc2626'  // Bright Red for Away team
  };

  const addPlayer = (x, y) => {
    if (!selectedTeam) return; // Don't add player if no team is selected
    
    const teamPlayerCounter = playerCounters[selectedTeam];
    const newPlayer = {
      id: `${selectedTeam}-${teamPlayerCounter}`,
      x,
      y,
      color: teamColors[selectedTeam],
      number: teamPlayerCounter,
      team: selectedTeam
    };
    setPlayers([...players, newPlayer]);
    setPlayerCounters({
      ...playerCounters,
      [selectedTeam]: teamPlayerCounter + 1
    });
  };

  const deletePlayer = (playerId) => {
    setPlayers(players.filter(p => p.id !== playerId));
  };

  const handleClearPlayers = () => {
    setPlayers([]);
    setBall(null);
    setPlayerCounters({ team1: 1, team2: 1 });
    setMode('normal');
  }

  const handleClearDrawings = () => {
    setLines([]);
    setMode('normal');
  }

  const handleSave = () => {
    const data = {
      players,
      lines,
      playerCounters,
      ball
    };
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'soccer-strategy.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleLoad = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        if (data.players && data.lines) {
          setPlayers(data.players);
          setLines(data.lines);
          setBall(data.ball || null);
          if (data.playerCounters) {
            setPlayerCounters(data.playerCounters);
          } else if (data.playerCounter) { // For backwards compatibility
            const maxTeam1 = Math.max(0, ...data.players.filter(p => p.team === 'team1').map(p => p.number));
            const maxTeam2 = Math.max(0, ...data.players.filter(p => p.team === 'team2').map(p => p.number));
            setPlayerCounters({ team1: maxTeam1 + 1, team2: maxTeam2 + 1 });
          } else {
            setPlayerCounters({ team1: 1, team2: 1 });
          }
          setMode('normal');
        } else {
          alert('Invalid strategy file.');
        }
      } catch (error) {
        alert('Error loading strategy file.');
      }
    };
    reader.readAsText(file);
    // Reset file input
    e.target.value = null;
  };

  const triggerLoad = () => {
    fileInputRef.current.click();
  };

  const formations = {
    '4-4-2': {
      positions: [
        { x: 0.08, y: 0.5, role: 'GK' },   // Goalkeeper
        { x: 0.25, y: 0.2, role: 'CB' },   // Center Back
        { x: 0.25, y: 0.35, role: 'CB' },  // Center Back
        { x: 0.25, y: 0.65, role: 'CB' },  // Center Back
        { x: 0.25, y: 0.8, role: 'CB' },   // Center Back
        { x: 0.5, y: 0.25, role: 'CM' },   // Central Midfielder
        { x: 0.5, y: 0.4, role: 'CM' },    // Central Midfielder
        { x: 0.5, y: 0.6, role: 'CM' },    // Central Midfielder
        { x: 0.5, y: 0.75, role: 'CM' },   // Central Midfielder
        { x: 0.75, y: 0.35, role: 'ST' },  // Striker
        { x: 0.75, y: 0.65, role: 'ST' }   // Striker
      ]
    },
    '4-3-3': {
      positions: [
        { x: 0.08, y: 0.5, role: 'GK' },   // Goalkeeper
        { x: 0.25, y: 0.15, role: 'CB' },  // Right Back
        { x: 0.25, y: 0.35, role: 'CB' },  // Center Back
        { x: 0.25, y: 0.65, role: 'CB' },  // Center Back
        { x: 0.25, y: 0.85, role: 'CB' },  // Left Back
        { x: 0.45, y: 0.3, role: 'CM' },   // Central Midfielder
        { x: 0.45, y: 0.5, role: 'CM' },   // Central Midfielder
        { x: 0.45, y: 0.7, role: 'CM' },   // Central Midfielder
        { x: 0.75, y: 0.2, role: 'ST' },   // Right Winger
        { x: 0.75, y: 0.5, role: 'ST' },   // Striker
        { x: 0.75, y: 0.8, role: 'ST' }    // Left Winger
      ]
    },
    '3-5-2': {
      positions: [
        { x: 0.08, y: 0.5, role: 'GK' },   // Goalkeeper
        { x: 0.25, y: 0.25, role: 'CB' },  // Center Back
        { x: 0.25, y: 0.5, role: 'CB' },   // Center Back
        { x: 0.25, y: 0.75, role: 'CB' },  // Center Back
        { x: 0.45, y: 0.1, role: 'CM' },   // Right Wing Back
        { x: 0.45, y: 0.3, role: 'CM' },   // Central Midfielder
        { x: 0.45, y: 0.5, role: 'CM' },   // Central Midfielder
        { x: 0.45, y: 0.7, role: 'CM' },   // Central Midfielder
        { x: 0.45, y: 0.9, role: 'CM' },   // Left Wing Back
        { x: 0.75, y: 0.4, role: 'ST' },   // Striker
        { x: 0.75, y: 0.6, role: 'ST' }    // Striker
      ]
    }
  };

  const applyFormation = (formationName) => {
    if (!selectedTeam) return;
    
    const formation = formations[formationName];
    if (!formation) return;

    // Remove existing players for the selected team
    const otherTeamPlayers = players.filter(p => p.team !== selectedTeam);
    
    // Create new players based on formation
    const newPlayers = formation.positions.map((pos, index) => {
      // For team2 (red/away team), flip the formation horizontally
      const xPos = selectedTeam === 'team2' ? (1 - pos.x) : pos.x;
      
      return {
        id: `${selectedTeam}-${index + 1}`,
        x: xPos * 1200, // Canvas width
        y: pos.y * 780,  // Canvas height
        color: teamColors[selectedTeam],
        number: index + 1,
        team: selectedTeam,
        role: pos.role
      };
    });

    // Update players and counter
    setPlayers([...otherTeamPlayers, ...newPlayers]);
    setPlayerCounters({
      ...playerCounters,
      [selectedTeam]: formation.positions.length + 1
    });
  };

  const saveTemplate = () => {
    const templateName = prompt('Enter template name:');
    if (!templateName) return;
    
    const template = {
      name: templateName,
      players,
      lines,
      ball,
      playerCounters,
      timestamp: Date.now()
    };
    
    const newTemplates = [...savedTemplates, template];
    setSavedTemplates(newTemplates);
    localStorage.setItem('soccerTemplates', JSON.stringify(newTemplates));
    alert(`Template "${templateName}" saved!`);
  };

  const loadTemplate = (template) => {
    setPlayers(template.players || []);
    setLines(template.lines || []);
    setBall(template.ball || null);
    setPlayerCounters(template.playerCounters || { team1: 1, team2: 1 });
    setMode('normal');
  };

  const deleteTemplate = (templateName) => {
    if (window.confirm(`Are you sure you want to delete template "${templateName}"?`)) {
      const newTemplates = savedTemplates.filter(t => t.name !== templateName);
      setSavedTemplates(newTemplates);
      localStorage.setItem('soccerTemplates', JSON.stringify(newTemplates));
      alert(`Template "${templateName}" deleted!`);
    }
  };

  // Load templates from localStorage on component mount
  useEffect(() => {
    const saved = localStorage.getItem('soccerTemplates');
    if (saved) {
      setSavedTemplates(JSON.parse(saved));
    }
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <div className="header-with-ads">
          <h1>Soccer Strategy Board</h1>
          <AdSense
            adClient={AD_CONFIG.publisherId}
            adSlot={AD_CONFIG.adUnits.rightSidebar}
            adFormat="leaderboard"
            fullWidthResponsive={false}
            className="header-right-ad"
            style={{ width: '728px', height: '90px' }}
          />
        </div>
      </header>
      <div className="main-content">
        <div className="left-toolbar">
          <Toolbar
            side="left"
            handleClearPlayers={handleClearPlayers}
            handleClearDrawings={handleClearDrawings}
            selectedTeam={selectedTeam}
            setSelectedTeam={setSelectedTeam}
            teamColors={teamColors}
            mode={mode}
            setMode={setMode}
            handleSave={handleSave}
            triggerLoad={triggerLoad}
            applyFormation={applyFormation}
            saveTemplate={saveTemplate}
            savedTemplates={savedTemplates}
            loadTemplate={loadTemplate}
            deleteTemplate={deleteTemplate}
          />

        </div>
        <div className="soccer-field-container">
          <SoccerField
            players={players}
            setPlayers={setPlayers}
            addPlayer={addPlayer}
            deletePlayer={deletePlayer}
            mode={mode}
            setMode={setMode}
            lines={lines}
            setLines={setLines}
            ball={ball}
            setBall={setBall}
          />
        </div>
        <div className="right-toolbar">
          <Toolbar
            side="right"
            handleClearPlayers={handleClearPlayers}
            handleClearDrawings={handleClearDrawings}
            selectedTeam={selectedTeam}
            setSelectedTeam={setSelectedTeam}
            teamColors={teamColors}
            mode={mode}
            setMode={setMode}
            handleSave={handleSave}
            triggerLoad={triggerLoad}
            applyFormation={applyFormation}
            saveTemplate={saveTemplate}
            savedTemplates={savedTemplates}
            loadTemplate={loadTemplate}
            deleteTemplate={deleteTemplate}
          />

        </div>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleLoad}
        accept=".json"
      />
    </div>
  );
}

export default App;
