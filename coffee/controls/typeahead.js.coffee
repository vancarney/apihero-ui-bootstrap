## ApiHeroUI.Bootstrap.controls.TypeAhead
# Wrapper for Twitter's Typeahead.js (formerly Bootstrap Typeahead)
# author: Van Carney <carney.van@gmail.com>
class ApiHeroUI.Bootstrap.controls.TypeAhead extends ApiHeroUI.Bootstrap.View
  el:'.typeahead'
  displayKey:null
  close:->
    @$el.typeahead 'close'
    @
  open:->
    @$el.typeahead 'open'
    @
  getValue:->
    @$el.typeahead 'val'
  setValue:(v)->
    @$el.typeahead 'val', v
    @
  destroy:->
    @$el.typeahead 'destroy'
    @
  init:(o={},ds=null)->
    # TypeAhead.__super__.init.apply @, arguments
    
    _opts = o.opts || {}
    _ds   = ds
    
    @setDataSource = (ds={})=>
      _ds = _.pick ds, ['source','async', 'name','limit','display','templates']
      @$el.typeahead _opts, _ds
      @
    @getDataSource = =>
      _ds
      
    @setOptions = (opts={}, ds)=>
      _.extend _opts, _.pick opts, ['highlight','hint','minLength','classNames']
      if ds?
        @setDataSource ds
      else
        try
          @$el.typeahead _opts || {}, _ds || {}
        catch e
          console.log e
      @
    if (@dataSource)
      @setOptions _opts, @dataSource
    @getOptions = =>
      _opts
    # event Bindinds...
    @$el.bind 'typeahead:active', (evt,d)=> @trigger 'active', evt, d
    @$el.bind 'typeahead:idle', (evt,d)=> @trigger 'idle', evt, d
    @$el.bind 'typeahead:open', (evt,d)=> @trigger 'open', evt, d
    @$el.bind 'typeahead:close', (evt,d)=> @trigger 'close', evt, d
    @$el.bind 'typeahead:change', (evt,d)=> @trigger 'change', evt, d
    @$el.bind 'typeahead:select', (evt,d)=> @trigger 'change', evt, d
    @$el.bind 'typeahead:render', (evt,d)=> @trigger 'render', evt, d
    @$el.bind 'typeahead:autocomplete', (evt,d)=> @trigger 'autocomplete', evt, d
    @$el.bind 'typeahead:cursorchange', (evt,d)=> @trigger 'cursorchange', evt, d
    @$el.bind 'typeahead:asyncrequest', (evt,d)=> @trigger 'asyncrequest', evt, d
    @$el.bind 'typeahead:asynccancel', (evt,d)=> @trigger 'asynccancel', evt, d
    @$el.bind 'typeahead:asyncreceive', (evt,d)=> @trigger 'asyncreceive', evt, d