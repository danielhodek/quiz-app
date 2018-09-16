let numberInputs = document.querySelectorAll('.number-input');

for (let numberInput of numberInputs) {
	let min = parseInt(numberInput.getAttribute('data-min'));
	let max = parseInt(numberInput.getAttribute('data-max'));
	let step = parseInt(numberInput.getAttribute('data-step'));

	let decrementButton = numberInput.querySelector('.decrement');
	let incrementButton = numberInput.querySelector('.increment');
	let display = numberInput.querySelector('input');
	
	decrementButton.addEventListener('click', function() {
		let count = parseInt(display.value);
		if (count > min) {
			display.value = count - step;
		}
	});

	incrementButton.addEventListener('click', function() {
		let count = parseInt(display.value);
		if (count < max) {
			display.value = count + step;
		}
	});
}