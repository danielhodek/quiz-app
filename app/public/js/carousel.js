/* Carousel Script */

let carousel = document.querySelector('.carousel');

let slides = carousel.querySelectorAll('ul li');
let slidesArray = Array.from(slides);
let currentSlide = slidesArray[0];
let carouselTransition = false;
currentSlide.classList.add('active');

carousel.querySelector('.carousel-next').addEventListener('click', function() {
	if (!carouselTransition) {
		console.log(carouselTransition);
		showNextSlide();
	}
});
carousel.querySelector('.carousel-prev').addEventListener('click', function() {
	if (!carouselTransition) {
		console.log(carouselTransition);
		showPrevSlide();
	}
});

function loopCarousel() {
	if (!carouselTransition) {
		showNextSlide();
	} 
}

let timer = setInterval(loopCarousel, 3000);

function showNextSlide() {
	clearInterval(timer);
	carouselTransition = true;

	let currentSlideIndex = slidesArray.indexOf(currentSlide);
	let nextSlideIndex = (currentSlideIndex === slidesArray.length - 1) ? 0 : currentSlideIndex + 1;
	let nextSlide = slidesArray[nextSlideIndex];

	nextSlide.style.left = currentSlide.offsetWidth + 'px';
	nextSlide.classList.add('active');
	currentSlide.style.left = -currentSlide.offsetWidth + 'px';

	currentSlide.addEventListener('transitionend', function reset() {
		this.classList.remove('active');
		this.style.left = null;
		this.removeEventListener('transitionend', reset);
		currentSlide = nextSlide;
		carouselTransition = false;
		timer = setInterval(loopCarousel, 3000);
	});

	nextSlide.style.left = '0px';
}

function showPrevSlide() {
	clearInterval(timer);
	carouselTransition = true;

	let currentSlideIndex = slidesArray.indexOf(currentSlide);
	let prevSlideIndex = (currentSlideIndex === 0) ? slidesArray.length - 1 : currentSlideIndex - 1;
	let prevSlide = slidesArray[prevSlideIndex];

	prevSlide.style.left = -currentSlide.offsetWidth + 'px';
	prevSlide.classList.add('active');
	currentSlide.style.left = currentSlide.offsetWidth + 'px';

	currentSlide.addEventListener('transitionend', function reset() {
		this.classList.remove('active');
		this.style.left = null;
		this.removeEventListener('transitionend', reset);
		currentSlide = prevSlide;
		carouselTransition = false;
		timer = setInterval(loopCarousel, 3000);
	});

	prevSlide.style.left = '0px';
}