

// add event listeners for tabs
const activateTab = (event) => {
  const tabSheets = document.querySelectorAll('.tabcontent-container section'),
        tabs = document.querySelectorAll('#QuickFolders-Options-Tabbox button');
  let btn = event.target;
  Array.from(tabSheets).forEach(tabSheet => {
    tabSheet.classList.remove("active");
  });
  Array.from(tabs).forEach(button => {
    button.classList.remove("active");
  });

  const { target: { value: activeTabSheetId = "" } } = event;
  if (activeTabSheetId) {
    document.getElementById(activeTabSheetId).classList.add("active");
    btn.classList.add("active");
    // store last selected tab
    browser.LegacyPrefs.setPref('extensions.quickfolders.lastSelectedOptionsTab', btn.getAttribute("tabNo"));
  }
}

for (button of document.querySelectorAll("#QuickFolders-Options-Tabbox button")) {
  button.addEventListener("click", activateTab);
}


async function savePref(event) {
  let target = event.target,
      prefName = target.dataset.prefName; // automatically added from data-pref-name
  
	if (target instanceof HTMLInputElement) {
		if (target.getAttribute("type") === "checkbox") {
			await browser.LegacyPrefs.setPref(prefName, target.checked);
		} 
    else if (target.getAttribute("type") === "text" ||
			target.dataset.prefType === "string") {
			await browser.LegacyPrefs.setPref(prefName, target.value);
		} 
    else if (target.getAttribute("type") === "number") {
			await browser.LegacyPrefs.setPref(prefName, parseInt(target.value, 10));
		} 
    else if (target.getAttribute("type") === "radio" && target.checked) {
      await browser.LegacyPrefs.setPref(prefName, target.value);
    }    
    else {
			console.error("Received change event for input element with unexpected type", event);
		}
	} 
  else if (target instanceof HTMLSelectElement) {
		if (target.dataset.prefType === "string") {
			await browser.LegacyPrefs.setPref(prefName, target.value);
		} 
    else {
			await browser.LegacyPrefs.setPref(prefName, parseInt(target.value, 10));
		}
	} 
  else if (element instanceof HTMLTextAreaElement) {
    await browser.LegacyPrefs.setPref(prefName, target.value);
  }  
  else {
		console.error("Received change event for unexpected element", event);
	}  
}

async function loadPrefs() {
  // use LegacyPrefs
	const prefElements = Array.from(document.querySelectorAll("[data-pref-name]"));
	for (const element of prefElements) {
		const prefName = element.dataset.prefName;
		if (!prefName) {
			console.error("Preference element has unexpected data-pref attribute", element);
			continue;
		}
		if (element instanceof HTMLInputElement) {
      if (element.getAttribute("type") === "checkbox") {
        element.checked = await browser.LegacyPrefs.getPref(prefName);
      } 
      else if (element.getAttribute("type") === "text" ||
        element.dataset.prefType === "string"
      ) {
        element.value = await browser.LegacyPrefs.getPref(prefName);
      } 
      else if (element.getAttribute("type") === "number") {
        element.value = (await browser.LegacyPrefs.getPref(prefName)).toString();
      } 
      else if (element.getAttribute("type") === "radio") {
        let radioVal = (await browser.LegacyPrefs.getPref(prefName)).toString();
        if (element.value === radioVal) {
          element.checked = true;
        }
      }
      else {
        console.error("Input element has unexpected type", element);
      }
		} 
    else if (element instanceof HTMLSelectElement) {
			if (element.dataset.prefType === "string") {
				element.value = await browser.LegacyPrefs.getPref(prefName);
			} else {
				element.value = (await browser.LegacyPrefs.getPref(prefName)).toString();
			}
		} else if (element instanceof HTMLTextAreaElement) {
      element.value = await browser.LegacyPrefs.getPref(prefName);
    }
    else {
			console.error("Unexpected preference element", element);
		}
    
    // Wire up individual event handlers
    element.addEventListener("change", savePref);
    
	}  
  
  // 
}

i18n.updateDocument();
loadPrefs();
preselectTab();

// preselect the correct tab.
async function preselectTab() {

  let selectOptionsPane = await browser.LegacyPrefs.getPref('extensions.quickfolders.lastSelectedOptionsTab'),
      activeTabSheetId = "QuickFolders-General";
    // selectOptionsPane can be overwritten by URL parameter "selectedTab"
  let optionParams = new URLSearchParams(document.location.search);
  let selTab = optionParams.get("selectedTab");
  if (selTab.toString() != "" && selTab .toString() != "-1") {
    selectOptionsPane = selTab;
  }
  switch(parseInt(selectOptionsPane, 10)) {
    case 0:
      activeTabSheetId = "QuickFolders-General";
      break;
    case 1:
      activeTabSheetId = "QuickFolders-Advanced";
      break;
    case 2:
      activeTabSheetId = "QuickFolders-Layout";
      break;
    case 3:
      activeTabSheetId = "QuickFolders-Help";
      break;
    case 4:
      activeTabSheetId = "QuickFolders-Support";
      break;
    case 5:
      activeTabSheetId = "QuickFolders-Pro";
      break;
  }
  let tabEvent = new Event("click"),
      selectedTabElement = document.getElementById(activeTabSheetId);
  if (selectedTabElement) {
    selectedTabElement.dispatchEvent(tabEvent);
  }
}



