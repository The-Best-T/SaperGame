const playBtnElem = document.querySelector('#play-btn')
const fieldElem = document.querySelector('#cells-map')
const timerElem = document.querySelector('#timer')
const bombsCountElem = document.querySelector('#bombs-count')
const gameNameElem = document.querySelector('#game-name')

let bombsCount
let openedCells
let field
let gameStatus = false
let seconds
let timerId

playBtnElem.addEventListener('click', InitializeGame)

function InitializeGame() {
	gameStatus = true

	playBtnElem.removeEventListener('click', InitializeGame)
	playBtnElem.addEventListener('click', RestartGame)

	const playBtnIcon = playBtnElem.querySelector('i')
	playBtnIcon.classList.remove('fa-play')
	playBtnIcon.classList.add('fa-rotate-right')

	gameNameElem.style.zIndex = -1

	seconds = 0
	timerElem.innerHTML = '00:00'

	for (let i = 0; i < 10; i++) {
		for (let j = 0; j < 10; j++) {
			const cellElem = fieldElem.rows[i].cells[j]
			cellElem.classList.add('cell-closed')
			cellElem.classList.add('black-border')
			cellElem.addEventListener('contextmenu', event => {
				event.preventDefault()
			})
			cellElem.addEventListener(
				'contextmenu',
				MarkCellHandler.bind({ x: i, y: j })
			)
			cellElem.addEventListener(
				'click',
				OpenCellHandler.bind({ x: i, y: j })
			)
		}
	}

	bombsCount = 10
	openedCells = 0

	bombsCountElem.innerHTML = bombsCount

	field = [
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	]

	for (let i = 0; i < 10; i++) {
		let x
		let y

		do {
			x = Math.trunc(Math.random() * 10)
			y = Math.trunc(Math.random() * 10)
		} while (field[x][y] === 10)

		field[x][y] = 10
		IncreaseNeighbors(x, y)
	}

	timerId = setInterval(UpdateTimer, 1000)
}

function RestartGame() {
	location.reload()
}

function IncreaseNeighbors(x, y) {
	for (let i = x - 1; i < x + 2; i++) {
		for (let j = y - 1; j < y + 2; j++) {
			if (i === x && j === y) continue
			if (i < 0 || i > 9 || j < 0 || j > 9) continue
			if (field[i][j] === 10) continue

			field[i][j]++
		}
	}
}

function OpenCellHandler(event) {
	event.preventDefault()

	if (!gameStatus) return

	const cell = event.target
	if (!cell.classList.contains('cell')) return
	if (cell.querySelector('i').classList.contains('fa-flag')) return

	OpenCell(cell, this.x, this.y)
}

function OpenCell(cell, x, y) {
	if (!cell.classList.contains('cell-closed')) return

	cell.classList.remove('cell-closed')
	cell.removeEventListener('contextmenu', MarkCellHandler)
	cell.removeEventListener('click', OpenCellHandler)

	const iconNumber = SetIcon(cell, x, y)

	if (iconNumber === 10) {
		EndGame('Loose')
	}
	if (iconNumber === 0) QueueOpen(x, y)

	openedCells++
	if (openedCells === 90) EndGame('Win')
}

function SetIcon(cell, x, y) {
	if (field[x][y] === 0) return 0

	let iconName = 'fa-'
	if (field[x][y] === 10) iconName += 'bomb'
	else iconName += field[x][y]

	const icon = cell.querySelector('i')
	icon.classList.add(iconName)
	icon.classList.add('fa-solid')
	return field[x][y]
}

function QueueOpen(x, y) {
	for (let i = x - 1; i < x + 2; i++) {
		for (let j = y - 1; j < y + 2; j++) {
			if (i === x && j === y) continue
			if (i < 0 || i > 9 || j < 0 || j > 9) continue
			if (field[i][j] === 10) continue

			OpenCell(fieldElem.rows[i].cells[j], i, j)
		}
	}
}

function MarkCellHandler(event) {
	event.preventDefault()

	if (!gameStatus) return

	const icon = event.target.querySelector('i') ?? event.target
	if (bombsCount == 0 && !icon.classList.contains('fa-flag')) return

	ChangeFlag(icon)
	UpdateBombsCounter(icon)
}

function EndGame(message) {
	alert(message)
	gameStatus = false
	clearInterval(timerId)
}

function ChangeFlag(icon) {
	icon.classList.toggle('fa-solid')
	icon.classList.toggle('fa-flag')
}

function UpdateBombsCounter(icon) {
	if (!icon.classList.contains('fa-flag')) bombsCount++
	else bombsCount--

	bombsCountElem.innerHTML = bombsCount
}

function UpdateTimer() {
	seconds++
	if (seconds >= 3600) return

	let minutesView = Math.trunc(seconds / 60)
	if (minutesView.toString().length < 2) minutesView = '0' + minutesView

	secondsView = seconds - minutesView * 60
	if (secondsView.toString().length < 2) secondsView = '0' + secondsView

	timerElem.innerHTML = minutesView + ':' + secondsView
}
