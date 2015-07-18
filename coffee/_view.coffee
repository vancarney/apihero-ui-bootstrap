class ApiHeroUI.Bootstrap.View extends ApiHeroUI.core.View
  show:->
    @$el
    .addClass 'show'
    .removeCLass 'hidden'
    @
  hide:->
    @$el
    .addClass 'hidden'
    .removeCLass 'show'
    @
  setTooltip:(text,opts={})->
    @$el.toolTip _.extend opts, title:text
    @
  pullLeft:->
    @$el.addClass 'pull-left'
  pullRight:->
    @$el.addClass 'pull-right'