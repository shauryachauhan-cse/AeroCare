const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const handlers={},nodes=new Map(),storage=new Map();
const node=()=>({textContent:'',innerHTML:'',children:[],open:false,append(child){this.children.push(child)},replaceChildren(){this.children=[]},setAttribute(){},showModal(){this.open=true},close(){this.open=false},addEventListener(){},classList:{add(){},remove(){},toggle(){}},insertAdjacentHTML(){}});
const ctx={console,Date,Math,JSON,Set,Object,Array,String,Number,RegExp,FormData,URL,Blob,AeroFiles:{async save(){return {key:'qa-key',type:'text/plain',size:100}},async remove(){},async clearCase(){}},document:{createElement(tag){const n=node();n.tag=tag;return n},querySelector(s){if(!nodes.has(s))nodes.set(s,node());return nodes.get(s)},querySelectorAll(){return []},addEventListener(k,fn){handlers[k]=fn}},localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)},location:{hash:''},window:{addEventListener(){},scrollTo(){},print(){},setTimeout(){},scrollY:0},setTimeout(){},clearTimeout(){},requestAnimationFrame(fn){fn()}};
vm.createContext(ctx);vm.runInContext(fs.readFileSync('dist/rules.js','utf8'),ctx);ctx.AeroRules=ctx.window.AeroRules;vm.runInContext(fs.readFileSync('dist/script.js','utf8'),ctx);
(async()=>{
function run(code){return vm.runInContext(code,ctx)}
run(`state=fresh();state.profile={name:'Fictional QA',airline:'Air India',flightNumber:'QA001',pnr:'ABC123',from:'AAA',to:'BBB',departure:'2026-12-01',departureTime:'12:00',seat:'',duration:'2',condition:'kidney',stability:'stable',recent:'no',medicines:'',procedures:'',supports:['wheelchair'],consent:true};state.docs={medif:{name:'form.txt',at:'2026-11-13T10:00:00Z'},report:{name:'report.txt',at:'2026-11-13T10:00:00Z',issuedDate:'2026-11-25'}};state.completed=['medicines','review','wheelchair'];state.submitted=true;state.review='Review completed';state.assistance={wheelchair:'Confirmed'};`);
run(`applyProfile({...state.profile,medicines:'Updated fictional medicine notes'})`);
assert.equal(run(`state.docs.report.name`),'report.txt');assert.equal(run(`state.assistance.wheelchair`),'Confirmed');assert.equal(run(`state.completed.includes('review')`),true);assert.equal(run(`state.completed.includes('medicines')`),false);assert.equal(run(`state.needsResubmit`),true);
run(`applyProfile({...state.profile,departure:'2026-12-20'})`);assert.equal(run(`docChecks().find(d=>d.id==='report').ok`),false);assert.equal(run(`state.assistance.wheelchair`),'Needs reconfirmation');assert.equal(run(`state.docs.medif.name`),'form.txt');
run(`state.corrections.medif={note:'Correction needed',at:new Date().toISOString(),status:'requested'}`);assert.equal(run(`docChecks().find(d=>d.id==='medif').ok`),false);
// Requested corrections block resubmission until a replacement is recorded.
run(`location.hash='#confirm'`);await handlers.click({target:{closest(){return {dataset:{action:'submit'}}}}});assert.equal(run(`state.needsResubmit`),true);
await handlers.change({target:{dataset:{doc:'medif'},files:[{name:'replacement.txt',size:100}],closest(){return null}}});assert.equal(run(`state.corrections.medif.status`),'responded');assert.equal(run(`state.docs.medif.previousName`),'form.txt');assert.equal(run(`state.needsResubmit`),true);
await handlers.click({target:{closest(){return {dataset:{action:'submit'}}}}});assert.equal(run(`state.corrections.medif.status`),'resubmitted');assert.equal(run(`state.review`),'Pending review');assert.equal(run(`state.needsResubmit`),false);
// A case with a date failure cannot be completed by the reviewer.
run(`state.review='Pending review'`);const f=new FormData();f.set('reviewNote','');ctx.FormData=class{constructor(){return f}};
await handlers.submit({target:{id:'review-form',dataset:{}},submitter:{value:'Review completed'},preventDefault(){}});assert.equal(run(`state.review`),'Pending review');
// With valid metadata the simulated review resolves its correction history.
run(`state.docs.report.issuedDate='2026-12-15'`);await handlers.submit({target:{id:'review-form',dataset:{}},submitter:{value:'Review completed'},preventDefault(){}});assert.equal(run(`state.review`),'Review completed');assert.equal(run(`state.corrections.medif.status`),'resolved');
// Preview uses real Blob URLs and textContent, and refuses reviewer access without consent.
ctx.AeroFiles.get=async()=>new Blob(['<script>fictional text only</script>'],{type:'text/plain'});
run(`state.docs.medif.blobKey='qa-key';state.docs.medif.size=40;location.hash='#airline'`);
await run(`viewDocument('medif')`);assert.equal(nodes.get('#document-preview').open,true);assert.equal(nodes.get('#document-preview-body').children[0].tag,'pre');assert.match(nodes.get('#document-preview-body').children[0].textContent,/<script>/);assert.match(nodes.get('#document-preview-name').textContent,/replacement.txt/);
run(`closeDocumentPreview()`);assert.equal(nodes.get('#document-preview').open,false);assert.equal(nodes.get('#document-preview-body').children.length,0);assert.equal(run(`previewObjectUrl`),null);
ctx.AeroFiles.get=async()=>new Blob([new Uint8Array([137,80,78,71])],{type:'image/png'});await run(`viewDocument('medif')`);assert.equal(nodes.get('#document-preview-body').children[0].tag,'img');run(`closeDocumentPreview()`);
ctx.AeroFiles.get=async()=>new Blob(['%PDF-1.4'],{type:'application/pdf'});await run(`viewDocument('medif')`);assert.equal(nodes.get('#document-preview-body').children[0].type,'application/pdf');run(`closeDocumentPreview();state.profile.consent=false`);await run(`viewDocument('medif')`);assert.equal(nodes.get('#document-preview').open,false);run(`state.profile.consent=true`);
ctx.AeroFiles.get=async()=>null;await run(`viewDocument('medif')`);assert.equal(nodes.get('#document-preview').open,false);
// Case switching and old data load preserve newly added workflow fields and drafts.
run(`state.draft={name:'Unfinished fictional case'};state.draftAt=new Date().toISOString();save();const saved=JSON.parse(localStorage.getItem(KEY));state=fresh();loadCases(saved)`);assert.equal(run(`state.draft.name`),'Unfinished fictional case');assert.equal(run(`state.docs.medif.name`),'replacement.txt');
await handlers.click({target:{closest(){return {dataset:{action:'withdraw'}}}}});assert.equal(run(`state.profile.consent`),false);assert.equal(run(`state.submitted`),false);assert.match(run(`airline()`),/No shared case/);
assert.match(run(`briefContent()`),/Passenger-reported/);assert.match(run(`briefContent()`),/replacement.txt/);
run(`state=fresh();state.profile={airline:'Air India',condition:'none',stability:'stable',recent:'no',supports:['wheelchair']}`);assert.equal(run(`assessment().medical`),false);assert.equal(run(`medicalLabel()`),'No medical-review trigger identified');
run(`state.corrections={medif:{status:'requested',note:'Earlier requirement'}}`);assert.equal(run(`activeCorrections().length`),0);
console.log('Workflow checks passed: record retention, selective resets, date rechecks, correction/replacement/resubmission, review guards, draft persistence, consent and assistance separation.');

})().catch(error=>{console.error(error);process.exitCode=1});
