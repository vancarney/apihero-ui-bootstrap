class ApiHeroUI.Bootstrap.controls.AlertView extends ApiHeroUI.core.View
  setMessage:(mssg, kind="danger")->
    @model.set {message: mssg, kind:kind}
  reset:->
    @model.set 'message', null
    @$('.alert').addClass( 'hidden' ).text ''
  render:->
    kind = @model.attributes.kind || @model.defaults.kind || 'danger'
    if (mssg = @model.attributes.mssg) is null or mssg is ''
      @$(".alert-#{kind}").addClass( 'hidden' ).text ''
    else
      @$(".alert-#{kind}").text( mssg ).removeClass 'hidden'
  init:->
    model_class = Backbone.Model.extend
      defaults:
        kind:"danger"
        message:""
    @model = new model_class
    @model.on 'change', @render, @