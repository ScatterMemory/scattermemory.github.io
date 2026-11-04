// Catalogue and visual binding sizes. Personal writing is maintained in notes.js.
window.STUDY_BOOKS = [
  ['失控','network','#344e42'],['人类简史','human','#9b713f'],['枪炮病菌与钢铁','orbit','#654335'],['资本论','geometry','#773e36'],['男孩鼹鼠狐狸和马','landscape','#c0ad83'],['非暴力沟通','leaves','#526b74'],
  ['工作消费主义和新穷人','geometry','#68664e'],['鲜花帝国','leaves','#774f54'],['八次危机','orbit','#485b66'],['灰犀牛:如何应对大概率危机','geometry','#737368'],['上帝不掷骰子','orbit','#414d6b'],['上瘾','network','#705b49'],
  ['反脆弱','network','#4d6557'],['未来简史','human','#98774e'],['政治秩序的起源','geometry','#5f453e'],['论民主','geometry','#59656a'],['空雨衣','landscape','#727f79'],['极简人类史','human','#8d7554'],
  ['自下而上','network','#426259'],['蛤蟆先生去看心理医生','leaves','#7d8660'],['模型思维','geometry','#4e6273'],['贪婪的多巴胺','network','#775367'],['战争史','orbit','#675649'],['金雀花王朝','leaves','#826238'],
  ['基因彩票','network','#60694b'],['富国陷阱','geometry','#6e4538'],['被讨厌的勇气','landscape','#ab8a52'],['芯片战争','geometry','#405764'],['为什么我们相信阴谋论','orbit','#5b4c68'],['思考快与慢','human','#8f7955'],
  ['认知操纵','network','#57594e'],['金钱心理学','orbit','#5e745e'],['系统之美','network','#728276'],['心智重构','human','#655a78'],['平面国','geometry','#8e7454']
].map(([title, art, color], i) => {
  const id='book-'+(i+1),note=(window.STUDY_NOTES||{})[id]||{};
  // Visual thickness at a 252px cover height, not a claim about a particular edition's page count.
  const thickness=[24,24,28,30,12,16,18,22,26,20,24,16,24,22,30,20,14,14,22,14,26,18,28,30,20,22,16,26,20,26,18,18,20,18,12][i];
  return {id,title,art,color,number:i+1,thickness,cover:'./covers/'+id+'.svg',notes:[note.reading||'',note.reflection||'',note.questions||'']};
});
// Add your own MP3 files and relative URLs here when ready.
// Example: { title: '曲名', src: './media/my-song.mp3' }
window.STUDY_TRACKS = [];
