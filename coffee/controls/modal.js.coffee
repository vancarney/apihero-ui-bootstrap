##> Bootstrap Modal
# View Wrapper for Bootstrap's Modal JS Component
class ApiHeroUI.Bootstrap.controls.Modal extends ApiHeroUI.core.View
  events:
    # resends modal `hide.bs.modal` event as `hiding`
    'hide.bs.modal':->
      @trigger 'hiding', @$el
    # resends modal `hidden.bs.modal` event as `hidden`
    'hidden.bs.modal':->
      @trigger 'hidden', @$el
    # resends modal `show.bs.modal` event as `showing`
    'show.bs.modal':->
      @trigger 'showing', @$el
    # resends modal `shown.bs.modal` event as `shown`
    'shown.bs.modal':->
      @trigger 'shown', @$el
    # resends modal `loaded.bs.modal` event as `loaded`
    'loaded.bs.modal':->
      @trigger 'loaded', @$el
  # convenience accessor method to `show` on Modal
  show:->
    @$el.modal 'show'
  # convenience accessor method to `hide` on Modal
  hide:->
    @$el.modal 'hide'
  # convenience accessor method to `toggle` on Modal
  toggle:->
    @$el.modal 'toggle'
  # convenience accessor method to `handleUpdate` on Modal
  handleUpdate:->
    @$el.modal 'handleUpdate'
  init:(o={show:false})->
    # sets modal options if any passed
    @$el.modal _.pick o, ['backdrop','keyboard','show','remote']