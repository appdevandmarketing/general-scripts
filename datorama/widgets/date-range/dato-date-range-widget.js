function createPerformanceHeaderHTML(filter) {
    const startDate = filter.date.startDate;
    const endDate = filter.date.endDate;

    // Format dates to "01 Mar 2025" format
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, '0');
        const month = date.toLocaleDateString('en-US', { month: 'short' });
        const year = date.getFullYear();
        return `${day} ${month} ${year}`;
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
const filter = DA.query.getQuery()
const htmlElement = createPerformanceHeaderHTML(filter);
document.getElementById("widget-container").innerHTML = htmlElement

