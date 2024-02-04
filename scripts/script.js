const STYLE1 = 'styles/style1.css';
const STYLE2 = 'styles/style2.css';
const LS_KEY = 'mdd_style'

// load saved style on page reload to keep style changes across refresh/navigation
window.addEventListener('load', () => {
	const savedStyle = localStorage.getItem(LS_KEY);

	if (!savedStyle) return;

	const style = document.getElementById('style')
	style.setAttribute('href', savedStyle);
});

// set onclick event listener for toggle style button
document.getElementById('toggle').addEventListener('click', () => {
	const style = document.getElementById('style')

	const currStyle = style.getAttribute('href');
	const newStyle = currStyle === STYLE1 ? STYLE2 : STYLE1;

	// add transition style to all elements for smooth transition between styles (yes this is slow)
	const all = document.querySelectorAll('body *');
	
	for (const e of all) {
		e.classList.add('style-transition');
	}

	style.setAttribute('href', newStyle);
	localStorage.setItem(LS_KEY, newStyle);

	// we only want the transition to be applied during style change
	// has to be delayed or else it will remove the class during the transition
	setTimeout(() => {
		for (const e of all) {
			e.classList.remove('style-transition');
		}
	}, 500);
});
