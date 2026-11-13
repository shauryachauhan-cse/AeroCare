const assert=require('node:assert/strict');
const files=require('../dist/files.js');
function file(name,data){const blob=new Blob([data]);blob.name=name;return blob;}
(async()=>{
assert.equal(await files.fileType(file('fictional.pdf','%PDF-1.4\nfictional test')),'application/pdf');
assert.equal(await files.fileType(file('fictional.txt','<script>Not executable: shown as plain text</script>')),'text/plain');
assert.equal(await files.fileType(file('fictional.png',new Uint8Array([137,80,78,71,13,10,26,10,0]))),'image/png');
assert.equal(await files.fileType(file('fictional.jpg',new Uint8Array([255,216,255,224]))),'image/jpeg');
await assert.rejects(()=>files.fileType(file('fake.pdf','<html>not a PDF</html>')),/matching/);
await assert.rejects(()=>files.fileType(file('unsafe.svg','<svg onload="x"/>')),/matching/);
await assert.rejects(()=>files.fileType(file('binary.txt',new Uint8Array([0,1,2]))),/matching/);
await assert.rejects(()=>files.fileType(file('empty.txt','')),/non-empty/);
await assert.rejects(()=>files.save('case','report',file('fictional.txt','test')),/unavailable/);
console.log('File checks passed: allowed signatures, plain-text handling, mismatched/binary/unsupported/empty file rejection, unavailable-storage failure.');
})().catch(error=>{console.error(error);process.exitCode=1});
