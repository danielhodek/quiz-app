function insertAfter(node, newNode) {
	node.parentNode.insertBefore(newNode, node.nextSibling);
}

function htmlToElement(html) {
	let template = document.createElement('template');
	html = html.trim();
	template.innerHTML = html;
	return template.content.firstChild;
}