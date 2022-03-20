// init <pre> tags
// adjust_pre_tag();

window.addEventListener("load", adjust_pre_tag);

function adjust_pre_tag() {
	var elements = document.getElementsByTagName("pre");
	for (var e = 0; e < elements.length; e++) {
		var element = elements[e];
		var content = element.innerHTML;
		var lines = content.split("\n");
		while (allStartsWithTab(lines)) {
			for (var l = 0; l < lines.length; l++) {
				var line = lines[l];
				if (line.length > 0) {
					line = line.replace("\t", "");
					lines[l] = line;
				}
			}
		}
		element.innerHTML = page(lines);
	}
	function allStartsWithTab(lines) {
		var length = lines.length;
		if (length < 1) {
			return false;
		}
		for (var i = 0; i < lines.length - 1; i++) {
			if (!(lines[i].startsWith("\t"))) {
				return false;
			}
		}
		return true;
	}
}

// below are util method
function page(lines) {
	var page = "";
	var length = lines.length;
	if (length < 1) {
		return page;
	}
	if (length == 1) {
		return lines[0];
	}
	for (var i = 0; i < length - 1; i++) {
		page += lines[i] + "\n";
	}
	// page += "" + page[length - 1];
	return page;
}