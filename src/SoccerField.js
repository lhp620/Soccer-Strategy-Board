
import React, { useRef, useEffect, useState } from 'react';

const SoccerField = ({ 
  players, 
  setPlayers, 
  addPlayer,
  deletePlayer,
  mode, 
  setMode, 
  lines, 
  setLines,
  ball,
  setBall
}) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [draggingPlayer, setDraggingPlayer] = useState(null);
  const [draggingBall, setDraggingBall] = useState(false);
  const [draggingLine, setDraggingLine] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentLine, setCurrentLine] = useState(null);
  const [mouseDownPos, setMouseDownPos] = useState(null);
  const [mouseDownButton, setMouseDownButton] = useState(null);
  const [editingPlayer, setEditingPlayer] = useState(null);
  const [lastClickTime, setLastClickTime] = useState(0);
  const [lastClickedPlayer, setLastClickedPlayer] = useState(null);


  const drawField = (context, canvas) => {
    const fieldWidth = canvas.width;
    const fieldHeight = canvas.height;
    const scale = 10; // 10px = 1m

    // Field background
    context.fillStyle = '#27ae60'; // A more vibrant green
    context.fillRect(0, 0, fieldWidth, fieldHeight);

    // Field lines
    context.strokeStyle = '#f0f2f5';
    context.lineWidth = 2;
    context.strokeRect(1, 1, fieldWidth - 2, fieldHeight - 2); // Outer boundary

    // Center line
    context.beginPath();
    context.moveTo(fieldWidth / 2, 0);
    context.lineTo(fieldWidth / 2, fieldHeight);
    context.stroke();

    // Center circle
    context.beginPath();
    context.arc(fieldWidth / 2, fieldHeight / 2, 9.15 * scale, 0, 2 * Math.PI, false);
    context.stroke();
    
    // Center spot
    context.beginPath();
    context.arc(fieldWidth / 2, fieldHeight / 2, 3, 0, 2 * Math.PI, false);
    context.fillStyle = '#f0f2f5';
    context.fill();

    // Penalty Areas & Goal Areas
    const drawPenaltyArea = (x, y, width, height) => {
      context.strokeRect(x, y, width, height);
    };

    const penaltyAreaY = (fieldHeight - 40.3 * scale) / 2;
    const goalAreaY = (fieldHeight - 18.32 * scale) / 2;

    // Left
    drawPenaltyArea(0, penaltyAreaY, 16.5 * scale, 40.3 * scale);
    drawPenaltyArea(0, goalAreaY, 5.5 * scale, 18.32 * scale);
    
    // Right
    drawPenaltyArea(fieldWidth - 16.5 * scale, penaltyAreaY, 16.5 * scale, 40.3 * scale);
    drawPenaltyArea(fieldWidth - 5.5 * scale, goalAreaY, 5.5 * scale, 18.32 * scale);

    // Penalty Spots
    const drawPenaltySpot = (x) => {
      context.beginPath();
      context.arc(x, fieldHeight / 2, 2, 0, 2 * Math.PI, false);
      context.fillStyle = '#f0f2f5';
      context.fill();
    };
    drawPenaltySpot(11 * scale);
    drawPenaltySpot(fieldWidth - 11 * scale);

    // Penalty Arcs
    context.beginPath();
    context.arc(11 * scale, fieldHeight / 2, 9.15 * scale, -Math.PI / 3.2, Math.PI / 3.2, false);
    context.stroke();
    context.beginPath();
    context.arc(fieldWidth - 11 * scale, fieldHeight / 2, 9.15 * scale, Math.PI + Math.PI / 3.2, Math.PI - Math.PI / 3.2, true);
    context.stroke();

    // Corner Arcs
    const drawCornerArc = (x, y, startAngle, endAngle) => {
      context.beginPath();
      context.arc(x, y, 1 * scale, startAngle, endAngle, false);
      context.stroke();
    };
    drawCornerArc(0, 0, 0, Math.PI / 2);
    drawCornerArc(fieldWidth, 0, Math.PI / 2, Math.PI);
    drawCornerArc(0, fieldHeight, -Math.PI / 2, 0);
    drawCornerArc(fieldWidth, fieldHeight, Math.PI, Math.PI * 1.5);
  };

  const drawPlayer = (context, player) => {
    context.shadowColor = 'rgba(0, 0, 0, 0.3)';
    context.shadowBlur = 5;
    context.shadowOffsetX = 2;
    context.shadowOffsetY = 2;

    // Different styling based on role
    const roleColors = {
      'GK': '#fbbf24', // Yellow for goalkeeper
      'CB': player.color,
      'CM': player.color,
      'ST': player.color
    };

    context.beginPath();
    context.arc(player.x, player.y, 16, 0, 2 * Math.PI);
    context.fillStyle = roleColors[player.role] || player.color;
    context.fill();
    
    // Special border for goalkeeper
    if (player.role === 'GK') {
      context.strokeStyle = '#f59e0b';
      context.lineWidth = 3;
    } else {
      context.strokeStyle = 'rgba(255, 255, 255, 0.8)';
      context.lineWidth = 2;
    }
    context.stroke();

    // Reset shadow for text
    context.shadowColor = 'transparent';

    context.fillStyle = player.role === 'GK' ? '#000000' : 'white';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.font = 'bold 16px Roboto';
    context.fillText(player.number, player.x, player.y);

    // Draw role indicator
    if (player.role) {
      context.fillStyle = player.role === 'GK' ? '#000000' : 'rgba(255, 255, 255, 1.0)';
      context.font = 'bold 16px Roboto';
      // Position role text above for red team (team2), below for blue team (team1)
      const roleY = player.team === 'team2' ? player.y - 28 : player.y + 28;
      context.fillText(player.role, player.x, roleY);
    }
  };

  const drawLine = (context, line) => {
    const lineColors = {
      'draw': '#f1c40f',      // Yellow for tactical lines
      'movement': '#e74c3c',  // Red for player movement
      'pass': '#1e40af'       // Deeper blue for passes
    };

    const lineWidths = {
      'draw': 4,
      'movement': 5,
      'pass': 4
    };

    context.beginPath();
    context.moveTo(line.startX, line.startY);
    context.lineTo(line.endX, line.endY);
    context.strokeStyle = lineColors[line.type] || '#f1c40f';
    context.lineWidth = lineWidths[line.type] || 4;
    context.lineCap = 'round';
    context.shadowColor = 'rgba(0, 0, 0, 0.3)';
    context.shadowBlur = 5;
    context.shadowOffsetX = 2;
    context.shadowOffsetY = 2;
    
    // Dashed line for passes
    if (line.type === 'pass') {
      context.setLineDash([10, 5]);
    } else {
      context.setLineDash([]);
    }
    
    context.stroke();
    
    // Draw arrowhead for movement and pass lines
    if (line.type === 'movement' || line.type === 'pass') {
      drawArrowhead(context, line.startX, line.startY, line.endX, line.endY, lineColors[line.type]);
    }
    
    // Reset shadow and dash
    context.shadowColor = 'transparent';
    context.setLineDash([]);
  };

  const drawArrowhead = (context, startX, startY, endX, endY, color) => {
    const angle = Math.atan2(endY - startY, endX - startX);
    const arrowLength = 15;
    const arrowAngle = Math.PI / 6;

    context.fillStyle = color;
    context.beginPath();
    context.moveTo(endX, endY);
    context.lineTo(
      endX - arrowLength * Math.cos(angle - arrowAngle),
      endY - arrowLength * Math.sin(angle - arrowAngle)
    );
    context.lineTo(
      endX - arrowLength * Math.cos(angle + arrowAngle),
      endY - arrowLength * Math.sin(angle + arrowAngle)
    );
    context.closePath();
    context.fill();
  };

  const drawBall = (context, ballPos) => {
    const radius = 12;
    
    // Shadow
    context.shadowColor = 'rgba(0, 0, 0, 0.4)';
    context.shadowBlur = 6;
    context.shadowOffsetX = 2;
    context.shadowOffsetY = 2;

    // Ball background (white)
    context.beginPath();
    context.arc(ballPos.x, ballPos.y, radius, 0, 2 * Math.PI);
    context.fillStyle = '#ffffff';
    context.fill();
    
    // Reset shadow for pattern
    context.shadowColor = 'transparent';

    // Draw the classic soccer ball pattern - simple and clean
    context.strokeStyle = '#000000';
    context.lineWidth = 1.5;
    context.fillStyle = '#000000';

    // Central black pentagon (smaller and cleaner)
    context.beginPath();
    const pentSize = 3;
    for (let i = 0; i < 5; i++) {
      const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
      const x = ballPos.x + Math.cos(angle) * pentSize;
      const y = ballPos.y + Math.sin(angle) * pentSize;
      if (i === 0) {
        context.moveTo(x, y);
      } else {
        context.lineTo(x, y);
      }
    }
    context.closePath();
    context.fill();

    // Draw simple curved lines radiating from pentagon (the classic soccer ball seams)
    context.strokeStyle = '#000000';
    context.lineWidth = 2;
    context.lineCap = 'round';

    // Five lines radiating from each pentagon vertex
    for (let i = 0; i < 5; i++) {
      const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
      const startX = ballPos.x + Math.cos(angle) * pentSize;
      const startY = ballPos.y + Math.sin(angle) * pentSize;
      const endX = ballPos.x + Math.cos(angle) * (radius - 2);
      const endY = ballPos.y + Math.sin(angle) * (radius - 2);
      
      context.beginPath();
      context.moveTo(startX, startY);
      context.lineTo(endX, endY);
      context.stroke();
    }

    // Add curved connecting lines between the radiating lines (hexagon edges)
    context.lineWidth = 1.5;
    for (let i = 0; i < 5; i++) {
      const angle1 = (i * 2 * Math.PI) / 5 - Math.PI / 2;
      const angle2 = ((i + 1) * 2 * Math.PI) / 5 - Math.PI / 2;
      
      const x1 = ballPos.x + Math.cos(angle1) * (radius - 2);
      const y1 = ballPos.y + Math.sin(angle1) * (radius - 2);
      const x2 = ballPos.x + Math.cos(angle2) * (radius - 2);
      const y2 = ballPos.y + Math.sin(angle2) * (radius - 2);
      
      // Draw curved line between endpoints
      context.beginPath();
      context.moveTo(x1, y1);
      const midX = ballPos.x + Math.cos((angle1 + angle2) / 2) * (radius + 1);
      const midY = ballPos.y + Math.sin((angle1 + angle2) / 2) * (radius + 1);
      context.quadraticCurveTo(midX, midY, x2, y2);
      context.stroke();
    }

    // Outer circle border
    context.strokeStyle = '#000000';
    context.lineWidth = 1;
    context.beginPath();
    context.arc(ballPos.x, ballPos.y, radius, 0, 2 * Math.PI);
    context.stroke();
  };

  // Function to check if a point is near a line
  const isPointNearLine = (mouseX, mouseY, line, threshold = 8) => {
    const { startX, startY, endX, endY } = line;
    
    // Calculate distance from point to line segment
    const A = mouseX - startX;
    const B = mouseY - startY;
    const C = endX - startX;
    const D = endY - startY;

    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    
    if (lenSq === 0) return false; // Line has no length
    
    let param = dot / lenSq;
    
    let xx, yy;
    
    if (param < 0) {
      xx = startX;
      yy = startY;
    } else if (param > 1) {
      xx = endX;
      yy = endY;
    } else {
      xx = startX + param * C;
      yy = startY + param * D;
    }

    const dx = mouseX - xx;
    const dy = mouseY - yy;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    return distance <= threshold;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);
    drawField(context, canvas);
    lines.forEach(line => drawLine(context, line));
    if (currentLine) {
      drawLine(context, currentLine);
    }
    players.forEach(player => drawPlayer(context, player));
    if (ball) {
      drawBall(context, ball);
    }
  }, [players, lines, currentLine, ball]);

  const handleMouseDown = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const mouseX = (e.clientX - rect.left) * scaleX;
    const mouseY = (e.clientY - rect.top) * scaleY;

    // Handle right-click (button 2) for deletion
    if (e.button === 2) {
      e.preventDefault();
      // Check if right-click is on the ball
      if (ball) {
        const dx = mouseX - ball.x;
        const dy = mouseY - ball.y;
        if (dx * dx + dy * dy < 12 * 12) { // Ball radius is 12
          setBall(null);
          return;
        }
      }
      // Check if right-click is on a line
      for (let i = lines.length - 1; i >= 0; i--) {
        const line = lines[i];
        if (isPointNearLine(mouseX, mouseY, line)) {
          setLines(lines.filter((_, index) => index !== i));
          return;
        }
      }
      // Check if right-click is on a player
      for (let i = players.length - 1; i >= 0; i--) {
        const player = players[i];
        const dx = mouseX - player.x;
        const dy = mouseY - player.y;
        if (dx * dx + dy * dy < 16 * 16) { // Player radius is 16
          deletePlayer(player.id);
          return;
        }
      }
      return; // Right-click on empty space, do nothing
    }

    // Handle left-click (button 0)
    if (e.button !== 0) return;

    setMouseDownPos({ x: mouseX, y: mouseY });
    setMouseDownButton(0); // Track that left button was pressed

    if (mode === 'draw' || mode === 'movement' || mode === 'pass') {
      setIsDrawing(true);
      setCurrentLine({ 
        startX: mouseX, 
        startY: mouseY, 
        endX: mouseX, 
        endY: mouseY,
        type: mode
      });
      return;
    }

    if (mode === 'ball') {
      setBall({ x: mouseX, y: mouseY });
      setMode('normal');
      return;
    }

    // Check if clicking on the ball first
    if (ball) {
      const dx = mouseX - ball.x;
      const dy = mouseY - ball.y;
      if (dx * dx + dy * dy < 12 * 12) { // Ball radius is 12
        setDraggingBall(true);
        setDragOffset({ x: dx, y: dy });
        return;
      }
    }

    // Check if clicking on a line
    for (let i = lines.length - 1; i >= 0; i--) {
      const line = lines[i];
      if (isPointNearLine(mouseX, mouseY, line)) {
        setDraggingLine({ index: i, line: line });
        // Calculate offset from mouse to line center
        const centerX = (line.startX + line.endX) / 2;
        const centerY = (line.startY + line.endY) / 2;
        setDragOffset({ x: mouseX - centerX, y: mouseY - centerY });
        return;
      }
    }

    for (let i = players.length - 1; i >= 0; i--) {
      const player = players[i];
      const dx = mouseX - player.x;
      const dy = mouseY - player.y;
      if (dx * dx + dy * dy < 16 * 16) { // Player radius is 16
        // Check for double-click
        const currentTime = Date.now();
        if (lastClickedPlayer === player.id && currentTime - lastClickTime < 300) {
          // Double-click detected - start editing
          const newNumber = prompt(`Enter player number (current: ${player.number}):`);
          const newPosition = prompt(`Enter player position (current: ${player.role || ''}):`);
          
          const updatedPlayer = { ...player };
          
          if (newNumber !== null && newNumber.trim() !== '') {
            updatedPlayer.number = newNumber.trim();
          }
          
          if (newPosition !== null) {
            updatedPlayer.role = newPosition.trim();
          }
          
          setPlayers(players.map(p => 
            p.id === player.id ? updatedPlayer : p
          ));
          
          setLastClickTime(0);
          setLastClickedPlayer(null);
          return;
        } else {
          setLastClickTime(currentTime);
          setLastClickedPlayer(player.id);
        }
        
        setDraggingPlayer(player);
        setDragOffset({ x: dx, y: dy });
        return;
      }
    }
  };

  const handleMouseMove = (e) => {
    if ((mode === 'draw' || mode === 'movement' || mode === 'pass') && isDrawing) {
      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      const mouseX = (e.clientX - rect.left) * scaleX;
      const mouseY = (e.clientY - rect.top) * scaleY;
      setCurrentLine(prevLine => ({ ...prevLine, endX: mouseX, endY: mouseY }));
      return;
    }

    if (!draggingPlayer && !draggingBall && !draggingLine) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const mouseX = (e.clientX - rect.left) * scaleX;
    const mouseY = (e.clientY - rect.top) * scaleY;
    const newX = mouseX - dragOffset.x;
    const newY = mouseY - dragOffset.y;

    if (draggingBall) {
      setBall({ x: newX, y: newY });
    } else if (draggingPlayer) {
      setPlayers(players.map(p =>
        p.id === draggingPlayer.id ? { ...p, x: newX, y: newY } : p
      ));
    } else if (draggingLine) {
      // Calculate the offset to move the line
      const originalLine = draggingLine.line;
      const centerX = (originalLine.startX + originalLine.endX) / 2;
      const centerY = (originalLine.startY + originalLine.endY) / 2;
      
      const deltaX = newX - centerX;
      const deltaY = newY - centerY;
      
      const updatedLine = {
        ...originalLine,
        startX: originalLine.startX + deltaX,
        startY: originalLine.startY + deltaY,
        endX: originalLine.endX + deltaX,
        endY: originalLine.endY + deltaY
      };
      
      setLines(lines.map((line, index) => 
        index === draggingLine.index ? updatedLine : line
      ));
    }
  };

  const handleMouseUp = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const mouseX = (e.clientX - rect.left) * scaleX;
    const mouseY = (e.clientY - rect.top) * scaleY;

    // Only process mouse up events for left clicks
    if (mouseDownButton !== 0) {
      setMouseDownButton(null);
      return;
    }

    if ((mode === 'draw' || mode === 'movement' || mode === 'pass') && isDrawing) {
      setLines([...lines, currentLine]);
      setIsDrawing(false);
      setCurrentLine(null);
      setMode('normal');
    } else if (mode === 'normal' && !draggingPlayer && !draggingBall && !draggingLine) {
      // Only add a player if the mouse is inside the canvas
      if (mouseX >= 0 && mouseX <= canvas.width && mouseY >= 0 && mouseY <= canvas.height) {
        addPlayer(mouseX, mouseY);
      }
    }

    setDraggingPlayer(null);
    setDraggingBall(false);
    setDraggingLine(null);
    setMouseDownPos(null);
    setMouseDownButton(null);
  };

  useEffect(() => {
    const handleWindowMouseUp = (e) => {
        if(draggingPlayer || draggingBall || draggingLine){
            setDraggingPlayer(null);
            setDraggingBall(false);
            setDraggingLine(null);
            setMouseDownPos(null);
            setMouseDownButton(null);
        }
    };

    window.addEventListener('mouseup', handleWindowMouseUp);

    return () => {
      window.removeEventListener('mouseup', handleWindowMouseUp);
    };
  }, [draggingPlayer, draggingBall, draggingLine]);


  const getCursor = () => {
    if (mode === 'draw' || mode === 'movement' || mode === 'pass') return 'crosshair';
    if (mode === 'ball') return 'crosshair';
    if (draggingPlayer || draggingBall || draggingLine) return 'grabbing';
    return 'pointer';
  };

  const handleContextMenu = (e) => {
    // Always prevent the default context menu from appearing
    e.preventDefault();
  };



  return (
    <div 
      ref={containerRef}
      style={{ 
        overflow: 'hidden', 
        borderRadius: '20px',
        position: 'relative'
      }}
    >
      <canvas
        ref={canvasRef}
        width={1200}
        height={780}
        style={{ 
          cursor: getCursor()
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onContextMenu={handleContextMenu}
      />
    </div>
  );
};

export default SoccerField;
