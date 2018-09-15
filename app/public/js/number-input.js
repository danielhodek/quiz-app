let numberPickers = document.querySelectorAll('.number-picker');

for (let numberPicker of numberPickers) {
	let min = parseInt(numberPicker.getAttribute('data-min'));
	let max = parseInt(numberPicker.getAttribute('data-max'));
	let step = parseInt(numberPicker.getAttribute('data-step'));

	let decrementButton = numberPicker.querySelector('.decrement');
	let incrementButton = numberPicker.querySelector('.increment');
	let display = numberPicker.querySelector('input');
	
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