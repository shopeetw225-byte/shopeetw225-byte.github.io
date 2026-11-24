(()=>{
'use strict';
const $=s=>document.querySelector(s),esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const safeUrl=v=>{try{const u=new URL(v);return ['https:','http:'].includes(u.protocol)?u.href:'#'}catch{return '#'}};
const link=(u,t)=>`<a href="${esc(safeUrl(u))}" target="_blank" rel="noopener noreferrer">${esc(t)} ↗</a>`;
const num=n=>typeof n==='number'?n.toLocaleString('zh-CN'):'';
let rows=[],page=1;const pageSize=25;
const contactHtml=c=>c.contactType==='邮箱'||c.contactType==='表单'?`<p class="contact"><span class="label">公开${esc(c.contactType)}：</span>${esc(c.contact)}${c.contactSource?' · '+link(c.contactSource,'来源'):''}</p>`:`<p class="contact"><span class="label">联系：</span>${esc(c.sendChannel||'待核')}</p>`;
const card=c=>`<article class="card"><div class="card-head"><h2>${link(c.profileUrl,c.name)}<span class="uid">${esc(c.platform)} · ${esc(c.language)}${c.subscribers?' · 订阅 '+esc(c.subscribers):''}</span></h2><div class="badges"><span class="badge${c.priorityTier===1?' t1':''}">${esc(c.priority)}</span>${c.taiwan?'<span class="badge tw">台湾</span>':''}${c.sendHold?'<span class="badge t1">暂缓发信</span>':''}<span class="badge">适配${esc(c.fit)}</span><span class="badge">${esc(c.niche)}</span></div></div><p class="fit">${esc(c.reason)}</p><ul class="works">${(c.samples||[]).map(s=>`<li>${link(s.url,s.title)}${s.game?`<span class="views">${esc(s.game)}</span>`:''}<time class="date" datetime="${esc(s.date)}">${esc(s.date)}</time>${typeof s.views==='number'?`<span class="views">${num(s.views)} 播放</span>`:''}</li>`).join('')}</ul>${contactHtml(c)}${c.sendNote?`<p class="contact"><span class="label">发信注意：</span>${esc(c.sendNote)}</p>`:''}${c.contactNote?`<p class="limitations">${esc(c.contactNote)}</p>`:''}${c.manualTierNote?`<p class="limitations">推荐调整：${esc(c.manualTierNote)}</p>`:''}<p class="status">${esc(c.outreachStatus)}${c.sendHold?' · '+esc(c.sendHold):''}</p>${c.limitations?`<p class="limitations">${esc(c.limitations)}</p>`:''}</article>`;
function render(){
const term=$('#q').value.trim().toLocaleLowerCase(),tier=$('#tier').value,lang=$('#lang').value,contact=$('#contact').value,region=$('#region').value;
const visible=rows.filter(c=>(!tier||String(c.priorityTier)===tier)&&(!lang||c.languageGroup===lang)&&(!contact||(contact==='other'?!['邮箱','表单'].includes(c.contactType):c.contactType===contact))&&(!region||c.taiwan)&&(!term||[c.name,c.reason,c.niche,c.language,...(c.samples||[]).flatMap(s=>[s.title,s.game])].join(' ').toLocaleLowerCase().includes(term)));
const pages=Math.max(1,Math.ceil(visible.length/pageSize));page=Math.min(page,pages);
$('#result-count').textContent=`显示 ${visible.length} / ${rows.length} 位${visible.length?` · 第 ${page} / ${pages} 页`:''}`;
$('#cards').innerHTML=visible.length?visible.slice((page-1)*pageSize,page*pageSize).map(card).join(''):'<p class="empty">没有匹配的创作者，换个关键词或筛选条件试试。</p>';
$('#pages').innerHTML=pages>1?Array.from({length:pages},(_,i)=>`<button type="button" data-page="${i+1}" ${page===i+1?'aria-current="page"':''}>${i+1}</button>`).join(''):'';
$('#pages').querySelectorAll('button').forEach(b=>b.onclick=()=>{page=Number(b.dataset.page);render();$('#result-count').scrollIntoView({block:'start'})});
}
$('#filters').addEventListener('submit',e=>e.preventDefault());$('#filters').addEventListener('input',()=>{page=1;render()});
fetch('overseas-idle-creators-20261124.json',{cache:'no-store'}).then(r=>{if(!r.ok)throw Error('fetch');return r.json()}).then(data=>{
rows=data.creators;$('#total').textContent=rows.length;$('#tier1').textContent=rows.filter(c=>c.priorityTier===1).length;$('#emails').textContent=rows.filter(c=>c.contactType==='邮箱').length;$('#tw').textContent=rows.filter(c=>c.taiwan).length;
$('#checked').textContent=`资料核对：${data.research_date}`;
$('.notice').textContent=`目标 ${data.target_count} 位，去重后新增 ${rows.length} 位，按第一、第二、第三推荐排序。另有 ${data.already_known_count} 位与旧名单重合（其中 ${data.already_contacted_count} 位已联系过），不在本页重复列出。${data.send_plan} 筛选标准：${data.criteria}`;
Object.keys(data.language_group_counts||{}).forEach(g=>{const o=document.createElement('option');o.value=g;o.textContent=`${g}（${data.language_group_counts[g]}）`;$('#lang').append(o)});
if(new URLSearchParams(location.search).get('region')==='tw')$('#region').value='tw';
render();
}).catch(()=>{$('#result-count').textContent='名单暂时无法读取，请刷新重试。'});
})();
