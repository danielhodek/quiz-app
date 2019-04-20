function insertAfter(node, newNode) {
	node.parentNode.insertBefore(newNode, node.nextSibling);
}

function htmlToElement(html) {
	let template = document.createElement('template');
	html = html.trim();
	template.innerHTML = html;
	return template.content.firstChild;
}

function dom(selector) {
	if (typeof selector === 'string' || selector instanceof String) {
		if (selector.length > 0) {
			switch (selector[0]) {
				case '#': return document.getElementById(selector.substr(1));
				case '.': return document.getElementsByClassName(selector.substr(1));
				default: return document.getElementsByTagName(selector);
			}
		}
	} 
	return null;
}

function getParams(data) {
	let params = {};
	if (data instanceof Array) {
		for (let d of data) {
			params[d.id] = d.value;
		}
	}
	let string = '';
	for (let p in params) {
		if (string.length > 0) string += '&';
		string += p + '=' + params[p]
	}
	return string;
}

function ajaxGet() {

}

function ajaxPost(action, settings) {
	let params = getParams(settings.content);
	let xhr = new XMLHttpRequest();
	xhr.open('POST', action, );
	xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
	xhr.send(params);
	xhr.onload = function() {
		if (this.status === 200) {
			let data = JSON.parse(this.responseText);
			this.data = data;
			if (data.success) {
				settings.success.call(this);
			} else {
				settings.error.call(this);
			}
		}
	}
}