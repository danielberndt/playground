var cards, container;

// the more elements, the more delayed the scroll effect.
var lastScrollTops = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];

function recalc() {
  var newScrollTop = container.scrollTop;
  lastScrollTops.push(newScrollTop);
  lastScrollTops.splice(0,1);
  var i, didScroll=false;
  for (i=0;i<lastScrollTops.length-1;i++) {
    if (lastScrollTops[i]!=lastScrollTops[i+1]) {
      didScroll=true;
      break;
    }
  }
  if (didScroll) {
    var avgScroll = 0;
    for (i=0;i<lastScrollTops.length;i++) avgScroll+=lastScrollTops[i];
    avgScroll/=lastScrollTops.length;
    for (i=0;i < cards.length;i++) {
      var c = cards[i];
      c.style.transform = "translateZ("+(-(Math.abs(avgScroll - c.offsetTop+200)/300))+"px)";
      c.style.zIndex = 10000- Math.abs(c.offsetTop-200 - avgScroll);
    }
  }

  requestAnimationFrame(recalc);
}

document.addEventListener('DOMContentLoaded', function(){
  cards = document.getElementsByClassName("card");
  container = document.getElementsByClassName("cards")[0];
  var c1 = document.getElementsByClassName("card")[0];
  var cl = document.getElementsByClassName("card")[49];
  c1.style.marginTop = "200px";
  cl.style.marginBottom = "300px";
  recalc();
  requestAnimationFrame(recalc);
});