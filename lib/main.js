var { ToggleButton } = require('sdk/ui/button/toggle');
var { setTimeout, setInterval } = require("sdk/timers");
var { Panel } = require("sdk/panel");

var START_DATE = new Date(2015, 0, 4);
var DAY_AS_MILLISECOND = 24 * 60 * 60 * 1000;
var PANEL_CONTENT_SCRIPT = "self.port.on(\"setDisplayString\", function(displayString) {" +
  " document.getElementById(\"panelHtml\").innerHTML = displayString;" +
"});";

// UIs to be shown on browser	
var button = ToggleButton({
  id: "week-day-count-button",
  label: "Eddiq", // This will change on update()
  icon: {
    "16": "./logosq-16.ico",
    "32": "./logosq-64.png",
    "64": "./logosq-64.png"
  },
  badgeColor: "rgba(240, 51, 26, 230)",
  onClick: buttonOnClick
});

var panel = Panel({
  width: 135,
  height: 30,
  contentURL: "./panel.html",
  contentScript: PANEL_CONTENT_SCRIPT,
  onHide: panelOnHide
});

function buttonOnClick() {
  panel.show({
    position: button
  });
}

function panelOnHide() {
  button.state("window", {
    checked: false
  });
}

function getWeeksAndDays() {
  var diff = Date.now() - Date.UTC(START_DATE.getFullYear(), START_DATE.getMonth(), START_DATE.getDate());
  var totalDayCount = Math.ceil(diff / DAY_AS_MILLISECOND);
  var weekCount = Math.trunc(totalDayCount / 7);
  var dayCount = totalDayCount - (weekCount * 7);
	
  return [weekCount, dayCount];
}

function getDisplayString() {
  function getDayString(day) {
    if (day == 1) {
      return "day";
    }
    else {
      return "days";
    }
  }
  var weeksAndDays = getWeeksAndDays();
  var dayString = (weeksAndDays[1] > 0) ? " & " + weeksAndDays[1] +
    " " + getDayString(weeksAndDays[1]) : "";
	
  return weeksAndDays[0] + " Weeks" + dayString + "! :D";
}

function getBadgeString() {
  var weeksAndDays = getWeeksAndDays();
  return weeksAndDays[0] + ":" + weeksAndDays[1];
}

function getNextMidnight() {
  var nextDay = new Date(Date.now() + DAY_AS_MILLISECOND);
  return new Date(nextDay.getFullYear(), nextDay.getMonth(), nextDay.getDate());
}

function update() {
  var displayString = getDisplayString();
  var badgeString = getBadgeString();
	
  button.label = displayString;
  button.badge = badgeString;
  panel.port.emit("setDisplayString", displayString);

  var nextMidnight = getNextMidnight();
  console.log("Scheduling next update at " + nextMidnight.toString());
  setTimeout(update, nextMidnight.getTime() - Date.now());
}

update();