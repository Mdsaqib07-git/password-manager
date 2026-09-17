const seedItems = [
  {id:1,type:"login",name:"GitHub",username:"alex.kim",url:"github.com",folder:"Work",favorite:true,updated:6,logo:"G",logoClass:"logo-dark"},
  {id:2,type:"login",name:"Google",username:"alex.kim@gmail.com",url:"accounts.google.com",folder:"Personal",favorite:true,updated:4,logo:"G",logoClass:"logo-blue"},
  {id:3,type:"card",name:"Chase Sapphire",subtitle:"•••• 4482",url:"",folder:"Finance",favorite:false,updated:8,logo:"C",logoClass:"logo-green"},
  {id:4,type:"note",name:"Wi-Fi passwords",subtitle:"Secure note",url:"",folder:"Personal",favorite:false,updated:3,logo:"≡",logoClass:"logo-pink"},
  {id:5,type:"identity",name:"Alex Kim",subtitle:"Identity",url:"",folder:"Personal",favorite:false,updated:10,logo:"A",logoClass:"logo-purple"},
  {id:6,type:"ssh",name:"Production server",subtitle:"ssh-ed25519",url:"",folder:"Work",favorite:true,updated:2,logo:"⌁",logoClass:"logo-teal"},
  {id:7,type:"login",name:"Notion",username:"alex.kim",url:"notion.so",folder:"Work",favorite:false,updated:9,logo:"N",logoClass:"logo-dark"},
  {id:8,type:"card",name:"Amex Gold",subtitle:"•••• 1098",url:"",folder:"Finance",favorite:false,updated:1,logo:"A",logoClass:"logo-orange"}
];

const labels = {login:"Login",card:"Card",identity:"Identity",note:"Secure note",ssh:"SSH key"};
const state = {items: JSON.parse(localStorage.getItem("vaultly-items") || "null") || seedItems, view:"all", filter:"all", query:"", sort:"updated", formType:"login", editingId:null};
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

function persist(){ localStorage.setItem("vaultly-items", JSON.stringify(state.items)); }
function initials(name){ return name.trim().split(/\s+/).map(word => word[0]).slice(0,2).join("").toUpperCase(); }
function getTypeCount(type){ return state.items.filter(item => item.type === type).length; }
function visibleItems(){
  let items = state.items.filter(item => {
    const matchesSearch = [item.name,item.username,item.url,item.subtitle,item.folder].join(" ").toLowerCase().includes(state.query.toLowerCase());
    const matchesFilter = state.filter === "all" || item.type === state.filter;
    const matchesView = state.view === "favorites" ? item.favorite : state.view === "recent" ? item.updated <= 6 : true;
    return matchesSearch && matchesFilter && matchesView;
  });
  if(state.sort === "name") items.sort((a,b) => a.name.localeCompare(b.name));
  if(state.sort === "type") items.sort((a,b) => labels[a.type].localeCompare(labels[b.type]));
  if(state.sort === "updated") items.sort((a,b) => a.updated - b.updated);
  return items;
}
function render(){
  const items = visibleItems();
  $("#itemsGrid").classList.toggle("list-view", state.list);
  $("#itemsGrid").innerHTML = items.map(itemCard).join("");
  $("#emptyState").classList.toggle("hidden", items.length > 0);
  $("#allCount").textContent = state.items.length;
  $("#favoriteCount").textContent = state.items.filter(item => item.favorite).length;
  $("#totalStat").textContent = state.items.length;
  $("#favoriteStat").textContent = state.items.filter(item => item.favorite).length;
  $("#pillAll").textContent = state.items.length;
  ["login","card","identity","note","ssh"].forEach(type => { const node = $(`#pill${type[0].toUpperCase()+type.slice(1)}`); if(node) node.textContent = getTypeCount(type); });
  $$(".filter-pill").forEach(button => button.classList.toggle("active", button.dataset.filter === state.filter));
  $$(".nav-item[data-view]").forEach(button => button.classList.toggle("active", button.dataset.view === state.view));
}
function itemCard(item){
  const detail = item.type === "login" ? (item.username || "No username") : (item.subtitle || labels[item.type]);
  const secondary = item.type === "login" ? (item.url || "Login") : item.folder;
  return `<article class="vault-card" data-id="${item.id}">
    <div class="card-head"><div class="item-logo ${item.logoClass}">${item.logo || initials(item.name)}</div><button class="star ${item.favorite ? "is-favorite" : ""}" data-favorite="${item.id}" aria-label="Toggle favorite">★</button></div>
    <div class="item-name">${escapeHtml(item.name)}</div><div class="item-meta">${escapeHtml(detail)}</div>
    <div class="item-footer"><span class="item-type">${labels[item.type]}</span><span>${escapeHtml(secondary)}</span></div>
  </article>`;
}
function escapeHtml(value=""){ return String(value).replace(/[&<>"']/g, char => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;" }[char])); }
function updateHeading(){
  const titles = {all:["All items","Everything you’ve saved in one secure place."],favorites:["Favorites","Your most important items, close at hand."],recent:["Recently used","Items you’ve accessed lately."],personal:["Personal vault","Your private items and credentials."],shared:["Shared with me","Items shared with you by your organization."],login:["Logins","Your usernames and passwords."],card:["Cards","Payment cards stored securely."],identity:["Identities","Personal information for quick form filling."],note:["Secure notes","Private notes protected by your vault."],ssh:["SSH keys","Keys for secure server access."]};
  const [title,description] = titles[state.view] || titles.all;
  $("#pageTitle").textContent = title; $("#pageDescription").textContent = description;
  $("#viewEyebrow").textContent = state.view === "all" ? "PERSONAL VAULT" : labels[state.view] ? "ITEM TYPE" : "PERSONAL VAULT";
}
function setView(view){ state.view=view; state.filter = labels[view] ? view : "all"; updateHeading(); render(); }
function fieldsFor(type, item={}){
  if(type === "login") return `<div class="field-row"><label>Username<input name="username" value="${escapeHtml(item.username || "")}" placeholder="name@example.com"></label><label>Password<input name="password" type="password" value="${escapeHtml(item.password || "")}" placeholder="••••••••"></label></div><label>Website URL<input name="url" value="${escapeHtml(item.url || "")}" placeholder="https://example.com"></label>`;
  if(type === "card") return `<div class="field-row"><label>Cardholder name<input name="cardholder" value="${escapeHtml(item.cardholder || "")}" placeholder="Alex Kim"></label><label>Card number<input name="number" value="${escapeHtml(item.number || "")}" placeholder="1234 5678 9012 3456"></label></div><div class="field-row"><label>Expiry date<input name="expiry" value="${escapeHtml(item.expiry || "")}" placeholder="MM / YY"></label><label>Security code<input name="cvv" type="password" value="${escapeHtml(item.cvv || "")}" placeholder="•••"></label></div>`;
  if(type === "identity") return `<div class="field-row"><label>First name<input name="firstName" value="${escapeHtml(item.firstName || "")}" placeholder="Alex"></label><label>Last name<input name="lastName" value="${escapeHtml(item.lastName || "")}" placeholder="Kim"></label></div><label>Email<input name="email" value="${escapeHtml(item.email || "")}" placeholder="name@example.com"></label><label>Phone<input name="phone" value="${escapeHtml(item.phone || "")}" placeholder="+1 555 000 0000"></label>`;
  if(type === "ssh") return `<label>Private key<textarea name="privateKey" placeholder="-----BEGIN OPENSSH PRIVATE KEY-----">${escapeHtml(item.privateKey || "")}</textarea></label><label>Public key<input name="publicKey" value="${escapeHtml(item.publicKey || "")}" placeholder="ssh-ed25519 AAAA..."></label>`;
  return `<label>Note<textarea name="note" placeholder="Write something private...">${escapeHtml(item.note || "")}</textarea></label>`;
}
function openModal(item=null){
  state.editingId = item ? item.id : null; state.formType = item ? item.type : "login";
  $("#modalTitle").textContent = item ? "Edit item" : "Add an item";
  $("#itemForm").elements.name.value = item?.name || "";
  $("#itemForm").elements.folder.value = item?.folder || "Personal";
  $("#itemForm").elements.favorite.checked = Boolean(item?.favorite);
  $("#dynamicFields").innerHTML = fieldsFor(state.formType, item || {});
  $$(".type-option").forEach(button => button.classList.toggle("active", button.dataset.type === state.formType));
  $("#itemModal").classList.remove("hidden"); setTimeout(() => $("#itemForm").elements.name.focus(), 50);
}
function closeModal(){ $("#itemModal").classList.add("hidden"); }
function showToast(message="Item saved to your vault."){ $("#toast p").textContent=message; $("#toast").classList.remove("hidden"); setTimeout(() => $("#toast").classList.add("hidden"), 2300); }

$("#addButton").addEventListener("click", () => openModal());
$("#emptyAddButton").addEventListener("click", () => openModal());
$("#closeModal").addEventListener("click", closeModal);
$("#cancelModal").addEventListener("click", closeModal);
$("#itemModal").addEventListener("click", event => { if(event.target === $("#itemModal")) closeModal(); });
$("#searchInput").addEventListener("input", event => { state.query=event.target.value; render(); });
$("#sortSelect").addEventListener("change", event => { state.sort=event.target.value; render(); });
$("#gridButton").addEventListener("click", () => { state.list=false; $("#gridButton").classList.add("active"); $("#listButton").classList.remove("active"); render(); });
$("#listButton").addEventListener("click", () => { state.list=true; $("#listButton").classList.add("active"); $("#gridButton").classList.remove("active"); render(); });
$$(".nav-item[data-view]").forEach(button => button.addEventListener("click", () => setView(button.dataset.view)));
$$(".filter-pill").forEach(button => button.addEventListener("click", () => { state.filter=button.dataset.filter; state.view="all"; updateHeading(); render(); }));
$("#typeSelector").addEventListener("click", event => { const button=event.target.closest(".type-option"); if(!button) return; state.formType=button.dataset.type; $$(".type-option").forEach(option => option.classList.toggle("active", option===button)); $("#dynamicFields").innerHTML=fieldsFor(state.formType); });
$("#itemsGrid").addEventListener("click", event => {
  const favorite=event.target.closest("[data-favorite]");
  if(favorite){ event.stopPropagation(); const item=state.items.find(entry => entry.id === Number(favorite.dataset.favorite)); item.favorite=!item.favorite; persist(); render(); return; }
  const card=event.target.closest("[data-id]"); if(card) openModal(state.items.find(item => item.id === Number(card.dataset.id)));
});
$("#itemForm").addEventListener("submit", event => {
  event.preventDefault(); const form=new FormData(event.target); const existing=state.items.find(item => item.id===state.editingId);
  const record={...(existing || {}),id:state.editingId || Date.now(),type:state.formType,name:form.get("name"),folder:form.get("folder"),favorite:form.get("favorite")==="on",updated:0,logo:state.formType==="login" ? initials(form.get("name") || "L")[0] : ({card:"$",identity:"A",note:"≡",ssh:"⌁"}[state.formType]),logoClass:({login:"logo-purple",card:"logo-orange",identity:"logo-green",note:"logo-pink",ssh:"logo-teal"}[state.formType])};
  ["username","password","url","cardholder","number","expiry","cvv","firstName","lastName","email","phone","privateKey","publicKey","note"].forEach(key => { if(form.has(key)) record[key]=form.get(key); });
  if(state.editingId) Object.assign(existing,record); else state.items.unshift(record); persist(); closeModal(); updateHeading(); render(); showToast(state.editingId ? "Item updated." : "Item saved to your vault.");
});
document.addEventListener("keydown", event => { if((event.metaKey || event.ctrlKey) && event.key.toLowerCase()==="k"){ event.preventDefault(); $("#searchInput").focus(); } if(event.key==="Escape" && !$("#itemModal").classList.contains("hidden")) closeModal(); });

updateHeading(); render();
