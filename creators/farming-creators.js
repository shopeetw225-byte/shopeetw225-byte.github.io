(()=>{
 'use strict';
 const $=s=>document.querySelector(s),esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const safeUrl=value=>{try{const u=new URL(value);return u.protocol==='https:'&&['space.bilibili.com','www.bilibili.com'].includes(u.hostname)?u.href:'#'}catch{return '#'}};
 let rows=[],page=1;const pageSize=25;
 function render(){
  const term=$('#q').value.trim().toLocaleLowerCase(),category=$('#category').value,tier=$('#tier').value,status=$('#status').value;
  const visible=rows.filter(c=>(!category||c.category===category)&&(!tier||c.tier===tier)&&(!status||(status==='recorded')===Boolean(c.outreach?.has_record))&&(!term||[c.name,c.uid,c.fit_reason,...c.videos.map(v=>v.title)].join(' ').toLocaleLowerCase().includes(term)));
  const pages=Math.max(1,Math.ceil(visible.length/pageSize));page=Math.min(page,pages);
  $('#result-count').textContent=`显示 ${visible.length} / ${rows.length} 位${visible.length?` · 第 ${page} / ${pages} 页`:''}`;
  $('#cards').innerHTML=visible.length?visible.slice((page-1)*pageSize,page*pageSize).map(c=>`<article class="card" data-uid="${esc(c.uid)}"><div class="card-head"><h2><a href="${esc(safeUrl(c.profile_url))}" target="_blank" rel="noopener noreferrer">${esc(c.name)} ↗</a><span class="uid">UID ${esc(c.uid)}</span></h2><div class="badges"><span class="badge ${c.user_selected?'selected':''}">${esc(c.tier)}</span><span class="badge">${esc(c.category)}</span>${c.outreach?.has_record?'<span class="badge history">有邀请记录</span>':''}</div></div><p class="fit">${esc(c.fit_reason)}</p><ul class="works">${c.videos.map(v=>`<li><a href="${esc(safeUrl(v.url))}" target="_blank" rel="noopener noreferrer">${esc(v.title)} ↗</a><time class="date" datetime="${esc(v.date)}">${esc(v.date)}</time></li>`).join('')}</ul><p class="status">${esc(c.outreach?.label||'本地未见发送记录；联系前再查私信')}</p>${c.limitations?`<p class="limitations">${esc(c.limitations)}</p>`:''}</article>`).join(''):'<p class="empty">没有匹配的账号，换个关键词或筛选条件试试。</p>';
  $('#pages').innerHTML=pages>1?Array.from({length:pages},(_,i)=>`<button type="button" data-page="${i+1}" ${page===i+1?'aria-current="page"':''}>${i+1}</button>`).join(''):'';
  $('#pages').querySelectorAll('button').forEach(b=>b.onclick=()=>{page=Number(b.dataset.page);render();$('#result-count').scrollIntoView({block:'start'})});
 }
 $('#filters').addEventListener('submit',e=>e.preventDefault());
 $('#filters').addEventListener('input',()=>{page=1;render()});
 fetch('idle-farming-creators-20261116.json',{cache:'no-store'}).then(r=>{if(!r.ok)throw Error('fetch');return r.json()}).then(data=>{
  if(data.review_status==='rechecking'){$('h1').textContent='搬砖博主 · 重新核查中';$('#total').textContent='—';$('#recent').textContent='—';$('#selected').textContent='7';$('#filters').style.display='none';$('#result-count').textContent='旧名单正在合并重筛，暂不按上一版100位推荐。';$('.notice').textContent='按用户最新要求：优先找自己玩游戏、挂机刷货、出售掉落的搬砖博主。开发者、发行方和泛游戏资讯账号移出；若核实不足100位，会如实标明数量。';return;}
  rows=data.creators;$('#total').textContent=rows.length;$('#recent').textContent=rows.filter(c=>c.recent_evidence).length;$('#selected').textContent=rows.filter(c=>c.user_selected).length;$('#checked').textContent=`资料核对：${data.research_date}`;
  [...new Set(rows.map(c=>c.category))].forEach(category=>{const option=document.createElement('option');option.value=category;option.textContent=category;$('#category').append(option)});render();
 }).catch(()=>{$('#result-count').textContent='名单暂时无法读取，请刷新重试。'});
})();
