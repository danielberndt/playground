var React = require('react');

var Card = React.createClass({

  getInitialState: function() {
    return {}
  },

  render: function() {
    return (
      <div className="card">
        <div className="card-front"></div>
        <div className="card-back"></div>
      </div>
    );
  }
});

module.exports = Card;