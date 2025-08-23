
import React, { useState, useRef } from 'react';

const Toolbar = ({
  side,
  handleClearPlayers,
  handleClearDrawings,
  selectedTeam,
  setSelectedTeam,
  teamColors,
  mode,
  setMode,
  handleSave,
  triggerLoad,
  applyFormation,
  saveTemplate,
  savedTemplates,
  loadTemplate,
  deleteTemplate
}) => {
  const [showTemplateManager, setShowTemplateManager] = useState(false);
  const [tooltip, setTooltip] = useState({ show: false, text: '', x: 0, y: 0 });
  const tooltipRef = useRef(null);

  const toggleMode = (buttonMode) => {
    const newMode = mode === buttonMode ? 'normal' : buttonMode;
    setMode(newMode);
    
    // Unselect team when entering draw, movement, pass, or ball mode
    if (newMode === 'draw' || newMode === 'movement' || newMode === 'pass' || newMode === 'ball') {
      setSelectedTeam(null);
    } else if (newMode === 'normal' && !selectedTeam) {
      // Auto-select team1 when returning to normal mode if no team is selected
      setSelectedTeam('team1');
    }
  };

  const handleMouseEnter = (event, text) => {
    const rect = event.target.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top - 10;
    setTooltip({ show: true, text, x, y });
  };

  const handleMouseLeave = () => {
    setTooltip({ show: false, text: '', x: 0, y: 0 });
  };

  // Left toolbar content
  const leftToolbarContent = (
    <>
      <div className="toolbar-group">
        <span 
          onMouseEnter={(e) => handleMouseEnter(e, "Select which team to add players for. Click Home (blue) or Away (red) to switch teams.")}
          onMouseLeave={handleMouseLeave}
        >
          Team:
        </span>
        <div className="team-selector">
          <button 
            className={`team-button team-home ${selectedTeam === 'team1' ? 'selected' : ''} ${mode !== 'normal' ? 'disabled' : ''}`}
            style={{backgroundColor: teamColors.team1}}
            onClick={() => {
              if (mode === 'normal') {
                setSelectedTeam('team1');
              }
            }}
            disabled={mode !== 'normal'}>
            <div className="team-icon">🏠</div>
            <div className="team-info">
              <span className="team-name">Home</span>
              <span className="team-color-indicator"></span>
            </div>
          </button>
          <button 
            className={`team-button team-away ${selectedTeam === 'team2' ? 'selected' : ''} ${mode !== 'normal' ? 'disabled' : ''}`}
            style={{backgroundColor: teamColors.team2}}
            onClick={() => {
              if (mode === 'normal') {
                setSelectedTeam('team2');
              }
            }}
            disabled={mode !== 'normal'}>
            <div className="team-icon">✈️</div>
            <div className="team-info">
              <span className="team-name">Away</span>
              <span className="team-color-indicator"></span>
            </div>
          </button>
        </div>
      </div>
      <div className="toolbar-group mode-group">
        <span 
          onMouseEnter={(e) => handleMouseEnter(e, "Choose line drawing tools: Draw general lines, show player movement, or mark passes on the field.")}
          onMouseLeave={handleMouseLeave}
        >
          Lines:
        </span>
        <button 
          className={`mode-button ${mode === 'draw' ? 'active' : ''}`}
          onClick={() => toggleMode('draw')}>
          {mode === 'draw' ? 'Cancel' : 'General Line'}
        </button>
        <button 
          className={`mode-button ${mode === 'movement' ? 'active' : ''}`}
          onClick={() => toggleMode('movement')}>
          {mode === 'movement' ? 'Cancel' : 'Movement ➡️'}
        </button>
        <button 
          className={`mode-button ${mode === 'pass' ? 'active' : ''}`}
          onClick={() => toggleMode('pass')}>
          {mode === 'pass' ? 'Cancel' : 'Pass ⚽'}
        </button>
      </div>
      <div className="toolbar-group objects-group">
        <span 
          onMouseEnter={(e) => handleMouseEnter(e, "Place objects on the field like the ball.")}
          onMouseLeave={handleMouseLeave}
        >
          Objects:
        </span>
        <button 
          className={`mode-button ${mode === 'ball' ? 'active' : ''}`}
          onClick={() => toggleMode('ball')}>
          {mode === 'ball' ? 'Cancel' : 'Ball ⚽'}
        </button>
      </div>
    </>
  );

  // Right toolbar content
  const rightToolbarContent = (
    <>
      <div className="toolbar-group formation-group">
        <span 
          onMouseEnter={(e) => handleMouseEnter(e, "Apply preset formations to the selected team. Choose from 4-4-2, 4-3-3, or 3-5-2 tactical setups.")}
          onMouseLeave={handleMouseLeave}
        >
          Formations:
        </span>
        <button 
          className="formation-button" 
          onClick={() => applyFormation('4-4-2')}
          disabled={!selectedTeam || mode !== 'normal'}>
          4-4-2
        </button>
        <button 
          className="formation-button" 
          onClick={() => applyFormation('4-3-3')}
          disabled={!selectedTeam || mode !== 'normal'}>
          4-3-3
        </button>
        <button 
          className="formation-button" 
          onClick={() => applyFormation('3-5-2')}
          disabled={!selectedTeam || mode !== 'normal'}>
          3-5-2
        </button>
      </div>
      <div className="toolbar-group file-group">
        <span 
          onMouseEnter={(e) => handleMouseEnter(e, "Save your strategy to a file, load previous strategies, or manage saved templates.")}
          onMouseLeave={handleMouseLeave}
        >
          File:
        </span>
        <button className="secondary" onClick={handleSave}>Save</button>
        <button className="secondary" onClick={triggerLoad}>Load</button>
        <button className="secondary" onClick={saveTemplate}>Save Template</button>
        {savedTemplates.length > 0 && (
          <>
            <button 
              className={`secondary ${showTemplateManager ? 'active' : ''}`}
              onClick={() => setShowTemplateManager(!showTemplateManager)}>
              Manage Templates ({savedTemplates.length})
            </button>
            {showTemplateManager && (
              <div className="template-manager">
                <select 
                  className="template-select"
                  onChange={(e) => {
                    if (e.target.value) {
                      const template = savedTemplates.find(t => t.name === e.target.value);
                      if (template) {
                        loadTemplate(template);
                        setShowTemplateManager(false);
                      }
                      e.target.value = '';
                    }
                  }}
                  defaultValue="">
                  <option value="">Load</option>
                  {savedTemplates.map(template => (
                    <option key={template.name} value={template.name}>
                      {template.name}
                    </option>
                  ))}
                </select>
                <select 
                  className="template-delete-select"
                  onChange={(e) => {
                    if (e.target.value) {
                      deleteTemplate(e.target.value);
                      e.target.value = '';
                    }
                  }}
                  defaultValue="">
                  <option value="">Delete</option>
                  {savedTemplates.map(template => (
                    <option key={template.name} value={template.name}>
                      {template.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </>
        )}
      </div>
      <div className="toolbar-group clear-group">
        <span 
          onMouseEnter={(e) => handleMouseEnter(e, "Remove all players and drawings from the field to start fresh with your strategy.")}
          onMouseLeave={handleMouseLeave}
        >
          Clear:
        </span>
        <button className="danger" onClick={handleClearPlayers}>Clear Players</button>
        <button className="danger" onClick={handleClearDrawings}>Clear Drawings</button>
      </div>
    </>
  );

  return (
    <>
      <div className={`toolbar ${side}-toolbar`}>
        {side === 'left' ? leftToolbarContent : rightToolbarContent}
      </div>
      {tooltip.show && (
        <div 
          className="tooltip"
          style={{
            left: `${tooltip.x}px`,
            top: `${tooltip.y}px`,
            transform: 'translateX(-50%)',
            opacity: 1,
            visibility: 'visible'
          }}
        >
          {tooltip.text}
        </div>
      )}
    </>
  );
};

export default Toolbar;
