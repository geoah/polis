var Handlebones = require("handlebones");
var template = require('../tmpl/conversationConfig');
var Utils = require("../util/utils");
var Constants = require("../util/constants");
var disappearingAlert = require("../util/polisAlert").disappearingAlert;
var serialize = require("../util/serialize");


module.exports =  Handlebones.ModelView.extend({
  name: "conversationConfigView",
  template: template,
  events: {
  "click #submitButton": "onFormChange"
  },
  onFormChange: function(e) {
    e.preventDefault();
    var that = this;

    serialize(this, function(attrs) {
      // attrs.is_active = Boolean(attrs.is_active);
      attrs.strict_moderation = that.$("#strictOn")[0].checked;
      attrs.write_type = that.$("#writeTypeOn")[0].checked ? 1 : 0;
      attrs.vis_type = that.$("#visTypeOn")[0].checked ? 1 : 0;
      attrs.help_type = that.$("#helpTypeOn")[0].checked ? 1 : 0;
      attrs.socialbtn_type = that.$("#socialbtnTypeOn")[0].checked ? 1 : 0;


      attrs.auth_needed_to_vote = that.$("#auth_needed_to_voteOn")[0].checked ? true : false;
      attrs.auth_needed_to_write = that.$("#auth_needed_to_writeOn")[0].checked ? true : false;
      attrs.auth_opt_fb = that.$("#auth_opt_fbOn")[0].checked ? true : false;
      attrs.auth_opt_tw = that.$("#auth_opt_twOn")[0].checked ? true : false;
      attrs.auth_opt_allow_3rdparty = that.$("#auth_opt_allow_3rdpartyOn")[0].checked ? true : false;


      attrs.conversation_id = that.model.get("conversation_id");
      var queryString = Utils.toQueryParamString(attrs);
      $.ajax({
        url: "/api/v3/conversations?" + queryString,
        type: "PUT",
      }).then(function() {
        disappearingAlert("Saved", 500).then(function() {
          window.location.reload();
        });
      }, function(err) {
        alert("error saving");
      });
    });

  },
  context: function() {
    var ctx = Handlebones.ModelView.prototype.context.apply(this, arguments);
    // ctx.created = new Date(Number(ctx.created));

    ctx.auth_needed_to_voteDefault = _.isNull(ctx.auth_needed_to_vote);
    ctx.auth_needed_to_voteIsOn = true === ctx.auth_needed_to_vote;
    ctx.auth_needed_to_voteIsOff = false === ctx.auth_needed_to_vote;

    ctx.auth_needed_to_writeDefault = _.isNull(ctx.auth_needed_to_write);
    ctx.auth_needed_to_writeIsOn = true === ctx.auth_needed_to_write;
    ctx.auth_needed_to_writeIsOff = false === ctx.auth_needed_to_write;

    ctx.auth_opt_twDefault = _.isNull(ctx.auth_opt_tw);
    ctx.auth_opt_twIsOn = true === ctx.auth_opt_tw;
    ctx.auth_opt_twIsOff = false === ctx.auth_opt_tw;

    ctx.auth_opt_fbDefault = _.isNull(ctx.auth_opt_fb);
    ctx.auth_opt_fbIsOn = true === ctx.auth_opt_fb;
    ctx.auth_opt_fbIsOff = false === ctx.auth_opt_fb;

    ctx.auth_opt_allow_3rdpartyDefault = _.isNull(ctx.auth_opt_allow_3rdparty);
    ctx.auth_opt_allow_3rdpartyIsOn = true === ctx.auth_opt_allow_3rdparty;
    ctx.auth_opt_allow_3rdpartyIsOff = false === ctx.auth_opt_allow_3rdparty;


    return ctx;
  },
  initialize: function(options) {
    Handlebones.ModelView.prototype.initialize.apply(this, arguments);
    var that = this;
    var conversation_id = this.conversation_id = this.model.get("conversation_id");
  } // end initialize
});
