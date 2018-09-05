/* Collapsible Script */

let toggles = document.querySelectorAll('.toggle');

for (let i = 0; i < toggles.length; i++) {
	let toggle = toggles[i];
	let targetId = toggle.getAttribute('data-target');
	let target = document.getElementById(targetId);

	toggle.addEventListener('click', function() {
		if (!target.classList.contains('transition')) {
			if (target.style.maxHeight) {
				target.style.maxHeight = null;
				toggle.classList.remove('active');
			} else {
				target.classList.add('show');
				target.classList.add('transition');
				target.style.maxHeight = target.scrollHeight + 'px';
				toggle.classList.add('active');
			}
		}
	});

	target.addEventListener('transitionend', function() {
		let targetCurrentHeight = getComputedStyle(target).getPropertyValue('max-height');
		if (targetCurrentHeight == '0px') {
			target.classList.remove('show');
			target.classList.remove('transition');
			toggle.classList.remove('active');
		} else {
			target.classList.remove('transition');
		}
	});
}
