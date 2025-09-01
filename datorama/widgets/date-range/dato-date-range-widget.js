function createPerformanceHeaderHTML(filter) {
  const startDate = filter.date.startDate;
  const endDate = filter.date.endDate;

  const MONTHS = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const formatDate = (yyyyMmDd) => {
    const [y, m, d] = yyyyMmDd.split("-").map(Number);
    return `${String(d).padStart(2, "0")} ${MONTHS[m - 1]} ${y}`;
  };

  const formattedStartDate = formatDate(startDate);
  const formattedEndDate = formatDate(endDate);

  return `
        <div id="header">
            <img id="logo" src="https://rainlocal.com/wp-content/uploads/2018/11/Rain-Horizontal.png"/>
        </div>
        <div id="note">Performance during &nbsp;&nbsp;<b>${formattedStartDate}</b>&nbsp;&nbsp;to&nbsp;&nbsp;
            <b>${formattedEndDate}</b>
        </div>
    `;
}
const filter = DA.query.getQuery();
const htmlElement = createPerformanceHeaderHTML(filter);
const container = document.getElementById("rain-widget-container");
if (container != null) {
  container.innerHTML = htmlElement;
} else {
  document.getElementById("widget-container").innerHTML = htmlElement;
}
