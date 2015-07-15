class ApiHeroUI.Bootstrap.controls.TypeAhead extends ApiHeroUI.Bootstrap.core.View
  lookup:->
    @$el.typeahead().lookup()
    @
  getActive:->
    @$el.typeahead().getActive()
  init:(o={})->
    _options = _.extend autoSelect: true, o
    @getOption = =>
      _options.get.apply @, arguments
    @setOption = =>
      _options.set.apply @, arguments
      @
