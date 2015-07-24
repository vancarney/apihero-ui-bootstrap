class test.AppView extends ApiHeroUI.core.Application
  subviews:
    "nav":ApiHeroUI.core.View
    "#connect.modal":test.components.LoginModal
(( global, $ ) ->
  $(document).bind (if global.Util.isPhonegap() then 'deviceready' else 'ready'), =>
    window.app    = new test.AppView
    auth          = Test.Auth.getInstance()
    @router       = new Test.Router
    @registerUser = auth.registerUser
    @login        = auth.login
    @getUser      = auth.getUser
    @isAuthenticated = auth.isAuthenticated
) window, jQuery