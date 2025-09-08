const version = "1.3";

function dispatchClick(node, role) {
  const event = new MouseEvent("click", {
    view: window,
    bubbles: true,
    cancelable: true,
  });
  if(node.dispatchEvent(event)) {
    console.log("dispatchClick " + version + ": clicked " + node.nodeName + " text: " + node.textContent + " role: " + role);
    return true;
  }
  console.log("dispatchClick " + version + ": " + node.nodeName + " text: " + node.textContent + " role: " + role + " cancelled");
  return false;
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

function checkElement(match, checkDepth, desiredRole) {
  var xpath = "//span[text()='"+match.text+"']";
  var node = document.evaluate(xpath, match.node, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
  if(node) {
    while(node && checkDepth) {
      if(node.getAttribute('role') == desiredRole) {
        return {node: node, role: desiredRole, text: match.text, match: true };
      }
      node = node.parentNode;
      checkDepth--;
    }
  }
  return {match: false};
}


function setObserverEnabled(observer, enable) {
  if(enable) {
    observer.observe(document, { childList: true, subtree: true });
  } else {
    observer.disconnect();
  }
}

// Ordering Button observer
const orderingButtonCallback = (mutationList, observer) => {
  const triggerTexts = ['Most relevant','Top comments','Newest'];
  var matches = matchTrigger(triggerTexts, mutationList);
  for(const match of matches) {
    var check = checkElement(match, 2, "button");
    if(check.match) {
      // found an ordering button and it is not set to 'All comments'
      // enable ordering selector observer and click ordering button
      setObserverEnabled(orderingSelectorObserver, true);
      if(!dispatchClick(check.node, check.role)) {
        setObserverEnabled(orderingSelectorObserver, false);
      }
      return;
    }
  }
};

// Ordering Selector observer
const orderingSelectorCallback = (mutationList, observer) => {
  const triggerTexts = ['All comments'];
  var matches = matchTrigger(triggerTexts, mutationList);
  for(const match of matches) {
    var check = checkElement(match, 6, "menuitem");
    if(check.match) {
      // found an ordering selector item called 'All comments'
      // disable ordering selector observer and click 'All comments'
      setObserverEnabled(orderingSelectorObserver, false);
      dispatchClick(check.node, check.role);
      return;
    }
  }
};

const orderingButtonObserver = new MutationObserver(orderingButtonCallback);
const orderingSelectorObserver = new MutationObserver(orderingSelectorCallback);

setObserverEnabled(orderingButtonObserver, true);
