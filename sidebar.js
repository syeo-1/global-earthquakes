// functions for manipulating the sidebard menu

function openNav() {
  document.getElementById("mySidenav").style.width = "250px";
}

function closeNav() {
  document.getElementById("mySidenav").style.width = "0";
}

function toggleNav() {
    document.getElementById("mySidenav").classList.toggle("open");
}

// export function getFormValues() {
//   const dateStartValue = document.getElementById("date-start").value;
//   const dateEndValue = document.getElementById("date-end").value;
//   const minMagValue = document.getElementById("min-mag").value;
//   const maxMagValue = document.getElementById("max-mag").value;

//   return {
//     "dateStart": dateStartValue,
//     "dateEnd": dateEndValue,
//     "minMag": minMagValue,
//     "maxMag": maxMagValue
//   }
// }

function getTodayDate() {
  return (new Date()).toISOString().split('T')[0];
}

function getMinDate() {
  return minDate = (new Date(new Date().setDate((new Date()).getDate() - 30))).toISOString().split('T')[0];
}

function getDateValues() {
  // get todays date and today minus 30 days (minimum date) in yyyy-mm-dd format

  // Source - https://stackoverflow.com/a/32192991
  // Posted by leaksterrr, modified by community. See post 'Timeline' for change history
  // Retrieved 2026-02-10, License - CC BY-SA 4.0

  const today = (new Date()).toISOString().split('T')[0];
  const minDate = (new Date(new Date().setDate((new Date()).getDate() - 30))).toISOString().split('T')[0];

  return {
    "today": today,
    "minDate": minDate
  }

}

// export function convertYYYYMMDDToEpochMilliseconds(dateString) {
//   const [year, month, day] = dateString.split("-").map(Number)
//   const epochMillisecondsDate = Date.UTC(year, month-1, day)

//   return epochMillisecondsDate
// }


function setInitialFormRestrictionsAndValues() {
  dateValues = getDateValues()

  document.getElementById("date-start").min = dateValues.minDate
  document.getElementById("date-start").max = dateValues.today
  document.getElementById("date-start").value = dateValues.minDate

  document.getElementById("date-end").min = dateValues.minDate
  document.getElementById("date-end").max = dateValues.today
  document.getElementById("date-end").value = dateValues.today

  document.getElementById("min-mag").value = 0
  document.getElementById("max-mag").value = 10
}

// window.addEventListener("load", setInitialFormRestrictionsAndValues);
