class ApiHeroUI.Bootstrap.components.LoginForm extends ApiHeroUI.Bootstrap.components.FormView
  init:(o)->
    LoginForm.__super__.init.call @, o
    fieldHandlers = 
      "change input[name=reg_email]":->
        @$('input[name=email_confirm]').removeClass( 'hidden' ).focus() if @model.isValid()
      "change input[name=reg_password]":->
        @$('input[name=password_confirm]').removeClass( 'hidden' ).focus() if @model.isValid()
    _.extend @events, fieldHandlers