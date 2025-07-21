$(document).ready(function () {
  // Array of notes
  const notes = [
    {
      title: "Apply",
      description:
        "Only direct conversions: apply now, open account, become a member, etc.",
    },
    {
      title: "Primary",
      description:
        "High-value actions: call links, contact forms, high-intent info e.g. rate views & calculators, etc.",
    },
    {
      title: "Secondary",
      description:
        "Support actions: branch lookups, directions, general info, learn more, etc.",
    },
  ];

  let footnoteContent = `
    <br/>
    <p class='rain-text-margin'>
      <div class="info-icon-wrapper">
        ℹ️
        <div class="custom-popover">
        <b> Disclaimer: </b> <br/>
The APS category was implemented in March/April 2025 and remained in beta until the end of July 2025. If a date range prior to implementation is selected, all conversions will appear as "uncategorized" and categories themselves may not be accurate or consistent during the beta period.</div>
     
     </div>
      <u>Conversion Category Descriptions:</u>
    </p>
  `;

  // Loop through the array to generate <p> elements
  notes.forEach((note) => {
    footnoteContent += `<p class="rain-text-margin"><b>${note.title}:</b> ${note.description}</p>`;
  });

  // Insert the generated HTML into the parent div with id 'RAIN-Conversion-Footnote'
  $("#RAIN-Conversion-Footnote").html(footnoteContent);
});
