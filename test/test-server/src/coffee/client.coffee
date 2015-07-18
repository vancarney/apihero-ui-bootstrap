self = exports ? window
self.Test = RikkiTikki.createScope 'test'
self.Test.Object::idAttribute = 'id'
class self.Test.item extends self.Test.Model
  defaults:
    name:""
    description:""
class self.Test.items extends self.Test.Collection
  model:self.Test.item