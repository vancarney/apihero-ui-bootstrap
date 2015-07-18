class yungcloud.AppView extends ApiHeroUI.core.Application
  subviews:
    "nav":ApiHeroUI.core.View
    "#connect.modal":yungcloud.components.LoginModal
(( global, $ ) ->
  $(document).bind (if global.Util.isPhonegap() then 'deviceready' else 'ready'), =>
    window.app    = new yungcloud.AppView
    auth          = Yungcloud.Auth.getInstance()
    @router       = new Yungcloud.Router
    @registerUser = auth.registerUser
    @login        = auth.login
    @getUser      = auth.getUser
    @isAuthenticated = auth.isAuthenticated
) window, jQuery