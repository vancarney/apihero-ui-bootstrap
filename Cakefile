# require Node::FS
fs = require 'fs'
path = require 'path'
{_} = require 'lodash'
# require Node::Util
# connect = require 'connect'
{debug, error, log, print} = require 'util'
# import Spawn and Exec from child_process
{spawn, exec, execFile}=require 'child_process'

# colors
red   = "\u001b[0;31m"
green = "\u001b[0;32m"
reset = "\u001b[0;0m"
# try to import the Which module
try
  which = (require 'which').sync
catch err
  if process.platform.match(/^win/)?
    error 'The which module is required for windows. try "npm install which"'
  which = null

# file extensions for watching
exts='coffee|jade'
# Begin Callback Handlers
# Callback From 'coffee'
coffeeCallback=()->
  console.log arguments if arguments[0]?

mincerCallback = (cB)->
  proj_name     = path.basename __dirname
  manifest_path = "./dist/manifest.json"
  manifest      = require manifest_path
  assets        = manifest.assets
  done = _.after _.keys(assets).length, => 
    fs.unlink manifest_path, cB
  _.each assets, (file,name)=>
    exec "mv ./dist/#{file} ./dist/#{proj_name}#{path.extname name}", done()
# Callback From 'docco'
doccoCallback=()->
  # exec "rm -rf ../sparse-pages/docs; mv docs ../sparse-pages"
  
  
# Begin Tasks

# ## *setup*
# Installs Dependencies
task 'setup', 'Installs Dependencies', ()-> setup -> log ':)', green
setup = (cB)->
  exec "npm install ; bower install", cB
  
  
# ## *build*
# Compiles Sources
task 'build', 'Compiles Sources', ()-> build -> log ':)', green
build = (cB)->
  exec "node manifest", =>
    setTimeout (=> mincerCallback cB), 1200

# ## *watch*
# watch project src folders and build on change
task 'watch', 'watch project src folders and build on change', ()-> watch -> log ':)', green
watch = ()->
  exec "supervisor -e '#{['.coffee']}' -n exit -q -w '#{paths.coffee[1]}' -x 'cake' build"
# ## *minify*
# Minify Generated JS and HTML
task 'minify', 'Minify Generated JS and HTML', ()-> minify -> log ':)', green
minify = ()->
  exec 'uglifyjs -c --output lib/sparse.min.js lib/sparse.js'

# ## *docs*
# Generate Documentation
task 'docs', 'Generate Documentation', ()-> docs -> log ':)', green
docs = ()->
  # From Module 'docco'
  #
  if (moduleExists 'docco')
    try
    
      launch 'docco', fList.files, doccoCallback
    catch e
      error e

# ## *test*
# Runs your test suite.
task 'test', 'Runs your test suite.', (options=[],callback)-> test -> log ':)', green
test = (options=[],callback)->
  # From Module 'mocha'
  #
  if moduleExists('mocha')
    if typeof options is 'function'
      callback = options
      options = []

    # add coffee directive
    options.push '--compilers'
    options.push 'coffee:coffee-script/register'
    options.push '--reporter'
    options.push 'spec'
    # options.push '-g'
    # options.push 'Query+'
    console.log options.join ' '
    launch 'mocha', options, callback

# Begin Helpers
#  
launch = (cmd, options=[], callback) ->
  cmd = which(cmd) if which
  app = spawn cmd, options
  app.stdout.pipe(process.stdout)
  app.stderr.pipe(process.stderr)
  app.on 'exit', (status) -> callback?() if status is 0
log = (message, color, explanation) -> 
  console.log color+message+reset+(explanation or '') 
moduleExists = (name) ->
  try 
    require name 
  catch err 
    error "#{red}#{name} required: npm install #{name}#{reset}"
    false
walk = (dir, done) ->
  results = []
  fs.readdir dir, (err, list) ->
    return done(err, []) if err
    pending = list.length
    return done(null, results) unless pending
    for name in list
      continue if name.match( /^\./) or name.match( /\.json$/ )
      file = "#{dir}/#{name}"
      try
        stat = fs.statSync file
      catch err
        stat = null
      if stat?.isDirectory()
        walk file, (err, res) ->
          results.push name for name in res
          done(null, results) unless pending
      else
        results.push file
        done(null, results)