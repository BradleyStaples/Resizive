Resizive = ->
  elements =
    startButton: $(".btn-start")
    pauseButton: $(".btn-pause")
    minusButton: $(".btn-minus")
    plusButton: $(".btn-plus")
    helpButton: $(".button-help")
    dataEntry: $(".data-entry")
    showWidth: $(".show-width")
    showWidthEM: $(".show-width-em")
    showWidthPX: $(".show-width-px")
    header: $(".header")
    url: $(".url-entry")
    img: $(".loading")
    body: $("body")
    win: $(window)

  data =
    url: null
    timer: null
    paused: false
    resizing: false
    klassResize: "resizing"
    klassPause: "paused"
    direction: -1
    stepDuration: 50
    stepIncrememnt: 10
    animationDuration: 100
    animationIncrement: 50
    minWidth: 320
    currWidth: elements.win.width()
    maxWidth: elements.win.width()
    iframe: "<iframe frameborder=\"0\" width=\"100%\" height=\"100%\" class=\"resizer\" src=\"{{url}}\"></iframe>"

  animator = (duration) ->
    elements.body.animate
      width: data.currWidth
    , duration, ->
      elements.showWidth.text data.currWidth + "px"

    window.location.hash = "#url=" + encodeURIComponent(elements.url.val()) + "&width=" + encodeURIComponent(data.currWidth)

  end = ->
    mw = data.maxWidth
    elements.body.removeClass data.klassResize
    clearInterval data.timer
    elements.body.stop true, true
    elements.img.css "display", "none"
    $(".resizer").remove()
    elements.pauseButton.html "<span>P</span>ause"
    elements.body.removeClass data.klassPause
    data.url = null

    # reset the direction
    data.direction = -1

    # reset the width back to the current max viewport size for currWidth and actual body/header elements
    data.currWidth = mw
    elements.body.width mw
    elements.header.width mw
    elements.showWidth.text mw + "px"
    elements.startButton.html("<span>S</span>tart").attr "title", "For best results maximize your browser first =)"
    window.location.hash = ""
    data.paused = false
    data.resizing = false

  getQueryString = ->
    result = {}
    queryString = location.hash.toString().substring(1)

    # complicated regex magickery found on stackoverflow
    regex = /([^&=]+)=([^&]*)/g
    matches = undefined

    # while the regex finds matches in a xxx=yyy format, it splits & parses them up
    matches = regex.exec(queryString)
    while matches

      # also decodes them in case they are URI encoded
      result[decodeURIComponent(matches[1])] = decodeURIComponent(matches[2])
      matches = regex.exec(queryString)

    # return any matches as an array
    result

  keepInBounds = (reset) ->
    if data.currWidth > data.maxWidth
      data.currWidth = data.maxWidth
      data.direction *= -1  if reset
    else if data.currWidth < data.minWidth
      data.currWidth = data.minWidth
      data.direction *= -1  if reset

  minus = ->
    updateDirection -1
    resize "stepDuration", "stepIncrememnt"

  parseQueryString = ->
    params = getQueryString()
    if params.hasOwnProperty("url") and params.hasOwnProperty("width")
      if params.url isnt "" and not isNaN(params.width)
        elements.url.val params.url
        data.currWidth = parseInt(params.width, 10)
        elements.showWidth.text(params.width + "px").blur()
      return true
    false

  pause = ->
    elements.body.addClass(data.klassPause).stop true, true
    clearInterval data.timer
    updateWidth elements.body.width()
    data.paused = true
    elements.pauseButton.html "<span>R</span>esume"

  plus = ->
    updateDirection +1
    resize "stepDuration", "stepIncrememnt"

  resize = (durationType, sizeType) ->
    adjustment = data[sizeType]
    duration = data[durationType]
    reset = (if (durationType is "stepDuration") then false else true)
    startingWidth = data.currWidth
    data.currWidth = data.currWidth + (adjustment * data.direction)
    keepInBounds reset
    animator duration  if startingWidth isnt data.currWidth

  resume = ->
    elements.body.removeClass(data.klassPause).stop true, true
    data.timer = setInterval(->
      resize "animationDuration", "animationIncrement"
    , data.animationDuration)
    data.paused = false
    elements.pauseButton.html "<span>P</span>ause"

  setBindings = ->
    k = undefined
    elements.win.resize updateMaxWidth
    elements.startButton.click ->
      if data.resizing
        end()
      else
        start()

    elements.pauseButton.click ->
      if data.paused
        resume()
      else
        pause()

    elements.plusButton.click plus
    elements.minusButton.click minus
    elements.url.keydown (e) ->
      e.stopPropagation()
      # enter key
      start false  if e.which is 13 # pass explicit false to show no query data and avoid auto pause

    elements.showWidth.blur ->
      setWidth()

    elements.showWidth.keydown (e) ->
      e.stopPropagation()
      if e.which is 13 # enter key
        # prevent carriage return with preventDefault
        e.preventDefault()
        elements.showWidth.blur()


    # keyboard controls via Kibo : https://github.com/marquete/kibo
    k = new Kibo()
    k.down ["s"], start
    k.down ["e"], end
    k.down ["p"], pause
    k.down ["r"], resume
    k.down ["down", "left", "-"], minus
    k.down ["up", "right", "+"], plus

  setWidth = ->
    px = elements.showWidth.text().replace(" ", "").replace("px", "").replace("em", "")
    startingWidth = data.currWidth
    if isNaN(px)
      elements.showWidth.text data.currWidth + "px"
    return
    data.currWidth = parseInt(px, 10)
    if data.currWidth < startingWidth
      updateDirection -1
    else
      updateDirection +1
    keepInBounds false
    animator data.animationDuration  if startingWidth isnt data.currWidth

  start = (queryLoad) ->
    elements.body.addClass data.klassResize
    elements.startButton.html("<span>E</span>nd").attr "title", ""
    elements.img.css "display", "block"

    # Todo: validate URL
    data.url = elements.url.val()
    data.url = "http://" + data.url  if data.url.indexOf("://") is -1
    $(data.iframe.replace("{{url}}", data.url)).css("display", "none").appendTo(elements.body).one "load", ->
      elements.img.css "display", "none"
      $(".resizer").css "display", "block"
      if queryLoad is true
        keepInBounds false
        animator data.animationDuration
        pause()
      else
        data.timer = setInterval(->
          resize "animationDuration", "animationIncrement"
        , data.animationDuration)

    data.paused = false
    data.resizing = true

  updateDirection = (dir) ->
    data.direction = dir

  updateMaxWidth = ->
    data.max = elements.win.width()

  updateWidth = (w) ->
    data.currWidth = w
    elements.showWidth.text data.currWidth + "px"


  # enclosure via return object
  init: ->
    query = parseQueryString()
    setBindings()
    start query  if query

  $ ->
    window.resizive = new Resizive()
    resizive.init()
