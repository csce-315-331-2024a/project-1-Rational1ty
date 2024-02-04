// load saved style on page reload to keep style changes across refresh/navigation
window.addEventListener('load', () => {
	const savedStyle = localStorage.getItem('mdd_style');

	if (!savedStyle) return;

	const style = document.getElementById('style')
	style.setAttribute('href', savedStyle);
});

// set onclick event listener for toggle style button
document.getElementById('toggle').addEventListener('click', () => {
	const style = document.getElementById('style')

	const currStyle = style.getAttribute('href');
	const newStyle = currStyle === 'style1.css' ? 'style2.css' : 'style1.css';

	style.setAttribute('href', newStyle);
	localStorage.setItem('mdd_style', newStyle);
});
