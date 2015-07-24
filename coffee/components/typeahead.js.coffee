class ApiHeroUI.Bootstrap.components.Typeahead extends ApiHeroUI.Bootstrap.View
  el:'.typeahead'
  setCollection:(collection)->
    @collection = unless typeof collection is 'function' then collection else new collection
    return unless @collection
    @collection.on 'reset', =>
      ds = _.map @collection.models, (m)-> m.valueOf()
      @$el.typeahead 
        source: ds,
        header:"<div class='col-xs-12'><a href='#'>Click Here to see All Results</a></div>"
    @collection.fetch reset: true 
  init:(o={})->
    Typeahead.__super__.init o