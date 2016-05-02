function animate() {
  var controller = new ScrollMagic.Controller();

  // spreadsheet
  var scene = new ScrollMagic.Scene({
    duration: 500,
    offset: -200,
    triggerElement: ".spreadsheet-section",
  })
  .setTween(".invoice", {
    transform: 'translate3d(0px, 0, 0)',
    opacity: 1,
    offset: -200,
  })
  .addTo(controller);

  // version controlled
  var version = new TimelineMax();
  version.add(TweenMax.to(".timecard-state.one", 3, {
    transform: 'translate3d(0px, 0, 0)',
    width: "29%",
  }));
  // fade in all time states
  version.add(TweenMax.to(".timecard-state", 1, {opacity: 1}));

  var scene = new ScrollMagic.Scene({
    duration: 500,
    offset: -100,
    triggerElement: ".versioned-section",
  })
  .setTween(version)
  .addTo(controller);

  // own your data
  var scene = new ScrollMagic.Scene({
    duration: 500,
    offset: -50,
    triggerElement: ".owndata-section",
  })
  .setTween(".glyph-owndata img", {
    transform: 'translate3d(-720px, -20px, 0)',
  })
  .addTo(controller);

  // terminal
  var scene = new ScrollMagic.Scene({
    duration: 500,
    offset: -50,
    triggerElement: ".features-tools",
  })
  .setTween(".terminal", {
    height: "28em"
  })
  .addTo(controller);

  // features

  // clock
  var scene = new ScrollMagic.Scene({
    duration: 500,
    offset: -50,
    triggerElement: ".features-watch",
  })
  .setTween(TweenMax.to(".features-watch .hand.end", 1, {
    rotation: 360,
  }))
  .addTo(controller);
}

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

  // mixpanel stats
  $("[ref=learnmore]").on("click", function() { mixpanel.track("click-learnmore") });
  $("[ref=signin]").on("click", function() { mixpanel.track("click-login", {from: "gettingstarted"}) });
  $("[ref=loginnav]").on("click", function() { mixpanel.track("click-login", {from: "nav"}) });

  // animations for home page
  if (typeof ScrollMagic !== "undefined") animate();
});
