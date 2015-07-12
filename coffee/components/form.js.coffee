class ApiHeroUI.Bootstrap.components.FormView extends ApiHeroUI.components.FormView
  alertDelegate:null
  failureMessage:'form submission failed'
  successMessage:'form submission was succesful'
  init:(o)->
    FormView.__super__.init.call @, o
    @alertDelegate = o.alertDelegate if o.hasOwnProperty 'alertDelegate'
    @on "changing", (=> @alertDelegate?.reset() ), @
    @on 'invalid', ((model, e)=> @alertDelegate?.setMessage e, 'danger'), @
    @on 'submit-failure', ((e)=> @alertDelegate?.setMessage @failureMessage, 'danger'), @
    @on 'submit-success', (=> @alertDelegate?.setMessage @successMessage, 'success'), @