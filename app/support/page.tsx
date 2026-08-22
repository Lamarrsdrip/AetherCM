"use client"
import AppShell from '@/components/AppShell'

const categories:[string,string,string][]=[
 ['ACCOUNT_ACCESS','Account access','Passwords, account security and profile access.'],
 ['MONEY','Money','Deposits, withdrawals and payment status.'],
 ['INVESTMENTS','Investments','Share requests, holdings and portfolio questions.'],
 ['ACCOUNT_ACTIVITY','Account activity','Balance changes, approvals and account history.'],
]

function openChat(category?:string){
 window.dispatchEvent(new CustomEvent('aether:open-chat',{detail:{category}}))
}

export default function Support(){
 return <AppShell><section className="workspace modernWorkspace">
  <div className="workspaceHead"><div><span className="eyebrow">Support</span><h1>Help when you need it.</h1><p>Message Aether Support and a real person will reply in the same conversation.</p></div></div>
  <div className="supportHero panel">
   <div><h2>Talk with Aether Support</h2><p>Send a message and the Aether team will reply here. Notifications let you know when we respond.</p></div>
   <button className="primaryMoneyBtn" onClick={()=>openChat()}>Message Support</button>
  </div>
  <div className="faqGrid">
   {categories.map(([key,title,body])=>
    <button key={key} className="panel supportCategoryCard" onClick={()=>openChat(key)}>
     <b>{title}</b><p>{body}</p><span className="viewInvestmentLink">Start conversation →</span>
    </button>
   )}
  </div>
 </section></AppShell>
}
