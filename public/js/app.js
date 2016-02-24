$(document).ready(function () {
  $('[data-toggle="popover"]').popover();

  // select the popover contents on click
  $("body").on("click", ".repo-badge .popover-content", function() {
    range = document.createRange();
    range.selectNodeContents(this);
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(range);
  });
});
