##> Bootstrap Modal
# View Wrapper forPicklist JS Component
class ApiHeroUI.Bootstrap.controls.Picklist extends ApiHeroUI.core.View
  events:
    "click .list-group-item": (evt)->
      @__selectedValue = (@__selectedEl = @$(evt.target).closest '.list-group-item').attr 'data-value'
      @trigger 'change', @getSelected()
  getSelected: ->
    o = 
      el: @__selectedElement
      val: @__selectedValue
  value: ->
    @getSelected().val
  valueOf: ->
    @getSelected()
