module.exports = (node, eventName) => {
  let doc
  if (node.ownerDocument) {
    doc = node.ownerDocument
  } else if (node.nodeType === 9) {
    doc = node
  } else {
    throw new Error(`Invalid node passed to fireEvent: ${node}`)
  }

  if (node.dispatchEvent) {
    let eventClass = ''
    switch (eventName) {
      case 'click':
      case 'mousedown':
      case 'mouseup':
        eventClass = 'MouseEvents'
        break
      case 'focus':
      case 'change':
      case 'blur':
      case 'select':
        eventClass = 'HTMLEvents'
        break
      default:
        throw new Error(`Couldn't find an event class for event: ${eventName}`)
    }
    const event = doc.createEvent(eventClass)
    event.initEvent(eventName, true, true)
    event.synthetic = true
    node.dispatchEvent(event, true)
  } else if (node.fireEvent) {
    const event = doc.createEventObject()
    event.synthetic = true // allow detection of synthetic events
    node.fireEvent(`on${eventName}`, event)
  }
}
