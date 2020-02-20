const {client, xml} = require('@xmpp/client')
const debug = require('@xmpp/debug')

const xmpp = client({
  service: 'ws://localhost:7070/ws'
})

xmpp.on('open',async(o)=>{
  console.log(o)
})

debug(xmpp, true)

xmpp.on('error', err => {
  console.error(err)
})


xmpp.on('stanza', async stanza => {
  if (stanza.is('message')) {
    //await xmpp.send(xml('presence', {type: 'unavailable'}))
    await xmpp.stop()
  }
})

xmpp.on('stanza', async (stanza) => {
  const message = xml(
    'iq',{type:'get',id:'reg1',to:'shakspear.lit'},
    xml('query',{'xmlns':'jabber:iq:register'})
  )
  //await xmpp.send(message);
});


xmpp.on('online', async address => {
  // Makes itself available
  await xmpp.send(xml('presence'))

  const register = xml(
    'iq',{type:'set',from:address,id:'unreg1'},
    xml('query',{'xmlns':'jabber:iq:register'},xml('remove'))
  )
  // await xmpp.send(message2);


  // Sends a chat message to itself
  const message = xml(
    'message',
    {type: 'chat', to: address},
    xml('body', {}, '你好')
  )
 // await xmpp.send(message)
})

xmpp.start().catch(console.error)