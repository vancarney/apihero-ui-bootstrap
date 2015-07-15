class ApiHeroUI.Bootstrap.search.View extends ApiHeroUI.search.View
  init:(o)->
    subviews['.search-filter'] = ApiHeroUI.Bootstrap.search.FilterElement
    View.__super__.init.apply @, arguments
