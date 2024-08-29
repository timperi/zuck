function simulateClick(node) {
	var alreadyClicked = node.getAttribute('sukkerperi-has-clicked');
	if(alreadyClicked == "true") {
		return true;
	}
	node.setAttribute('sukkerperi-has-clicked', "true");

  const event = new MouseEvent("click", {
    view: window,
    bubbles: true,
    cancelable: true,
  });
	console.log("simulateClick: clicking " + node.nodeName + " text: " + node.textContent);
  return node.dispatchEvent(event);
}

function matchTrigger(triggerTexts, mutationList) {
	var matchedNodes = [];
	for (const mutation of mutationList) {
		if (mutation.type === "childList") {
			for(const addedNode of mutation.addedNodes) {
				if(addedNode.nodeName === "DIV") {
					for(const triggerText of triggerTexts) {
						if(addedNode.textContent.includes(triggerText)) {
							matchedNodes.push( {text: triggerText, node: addedNode});
						}
					}
				}
			}
		}
	}
	return matchedNodes;
}

function checkElementAndClickIfMatch(match, checkDepth, desiredRole) {
	var xpath = "//span[text()='"+match.text+"']";
	var node = document.evaluate(xpath, match.node, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
	if(node) {
		while(node && checkDepth) {
			if(node.getAttribute('role') == desiredRole) {
				simulateClick(node);
				return;
			}
			node = node.parentNode;
			checkDepth--;
		}
	}
}

function enableObserver(observer, enable) {
	if(enable) {
		observer.observe(document, { childList: true, subtree: true });
	} else {
		observer.disconnect();
	}
}

// Ordering Button observer
const orderingButtonCallback = (mutationList, observer) => {
	const triggerTexts = ['Top comments','Newest','All comments'];
	var matches = matchTrigger(triggerTexts, mutationList);
	for(const match of matches) {
		checkElementAndClickIfMatch(match, 2, "button");
	}
};
const orderingButtonObserver = new MutationObserver(orderingButtonCallback);

// Ordering Selector observer
const orderingSelectorCallback = (mutationList, observer) => {
	const triggerTexts = ['All comments'];
	var matches = matchTrigger(triggerTexts, mutationList);
	for(const match of matches) {
		checkElementAndClickIfMatch(match, 6, "menuitem");
	}
};
const orderingSelectorObserver = new MutationObserver(orderingSelectorCallback);

enableObserver(orderingButtonObserver, true);
enableObserver(orderingSelectorObserver, true);
