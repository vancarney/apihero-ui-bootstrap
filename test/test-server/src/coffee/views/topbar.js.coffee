class test.views.TopBar extends ApiHeroUI.Bootstrap.View
  subviews:
    '.typeahead':ApiHeroUI.Bootstrap.components.Typeahead
  # init:->
    # @collection = new self.Yungcloud.TypeAhead
    # @collection.on 'reset', =>
      # ds = _.map @collection.models, (m)-> m.valueOf()
      # # $('input[data-provide=typeahead]').typeahead 'destroy'
      # console.log ds.length
      # $('input[data-provide=typeahead]').typeahead 
        # source: ds,
        # autoSelect:true
    # # $('input[data-provide=typeahead]').typeahead(source:[])
    # # $('input[data-provide=typeahead]').on 'change', (evt)=>
      # # @collection.url = "/api/v1/Search/query?q=#{$(evt.target).val()}"
      # # @collection.fetch reset: true
    # @collection.url = "/api/v1/Search/typeahead?q="
    # @collection.fetch reset: true      