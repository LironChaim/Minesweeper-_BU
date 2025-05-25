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

var gBoard

var gLevel = {
    
    Beginner :{ SIZE: 4, MINES: 2},
    Medium :{ SIZE: 4, MINES: 2},
    'Help Me God' :{ SIZE: 4, MINES: 2},
}

var gGame = {
  isOn: false,
  isFirstClick: true, 
  lives: 3,      
  revealedCount: 0,   
  markedCount: 0,    
  secsPassed: 0      
};

function onInit() {
//   console.log(' Game initialized!');
//   gGame.isOn = true;
//   gBoard = buildBoard();                    
//   console.table(gBoard);
//   renderBoard(gBoard);
console.log('Game initialized!');
  gGame.isOn = true;
  gGame.isFirstClick = true
  gGame.lives = 3
  gGame.revealedCount = 0
  gGame.markedCount = 0
  gBoard = buildBoard();
  setMinesNegsCount(gBoard);
  console.table(gBoard);
  renderBoard(gBoard);
  renderLives ()
  renderSmiley ('normal')
} 

function buildBoard() {
  console.log('Board Size', gLevel['Beginner'].SIZE); 
  var board = [];

  // creating table rows
  for (var i = 0; i < gLevel['Beginner'].SIZE; i++) {
    board[i] = [];

    // creating cells
    for (var j = 0; j < gLevel['Beginner'].SIZE; j++) {
      
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
      strHTML += `<td class="cell ${className}" onclick="onCellClicked(this, ${i}, ${j})">${content}</td>`;
    }
    strHTML += '</tr>';
  }

//   elBoard.innerHTML = strHTML;

    var elBoard = document.querySelector('.board')
    elBoard.innerHTML = strHTML;
}

function onCellClicked(elCell, i, j) {
  console.log('Cell clicked:', i, j);
  var cell = gBoard[i][j];

  // chack for game ON
  if (!gGame.isOn) {
    console.log('game is not ON');
    return;
  }
  if (cell.isRevealed || cell.isMarked) {
    console.log(' Cell revealed / flagged');
    return;
  }

if (gGame.isFirstClick) {
    console.log('safe- first click');
    placeMines(gBoard, i, j);
    setMinesNegsCount(gBoard);
    console.table(gBoard);
    gGame.isFirstClick = false;
  }

// mark reveald cell
  cell.isRevealed = true;
  gGame.revealedCount++;
  console.log(`RevealedCount:' ${gGame.revealedCount}`);

  // if maine reveal all - game over
  if (cell.isMine) {
    console.log('clicked a mine.');
    revealAllMines();
    gGame.isOn = false;
    gGame.lives--;
    renderLives();
if (gGame.lives === 0) {
    revealAllMines()
    gGame.isOn = false
    renderSmiley ('dead')
}else {
    setTimeout (()=> {
        cell.isRevealed = false
        renderBoard(gBoard) 
        }, 800)
}
return;

    }

    console.log(`cell/neighbors = ${cell.minesAroundCount}`);
  // repeat render board
  renderBoard(gBoard);
  checkVictory();
}

function checkVictory() {
  var size = gLevel['Beginner'].SIZE;
  var totalCells = size * size;
  var minesCount = gLevel['Beginner'].MINES;
  if (gGame.revealedCount === totalCells - minesCount) {
    console.log('WIN');
    gGame.isOn = false;
    renderSmiley('cool');
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
  console.log(`placeMines: place ${gLevel['Beginner'].MINES} Mines,insted of[${safeI},${safeJ}]`);
  let minesToPlace = gLevel['Beginner'].MINES;

  // counts mine befor palcment
  while (minesToPlace > 0) {
    const i = getRandomInt(0, board.length);
    const j = getRandomInt(0, board[i].length);
    
    
    if ((i === safeI && j === safeJ) || board[i][j].isMine) continue;

    // updating the model
    board[i][j].isMine = true; 
    console.log(`Mine #${gLevel['Beginner'].MINES - minesToPlace + 1} in[${i},${j}]`);
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