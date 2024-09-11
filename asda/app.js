const resultElement = document.getElementById('result')
const inp1 = document.getElementById('input1')
const inp2 = document.getElementById('input2')
const submitBtn = document.getElementById('submit')
const plus = document.getElementById('plus')
const minus = document.getElementById('minus')
let action = '+'

plus.onclick = function () {
	action = '+'
}
minus.onclick = function () {
	action = '-'
}

function printResult(result) {
	if (result < 0) {
		resultElement.style.color = 'red'
	} else {
		resultElement.style.color = 'green'
	}
	resultElement.textContent = result
}

function computeNumbersWithAction(val1, val2, actionSymbol) {
	const num1 = Number(val1.value)
	const num2 = Number(val2.value)
	return actionSymbol == '+' ? num1 + num2 : num1 - num2
}

submitBtn.onclick = function () {
	const result = computeNumbersWithAction(inp1, inp2, action)
	printResult(result)
}
 