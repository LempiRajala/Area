enum STATES {
  NEW_GAME,
  INIT,
  // проверка после смены игрока
  CHECK_DEFEAT_BEFORE_MOVE,
  WAIT_FOR_ROLL,
  ROLL,
  WAIT_FOR_FIRST_CORNER,
  WAIT_FOR_SECOND_CORNER,
  // проверка перед сменой игрока
  CHECK_DEFEAT_AFTER_MOVE,
  CHANGE_PLAYER,
  FILL_SURROUNDED_IF_ANY,
  END_GAME
}

export default STATES;