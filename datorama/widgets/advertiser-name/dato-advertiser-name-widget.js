const queryResult = DA.query.getQueryResult();
console.log(JSON.stringify(queryResult));
if (queryResult.rows.length == 1) {
    let index = -1;
    for (let i = 0; i < queryResult.fields.length; i++) {
        let field = queryResult.fields[i];
        if (field.name.indexOf("Advertiser Full Name") >= 0) {
            index = i;
            break;
        }
    }

    queryResult.rows.forEach((row) => {
        const advertiserName = row[index].value.toUpperCase();
        const div = document.getElementById("title");
        div.textContent = advertiserName;
        return;
    });
} else {
    const filter = DA.query.getQuery().filter;
    for (let key in filter) {
        const kObj = filter[key];
        if (kObj.name === "Advertiser") {
            const advertiserName = kObj.value[0].value[0].toUpperCase();
            const div = document.getElementById("title");
            div.textContent = advertiserName;
            break;
        }
    }
}
