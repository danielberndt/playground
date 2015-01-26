var React = require('react'),
    range = require("lodash.range");

var {addAnimation} = require("./animation");

var Card = require('./card.jsx');

function jitter(from, to) {
  return Math.random()*(to-from)+from;
}

var CardApp = React.createClass({

  getInitialState: function() {
    this._isOnDeck = false;
    this._maxDist = 0;
    return {numCards: 50}
  },

  _onClick: function() {
    if (this._isOnDeck) {
      this._goBack();
    } else {
      this._goOnDeck();
    }
    this._isOnDeck = !this._isOnDeck;
  },

  _goOnDeck: function() {
    var deck = this.refs.deck.getDOMNode(),
        target = {x: deck.offsetLeft, y: deck.offsetTop},
        cards = range(this.state.numCards).map((i) => this.refs["card-"+i].getDOMNode());

    this._maxDist = 0;

    cards.forEach((card, i) => {

      var source = {x: card.offsetLeft, y: card.offsetTop, width: card.offsetWidth},
          diffX = target.x-source.x,
          diffY = target.y - source.y,
          dist = Math.sqrt(diffX*diffX+diffY*diffY);

      this._maxDist = Math.max(dist, this._maxDist);

      card.style.transformOrigin = (diffX+source.width)/2+"px";
      card.style.zIndex = parseInt(dist,10);

      var opts = {
        durationMillis: 200+dist/this._getSpeedFactor(),
        delay: dist/this._getSpeedFactor(),
        props: {
          rotateY:{target:180, unit:'deg'},
          translateY:{target:diffY+jitter(-5,5), unit:'px'},
          translateX:{target:jitter(-5,5), unit:'px'},
          rotateZ:{target:jitter(1000/diffX,1000/diffX), unit:'deg'},
        }
      }
      addAnimation(card, opts);
    });
  },

  _goBack: function() {
    var deck = this.refs.deck.getDOMNode(),
        target = {x: deck.offsetLeft, y: deck.offsetTop},
        cards = range(this.state.numCards).map((i) => this.refs["card-"+i].getDOMNode());

    cards.forEach((card, i) => {
      var source = {x: card.offsetLeft, y: card.offsetTop, width: card.offsetWidth},
          diffX = target.x-source.x,
          diffY = target.y - source.y,
          dist = Math.sqrt(diffX*diffX+diffY*diffY);

      var opts = {
        durationMillis: 200+dist/this._getSpeedFactor(),
        delay: (this._maxDist-dist)/(this._getSpeedFactor()/3),
        props: {
          rotateY:{target:0, unit:'deg'},
          translateY:{target:0, unit:'px'},
          translateX:{target:0, unit:'px'},
          rotateZ:{target:0, unit:'deg'},
        }
      }
      addAnimation(card, opts);
    })
  },

  _onChangeNumCards: function(e) {
    this.setState({numCards: parseInt(e.target.value,10)});
    if (this._isOnDeck) this._onClick();
  },

  _getSpeedFactor: function() {
    return parseFloat(this.refs.speedFactorInput.getDOMNode().value);
  },

  render: function() {
    var cards = range(this.state.numCards).map(function(i) {return <Card key={i} ref={"card-"+i}/>;});
    return (
      <div>
        <dl>
          <dt>Number Cards</dt>
          <dd><input type="number" value={this.state.numCards} onChange={this._onChangeNumCards}/></dd>
          <dt>Speed Factor</dt>
          <dd><input type="number" defaultValue={3} ref="speedFactorInput"/></dd>
        </dl>
        <div className="playground">
          <div className="card-list">
            {cards}
          </div>
          <div className="deck-container">
            <div ref="deck" className="deck"></div>
            <button type="button" onClick={this._onClick}>Go!</button>
          </div>
        </div>
      </div>
    );
  }
});

document.addEventListener('DOMContentLoaded', function(){
  React.renderComponent(<CardApp/>, document.getElementById('card-app'));
});