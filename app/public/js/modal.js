let modalToggles = document.querySelectorAll('.modal-toggle');

for (let modalToggle of modalToggles) {
	let modalId = modalToggle.getAttribute('data-target');
	let modal = document.getElementById(modalId);

	modalToggle.addEventListener('click', function() {
		if (!modal.classList.contains('modal-show')) {
			let inputs = modal.querySelectorAll('.form-control');
			for (let input of inputs) {
				input.value = '';
			}
			let extras = modal.querySelectorAll('.extra');
			for (let extra of extras) {
				extra.remove();
			}
		}
		modal.classList.toggle('modal-show');
		document.body.classList.toggle('no-scroll');
	});
}