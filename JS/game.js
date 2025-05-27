'use strict'

// Global Variables
// ----------------
// gBoard
// A Matrix containing cell objects
// gLevel
// An object by which the board size is set
// gGame
// Holds the current game state

const MINE = '💣'
const FLAG = '🚩' 
const EMPTY = ' '

var gHistory = [];

var gBoard

var gTimerInterval = null;

var gLevel = {
    
    Beginner :{ SIZE: 4, MINES: 2},
    Medium :{ SIZE: 8, MINES: 14},
    'Help Me God' :{ SIZE: 12, MINES: 32},
}

var gCurrLevelName = 'Beginner';

var gCurrLevel     = gLevel[gCurrLevelName];

var gGame = {
  isOn: false,
  isFirstClick: true, 
  lives: 3,      
  revealedCount: 0,   
  markedCount: 0,    
  secsPassed: 0,
  hints: 3,
  isHintActive: false,
  safeClicks: 3,
  megaHints: 1,
  isMegaHintActive: false,
  megaHintFirstPos: null,
  isManualMode: false,
  manualMinesToPlace: 0,
  manualModeCompleted: false,     
};


function onInit() {
//   console.log(' Game initialized!');
//   gGame.isOn = true;
//   gBoard = buildBoard();                    
//   console.table(gBoard);
//   renderBoard(gBoard);
console.log('Game initialized!');
  gGame.isOn = false;
  gGame.isFirstClick = true
  gGame.lives = 3
  gGame.revealedCount = 0
  gGame.markedCount = 0
  gGame.secsPassed = 0
  gGame.hints = 3
  gGame.isHintActive = false
  gGame.safeClicks = 3
  gGame.isManualMode        = false;
  gGame.manualMinesToPlace  = gCurrLevel.MINES;
  gGame.manualModeCompleted = false;
  gBoard = buildBoard();
//   setMinesNegsCount(gBoard);
  console.table(gBoard);
  renderManualCount();
  renderBoard(gBoard)
  renderLives ()
  renderSmiley ('normal')
  renderHints()
  renderSafeClicks();
  renderMegaHint();
  stopTimer();
  renderTimer();
  renderBestScore();
  renderUndoButton();
  renderModeStatus();
  initDarkMode();
  if (!gGame.isManualMode) gGame.isOn = true
} 

function buildBoard() {
  console.log('Board Size', gCurrLevel.SIZE); 
  var board = [];

  // creating table rows
  for (var i = 0; i < gCurrLevel.SIZE; i++) {
    board[i] = [];

    // creating cells
    for (var j = 0; j < gCurrLevel.SIZE; j++) {
      
      board[i][j] = {
        minesAroundCount: 0,
        isRevealed: false,
        isMine: false,
        isMarked: false
      };
      console.log('Created cell at [' + i + ',' + j + ']:', board[i][j]);
    }
  }

  // Mines Demo 
//   board[1][2]= MINE
//   board[2][3]= MINE
//   console.log(' Mines placed at [1,2] and [2,3]')
    // board[1][2].isMine = true;
    // board[2][3].isMine = true;


  return board;  
}

function setMinesNegsCount(board) {
  console.log('Mines around each cell');
  for (var i = 0; i < board.length; i++) {
    for (var j = 0; j < board[i].length; j++) {
      var count = 0;
//   Nighbors loop
      for (let celli = -1; celli <= 1; celli++) {
        for (let cellj = -1; cellj <= 1; cellj++) {
          
          if (celli === 0 && cellj === 0) continue;

          const ni = i + celli;
          const nj = j + cellj;

          
          if (ni < 0 || nj < 0 || ni >= board.length || nj >= board[i].length) continue;
          if (board[ni][nj].isMine) count++;
        }
      }

      board[i][j].minesAroundCount = count;
      console.log(`Cell [${i},${j}] => minesAroundCount = ${count}`);
    }
  }
  console.table(board);
}

function renderBoard(board) {
  console.log('Rendering board...');
  var strHTML = ''
  
  //   for (var i = 0; i < board.length; i++) {
    //       strHTML += '<tr>';
    //       for (var j = 0; j < board[0].length; j++) {
        //           strHTML += '<td class="cell"></td>';
        //         }
        //         strHTML += '</tr>';
        //     }
  for (var i = 0; i < board.length; i++) {
    strHTML += '<tr>';
    for (var j = 0; j < board[i].length; j++) {
      var cell = board[i][j];
      var content = '';
      var className = '';
// add class if revealed
      if (cell.isRevealed) {
        className = 'revealed';
      if (cell.isMine) 
        content = MINE;
       else if (cell.minesAroundCount > 0) 
        content = cell.minesAroundCount;
      }

    //   console.log(`Rendering cell [${i},${j}]:`, content || '(empty)');
      strHTML += `<td class="cell ${className}" onclick="onCellClicked(this, ${i}, ${j})"
               oncontextmenu="onCellMarked(event, this, ${i}, ${j})">
              ${cell.isMarked ? FLAG : content}</td>`;
    }
    strHTML += '</tr>';
  }

//   elBoard.innerHTML = strHTML;

    var elBoard = document.querySelector('.board')
    elBoard.innerHTML = strHTML;
}

function onCellClicked(elCell, i, j) {
console.log('Cell clicked:', i, j);
saveState();
if (gGame.isManualMode) {
  if (gGame.manualMinesToPlace === 0) return;
  if (gBoard[i][j].isMine) return;

  gBoard[i][j].isMine = true;
    gGame.manualMinesToPlace--;
    renderBoard(gBoard);
    renderManualCount();

    if (gGame.manualMinesToPlace === 0) {
      gGame.isManualMode = false;
      gGame.manualModeCompleted = true;
      gGame.isOn = true;

      setMinesNegsCount(gBoard);

      gGame.isFirstClick = false;
      startTimer();
      renderManualCount();
      console.log('Manual placement done, game started');
      renderModeStatus();
    }
    return;
  }

  if (!gGame.isOn) return;

  var cell = gBoard[i][j];

  if (gGame.isMegaHintActive) {
  // if First - keep cor
  if (!gGame.megaHintFirstPos) {
    gGame.megaHintFirstPos = { i, j };
    console.log('Mega-Hint: first corner set at', i, j);
  } else {
    // sec corn 
    var start = gGame.megaHintFirstPos;
    var end   = { i, j };
    useMegaHint(start, end);
    gGame.megaHints--;
    renderMegaHint();
    gGame.isMegaHintActive = false;
    gGame.megaHintFirstPos = null;
  }
  return;
}

  // 1) Hint is on ?
  if (gGame.isHintActive && !cell.isRevealed) {
    console.log('💡 Using hint on:', i, j);
    revealTemporarily(i, j);
    gGame.isHintActive = false;
    return;
  }

  // 2) is cell revealed or flagged?
  if (cell.isRevealed || cell.isMarked) return;

  // 3) First click – place mines and count Negs
  if (gGame.isFirstClick) {
    console.log(' First click – placing mines');
    startTimer();
    placeMines(gBoard, i, j);
    setMinesNegsCount(gBoard);
    console.table(gBoard);
    gGame.isFirstClick = false;
  }

  // 4) if Mine life one is down
  if (cell.isMine) {
    console.log('Boom! You hit a mine.');
    gGame.lives--;
    renderLives();

    if (gGame.lives === 0) {
      console.log(' No lives left — Game Over');
      revealAllMines();
      gGame.isOn = false;
      renderSmiley('dead');
    } else {
      setTimeout(() => {
        cell.isRevealed = false;
        renderBoard(gBoard);
      }, 800);
    }
    return;
  }

  // 5) safeCell - recurstion reveal
  if (cell.minesAroundCount === 0) {
    expandReveal(gBoard, i, j);
  } else {
    cell.isRevealed = true;
    gGame.revealedCount++;
  }

  
  renderBoard(gBoard);
  checkVictory();
  if (!gGame.isOn) stopTimer ();
}

function onCellMarked(ev, elCell, i, j) {
  ev.preventDefault();
  saveState();
  if (!gGame.isOn) return;

  var cell = gBoard[i][j];
  if (cell.isRevealed) return;

  cell.isMarked = !cell.isMarked;
  gGame.markedCount += cell.isMarked ? 1 : -1;
  console.log(` MarkedCount = ${gGame.markedCount}`);

  renderBoard(gBoard);
  checkVictory();
}

function checkVictory() {
  const level = 'Beginner';
  const size = gCurrLevel.SIZE;
  const totalCells = size * size;
  const minesCount = gCurrLevel.MINES;

  if (
    gGame.revealedCount === totalCells - minesCount && gGame.markedCount === minesCount) 
    {
    console.log('WIN');
    gGame.isOn = false;
    renderSmiley('cool');
    stopTimer();

    if (setBestScore(level, gGame.secsPassed)) {
      console.log('New best time:', gGame.secsPassed);
  }
  renderBestScore ();
  }
}

function revealAllMines() {
  console.log('reveal mines');
  for (var i = 0; i < gBoard.length; i++) {
    for (var j = 0; j < gBoard[i].length; j++) {
      if (gBoard[i][j].isMine) {
        gBoard[i][j].isRevealed = true;
      }
    }
  }
  renderBoard(gBoard);
}

function placeMines(board, safeI, safeJ) {
  console.log(`placeMines: place ${gCurrLevel.MINE} Mines,insted of[${safeI},${safeJ}]`);
  let minesToPlace = gCurrLevel.MINES;

  // counts mine befor palcment
  while (minesToPlace > 0) {
    const i = getRandomInt(0, board.length);
    const j = getRandomInt(0, board[i].length);
    
    
    if ((i === safeI && j === safeJ) || board[i][j].isMine) continue;

    // updating the model
    board[i][j].isMine = true; 
    console.log(`Mine #${gCurrLevel.MINE - minesToPlace + 1} in[${i},${j}]`);
    minesToPlace--;
  }

  console.table(board); // updated model
  }

  function renderLives() {
  var elLives = document.getElementById('lives-count');
  elLives.innerText = gGame.lives;
  console.log('Lives left:', gGame.lives);
  }

  function renderSmiley(state) {
  var elSmiley = document.querySelector('.smiley');
  switch (state) {
    case 'normal':
      elSmiley.innerText = '😃';
      break;
    case 'dead':
      elSmiley.innerText = '💀';
      break;
    case 'cool':
      elSmiley.innerText = '😎';
      break;
  }
  console.log('Smiley is', elSmiley.innerText);
}

function renderHints() {
  var hintBtns = document.querySelectorAll('.hint');
  hintBtns.forEach((btn, idx) => {
    if (idx < gGame.hints) {
      btn.disabled = false;
      btn.innerText = '💡';
    } else {
      btn.disabled = true;
      btn.innerText = '❌';
    }
  });
}

function onHintClick(elBtn) {
  saveState();
  if (!gGame.isOn) return;
  if (gGame.hints === 0) return;
  // turn on Hint
  gGame.isHintActive = true;
  console.log('💡 Hint activated! Click a cell to use it.');
  // Marked as on 
  gGame.hints--;
  renderHints();
}

function revealTemporarily(i, j) {
  var cellsToReveal = [];
  for (let deltaI = -1; deltaI <= 1; deltaI++) {
    for (let deltaJ = -1; deltaJ <= 1; deltaJ++) {
      const ni = i + deltaI;
      const nj = j + deltaJ;
      if (ni < 0 || nj < 0 || ni >= gBoard.length || nj >= gBoard[0].length) continue;
      if (gBoard[ni][nj].isRevealed) continue; // כבר נחשף – נשמור אותו
      cellsToReveal.push({ i: ni, j: nj });
      gBoard[ni][nj].isRevealed = true;
    }
  }
  renderBoard(gBoard);
  setTimeout(() => {
    cellsToReveal.forEach(pos => {
      gBoard[pos.i][pos.j].isRevealed = false;
    });
    renderBoard(gBoard);
    console.log('💡 Hint ended.');
  }, 1500);
}

function renderSafeClicks() {
  var elBtn = document.getElementById('safe-btn');
  elBtn.innerText = gGame.safeClicks;
  elBtn.disabled = gGame.safeClicks === 0;
  console.log('Safe-Clicks left:', gGame.safeClicks);
}

function onSafeClick() {
    saveState();
  // if game is on and after first click
  if (!gGame.isOn || gGame.isFirstClick) return; 
  if (gGame.safeClicks === 0) return;

  // find a rendom pos of a safeCell that not have been revealed or flagged
  var emptyCells = [];
  for (var i = 0; i < gBoard.length; i++) {
    for (var j = 0; j < gBoard[i].length; j++) {
      var cell = gBoard[i][j];
      if (!cell.isMine && !cell.isRevealed && !cell.isMarked) {
        emptyCells.push({i, j});
      }
    }
  }
  if (!emptyCells.length) return;

  var idx = getRandomInt(0, emptyCells.length);
  var pos = emptyCells[idx];

  
  revealTemporarily(pos.i, pos.j);
  gGame.safeClicks--;
  renderSafeClicks();
}

function expandReveal(board, i, j) {
  // if outside borderes - stop
if (i < 0 || j < 0 || i >= board.length || j >= board[0].length) return;
  
// if a mime reveald or flagged - dont tuch
  var cell = board[i][j];
  if (cell.isMine || cell.isRevealed || cell.isMarked) return;

  cell.isRevealed = true;
  gGame.revealedCount++;
// if a Num is > 0 stop
   if (cell.minesAroundCount > 0) return;
  // in case all 8 Negs (count === 0) 
   for (var di = -1; di <= 1; di++) {
    for (var dj = -1; dj <= 1; dj++) {
      if (di === 0 && dj === 0) continue;
      expandReveal(board, i + di, j + dj);
    }
  }
}

function renderMegaHint() {
  var elCount = document.getElementById('mega-count');
  elCount.innerText = gGame.megaHints;
  // Mega-Hints - disable if there's none
  document.querySelector('.mega-hint').disabled = (gGame.megaHints === 0);
}

function onMegaHintClick() {
  saveState();
  if (!gGame.isOn || gGame.megaHints === 0) return;
  gGame.isMegaHintActive = true;
  gGame.megaHintFirstPos = null;
  console.log('Mega-Hint activated! Click first corner.');
}

function useMegaHint(start, end) {
  // Builed param
  var iMin = Math.min(start.i, end.i);
  var iMax = Math.max(start.i, end.i);
  var jMin = Math.min(start.j, end.j);
  var jMax = Math.max(start.j, end.j);

  // Cell that did not reaveld
  var toHide = [];
  for (var i = iMin; i <= iMax; i++) {
    for (var j = jMin; j <= jMax; j++) {
      var cell = gBoard[i][j];
      if (!cell.isRevealed) {
        toHide.push({ i, j });
        cell.isRevealed = true;
      }
    }
  }
  renderBoard(gBoard);
  console.log(`Mega-Hint: revealed [${iMin},${jMin}]→[${iMax},${jMax}]`);

  // 2 sec 
  setTimeout(() => {
    toHide.forEach(pos => {
      gBoard[pos.i][pos.j].isRevealed = false;
    });
    renderBoard(gBoard);
    console.log(' Mega-Hint ended.');
  }, 2000);
}

function renderTimer() {
  document.getElementById('timer').innerText = gGame.secsPassed;
}

function startTimer() {
  clearInterval(gTimerInterval);
  gGame.secsPassed = 0;
  renderTimer();
  gTimerInterval = setInterval(() => {
    gGame.secsPassed++;
    renderTimer();
  }, 1000);
}

function stopTimer() {
  clearInterval(gTimerInterval);
}

function getBestScore(levelName) {
  return localStorage.getItem('best_' + levelName);
}

function setBestScore(levelName, time) {
  const key = 'best_' + levelName;
  const prev = localStorage.getItem(key);
  if (!prev || time < +prev) {
    localStorage.setItem(key, time);
    return true;
  }
  return false;
}

function renderBestScore() {
  const level = 'Beginner'; // מאוחר יותר תחליף לדינמי
  const best = getBestScore(level);
  document.getElementById('best-score').innerText = best || '–';
}

function saveState() {
  const boardCopy = JSON.parse(JSON.stringify(gBoard));
  const gameCopy  = { 
    isOn:        gGame.isOn,
    isFirstClick:gGame.isFirstClick,
    lives:       gGame.lives,
    revealedCount: gGame.revealedCount,
    markedCount:   gGame.markedCount,
    secsPassed:    gGame.secsPassed,
    hints:       gGame.hints,
    isHintActive:gGame.isHintActive,
    safeClicks:  gGame.safeClicks,
    megaHints:   gGame.megaHints,
    isMegaHintActive: gGame.isMegaHintActive,
    megaHintFirstPos: gGame.megaHintFirstPos
  };
  gHistory.push({ board: boardCopy, game: gameCopy });
  renderUndoButton();
}

function onUndoClick() {
  if (!gHistory.length) return;
  const prev = gHistory.pop();
  gBoard = JSON.parse(JSON.stringify(prev.board));
  Object.assign(gGame, prev.game);
  renderBoard(gBoard);
  renderLives();
  renderSmiley(gGame.isOn ? 'normal' : (gGame.lives===0?'dead':'cool'));
  renderHints();
  renderSafeClicks();
  renderMegaHint();
  renderTimer();
  renderBestScore();
  renderUndoButton();
}

function renderUndoButton() {
  document.getElementById('undo-btn').disabled = (gHistory.length === 0);
}

function renderManualCount() {
  document.getElementById('manual-count').innerText =
    gGame.isManualMode
      ? gGame.manualMinesToPlace
      : '–';
  document.getElementById('manual-btn').innerText =
    gGame.isManualMode ? '✅ Done' : '✏️ Place Mines';
}

function onManualModeClick() {
  if (!gGame.isOn && !gGame.manualModeCompleted) {
    gGame.isManualMode = !gGame.isManualMode;
    if (gGame.isManualMode) {
      gGame.manualMinesToPlace = gCurrLevel.MINES;
      gBoard = buildBoard();
      renderBoard(gBoard);
    }
    renderManualCount();
    renderModeStatus();
  }
}

function renderModeStatus() {
  var el = document.getElementById('mode-status');
  if (gGame.isManualMode) {
    el.innerText = '📝 Placement Mode: click to place mines';
    document.body.classList.add('manual-mode');
  } else if (gGame.manualModeCompleted) {
    el.innerText = '🎮 Play Mode';
    document.body.classList.remove('manual-mode');
  } else {
    el.innerText = '';
    document.body.classList.remove('manual-mode');
  }
}

function onLevelSelect(levelName) {
  gCurrLevelName = levelName;
  gCurrLevel     = gLevel[levelName];
  document.querySelectorAll('.level-btn').forEach(btn => {
    btn.classList.toggle('selected', btn.innerText === levelName);
  });
  onInit();
}
