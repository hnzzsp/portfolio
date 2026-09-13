/* ============================================================
   content.js —— 内容编辑模块（原 admin.html 的后台主体）
   ------------------------------------------------------------
   由 build_content.py 从 admin.html 自动抽取生成，请勿手改本文件，
   改 admin.html 后重新运行脚本即可。

   用法：
     PFContent.mount(容器元素)          // 注入完整后台表单并载入线上数据
     PFContent.mount(容器, {save: fn})  // 可覆盖保存实现（默认用内置 GitHub 提交）
   ============================================================ */
window.PFContent = (function(){
  var SCOPE = 'pfct-root';
  var HTML = "<div id=\"pfct-panel\" class=\"admin\">\n<span class=\"hide\" id=\"pfct-sitePill\"></span><span class=\"hide\" id=\"pfct-dirtyTip\">● 有未保存的修改</span>\n\n  <!-- 侧栏目录 -->\n  <nav class=\"side\" id=\"pfct-side\">\n    <h4>分区</h4>\n    <a href=\"#pfct-s-token\">访问令牌</a>\n    <a href=\"#pfct-s-contact\">联系方式</a>\n    <a href=\"#pfct-s-hero\">首页抬头</a>\n    <a href=\"#pfct-s-facts\">Quick Facts</a>\n    <a href=\"#pfct-s-about\">个人简介</a>\n    <a href=\"#pfct-s-stats\">关键数据</a>\n    <a href=\"#pfct-s-skills\">技能专长</a>\n    <a href=\"#pfct-s-projects\">项目经历</a>\n    <a href=\"#pfct-s-timeline\">教育与实践</a>\n    <a href=\"#pfct-s-footer\">页脚</a>\n    <a href=\"#pfct-s-files\">其他文件</a>\n    <a href=\"#pfct-s-save\">保存与发布</a>\n    <a href=\"#pfct-s-pw\">修改密码</a>\n    <a href=\"#pfct-s-about2\">存储说明</a>\n  </nav>\n\n  <div>\n\n    <div class=\"msg\" id=\"pfct-msg\"></div>\n\n    <div class=\"card hide\" id=\"pfct-offlineCard\">\n      <h2>离线编辑模式</h2>\n      <p class=\"tip\">无法从服务器读取 <code>data.json</code>。常见原因：用 <code>file://</code> 直接打开（浏览器禁止读取本地文件）；\n      在只挂单个 HTML 的预览面板里打开；或网络不通。当前地址：<code id=\"pfct-locInfo\"></code></p>\n      <textarea id=\"pfct-pasteJson\" style=\"min-height:150px;font-family:var(--mono);font-size:12.5px\" placeholder=\"把本地 site/data.json 的完整内容粘贴到这里…\"></textarea>\n      <div class=\"barrow\">\n        <button class=\"ghost mini\" type=\"button\" id=\"pfct-pasteBtn\">解析并开始编辑</button>\n        <button class=\"ghost mini\" type=\"button\" id=\"pfct-retryBtn\">重新尝试联网读取</button>\n      </div>\n    </div>\n\n    <div class=\"card\" id=\"pfct-s-token\">\n      <h2>访问令牌</h2>\n      <p class=\"tip\">保存与上传都靠它。只存在当前标签页内存里，<b>不会写入任何文件、不会进仓库</b>，关闭标签页即失效。</p>\n      <label for=\"pfct-tok\">GitHub Personal Access Token（需 repo 权限）</label>\n      <input type=\"password\" id=\"pfct-tok\" autocomplete=\"off\" placeholder=\"ghp_xxxxxxxxxxxx\">\n      <label class=\"check\"><input type=\"checkbox\" id=\"pfct-tokLong\" checked> 在本机记住令牌（长期有效，下次打开自动填好）</label>\n      <p class=\"hint\">只存在<b>你这台电脑的浏览器</b>里（localStorage），不写进任何文件、不进仓库、不上传服务器。换浏览器或清缓存后需重新贴一次。<b>公用电脑请取消勾选</b>，那样只在当前标签页有效、关闭即失效。</p>\n    </div>\n\n    <div class=\"card\" id=\"pfct-s-contact\">\n      <h2>联系方式</h2>\n      <div class=\"row2\">\n        <div><label>邮箱</label><input type=\"text\" data-p=\"contact.email\"></div>\n        <div><label>电话</label><input type=\"text\" data-p=\"contact.phone\"></div>\n      </div>\n      <div class=\"row2\">\n        <div><label>微信</label><input type=\"text\" data-p=\"contact.wechat\"></div>\n        <div><label>城市</label><input type=\"text\" data-p=\"contact.city\"></div>\n      </div>\n      <div class=\"row2\">\n        <div><label>GitHub 显示名</label><input type=\"text\" data-p=\"contact.github\"></div>\n        <div><label>GitHub 链接</label><input type=\"text\" data-p=\"contact.githubUrl\"></div>\n      </div>\n      <div class=\"row2\">\n        <div><label>作品站显示名</label><input type=\"text\" data-p=\"contact.site\"></div>\n        <div><label>作品站链接</label><input type=\"text\" data-p=\"contact.siteUrl\"></div>\n      </div>\n      <div class=\"barrow\"><button class=\"mini\" data-save type=\"button\">保存本区</button><span class=\"hint\">改动会立即提交到仓库</span></div>\n    </div>\n\n    <div class=\"card\" id=\"pfct-s-hero\">\n      <h2>首页抬头 Hero</h2>\n      <div class=\"row2\">\n        <div><label>显示名</label><input type=\"text\" data-p=\"profile.enName\"></div>\n        <div><label>头像字母</label><input type=\"text\" data-p=\"profile.avatarText\"></div>\n      </div>\n      <label>眉标</label><input type=\"text\" data-p=\"profile.eyebrow\">\n      <label>主标题</label><input type=\"text\" data-p=\"profile.zhTitle\">\n      <label>导语段落（支持 &lt;strong&gt; 加粗）</label><textarea data-p=\"profile.lede\"></textarea>\n      <label>能力标签（每行一个）</label><textarea data-p=\"profile.tags\" data-type=\"lines\"></textarea>\n      <div class=\"row2\">\n        <div><label>姓名</label><input type=\"text\" data-p=\"profile.name\"></div>\n        <div><label>职位</label><input type=\"text\" data-p=\"profile.role\"></div>\n      </div>\n      <label>求职方向</label><input type=\"text\" data-p=\"profile.intent\">\n      <div class=\"barrow\"><button class=\"mini\" data-save type=\"button\">保存本区</button></div>\n    </div>\n\n    <div class=\"card\" id=\"pfct-s-facts\">\n      <h2>Quick Facts</h2>\n      <div id=\"pfct-factsBox\"></div>\n      <div class=\"barrow\"><button class=\"ghost mini\" type=\"button\" id=\"pfct-addFact\">+ 添加一行</button><button class=\"mini\" data-save type=\"button\">保存本区</button></div>\n    </div>\n\n    <div class=\"card\" id=\"pfct-s-about\">\n      <h2>个人简介</h2>\n      <div id=\"pfct-aboutBox\"></div>\n      <div class=\"barrow\"><button class=\"ghost mini\" type=\"button\" id=\"pfct-addPara\">+ 添加段落</button><button class=\"mini\" data-save type=\"button\">保存本区</button></div>\n    </div>\n\n    <div class=\"card\" id=\"pfct-s-stats\">\n      <h2>关键数据</h2>\n      <div id=\"pfct-statsBox\"></div>\n      <div class=\"barrow\"><button class=\"ghost mini\" type=\"button\" id=\"pfct-addStat\">+ 添加一块</button><button class=\"mini\" data-save type=\"button\">保存本区</button></div>\n    </div>\n\n    <div class=\"card\" id=\"pfct-s-skills\">\n      <h2>技能专长</h2>\n      <div id=\"pfct-skillsBox\"></div>\n      <div class=\"barrow\"><button class=\"ghost mini\" type=\"button\" id=\"pfct-addSkill\">+ 添加分组</button><button class=\"mini\" data-save type=\"button\">保存本区</button></div>\n    </div>\n\n    <div class=\"card\" id=\"pfct-s-projects\">\n      <h2>项目经历</h2>\n      <p class=\"tip\">每张卡可单独上传截图与源文件：截图会自动写入「截图区」，源文件上传后可一键插入到「结果」。</p>\n      <div id=\"pfct-projectsBox\"></div>\n      <div class=\"barrow\"><button class=\"ghost mini\" type=\"button\" id=\"pfct-addProject\">+ 添加项目</button><button class=\"mini\" data-save type=\"button\">保存本区</button></div>\n    </div>\n\n    <div class=\"card\" id=\"pfct-s-timeline\">\n      <h2>教育与实践</h2>\n      <div id=\"pfct-timelineBox\"></div>\n      <div class=\"barrow\"><button class=\"ghost mini\" type=\"button\" id=\"pfct-addTime\">+ 添加一条</button><button class=\"mini\" data-save type=\"button\">保存本区</button></div>\n    </div>\n\n    <div class=\"card\" id=\"pfct-s-footer\">\n      <h2>页脚</h2>\n      <div class=\"row2\">\n        <div><label>姓名</label><input type=\"text\" data-p=\"footer.name\"></div>\n        <div><label>后缀说明</label><input type=\"text\" data-p=\"footer.suffix\"></div>\n      </div>\n      <label>最后更新日期</label><input type=\"text\" data-p=\"meta.updated\">\n      <div class=\"barrow\"><button class=\"mini\" data-save type=\"button\">保存本区</button></div>\n    </div>\n\n    <div class=\"card\" id=\"pfct-s-files\">\n      <h2>其他文件上传</h2>\n      <p class=\"tip\">不属于某个项目的图片 / 源文件传到这里，存进 <code>assets/files/</code>，上传后复制代码自行粘贴到需要的位置。</p>\n      <input type=\"file\" id=\"pfct-fileInput\" multiple accept=\"image/*,.psd,.ai,.pdf,.zip,.svg\">\n      <div id=\"pfct-upList\"></div>\n    </div>\n\n    <div class=\"card\" id=\"pfct-s-save\" style=\"border-color:var(--accent)\">\n      <h2>保存与发布</h2>\n      <p class=\"tip\">保存会把 <code>data.json</code> 提交到仓库 <code>main</code> 分支，Pages 重新构建后前台自动生效，通常 <b>1 分钟内</b>。\n      每个分区都有自己的保存按钮，效果一样——都是提交整份数据。</p>\n      <label>提交说明（可选）</label>\n      <input type=\"text\" id=\"pfct-commitMsg\" placeholder=\"例如：更新联系方式\">\n      <div class=\"barrow\">\n        <button type=\"button\" id=\"pfct-saveBtn\">保存并发布</button>\n        <button class=\"ghost\" type=\"button\" id=\"pfct-reloadBtn\">放弃修改，重新载入</button>\n      </div>\n    </div>\n\n    <div class=\"card\" id=\"pfct-s-pw\">\n      <h2>修改管理密码</h2>\n      <div class=\"row2\">\n        <div><label>新密码</label><input type=\"password\" id=\"pfct-np1\" autocomplete=\"new-password\"></div>\n        <div><label>再输一次</label><input type=\"password\" id=\"pfct-np2\" autocomplete=\"new-password\"></div>\n      </div>\n      <p class=\"tip\">提交后改写 <code>admin.html</code> 里的哈希并重新发布，不用手改代码。<b>新密码务必自己记住</b>。</p>\n      <div class=\"barrow\"><button class=\"ghost\" type=\"button\" id=\"pfct-pwBtn\">提交新密码</button></div>\n    </div>\n\n    <div class=\"card\" id=\"pfct-s-about2\">\n      <h2>存储说明</h2>\n      <p class=\"tip\" style=\"margin:0\">\n        · <b>展示数据</b>：仓库根目录 <code>data.json</code>，公开可读<br>\n        · <b>上传文件</b>：<code>assets/projects/</code>（项目图）、<code>assets/files/</code>（源文件与其他）<br>\n        · <b>管理密码</b>：只存哈希，写在本页 <code>ADMIN_CONFIG.PASS_SHA256</code><br>\n        · <b>令牌 / 登录态</b>：sessionStorage，关闭标签页即失效\n      </p>\n    </div>\n\n  </div>\n</div>\n\n<button class=\"fabsave\" id=\"pfct-fabSave\" type=\"button\">保存并发布</button>\n<button class=\"fabsave\" id=\"pfct-fabSave\" type=\"button\">保存并发布</button>\n<div class=\"toast\" id=\"pfct-toast\"></div>\n</div>";
  var CSS = ".pfct-root{\n  --bg:#f6f6f4; --surface:#ffffff; --soft:#fbfbf9;\n  --text:#16161a; --dim:#6d6d68; --line:#e2e2dd;\n  --accent:#d81e05; --ok:#0a7d3c; --warn:#b3541e;\n  --r:10px; --r2:8px;\n  --mono:\"SFMono-Regular\",Consolas,\"Liberation Mono\",Menlo,monospace;\n  --sans:\"Helvetica Neue\",Helvetica,Arial,\"PingFang SC\",\"Microsoft YaHei\",sans-serif;\n}\n.pfct-root *{box-sizing:border-box}\n.pfct-root{margin:0;background:var(--bg);color:var(--text);font:15px/1.7 var(--sans);-webkit-font-smoothing:antialiased}\n.pfct-root a{color:var(--accent);text-decoration:none}\n.pfct-root code{font-family:var(--mono);font-size:.88em;background:#efefe9;padding:1px 5px;border-radius:4px}\n.pfct-root .hide{display:none!important}\n.pfct-root .bar{position:sticky;top:0;z-index:50;background:rgba(255,255,255,.92);backdrop-filter:blur(10px);border-bottom:1px solid var(--line)}\n.pfct-root .bar .inner{max-width:1180px;margin:0 auto;padding:0 24px;display:flex;align-items:center;gap:12px;height:62px}\n.pfct-root .bar h1{font-size:16px;margin:0;letter-spacing:-.01em;font-weight:800}\n.pfct-root .bar .sp{margin-left:auto;display:flex;align-items:center;gap:10px}\n.pfct-root .pill{font-size:12px;color:var(--dim);border:1px solid var(--line);padding:4px 11px;border-radius:99px;white-space:nowrap}\n.pfct-root .pill.dirty{color:var(--warn);border-color:var(--warn);background:#fdf3ee}\n.pfct-root .admin{max-width:1180px;margin:0 auto;padding:22px 24px 80px;display:grid;grid-template-columns:212px 1fr;gap:26px;align-items:start}\n.pfct-root .side{position:sticky;top:84px}\n.pfct-root .side h4{font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--dim);margin:0 0 10px 8px;font-weight:700}\n.pfct-root .side a{display:block;padding:7px 10px;border-radius:var(--r2);font-size:13.5px;color:var(--dim);transition:background .15s,color .15s}\n.pfct-root .side a:hover{background:#eee;color:var(--text)}\n.pfct-root .side a.on{background:var(--text);color:#fff;font-weight:600}\n@media (max-width:980px){.pfct-root .admin{grid-template-columns:1fr}\n.pfct-root .side{display:none}}\n.pfct-root .card{background:var(--surface);border:1px solid var(--line);border-radius:var(--r);padding:22px 24px;margin-bottom:18px;box-shadow:0 1px 2px rgba(0,0,0,.03);scroll-margin-top:80px}\n.pfct-root .card > h2{font-size:12px;letter-spacing:.13em;text-transform:uppercase;color:var(--dim);margin:0 0 16px;font-weight:700;display:flex;align-items:center;gap:10px}\n.pfct-root .card > h2::before{content:\"\";width:14px;height:2px;background:var(--accent)}\n.pfct-root .card > .tip{font-size:12.5px;color:var(--dim);margin:-8px 0 16px;line-height:1.65}\n.pfct-root .barrow{display:flex;align-items:center;gap:10px;margin-top:18px;padding-top:14px;border-top:1px dashed var(--line);flex-wrap:wrap}\n.pfct-root .barrow .hint{margin:0}\n.pfct-root label{display:block;font-size:12.5px;font-weight:700;color:var(--dim);margin:14px 0 6px}\n.pfct-root label:first-of-type{margin-top:0}\n.pfct-root input[type=text], .pfct-root input[type=password], .pfct-root input[type=number], .pfct-root textarea, .pfct-root select{\n  width:100%;padding:9px 12px;border:1px solid var(--line);background:var(--soft);\n  font:inherit;font-size:14px;color:var(--text);border-radius:var(--r2);transition:border-color .15s,background .15s;\n}\n.pfct-root textarea{min-height:74px;resize:vertical;line-height:1.65}\n.pfct-root input:focus, .pfct-root textarea:focus, .pfct-root select:focus{outline:none;border-color:var(--accent);background:#fff;box-shadow:0 0 0 3px rgba(216,30,5,.08)}\n.pfct-root .hint{font-size:12.5px;color:var(--dim);margin-top:6px;line-height:1.65}\n.pfct-root .check{display:flex;align-items:center;gap:8px;font-weight:400;font-size:13px;color:var(--text);margin-top:10px;cursor:pointer}\n.pfct-root .check input{width:auto;margin:0}\n.pfct-root .row2{display:grid;grid-template-columns:1fr 1fr;gap:14px}\n.pfct-root .row3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:14px}\n@media (max-width:680px){.pfct-root .row2, .pfct-root .row3{grid-template-columns:1fr}}\n.pfct-root button{font:inherit;font-size:14px;font-weight:700;padding:10px 20px;cursor:pointer;border-radius:var(--r2);border:1px solid var(--text);background:var(--text);color:#fff;font-family:var(--sans);transition:opacity .15s,background .15s,border-color .15s}\n.pfct-root button:hover{opacity:.87}\n.pfct-root button:disabled{opacity:.5;cursor:not-allowed}\n.pfct-root .ghost{background:transparent;color:var(--text);border-color:var(--line)}\n.pfct-root .ghost:hover{border-color:var(--accent);color:var(--accent);opacity:1}\n.pfct-root .danger{background:transparent;color:var(--warn);border-color:var(--line);padding:6px 12px;font-size:12.5px}\n.pfct-root .danger:hover{border-color:var(--warn);color:var(--warn);opacity:1}\n.pfct-root .mini{padding:6px 13px;font-size:12.5px}\n.pfct-root .cp{font-size:12px;font-weight:700;color:var(--dim);border:1px solid var(--line);padding:5px 12px;border-radius:99px;background:transparent;cursor:pointer;font-family:var(--sans)}\n.pfct-root .cp:hover{border-color:var(--accent);color:var(--accent);opacity:1}\n.pfct-root .item{border:1px solid var(--line);border-radius:var(--r2);padding:16px;margin-bottom:12px;background:var(--soft)}\n.pfct-root .item .ih{display:flex;align-items:center;gap:9px;margin-bottom:6px}\n.pfct-root .item .ih b{font-size:12px;letter-spacing:.06em;color:var(--dim);font-weight:700}\n.pfct-root .item .ih .sp{margin-left:auto;display:flex;gap:7px}\n.pfct-root .msg{border:1px solid var(--line);border-radius:var(--r2);padding:12px 16px;margin-bottom:18px;font-size:14px;display:none}\n.pfct-root .msg.on{display:block}\n.pfct-root .msg.ok{border-color:var(--ok);color:var(--ok);background:#f2faf5}\n.pfct-root .msg.err{border-color:var(--warn);color:var(--warn);background:#fdf6f2}\n.pfct-root .pfct-tst{position:fixed;top:76px;right:22px;z-index:80;padding:12px 20px;border-radius:var(--r2);font-size:14px;font-weight:600;box-shadow:0 10px 30px rgba(0,0,0,.14);opacity:0;transform:translateY(-8px);pointer-events:none;transition:opacity .2s,transform .2s}\n.pfct-root .pfct-tst.on{opacity:1;transform:none}\n.pfct-root .pfct-tst.ok{background:var(--ok);color:#fff}\n.pfct-root .pfct-tst.err{background:var(--warn);color:#fff}\n.pfct-root .pfct-tst.info{background:var(--text);color:#fff}\n.pfct-root .fabsave{position:fixed;right:22px;bottom:22px;z-index:70;box-shadow:0 8px 24px rgba(0,0,0,.18);display:none;padding:12px 24px}\n.pfct-root .fabsave.on{display:block}\n.pfct-root #login{max-width:400px;margin:14vh auto;background:var(--surface);border:1px solid var(--line);border-radius:var(--r);padding:30px}\n.pfct-root #login h2{margin:0 0 6px;font-size:22px;letter-spacing:-.01em}\n.pfct-root #login p{color:var(--dim);font-size:13.5px;margin:0 0 22px}\n.pfct-root footer{border-top:1px solid var(--line);padding:20px 24px 40px;color:var(--dim);font-size:13px;text-align:center}\n.pfct-root .upbox{border:1px dashed var(--line);border-radius:var(--r2);padding:12px;background:var(--soft);margin-top:10px}\n.pfct-root .upbox .row{display:flex;align-items:center;gap:10px;flex-wrap:wrap}\n.pfct-root .prevrow{display:flex;gap:10px;flex-wrap:wrap;margin-top:10px}\n.pfct-root .preview{display:flex;align-items:center;gap:10px;border:1px solid var(--line);border-radius:8px;padding:8px 10px;background:#fff;max-width:300px}\n.pfct-root .preview .thumb{\n  width:64px;height:48px;flex-shrink:0;border-radius:5px;border:1px solid var(--line);\n  object-fit:cover;background:#f2f2ee;display:grid;place-items:center;\n  font-size:9.5px;font-weight:800;color:#fff;letter-spacing:.03em;overflow:hidden;\n}\n.pfct-root .preview .pmeta{min-width:0;font-size:12px;color:var(--dim);line-height:1.5}\n.pfct-root .preview .pmeta b{display:block;font-size:13px;color:var(--text);max-width:210px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}\n.pfct-root .preview .pmeta a{color:var(--accent);word-break:break-all}\n.pfct-root .preview.pending{opacity:.72}";

  function mount(root, opts){
    if (!root) return null;
    opts = opts || {};
    root.classList.add(SCOPE);
    if (!document.getElementById('pfct-style')){
      var st = document.createElement('style');
      st.id = 'pfct-style';
      st.textContent = CSS;
      document.head.appendChild(st);
    }
    root.innerHTML = HTML;
    var api = (function(){
/* ================= 配置 ================= */
var ADMIN_CONFIG = {
  OWNER: 'hnzzsp',
  REPO: 'portfolio',
  BRANCH: 'main',
  DATA_PATH: 'data.json',
  ADMIN_PATH: 'admin.html',
  PASS_SHA256: '37a0034fb1fae0f18836a858af9b95b2215835b2b67923b69cfc3dfbeb65b40e',
  SESSION_KEY: 'pfAdminAuthed'
};

var API = 'https://api.github.com';
var DATA = null;
var DIRTY = false;

/* ================= 工具 ================= */
function $(id){ return document.getElementById(id); }
function arr(v){ return Object.prototype.toString.call(v) === '[object Array]' ? v : []; }
function esc(s){ return String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
var toastTimer = null;
function toast(text, kind){
  var t = $('pfct-toast');
  t.className = 'pfct-tst on ' + (kind || 'info');
  t.textContent = text;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(function(){ t.className = 'pfct-tst ' + (kind || 'info'); }, 2600);
}
function msg(text, kind){
  var el = $('pfct-msg');
  el.className = 'msg on ' + (kind || '');
  el.textContent = text;
  toast(text, kind === 'err' ? 'err' : (kind === 'ok' ? 'ok' : 'info'));
}
function setDirty(){
  DIRTY = true;
  $('pfct-dirtyTip').classList.remove('hide');
  $('pfct-fabSave').classList.add('on');
}
function clearDirty(){
  DIRTY = false;
  $('pfct-dirtyTip').classList.add('hide');
  $('pfct-fabSave').classList.remove('on');
}
function sha256(str){
  if (window.crypto && crypto.subtle){
    return crypto.subtle.digest('SHA-256', new TextEncoder().encode(str)).then(function(buf){
      return Array.prototype.map.call(new Uint8Array(buf), function(b){ return ('0' + b.toString(16)).slice(-2); }).join('');
    });
  }
  return Promise.reject(new Error('当前环境不支持 crypto.subtle，请用 https 或 localhost 访问。'));
}
function b64enc(str){
  var bytes = new TextEncoder().encode(str), bin = '';
  for (var i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin);
}
function b64dec(b64){
  var bin = atob(b64.replace(/\n/g, '')), bytes = new Uint8Array(bin.length);
  for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}
function gh(method, path, body){
  var token = $('pfct-tok').value.trim();
  if (!token) return Promise.reject(new Error('请先填写 GitHub 访问令牌'));
  return fetch(API + path, {
    method: method,
    headers: {
      'Authorization': 'Bearer ' + token,
      'Accept': 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'Content-Type': 'application/json'
    },
    body: body ? JSON.stringify(body) : undefined
  }).then(function(r){
    return r.json().then(function(j){
      if (!r.ok) throw new Error((j && j.message) || ('HTTP ' + r.status));
      return j;
    });
  });
}

/* ================= 载入数据 ================= */
function loadData(){
  if (location.protocol === 'file:'){
    offlinePrompt('当前是用 file:// 直接打开的，浏览器禁止页面读取本地数据文件。');
    return;
  }
  tryLoad([ADMIN_CONFIG.DATA_PATH + '?t=' + Date.now(), ADMIN_CONFIG.DATA_PATH, './' + ADMIN_CONFIG.DATA_PATH]);
}
function tryLoad(urls){
  if (!urls.length){ offlinePrompt('无法从服务器读取 data.json（网络失败或文件不在本页同目录）。'); return; }
  fetch(urls.shift(), {cache:'no-store'}).then(function(r){
    if (!r.ok) throw new Error('HTTP ' + r.status);
    return r.json();
  }).then(function(d){
    if (!d || !d.contact) throw new Error('数据格式不对');
    DATA = d; buildAll(); fillStatic();
    $('pfct-offlineCard').classList.add('hide');
    clearDirty();
  }).catch(function(){ tryLoad(urls); });
}
function offlinePrompt(reason){
  $('pfct-locInfo').textContent = location.href;
  $('pfct-offlineCard').classList.remove('hide');
  msg('读取 data.json 失败：' + reason, 'err');
}

/* ================= 表单构建 ================= */
function inputHtml(path, value, type){
  var v = esc(value);
  return type === 'area'
    ? '<textarea data-p="' + path + '" style="min-height:62px">' + v + '</textarea>'
    : '<input type="text" data-p="' + path + '" value="' + v + '">';
}
var SAVE_BTN = '<button class="mini ghost" data-save type="button">保存</button>';

function buildFacts(){
  $('pfct-factsBox').innerHTML = arr(DATA.profile.facts).map(function(f, i){
    return '<div class="item"><div class="ih"><b>第 ' + (i + 1) + ' 行</b><span class="sp">' + SAVE_BTN +
      '<button class="danger" type="button" data-del="facts" data-i="' + i + '">删除</button></span></div>' +
      '<div class="row3">' +
      '<div><label>标签</label>' + inputHtml('profile.facts.' + i + '.k', f.k) + '</div>' +
      '<div><label>值</label>' + inputHtml('profile.facts.' + i + '.v', f.v) + '</div>' +
      '<div><label>链接（可空）</label>' + inputHtml('profile.facts.' + i + '.href', f.href) + '</div>' +
      '</div></div>';
  }).join('');
}
function buildAbout(){
  $('pfct-aboutBox').innerHTML = arr(DATA.about.paragraphs).map(function(t, i){
    return '<div class="item"><div class="ih"><b>段落 ' + (i + 1) + '</b><span class="sp">' + SAVE_BTN +
      '<button class="danger" type="button" data-del="about" data-i="' + i + '">删除</button></span></div>' +
      inputHtml('about.paragraphs.' + i, t, 'area') + '</div>';
  }).join('');
}
function buildStats(){
  $('pfct-statsBox').innerHTML = arr(DATA.about.stats).map(function(s, i){
    return '<div class="item"><div class="ih"><b>第 ' + (i + 1) + ' 块</b><span class="sp">' + SAVE_BTN +
      '<button class="danger" type="button" data-del="stats" data-i="' + i + '">删除</button></span></div>' +
      '<div class="row2">' +
      '<div><label>数字</label>' + inputHtml('about.stats.' + i + '.num', s.num) + '</div>' +
      '<div><label>说明（可用 &lt;br&gt; 换行）</label>' + inputHtml('about.stats.' + i + '.label', s.label) + '</div>' +
      '</div></div>';
  }).join('');
}
function buildSkills(){
  $('pfct-skillsBox').innerHTML = arr(DATA.skills).map(function(g, i){
    var bars = arr(g.bars).map(function(b, j){
      return '<div class="item" style="background:#fff;margin-bottom:10px">' +
        '<div class="ih"><b>能力条 ' + (j + 1) + '</b><span class="sp">' + SAVE_BTN +
        '<button class="danger" type="button" data-del="bar" data-i="' + i + '" data-j="' + j + '">删除</button></span></div>' +
        '<div class="row3">' +
        '<div><label>名称</label>' + inputHtml('skills.' + i + '.bars.' + j + '.label', b.label) + '</div>' +
        '<div><label>说明</label>' + inputHtml('skills.' + i + '.bars.' + j + '.note', b.note) + '</div>' +
        '<div><label>百分比</label><input type="number" min="0" max="100" data-p="skills.' + i + '.bars.' + j + '.pct" value="' + (b.pct || 0) + '"></div>' +
        '</div></div>';
    }).join('');
    return '<div class="item"><div class="ih"><b>分组 ' + (i + 1) + '</b><span class="sp">' + SAVE_BTN +
      '<button class="danger" type="button" data-del="skill" data-i="' + i + '">删除分组</button></span></div>' +
      '<div class="row2">' +
      '<div><label>分组名</label>' + inputHtml('skills.' + i + '.name', g.name) + '</div>' +
      '<div><label>说明</label>' + inputHtml('skills.' + i + '.note', g.note) + '</div></div>' +
      '<label>关键词（每行一个）</label><textarea data-p="skills.' + i + '.kws" data-type="lines">' + esc(arr(g.kws).join('\n')) + '</textarea>' +
      '<label>能力条</label>' + bars +
      '<button class="ghost mini" type="button" data-add="bar" data-i="' + i + '">+ 添加能力条</button></div>';
  }).join('');
}
/* 已归档的项目附件 chips（只读展示；文件本体可在生成器「图片」页签删除） */
function attachChips(p, pi){
  var list = arr(p.files);
  if (!list.length) return '';
  var chips = list.map(function(f, fi){
    var path = f.rel || f.path || '';
    var nm = f.name || path.split('/').pop();
    return '<span class="pfct-afchip"><a class="cp" href="' + esc(path) + '" target="_blank" rel="noopener" title="' + esc(path) + '">📎 ' + esc(nm) + '</a>' +
      '<button class="danger mini" type="button" data-afdel data-i="' + pi + '" data-fi="' + fi + '" title="移除该附件引用">✕</button></span>';
  }).join(' ');
  return '<div class="hint" style="margin:0 0 10px"><b>项目附件（' + list.length + '）：</b>' + chips + '</div>';
}
function buildProjects(){
  $('pfct-projectsBox').innerHTML = arr(DATA.projects).map(function(p, i){
    var src = shotSrc(p.shot);
    var prev = src
      ? previewHtml('当前截图', src, 0, '已设置')
      : '<div class="hint">当前：占位文字（未设置图片）</div>';
    var files = filePreviews(p.res);
    return '<div class="item"><div class="ih"><b>项目 ' + (i + 1) + '</b><span class="sp">' + SAVE_BTN +
      '<button class="danger" type="button" data-del="project" data-i="' + i + '">删除项目</button></span></div>' +
      '<label>标题</label>' + inputHtml('projects.' + i + '.title', p.title) +
      '<label>角色 / 标签行</label>' + inputHtml('projects.' + i + '.role', p.role) +
      '<label>背景</label>' + inputHtml('projects.' + i + '.bg', p.bg, 'area') +
      '<label>行动</label>' + inputHtml('projects.' + i + '.act', p.act, 'area') +
      '<label>结果</label>' + inputHtml('projects.' + i + '.res', p.res, 'area') +
      '<label>标签（每行一个）</label><textarea data-p="projects.' + i + '.kws" data-type="lines">' + esc(arr(p.kws).join('\n')) + '</textarea>' +
      '<label>截图区 HTML</label><textarea data-p="projects.' + i + '.shot">' + esc(p.shot) + '</textarea>' +
      '<div class="hint" style="margin:2px 0 8px">「上传截图」传<b>图片</b>才会显示为项目封面；「上传源文件」传 PDF / PSD / ZIP 等，会作为<b>附件</b>出现在前台项目详情（可在线预览、下载）。</div>' +
      attachChips(p, i) +
      '<div class="upbox"><div class="row">' +
        '<button class="ghost mini" type="button" data-pick="shot" data-i="' + i + '">上传截图</button>' +
        '<button class="ghost mini" type="button" data-pick="file" data-i="' + i + '">上传源文件</button>' +
        '<span class="hint" id="pfct-upstate-' + i + '"></span>' +
      '</div>' +
      '<div class="prevrow" id="pfct-prevbox-' + i + '">' + prev + files + '</div>' +
      '<input type="file" class="hide" id="pfct-pick-' + i + '">' +
      '</div></div>';
  }).join('');
}
function buildTimeline(){
  $('pfct-timelineBox').innerHTML = arr(DATA.timeline).map(function(t, i){
    return '<div class="item"><div class="ih"><b>第 ' + (i + 1) + ' 条</b><span class="sp">' + SAVE_BTN +
      '<button class="danger" type="button" data-del="time" data-i="' + i + '">删除</button></span></div>' +
      '<div class="row2"><div><label>时间</label>' + inputHtml('timeline.' + i + '.when', t.when) + '</div>' +
      '<div><label>标题</label>' + inputHtml('timeline.' + i + '.title', t.title) + '</div></div>' +
      '<label>描述</label>' + inputHtml('timeline.' + i + '.desc', t.desc, 'area') + '</div>';
  }).join('');
}
function buildAll(){ buildFacts(); buildAbout(); buildStats(); buildSkills(); buildProjects(); buildTimeline(); }

/* ================= 增删（事件委托） ================= */
document.addEventListener('click', function(e){
  var b = e.target.closest('button');
  if (!b) return;

  /* 复制按钮 */
  var cp = e.target.closest('.cp[data-copy]');
  if (cp){
    var txt = cp.dataset.copy, old = cp.textContent;
    var done = function(ok){
      cp.textContent = ok ? '已复制' : '请手动复制';
      setTimeout(function(){ cp.textContent = old; }, 1500);
    };
    if (navigator.clipboard && navigator.clipboard.writeText){
      navigator.clipboard.writeText(txt).then(function(){ done(true); }, function(){ done(false); });
    } else {
      var ta = document.createElement('textarea');
      ta.value = txt; ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      try { done(document.execCommand('copy')); } catch (err) { done(false); }
      document.body.removeChild(ta);
    }
    return;
  }

  /* 分区/条目保存 */
  if (b.hasAttribute('data-save')){ doSave('已保存并发布'); return; }

  /* 项目附件：移除引用（文件本体保留在仓库，可在生成器「图片」页签删除） */
  if (b.hasAttribute('data-afdel')){
    var pi = parseInt(b.getAttribute('data-i'), 10);
    var fi = parseInt(b.getAttribute('data-fi'), 10);
    var list = (DATA.projects[pi] || {}).files || [];
    var f = list[fi];
    if (!f) return;
    var fnm = f.name || (f.rel || f.path || '').split('/').pop();
    if (!confirm('从前台移除附件「' + fnm + '」？\n仅移除展示引用，文件本体仍保留在仓库 assets/ 中，可随时重新添加。')) return;
    list.splice(fi, 1);
    DATA.projects[pi].files = list;
    buildProjects();
    setDirty();
    toast('已移除附件「' + fnm + '」，记得保存', 'ok');
    return;
  }

  /* 项目内上传入口 */
  var pick = b.getAttribute('data-pick');
  if (pick){
    var idx = b.getAttribute('data-i');
    var input = $('pfct-pick-' + idx);
    if (input){
      input.accept = pick === 'shot' ? 'image/*' : '*/*';
      input.dataset.kind = pick;
      input.dataset.idx = idx;
      input.value = '';
      input.click();
    }
    return;
  }

  var kind = b.getAttribute('data-del') || b.getAttribute('data-add');
  if (!kind) return;
  collect();
  var i = parseInt(b.getAttribute('data-i'), 10);
  var j = parseInt(b.getAttribute('data-j'), 10);
  if (b.hasAttribute('data-del')){
    if (kind === 'facts')   DATA.profile.facts.splice(i, 1);
    if (kind === 'about')   DATA.about.paragraphs.splice(i, 1);
    if (kind === 'stats')   DATA.about.stats.splice(i, 1);
    if (kind === 'bar')     DATA.skills[i].bars.splice(j, 1);
    if (kind === 'skill')   DATA.skills.splice(i, 1);
    if (kind === 'project') DATA.projects.splice(i, 1);
    if (kind === 'time')    DATA.timeline.splice(i, 1);
  } else if (kind === 'bar'){
    DATA.skills[i].bars.push({label:'新能力', note:'', pct:60});
  }
  buildAll(); fillStatic(); setDirty();
});

$('pfct-addFact').addEventListener('click', function(){ collect(); DATA.profile.facts.push({k:'',v:'',href:''}); buildFacts(); setDirty(); });
$('pfct-addPara').addEventListener('click', function(){ collect(); DATA.about.paragraphs.push(''); buildAbout(); setDirty(); });
$('pfct-addStat').addEventListener('click', function(){ collect(); DATA.about.stats.push({num:'',label:''}); buildStats(); setDirty(); });
$('pfct-addSkill').addEventListener('click', function(){ collect(); DATA.skills.push({name:'新分组',note:'',bars:[],kws:[]}); buildSkills(); setDirty(); });
$('pfct-addProject').addEventListener('click', function(){ collect(); DATA.projects.push({shot:'',title:'新项目',role:'',bg:'',act:'',res:'',kws:[]}); buildProjects(); setDirty(); });
$('pfct-addTime').addEventListener('click', function(){ collect(); DATA.timeline.push({when:'',title:'',desc:''}); buildTimeline(); setDirty(); });

/* ================= 收集与填充 ================= */
function setPath(obj, path, value){
  var keys = path.split('.'), cur = obj;
  for (var i = 0; i < keys.length - 1; i++){
    var k = keys[i];
    if (cur[k] == null) cur[k] = /^\d+$/.test(keys[i + 1]) ? [] : {};
    cur = cur[k];
  }
  cur[keys[keys.length - 1]] = value;
}
function collect(){
  Array.prototype.forEach.call(document.querySelectorAll('#pfct-panel [data-p]'), function(n){
    var val = n.value;
    if (n.getAttribute('data-type') === 'lines'){
      val = val.split('\n').map(function(s){ return s.trim(); }).filter(function(s){ return s !== ''; });
    } else if (n.type === 'number'){ val = parseInt(val, 10) || 0; }
    setPath(DATA, n.getAttribute('data-p'), val);
  });
}
function fillStatic(){
  Array.prototype.forEach.call(document.querySelectorAll('#pfct-panel [data-p]'), function(n){
    var cur = DATA, ok = true;
    n.getAttribute('data-p').split('.').forEach(function(k){
      if (cur == null){ ok = false; return; }
      cur = cur[k];
    });
    if (!ok || cur == null) return;
    n.value = n.getAttribute('data-type') === 'lines' ? arr(cur).join('\n') : cur;
  });
}

/* ================= 保存 ================= */
function doSave(okText){
  collect();
  var text = JSON.stringify(DATA, null, 2);
  var message = $('pfct-commitMsg').value.trim() || ('更新作品集内容 ' + new Date().toLocaleString('zh-CN'));
  var path = '/repos/' + ADMIN_CONFIG.OWNER + '/' + ADMIN_CONFIG.REPO + '/contents/' + ADMIN_CONFIG.DATA_PATH;
  var btns = document.querySelectorAll('[data-save],#saveBtn,#fabSave');
  Array.prototype.forEach.call(btns, function(x){ x.disabled = true; });
  toast('正在提交…', 'info');
  gh('GET', path + '?ref=' + ADMIN_CONFIG.BRANCH).then(function(j){
    return gh('PUT', path, { message: message, content: b64enc(text), sha: j.sha, branch: ADMIN_CONFIG.BRANCH });
  }).then(function(){
    Array.prototype.forEach.call(btns, function(x){ x.disabled = false; });
    clearDirty();
    $('pfct-commitMsg').value = '';
    msg((okText || '已保存并发布') + '。前台约 1 分钟内生效，按 Ctrl+F5 强制刷新可立即看到。', 'ok');
  }).catch(function(e){
    Array.prototype.forEach.call(btns, function(x){ x.disabled = false; });
    msg('保存失败：' + e.message, 'err');
  });
}
$('pfct-saveBtn').addEventListener('click', function(){ doSave('已保存并发布'); });
$('pfct-fabSave').addEventListener('click', function(){ doSave('已保存并发布'); });
$('pfct-reloadBtn').addEventListener('click', function(){ loadData(); msg('已重新载入线上数据，未保存的修改已丢弃。', ''); });

/* 任何输入都标记为未保存 */
document.addEventListener('input', function(e){
  if (e.target.matches('#panel input[data-p], #panel textarea[data-p]')) setDirty();
});
window.addEventListener('beforeunload', function(e){
  if (DIRTY){ e.preventDefault(); e.returnValue = ''; }
});

/* ================= 上传 ================= */
var upSeq = 0;
/* ---- 小预览窗口 ---- */
var EXT_COLOR = {psd:'#31a8ff', ai:'#ff9a00', pdf:'#e2574c', zip:'#8a63d2', rar:'#8a63d2',
                 fig:'#a259ff', sketch:'#fdb300', xd:'#ff61f6', mp4:'#4c9be8', doc:'#2b579a',
                 docx:'#2b579a', ppt:'#d24726', pptx:'#d24726', txt:'#7a7a72'};
function extOf(n){ var d = String(n).lastIndexOf('.'); return d > 0 ? String(n).slice(d + 1).toLowerCase() : ''; }
function isImgName(n){ return /^(png|jpe?g|webp|gif|svg|avif|bmp)$/.test(extOf(n)); }
function thumbHtml(name, url){
  if (isImgName(name)) return '<a href="' + esc(url) + '" target="_blank" rel="noopener" title="点击查看大图">'
    + '<img class="thumb" src="' + esc(url) + '" alt=""></a>';
  var e = extOf(name);
  var c = EXT_COLOR[e] || '#6d6d68';
  return '<span class="thumb" style="background:' + c + '">' + esc(e ? e.toUpperCase() : 'FILE') + '</span>';
}
function previewHtml(name, url, size, note){
  return '<div class="preview' + (note === '上传中…' ? ' pending' : '') + '">' +
    thumbHtml(name, url) +
    '<div class="pmeta"><b title="' + esc(name) + '">' + esc(name) + '</b>' +
    (size ? fmtSize(size) + ' · ' : '') +
    (note ? esc(note) : (url ? '<a href="' + esc(url) + '" target="_blank" rel="noopener">打开 ↗</a>' : '')) +
    '</div></div>';
}
function shotSrc(html){
  var m = /<img[^>]+src=["']([^"']+)["']/i.exec(html || '');
  return m ? m[1] : '';
}
function filePreviews(html){
  var re = /href=["'](assets\/[^"']+)["'][^>]*>([^<]*)</g, m, out = '';
  while ((m = re.exec(html || ''))){
    var nm = (m[2] || '').trim() || m[1].split('/').pop();
    out += previewHtml(nm, m[1], 0, '');
  }
  return out;
}

function safeName(name){
  // GitHub Pages 无法访问中文等非 ASCII 路径，只保留 ASCII 字符
  var base = name.replace(/\.[^.]*$/, '').replace(/[^A-Za-z0-9_-]+/g, '-').replace(/^-+|-+$/g, '');
  var ext = (name.match(/\.[^.]*$/) || [''])[0].toLowerCase();
  if (!base) base = 'file_' + Date.now();
  return base + ext;
}
function fmtSize(n){ return n >= 1048576 ? (n / 1048576).toFixed(1) + ' MB' : Math.max(1, Math.round(n / 1024)) + ' KB'; }
function isImg(name){ return /\.(png|jpe?g|webp|gif|svg|avif)$/i.test(name); }
function putContents(path, b64, message){
  return gh('PUT', '/repos/' + ADMIN_CONFIG.OWNER + '/' + ADMIN_CONFIG.REPO + '/contents/' + path,
    { message: message, content: b64, branch: ADMIN_CONFIG.BRANCH });
}
function uploadFile(file, dir, onOk, onFail){
  if (file.size > 40 * 1024 * 1024){ onFail('超过 40MB，请压缩后重试'); return; }
  var name = safeName(file.name);
  var reader = new FileReader();
  reader.onerror = function(){ onFail('文件读取失败'); };
  reader.onload = function(e){
    var b64 = String(e.target.result).split(',')[1];
    putContents('assets/' + dir + '/' + name, b64, '上传素材 ' + name).then(function(){
      onOk(name, 'assets/' + dir + '/' + name);
    }).catch(function(err){
      if (/sha/i.test(err.message)){
        var dot = name.lastIndexOf('.');
        var nn = dot > 0 ? name.slice(0, dot) + '_' + Date.now() + name.slice(dot) : name + '_' + Date.now();
        putContents('assets/' + dir + '/' + nn, b64, '上传素材 ' + nn).then(function(){
          onOk(nn, 'assets/' + dir + '/' + nn);
        }).catch(function(e2){ onFail(e2.message || e2); });
      } else onFail(err.message || err);
    });
  };
  reader.readAsDataURL(file);
}

/* 项目内上传：截图自动写入 shot 字段；源文件给出可插入的链接 */
document.addEventListener('change', function(e){
  var inp = e.target;
  if (!inp.id || inp.id.indexOf('pfct-pick-') !== 0) return;
  if (!inp.files || !inp.files.length) return;
  var idx = parseInt(inp.dataset.idx, 10);
  var kind = inp.dataset.kind;
  var file = inp.files[0];
  var st = $('pfct-upstate-' + idx);
  if (!st) return;
  if (!$('pfct-tok').value.trim()){ st.innerHTML = '<span style="color:var(--warn)">请先填写访问令牌</span>'; inp.value = ''; return; }
  st.textContent = '上传中… ' + fmtSize(file.size);
  /* 选完立刻用本地临时地址出小预览，不等上传完成 */
  var box = $('pfct-prevbox-' + idx);
  var objUrl = '';
  if (box && isImgName(file.name)){
    objUrl = URL.createObjectURL(file);
    box.insertAdjacentHTML('afterbegin', previewHtml(file.name, objUrl, file.size, '上传中…'));
    var pending = box.querySelector('.preview.pending');
  }
  collect();  // 先把当前编辑内容同步进 DATA，避免上传后重建表单丢改动
  uploadFile(file, kind === 'shot' ? 'projects' : 'files', function(name, rel){
    if (objUrl) URL.revokeObjectURL(objUrl);
    if (pending && pending.parentNode) pending.parentNode.removeChild(pending);
    if (kind === 'shot'){
      DATA.projects[idx].shot = '<img src="' + rel + '" alt="' + esc(name) + '" style="width:100%;height:100%;object-fit:cover">';
    } else {
      /* 源文件自动归档为项目附件：前台项目详情里可见、可在线预览、可下载 */
      DATA.projects[idx].files = DATA.projects[idx].files || [];
      DATA.projects[idx].files.push({ name: name, rel: rel, size: file.size });
    }
    buildProjects(); fillStatic(); setDirty();
    var s2 = $('pfct-upstate-' + idx);
    if (s2){
      s2.innerHTML = kind === 'shot'
        ? '<span style="color:var(--ok)">截图已上传并写入，记得点保存</span>'
        : '<span style="color:var(--ok)">已上传 ' + esc(name) + '，已加入本项目附件（前台项目详情可见）</span> · 记得点保存' +
          ' <button class="cp" data-copy="' + esc(rel) + '" type="button">复制路径</button>' +
          ' <button class="ghost mini" data-insert="' + idx + '" data-rel="' + esc(rel) + '" data-nm="' + esc(name) + '" type="button">插入到结果</button>';
    }
    if (kind !== 'shot'){
      var b2 = $('pfct-prevbox-' + idx);
      if (b2) b2.insertAdjacentHTML('beforeend', previewHtml(name, rel, file.size, ''));
    }
    toast('上传成功：' + name, 'ok');
  }, function(reason){
    if (objUrl) URL.revokeObjectURL(objUrl);
    if (pending && pending.parentNode) pending.parentNode.removeChild(pending);
    st.innerHTML = '<span style="color:var(--warn)">失败：' + esc(reason) + '</span>';
  });
  inp.value = '';
});
/* 插入到结果字段 */
document.addEventListener('click', function(e){
  var b = e.target.closest('[data-insert]');
  if (!b) return;
  collect();
  var i = parseInt(b.getAttribute('data-insert'), 10);
  var tag = '<a href="' + b.getAttribute('data-rel') + '" download>' + b.getAttribute('data-nm') + '（源文件下载）</a>';
  DATA.projects[i].res = (DATA.projects[i].res || '') + ' ' + tag;
  buildProjects(); fillStatic(); setDirty();
  toast('已插入到「结果」字段，记得保存', 'ok');
});

/* 其他文件上传（assets/files/） */
$('pfct-fileInput').addEventListener('change', function(){
  if (!this.files || !this.files.length) return;
  if (!$('pfct-tok').value.trim()){ msg('请先填写访问令牌再上传。', 'err'); this.value = ''; return; }
  Array.prototype.forEach.call(this.files, function(f){ otherUpload(f); });
  this.value = '';
});
function otherUpload(file){
  var id = 'up' + (++upSeq);
  var name = safeName(file.name);
  var objUrl = isImgName(file.name) ? URL.createObjectURL(file) : '';
  var row = document.createElement('div');
  row.className = 'item';
  row.innerHTML = '<div class="ih"><b>' + esc(name) + '</b><span class="sp"></span>' +
    '<span style="color:var(--dim)">上传中… ' + fmtSize(file.size) + '</span></div>' +
    (objUrl ? previewHtml(name, objUrl, file.size, '上传中…') : '');
  $('pfct-upList').prepend(row);
  uploadFile(file, 'files', function(nm, rel){
    if (objUrl) URL.revokeObjectURL(objUrl);
    var imgTag = '<img src="' + rel + '" alt="' + esc(nm) + '" style="width:100%;height:100%;object-fit:cover">';
    var dlTag = '<a href="' + rel + '" download>下载源文件</a>';
    row.innerHTML = '<div class="ih"><b>' + esc(nm) + '</b><span class="sp"></span>' +
      '<span style="color:var(--ok);font-weight:700">已上线</span></div>' +
      '<div class="prevrow">' + previewHtml(nm, rel, file.size, '') + '</div>' +
      '<div class="hint"><code>' + esc(rel) + '</code></div>' +
      '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:8px">' +
      (isImg(nm)
        ? '<button class="cp" data-copy="' + esc(imgTag) + '" type="button">复制图片代码</button>'
        : '<button class="cp" data-copy="' + esc(dlTag) + '" type="button">复制下载链接代码</button>') +
      '<button class="cp" data-copy="' + esc(rel) + '" type="button">复制路径</button></div>';
  }, function(reason){
    if (objUrl) URL.revokeObjectURL(objUrl);
    row.innerHTML = '<div class="ih"><b>' + esc(name) + '</b><span class="sp"></span>' +
      '<span style="color:var(--warn);font-weight:700">失败：' + esc(reason) + '</span></div>';
  });
}

/* ================= 离线兜底 ================= */
$('pfct-pasteBtn').addEventListener('click', function(){
  var raw = $('pfct-pasteJson').value.trim();
  if (!raw) return msg('请先粘贴 data.json 的完整内容。', 'err');
  var d;
  try { d = JSON.parse(raw); } catch (e){ return msg('不是合法的 JSON：' + e.message, 'err'); }
  if (!d.contact) return msg('缺少 contact 字段——请确认粘贴的是完整的 data.json。', 'err');
  DATA = d; buildAll(); fillStatic();
  $('pfct-offlineCard').classList.add('hide');
  msg('解析成功，已进入编辑。', 'ok');
});
$('pfct-retryBtn').addEventListener('click', function(){ msg('正在重新读取…', ''); loadData(); });

/* ================= 修改密码 ================= */
$('pfct-pwBtn').addEventListener('click', function(){
  var a = $('pfct-np1').value, b = $('pfct-np2').value;
  if (!a) return msg('请输入新密码。', 'err');
  if (a !== b) return msg('两次输入不一致。', 'err');
  if (a.length < 8) return msg('密码至少 8 位，建议含大小写、数字与符号。', 'err');
  toast('正在提交…', 'info');
  sha256(a).then(function(hash){
    var path = '/repos/' + ADMIN_CONFIG.OWNER + '/' + ADMIN_CONFIG.REPO + '/contents/' + ADMIN_CONFIG.ADMIN_PATH;
    return gh('GET', path + '?ref=' + ADMIN_CONFIG.BRANCH).then(function(j){
      var src = b64dec(j.content);
      var re = /PASS_SHA256\s*:\s*['"][^'"]*['"]/;
      if (!re.test(src)) throw new Error('未在 admin.html 中找到 PASS_SHA256，请检查文件是否被改写');
      var next = src.replace(re, "PASS_SHA256: '" + hash + "'");
      if (next === src){
        $('pfct-np1').value = ''; $('pfct-np2').value = '';
        return 'SAME';
      }
      return gh('PUT', path, { message: '更新后台管理密码哈希', content: b64enc(next), sha: j.sha, branch: ADMIN_CONFIG.BRANCH });
    });
  }).then(function(r){
    if (r === 'SAME') return msg('新密码与当前密码相同，无需修改。', '');
    $('pfct-np1').value = ''; $('pfct-np2').value = '';
    msg('密码已更新并重新发布，下次登录请使用新密码。', 'ok');
  }).catch(function(e){ msg('修改密码失败：' + e.message, 'err'); });
});

/* ================= 侧栏高亮 ================= */
(function(){
  var links = Array.prototype.slice.call($('pfct-side').querySelectorAll('a'));
  links.forEach(function(a){
    a.addEventListener('click', function(e){
      e.preventDefault();
      var t = document.querySelector(a.getAttribute('href'));
      if (t) t.scrollIntoView({behavior:'smooth', block:'start'});
      links.forEach(function(x){ x.classList.remove('on'); });
      a.classList.add('on');
    });
  });
  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(en){
      if (!en.isIntersecting) return;
      links.forEach(function(x){ x.classList.toggle('on', x.getAttribute('href') === '#' + en.target.id); });
    });
  }, {rootMargin:'-80px 0px -70% 0px'});
  links.forEach(function(a){
    var t = document.querySelector(a.getAttribute('href'));
    if (t) io.observe(t);
  });
})();

/* ================= 初始化 ================= */
$('pfct-sitePill').textContent = ADMIN_CONFIG.OWNER + '/' + ADMIN_CONFIG.REPO;
var TOKK = 'pfTok';
try{
  var lt = localStorage.getItem(TOKK);
  $('pfct-tok').value = lt || sessionStorage.getItem(TOKK) || '';
  $('pfct-tokLong').checked = !!lt;
}catch(e){}
function storeTok(v, keep){
  try{
    if (keep){ localStorage.setItem(TOKK, v); }
    else { localStorage.removeItem(TOKK); sessionStorage.setItem(TOKK, v); }
  }catch(e){}
}
$('pfct-tok').addEventListener('input', function(){ storeTok(this.value, $('pfct-tokLong').checked); });
$('pfct-tokLong').addEventListener('change', function(){
  storeTok($('pfct-tok').value, this.checked);
  toast(this.checked ? '已在本机记住令牌，下次打开自动填好' : '已改为仅当前标签页有效', 'ok');
});
loadData();
      return { getData: function(){ return DATA; },
               collectAll: collect,
               load: loadData,
               save: doSave,
               isDirty: function(){ return DIRTY; } };
    })();
    if (opts.onReady) opts.onReady(api);
    return api;
  }

  return { mount: mount };
})();
