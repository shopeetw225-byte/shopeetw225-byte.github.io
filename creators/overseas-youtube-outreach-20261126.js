(()=>{
'use strict';
const $=s=>document.querySelector(s),esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const safeUrl=v=>{try{const u=new URL(v);return ['https:','http:'].includes(u.protocol)?u.href:'#'}catch{return '#'}};
const link=(u,t)=>`<a href="${esc(safeUrl(u))}" target="_blank" rel="noopener noreferrer">${esc(t)} ↗</a>`;
let rows=[],page=1;const pageSize=25;
const card=c=>`<article class="card"><div class="card-head"><h2>${link(c.profileUrl,c.name)}<span class="uid">${esc(c.platform)} · ${esc(c.language)}${c.subscribers?' · 订阅 '+esc(c.subscribers):''}</span></h2><div class="badges">${c.delivery==='bounced'?'<span class="badge t1">退信</span>':''}<span class="badge">${esc(c.languageGroup)}</span>${c.niche?`<span class="badge">${esc(c.niche)}</span>`:''}</div></div>${c.sampleUrl?`<ul class="works"><li>${link(c.sampleUrl,c.sampleGame||'示例视频')}</li></ul>`:''}<p class="contact"><span class="label">公开邮箱：</span>${esc(c.contact)}${c.contactSource?' · '+link(c.contactSource,'来源'):''}</p><p class="status${c.delivery==='bounced'?'':' sent'}">${esc(c.outreachStatus)}${c.invitedAt?' · '+esc(c.invitedAt):''}</p></article>`;
function render(){
const term=$('#q').value.trim().toLocaleLowerCase(),lang=$('#lang').value,state=$('#state').value;
const visible=rows.filter(c=>(!lang||c.languageGroup===lang)&&(!state||(state==='bounced')===(c.delivery==='bounced'))&&(!term||[c.name,c.niche,c.language,c.sampleGame].join(' ').toLocaleLowerCase().includes(term)));
const pages=Math.max(1,Math.ceil(visible.length/pageSize));page=Math.min(page,pages);
$('#result-count').textContent=`显示 ${visible.length} / ${rows.length} 位${visible.length?` · 第 ${page} / ${pages} 页`:''}`;
$('#cards').innerHTML=visible.length?visible.slice((page-1)*pageSize,page*pageSize).map(card).join(''):'<p class="empty">没有匹配的创作者，换个关键词或筛选条件试试。</p>';
$('#pages').innerHTML=pages>1?Array.from({length:pages},(_,i)=>`<button type="button" data-page="${i+1}" ${page===i+1?'aria-current="page"':''}>${i+1}</button>`).join(''):'';
$('#pages').querySelectorAll('button').forEach(b=>b.onclick=()=>{page=Number(b.dataset.page);render();$('#result-count').scrollIntoView({block:'start'})});
}
$('#filters').addEventListener('submit',e=>e.preventDefault());$('#filters').addEventListener('input',()=>{page=1;render()});
fetch('overseas-youtube-outreach-20261126.json',{cache:'no-store'}).then(r=>{if(!r.ok)throw Error('fetch');return r.json()}).then(data=>{
rows=data.creators;const b=rows.filter(c=>c.delivery==='bounced').length;
$('#total').textContent=rows.length;$('#bounced').textContent=b;$('#delivered').textContent=rows.length-b;$('#langs').textContent=Object.keys(data.language_group_counts||{}).length;
$('#checked').textContent=`发信日期：${data.date}`;$('.notice').textContent=data.summary;
Object.entries(data.language_group_counts||{}).forEach(([g,n])=>{const o=document.createElement('option');o.value=g;o.textContent=`${g}（${n}）`;$('#lang').append(o)});
render();
}).catch(()=>{$('#result-count').textContent='名单暂时无法读取，请刷新重试。'});
})();
