class ApiHeroUI.Bootstrap.Tooltip extends Backbone.View
  ns:ApiHeroUI.controls
  options: new (Backbone.Model.extend
    defaults:
      "data-placement":"top"
      title:""
    validate:(attrs, opts)->
      valid = ['top','left','bottom','right']
      attr = 'data-placement'
      if attrs.hasOwnProperty attr
        return 'data-placement must be top,left,bottom or right' unless 0 <= valid.indexOf attrs[attr]
    valueOf:->
      o = @attributes
      o['data-toggle'] = 'tooltip'
      o
  )
  render:(options)->
    return unless @options.isValid()
    @attributes = _.extend @attributes, @model.valueOf()
    @
  intialize:(el,opts={})->
    @options
    .on 'change', @render, @
    .set opts
$.fn.Tooltip = (opts)=>
  return new ApiHeroUI.Bootstrap.Tooltip {el: @}, opts || {}