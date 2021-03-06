/*jslint indent: 2 */
/*global document: false, chrome: false, $: false, createLink: false, createProjectSelect: false*/

(function () {
  "use strict";
  var iframeRegex = /oauth2relay/, userData = null,
    selectedProjectId = null, selectedProjectBillable = false;

  function createTimerLink(task, tags) {
    var link = createLink('toggl-button asana');
    link.addEventListener("click", function (e) {
      chrome.extension.sendMessage({
        type: 'timeEntry',
        description: task,
        tags: tags,
        projectId: selectedProjectId,
        billable: selectedProjectBillable
      });
      link.innerHTML = "Started...";
      return false;
    });
    return link;
  }

  function addButton(e) {
    if (e.target.className === "details-pane-redesign" || iframeRegex.test(e.target.name)) {
      setTimeout(function () {
        var taskDescription = $(".property.description"),
            title = $("#details_pane_title_row textarea#details_property_sheet_title").value,
            asanaProject = $(".ancestor-projects > .tag, .property.projects .token_name"),
            ancestor_task = $(".ancestor-link"),
            task_id = window.location.pathname.split("/").slice(-1)[0],
            projectSelect = createProjectSelect(userData, "toggl-select asana", asanaProject ? asanaProject.text : '');

        // prefix subtask with ancestor
        if (ancestor_task) title = ancestor_task.text + " - " + title;

        //make sure we init the values when switching between tasks
        selectedProjectId = projectSelect.value;
        selectedProjectBillable = false;

        projectSelect.onchange = function (event) {
          selectedProjectId = event.target.options[event.target.selectedIndex].value;
          if (selectedProjectId !== "default") {
            selectedProjectBillable = userData.projects.filter(function (elem, index, array) {
                                        return (elem.id === selectedProjectId);
                                      })[0].billable;
          } else {
            selectedProjectId = null;
            selectedProjectBillable = false;
          }
        };

        taskDescription.parentNode.insertBefore(createTimerLink(title, ["ztask-" + task_id]), taskDescription.nextSibling);
        taskDescription.parentNode.insertBefore(projectSelect, taskDescription.nextSibling);
      } , 1000);
    }
  }

  chrome.extension.sendMessage({type: 'activate'}, function (response) {
    if (response.success) {
      console.log(response.user);
      userData = response.user;
      document.addEventListener("DOMNodeInserted", addButton);
    }
  });

}());
