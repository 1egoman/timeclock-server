$(document).ready(function () {
  $('[data-toggle="popover"]').popover();
  $('[data-toggle="tooltip"]').tooltip();

  // select the popover contents on click
  $("body").on("click", ".repo-badge .popover-content", function() {
    range = document.createRange();
    range.selectNodeContents(this);
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(range);
  });

  // smooth scroll divs
  $('a.smooth[href*="#"]').click(function() {
    if (location.pathname.replace(/^\//,'') == this.pathname.replace(/^\//,'') && location.hostname == this.hostname) {
      var target = $(this.hash);
      target = target.length ? target : $('[name=' + this.hash.slice(1) +']');
      if (target.length) {
        $('html, body').animate({
          scrollTop: target.offset().top
        }, 1000);
        return false;
      }
    }
  });

});
