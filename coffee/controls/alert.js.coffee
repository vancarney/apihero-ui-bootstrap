class ApiHeroUI.Bootstrap.controls.AlertView extends ApiHeroUI.core.View
  events:
    "click button.close": (evt)->
      evt.preventDefault()
      evt.stopPropagation()
      @reset()
      false
  setMessage:(mssg, kind)->
    @model.set {message: mssg, kind:(kind || @model.defaults.kind || 'danger')}
  reset:->
    @model.set {message: null}
  render:->
    kind = @model.getKind()
    if (mssg = @model.attributes.message) is null or mssg is '' or mssg is undefined
      return @$el.removeClass("alert-#{kind}").addClass( 'hidden' ).find('.alert-text').text ''
    @$el.addClass("alert-#{kind}").find('.alert-text').text( mssg ).end().removeClass 'hidden'
  init:->
    model_class = Backbone.Model.extend
      defaults:
        kind:"danger"
        message:""
      getKind:->
        @attributes.kind || @model.defaults.kind || 'danger'
      validate:(o)->
        mssg = o.message || @attributes.message
        kind = o.kind || @attributes.kind
        return 'Alert Message must be string' unless typeof mssg is 'string'
        return 'Alert Kind must be string' unless typeof kind is 'string'
        return "Alert Kind must be one of: #{kinds.join(',')}" unless 0 <= ['danger','info','warn','success'].indexOf kind
    @model = new model_class
    @model.on 'change', @render, @
    @model.on 'invalid', -> console.log @validationError