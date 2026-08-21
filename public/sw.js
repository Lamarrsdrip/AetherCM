self.addEventListener('install',()=>self.skipWaiting())
self.addEventListener('activate',event=>event.waitUntil(self.clients.claim()))

self.addEventListener('push',event=>{
  let data={title:'Aether',body:'You have a new account update.',url:'/dashboard'}
  try{data={...data,...event.data.json()}}catch{}
  event.waitUntil(self.registration.showNotification(data.title,{
    body:data.body,
    icon:'/icons/icon-192.png',
    badge:'/icons/badge-96.png',
    data:{url:data.url||'/dashboard'},
    tag:'aether-account-update',
    renotify:true
  }))
})

self.addEventListener('notificationclick',event=>{
  event.notification.close()
  const url=event.notification.data?.url||'/dashboard'
  event.waitUntil(self.clients.matchAll({type:'window',includeUncontrolled:true}).then(clients=>{
    for(const client of clients){
      if('focus' in client){
        client.navigate(url)
        return client.focus()
      }
    }
    return self.clients.openWindow(url)
  }))
})
