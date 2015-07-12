class ApiHeroUI.Bootstrap.AlertView extends ApiHeroUI.core.View
  setMessage:(mssg, kind="danger")->
    @model.set {message: mssg, kind:kind}
  reset:->
    @model.set 'message', null
    @$('.alert').addClass( 'hidden' ).text ''
  render:->
    if mssg is null or mssg is ''
      @$(".alert-#{kind}").addClass( 'hidden' ).text ''
    else
      @$(".alert-#{kind}").text( mssg ).removeClass 'hidden'
  init:->
    @model = new (Backbone.Model.extends
      defaults:
        kind:"danger"
        message:""
    )
    @model.on 'change', @render, @