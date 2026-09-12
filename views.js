/* ============================================================
   views.js —— 站点视图共享层
   ------------------------------------------------------------
   作品集首页（index.html）的「视图滑块」与生成与预览工具
   （builder.html）共用同一套简历 / 着陆页模板，避免两处各写一份
   导致改了这边忘了那边。

   暴露： window.PFV
     PFV.RESUME_STYLES / PFV.LANDING_STYLES   风格预设
     PFV.tplResume(d, style, editable)         完整简历页 HTML
     PFV.tplLanding(d, style, editable)        完整着陆页 HTML
     PFV.editorScript()                        注入预览 iframe 的就地编辑脚本
     PFV.inject(html, extra)                   把脚本插到 </body> 前
     PFV.getPath(obj, path) / PFV.setPath()    按 "projects.0.title" 读写
   ============================================================ */
window.PFV = (function () {
  'use strict';

  function esc(x) {
    return String(x == null ? '' : x)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function raw(x) { return String(x == null ? '' : x); }
  function stripTags(x) { return String(x == null ? '' : x).replace(/<[^>]*>/g, ''); }

  var RESUME_STYLES = {
    classic: { name: '黑白经典', bg: '#ffffff', text: '#16161a', dim: '#6d6d68', accent: '#16161a', line: '#e2e2dd' },
    swiss:   { name: '瑞士红',   bg: '#ffffff', text: '#111111', dim: '#6d6d68', accent: '#d81e05', line: '#e2e2dd' },
    warm:    { name: '暖调米杏', bg: '#faf7f2', text: '#2a2521', dim: '#7a736a', accent: '#2f6b4f', line: '#e5ddd0' },
    blue:    { name: '商务蓝',   bg: '#f7f9fc', text: '#16202c', dim: '#5b6572', accent: '#2563eb', line: '#dde5ef' }
  };
  var LANDING_STYLES = {
    tech:  { name: '深色科技', bg: '#0e1116', bg2: '#0b0e13', panel: '#121820', line: '#232a33', text: '#e6edf3', dim: '#9aa7b5', accent: '#7ee787', onaccent: '#0e1116', nav: 'rgba(14,17,22,.86)', glow: 'rgba(126,231,135,.16)' },
    light: { name: '亮色简约', bg: '#ffffff', bg2: '#f6f8fb', panel: '#ffffff', line: '#e3e8ef', text: '#16161a', dim: '#5b6572', accent: '#2563eb', onaccent: '#ffffff', nav: 'rgba(255,255,255,.9)',  glow: 'rgba(37,99,235,.10)' },
    vivid: { name: '渐变紫境', bg: '#14121f', bg2: '#100e18', panel: '#1d1a2e', line: '#2e2947', text: '#f1edff', dim: '#a79bc8', accent: '#a78bfa', onaccent: '#14121f', nav: 'rgba(20,18,31,.86)', glow: 'rgba(167,139,250,.18)' }
  };

  /* ---- 可编辑标记：editable 为真时才输出，发布的正式页面不带任何痕迹 ---- */
  function ka(p, ed) { return ed ? ' data-k="' + esc(p) + '"' : ''; }
  function ia(p, ed) { return ed ? ' data-img="' + esc(p) + '"' : ''; }
  /* 图片槽位：有图出图，无图在编辑态出「＋ 添加图片」占位 */
  function slotImg(p, src, ed, cls, alt) {
    if (src) return '<img src="' + esc(src) + '" alt="' + esc(alt || '') + '"' + (cls ? ' class="' + cls + '"' : '') + ia(p, ed) + ' loading="lazy">';
    if (!ed) return '';
    return '<span class="pf-addimg"' + ia(p, ed) + '>＋ 添加图片</span>';
  }

  /* ============================ 简历 ============================ */
  function tplResume(d, style, editable) {
    var ed = !!editable;
    var p = (d && d.profile) || {}, a = (d && d.about) || {}, c = (d && d.contact) || {};
    var md = (d && d.media) || {};
    var S = RESUME_STYLES[style] || RESUME_STYLES.classic;

    var skills = (d.skills || []).map(function (g, gi) {
      var items = (g.bars || []).map(function (b, bi) {
        return '<div class="bar"><span' + ka('skills.' + gi + '.bars.' + bi + '.label', ed) + '>' + esc(b.label) + '</span>' +
          '<i style="width:' + (b.pct || 0) + '%"></i><em' + ka('skills.' + gi + '.bars.' + bi + '.pct', ed) + '>' + (b.pct || 0) + '</em></div>';
      }).join('');
      var kws = (g.kws || []).map(function (k, ki) {
        return '<li' + ka('skills.' + gi + '.kws.' + ki, ed) + '>' + esc(k) + '</li>';
      }).join('');
      return '<section><h2' + ka('skills.' + gi + '.name', ed) + '>' + esc(g.name) + '</h2>' +
        '<p class="note"' + ka('skills.' + gi + '.note', ed) + '>' + esc(g.note || '') + '</p>' +
        items + (kws ? '<ul class="kws">' + kws + '</ul>' : '') + '</section>';
    }).join('');

    var projects = (d.projects || []).map(function (x, i) {
      return '<section class="pj"><h3' + ka('projects.' + i + '.title', ed) + '>' + esc(x.title) + '</h3>' +
        '<p class="role"' + ka('projects.' + i + '.role', ed) + '>' + esc(x.role) + '</p>' +
        '<ul>' +
          '<li><b>背景</b><span' + ka('projects.' + i + '.bg', ed) + '>' + raw(x.bg) + '</span></li>' +
          '<li><b>行动</b><span' + ka('projects.' + i + '.act', ed) + '>' + raw(x.act) + '</span></li>' +
          '<li><b>结果</b><span' + ka('projects.' + i + '.res', ed) + '>' + raw(x.res) + '</span></li>' +
        '</ul></section>';
    }).join('');

    var tl = (d.timeline || []).map(function (x, i) {
      return '<div class="tl"><span' + ka('timeline.' + i + '.when', ed) + '>' + esc(x.when) + '</span><div>' +
        '<b' + ka('timeline.' + i + '.title', ed) + '>' + esc(x.title) + '</b>' +
        '<p' + ka('timeline.' + i + '.desc', ed) + '>' + esc(x.desc) + '</p></div></div>';
    }).join('');

    var shots = (md.resumeShots || []).map(function (u, i) {
      return slotImg('media.resumeShots.' + i, u, ed, '', '');
    }).join('');
    if (ed) shots += '<span class="pf-addimg pf-addcell"' + ia('media.resumeShots.-1', ed) + '>＋ 添加图片</span>';

    return '<!doctype html><html lang="zh-CN"><head><meta charset="utf-8">' +
      '<meta name="viewport" content="width=device-width,initial-scale=1">' +
      '<title>' + esc(p.name || '简历') + ' · 简历</title><style>' +
      ':root{--pbg:' + S.bg + ';--ptext:' + S.text + ';--paccent:' + S.accent + ';--pdim:' + S.dim + ';--pline:' + S.line + '}' +
      '*{box-sizing:border-box}body{margin:0;padding:34px 26px;background:var(--pbg);color:var(--ptext);' +
      'font:14px/1.75 -apple-system,"PingFang SC","Microsoft YaHei",sans-serif;max-width:820px;margin:0 auto}' +
      'header{border-bottom:3px solid var(--paccent);padding-bottom:16px;margin-bottom:22px}' +
      'h1{margin:0;font-size:34px;letter-spacing:-.01em}header .sub{color:#6d6d68;margin-top:4px}' +
      '.ct{margin-top:12px;display:flex;gap:16px;flex-wrap:wrap;font-size:13px;color:var(--pdim)}' +
      'h2{font-size:13px;letter-spacing:.12em;text-transform:uppercase;color:var(--paccent);margin:26px 0 10px}' +
      'section{margin-bottom:18px}.note{color:var(--pdim);margin:0 0 8px;font-size:13px}' +
      '.bar{display:flex;align-items:center;gap:8px;font-size:13px;margin:5px 0}' +
      '.bar span{width:120px;flex-shrink:0}.bar i{display:block;height:6px;background:var(--paccent);max-width:420px}' +
      '.bar em{font-style:normal;font-size:11px;color:var(--pdim)}' +
      'ul.kws{list-style:none;padding:0;margin:8px 0 0;display:flex;gap:6px;flex-wrap:wrap}' +
      'ul.kws li{border:1px solid var(--pline);border-radius:999px;padding:3px 10px;font-size:12px}' +
      '.pj h3{margin:14px 0 2px;font-size:15px}.pj .role{color:var(--pdim);font-size:12.5px;margin:0 0 6px}' +
      '.pj ul{margin:0;padding-left:18px;font-size:13px;color:var(--ptext)}.pj li{margin:3px 0}' +
      '.tl{display:flex;gap:14px;padding:8px 0;border-top:1px solid var(--pline)}' +
      '.tl span{width:96px;flex-shrink:0;color:var(--pdim);font-size:12.5px}.tl b{font-size:14px}.tl p{margin:2px 0 0;font-size:13px;color:var(--pdim)}' +
      'footer{margin-top:28px;border-top:1px solid var(--pline);padding-top:12px;font-size:12px;color:var(--pdim)}' +
      '.shots{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-top:4px}' +
      '.shots img{width:100%;height:140px;object-fit:cover;border:1px solid var(--pline);border-radius:6px}' +
      '.av{width:92px;height:92px;border-radius:50%;object-fit:cover;float:right;margin:0 0 8px 18px;border:1px solid #e2e2dd;background:#f2f2ef}' +
      '@media print{body{padding:0}h2{page-break-after:avoid}.pj{page-break-inside:avoid}}' +
      '@media (max-width:600px){body{padding:18px 14px}h1{font-size:26px}.bar span{width:90px}.shots{grid-template-columns:repeat(2,1fr)}}' +
      '</style></head><body>' +
      '<header>' +
      (md.avatar ? '<img class="av" src="' + esc(md.avatar) + '" alt="头像"' + ia('media.avatar', ed) + '>'
                 : (ed ? '<span class="pf-addimg pf-av"' + ia('media.avatar', ed) + '>＋ 头像</span>' : '')) +
      '<h1' + ka('profile.name', ed) + '>' + esc(p.name || '姓名') + '</h1>' +
      '<div class="sub"><span' + ka('profile.eyebrow', ed) + '>' + esc(p.eyebrow || '') + '</span>' +
        '<span' + ka('profile.intent', ed) + '>' + (p.intent ? ' · ' + esc(p.intent) : '') + '</span></div>' +
      '<div class="ct">' +
        (c.email ? '<span>邮箱 <span' + ka('contact.email', ed) + '>' + esc(c.email) + '</span></span>' : '') +
        (c.phone ? '<span>电话 <span' + ka('contact.phone', ed) + '>' + esc(c.phone) + '</span></span>' : '') +
        (c.wechat ? '<span>微信 <span' + ka('contact.wechat', ed) + '>' + esc(c.wechat) + '</span></span>' : '') +
        (c.city ? '<span><span' + ka('contact.city', ed) + '>' + esc(c.city) + '</span></span>' : '') +
        (c.github ? '<span>GitHub <span' + ka('contact.github', ed) + '>' + esc(c.github) + '</span></span>' : '') +
      '</div></header>' +
      (a.paragraphs && a.paragraphs[0] ? '<section><h2>个人简介</h2><p' + ka('about.paragraphs.0', ed) + '>' + raw(a.paragraphs[0]) + '</p></section>' : '') +
      skills +
      '<section><h2>项目经历</h2>' + projects + '</section>' +
      '<section><h2>教育与实践</h2>' + tl + '</section>' +
      '<section><h2>作品样张</h2><div class="shots">' + shots + '</div></section>' +
      '<footer>本页由站点生成与预览工具从 data.json 实时生成 · ' + esc((d.meta && d.meta.updated) || '') +
      ' · <a href="https://hnzzsp.github.io/portfolio/" target="_blank" rel="noopener">查看完整作品集 ↗</a></footer>' +
      '</body></html>';
  }

  /* ============================ 着陆页 ============================ */
  function tplLanding(d, style, editable) {
    var ed = !!editable;
    var p = (d && d.profile) || {}, a = (d && d.about) || {}, c = (d && d.contact) || {};
    var md = (d && d.media) || {};
    var S = LANDING_STYLES[style] || LANDING_STYLES.tech;

    var features = (d.skills || []).slice(0, 3).map(function (g, i) {
      return '<div class="f"><span class="n">0' + (i + 1) + '</span>' +
        '<h3' + ka('skills.' + i + '.name', ed) + '>' + esc(g.name) + '</h3>' +
        '<p' + ka('skills.' + i + '.note', ed) + '>' + esc(g.note || '') + '</p>' +
        ((g.kws || []).slice(0, 4).map(function (k, ki) {
          return '<i' + ka('skills.' + i + '.kws.' + ki, ed) + '>' + esc(k) + '</i>';
        }).join('')) + '</div>';
    }).join('');

    var stats = (a.stats || []).map(function (s, i) {
      return '<div><b' + ka('about.stats.' + i + '.num', ed) + '>' + esc(s.num) + '</b>' +
        '<span' + ka('about.stats.' + i + '.label', ed) + '>' + raw(s.label) + '</span></div>';
    }).join('');

    /* 项目卡：图片来自 projects.i.shot（一段 <img> 片段），不再被画廊顶掉 */
    var cards = (d.projects || []).map(function (x, i) {
      var img = /<img\s/i.test(x.shot || '') ? x.shot : '';
      var inner = img
        ? img.replace(/<img/i, '<img' + (ed ? ' data-img="projects.' + i + '.shot"' : ''))
        : (ed ? '<span class="pf-addimg pf-cardimg"' + ia('projects.' + i + '.shot', ed) + '>＋ 添加作品图</span>' : '');
      return '<article>' + (inner ? '<div class="shot">' + inner + '</div>' : '<div class="shot ph">作品图待补充</div>') +
        '<h3' + ka('projects.' + i + '.title', ed) + '>' + esc(x.title) + '</h3>' +
        '<p class="r"' + ka('projects.' + i + '.role', ed) + '>' + esc(x.role) + '</p>' +
        '<p class="d"' + ka('projects.' + i + '.act', ed) + '>' + raw(x.act) + '</p>' +
        ((x.kws || []).map(function (k, ki) {
          return '<i' + ka('projects.' + i + '.kws.' + ki, ed) + '>' + esc(k) + '</i>';
        }).join('')) + '</article>';
    }).join('');

    /* 画廊：独立成段，追加在项目卡之后，不再替换项目卡 */
    var gShots = (md.landingShots || []).map(function (u, i) {
      return '<div class="g">' + slotImg('media.landingShots.' + i, u, ed, '', '') + '</div>';
    }).join('');
    if (ed) gShots += '<div class="g pf-addcell"><span class="pf-addimg"' + ia('media.landingShots.-1', ed) + '>＋ 添加图片</span></div>';
    var gallery = gShots
      ? '<section style="background:var(--L-bg)"><div class="wrap"><h2>作品图集</h2><div class="gallery">' + gShots + '</div></div></section>'
      : '';

    var heroImg = md.landingHero
      ? '<div class="heroimg"><img src="' + esc(md.landingHero) + '" alt=""' + ia('media.landingHero', ed) + '></div>'
      : (ed ? '<div class="heroimg"><span class="pf-addimg pf-hero"' + ia('media.landingHero', ed) + '>＋ 添加顶部主视觉</span></div>' : '');

    return '<!doctype html><html lang="zh-CN"><head><meta charset="utf-8">' +
      '<meta name="viewport" content="width=device-width,initial-scale=1">' +
      '<title>' + esc(p.name || '') + ' · ' + esc(p.role || '') + '</title><style>' +
      ':root{--L-bg:' + S.bg + ';--L-bg2:' + S.bg2 + ';--L-panel:' + S.panel + ';--L-line:' + S.line + ';--L-text:' + S.text + ';--L-dim:' + S.dim + ';--L-accent:' + S.accent + ';--L-onaccent:' + S.onaccent + ';--L-nav:' + S.nav + ';--L-glow:' + S.glow + '}' +
      '*{box-sizing:border-box}body{margin:0;background:var(--L-bg);color:var(--L-text);' +
      'font:15px/1.7 -apple-system,"PingFang SC","Microsoft YaHei",sans-serif}' +
      'a{color:inherit}.wrap{max-width:1080px;margin:0 auto;padding:0 22px}' +
      'nav{position:sticky;top:0;background:var(--L-nav);backdrop-filter:blur(8px);border-bottom:1px solid var(--L-line);z-index:9}' +
      'nav .wrap{display:flex;align-items:center;height:58px;gap:14px}' +
      'nav b{font-size:15px}nav .sp{margin-left:auto;display:flex;gap:8px}' +
      'nav button{background:var(--L-accent);color:var(--L-onaccent);border:0;border-radius:999px;padding:7px 16px;font:inherit;font-size:13px;font-weight:700;cursor:pointer}' +
      'header.hero{padding:76px 0 56px;background:radial-gradient(1000px 400px at 20% -10%,var(--L-glow),transparent)}' +
      '.eyebrow{color:var(--L-accent);font-size:12.5px;letter-spacing:.14em;text-transform:uppercase;margin:0 0 14px}' +
      'h1{margin:0;font-size:44px;line-height:1.15;letter-spacing:-.02em;max-width:16em}' +
      '.lede{color:var(--L-dim);font-size:16.5px;max-width:34em;margin:18px 0 26px}' +
      '.cta{display:inline-flex;gap:10px;flex-wrap:wrap}' +
      '.cta a{padding:11px 22px;border-radius:999px;font-size:14px;font-weight:700;text-decoration:none}' +
      '.cta a.p{background:var(--L-accent);color:var(--L-onaccent)}.cta a.s{border:1px solid var(--L-line);color:var(--L-text)}' +
      '.stats{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;border-top:1px solid var(--L-line);border-bottom:1px solid var(--L-line);padding:24px 0;margin:0}' +
      '.stats b{display:block;font-size:26px;color:var(--L-accent)}.stats span{font-size:12.5px;color:var(--L-dim);line-height:1.5}' +
      'section{padding:56px 0}h2{font-size:26px;margin:0 0 22px;letter-spacing:-.01em}' +
      '.feat{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}' +
      '.f{border:1px solid var(--L-line);border-radius:12px;padding:20px;background:var(--L-panel)}' +
      '.f .n{font-family:monospace;color:var(--L-accent);font-size:12px}.f h3{margin:6px 0 8px;font-size:16px}' +
      '.f p{color:var(--L-dim);font-size:13.5px;margin:0 0 12px}' +
      '.f i,.shot+.r{margin:0}.f i{display:inline-block;font-style:normal;font-size:11.5px;border:1px solid var(--L-line);border-radius:999px;padding:2px 9px;margin:0 5px 5px 0;color:var(--L-dim)}' +
      '.cards{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:18px}' +
      'article{border:1px solid var(--L-line);border-radius:12px;overflow:hidden;background:var(--L-panel);display:flex;flex-direction:column}' +
      '.shot{height:150px;background:var(--L-bg);overflow:hidden}.shot img{width:100%;height:100%;object-fit:cover}' +
      '.ph{display:flex;align-items:center;justify-content:center;color:var(--L-dim);font-size:12.5px}' +
      'article h3{margin:14px 14px 4px;font-size:15px}article .r{color:var(--L-accent);font-size:12px;margin:0 14px 8px}' +
      'article .d{color:var(--L-dim);font-size:13px;margin:0 14px 12px;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}' +
      'article i{display:inline-block;font-style:normal;font-size:11.5px;border:1px solid var(--L-line);border-radius:999px;padding:2px 9px;margin:0 0 14px 14px;color:var(--L-dim)}' +
      '.band{background:var(--L-panel);border:1px solid var(--L-line);border-radius:16px;padding:34px;text-align:center}' +
      'footer{border-top:1px solid var(--L-line);padding:24px 0;color:var(--L-dim);font-size:12.5px}' +
      '.heroimg{max-width:1080px;margin:24px auto 0;padding:0 22px}' +
      '.heroimg img{width:100%;height:300px;object-fit:cover;border-radius:14px;border:1px solid var(--L-line);display:block}' +
      '.gallery{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:14px}' +
      '.gallery .g{border-radius:12px;overflow:hidden;border:1px solid var(--L-line);background:var(--L-panel);min-height:120px}' +
      '.gallery img{width:100%;height:170px;object-fit:cover;display:block}' +
      '@media (max-width:860px){.stats{grid-template-columns:repeat(2,1fr)}.feat{grid-template-columns:1fr}h1{font-size:32px}header.hero{padding:52px 0 40px}}' +
      '</style></head><body>' +
      '<nav><div class="wrap"><b' + ka('profile.name', ed) + '>' + esc(p.name || '') + '</b>' +
      '<span style="color:' + S.dim + ';font-size:13px"' + ka('profile.role', ed) + '>' + esc(p.role || '') + '</span>' +
      '<span class="sp"><a class="s" style="font-size:13px;text-decoration:none;border:1px solid var(--L-line);padding:6px 14px;border-radius:999px" href="mailto:' + esc(c.email || '') + '"><span' + ka('contact.email', ed) + '>' + esc(c.email || '联系我') + '</span></a></span></div></nav>' +
      '<header class="hero"><div class="wrap">' +
      '<p class="eyebrow"' + ka('profile.eyebrow', ed) + '>' + esc(p.eyebrow || '') + '</p>' +
      '<h1' + ka('profile.zhTitle', ed) + '>' + esc(p.zhTitle || p.name || '') + '</h1>' +
      '<p class="lede"' + ka('profile.lede', ed) + '>' + raw(p.lede) + '</p>' +
      '<div class="cta"><a class="p" href="mailto:' + esc(c.email || '') + '">立即联系</a>' +
      (c.siteUrl ? '<a class="s" href="' + esc(c.siteUrl) + '" target="_blank" rel="noopener">查看作品站 ↗</a>' : '') + '</div>' +
      '</div></header>' +
      '<div class="wrap"><div class="stats">' + stats + '</div></div>' +
      heroImg +
      '<section><div class="wrap"><h2>能力矩阵</h2><div class="feat">' + features + '</div></div></section>' +
      '<section style="background:var(--L-bg2)"><div class="wrap"><h2>项目与作品</h2><div class="cards">' + cards + '</div></div></section>' +
      gallery +
      '<section><div class="wrap"><div class="band"><h2>有合适的机会？聊聊</h2>' +
      '<p style="color:' + S.dim + ';margin:0 0 18px">邮箱 <span' + ka('contact.email', ed) + '>' + esc(c.email || '') + '</span>' +
      (c.wechat ? ' · 微信 <span' + ka('contact.wechat', ed) + '>' + esc(c.wechat) + '</span>' : '') +
      (c.phone ? ' · 电话 <span' + ka('contact.phone', ed) + '>' + esc(c.phone) + '</span>' : '') + '</p>' +
      '<a class="p" style="background:var(--L-accent);color:var(--L-onaccent);padding:11px 24px;border-radius:999px;text-decoration:none;font-weight:700" href="mailto:' + esc(c.email || '') + '">发送邮件</a>' +
      '</div></div></section>' +
      '<footer><div class="wrap">© ' + new Date().getFullYear() + ' ' + esc((d.footer && d.footer.name) || p.name || '') +
      ' · 本页由站点生成与预览工具实时生成 · <a href="https://hnzzsp.github.io/portfolio/" target="_blank" rel="noopener">查看完整作品集 ↗</a></div></footer>' +
      '</body></html>';
  }

  /* ==================== 就地编辑脚本（注入预览 iframe） ==================== */
  function editorScript() {
    var css = [
      '[data-k]{outline:1px dashed rgba(126,231,135,.35);outline-offset:3px;cursor:text;border-radius:3px}',
      '[data-k]:hover{outline-color:#7ee787;background:rgba(126,231,135,.07)}',
      '[data-k]:focus{outline:2px solid #7ee787;background:rgba(126,231,135,.12)}',
      '[data-img]{cursor:pointer}',
      '.pf-imgwrap{position:relative;display:block}',
      '.pf-imgwrap>.pf-imgbar{position:absolute;top:8px;right:8px;display:flex;gap:6px;z-index:99;opacity:0;transition:opacity .15s}',
      '.pf-imgwrap:hover>.pf-imgbar{opacity:1}',
      '.pf-imgbar button{font:600 12px/1 -apple-system,"PingFang SC",sans-serif;border:0;border-radius:999px;padding:6px 10px;cursor:pointer;background:rgba(20,22,28,.82);color:#fff;box-shadow:0 2px 8px rgba(0,0,0,.25)}',
      '.pf-imgbar button:hover{background:#7ee787;color:#0e1116}',
      '.pf-addimg{display:flex;align-items:center;justify-content:center;border:2px dashed rgba(126,231,135,.55);color:#7ee787;border-radius:10px;font-size:13px;cursor:pointer;min-height:96px;background:rgba(126,231,135,.05)}',
      '.pf-addimg:hover{background:rgba(126,231,135,.14)}',
      '.pf-av{width:92px;height:92px;border-radius:50%;float:right;margin:0 0 8px 18px;min-height:0;font-size:12px}',
      '.pf-hero{height:300px;border-radius:14px}',
      '.pf-cardimg{height:150px;min-height:0;border-radius:0;border:0;background:rgba(126,231,135,.06)}',
      '.pf-addcell{min-height:120px}'
    ].join('');
    var js = [
      '(function(){',
      'var send=function(m){try{parent.postMessage(m,"*")}catch(e){}};',
      'var st=document.createElement("style");st.textContent=' + JSON.stringify(css) + ';document.head.appendChild(st);',
      /* 图片包装：换图 / 删除 */
      'Array.prototype.forEach.call(document.querySelectorAll("[data-img]"),function(el){',
      '  if(el.classList.contains("pf-addimg")){el.addEventListener("click",function(){send({type:"pf-img",act:"add",k:el.getAttribute("data-img")})});return;}',
      '  var w=document.createElement("span");w.className="pf-imgwrap";',
      '  el.parentNode.insertBefore(w,el);w.appendChild(el);',
      '  var bar=document.createElement("span");bar.className="pf-imgbar";',
      '  bar.innerHTML=\'<button type="button" data-a="rep">换图</button><button type="button" data-a="del">删除</button>\';',
      '  w.appendChild(bar);',
      '  bar.addEventListener("click",function(e){var b=e.target.closest?e.target.closest("[data-a]"):null;if(!b)return;',
      '    e.preventDefault();e.stopPropagation();send({type:"pf-img",act:b.getAttribute("data-a"),k:el.getAttribute("data-img")});});',
      '});',
      /* 文字就地编辑 */
      'function val(el){var h=el.innerHTML.trim(),t=el.textContent.trim();return (h!==t&&/<[a-z]/i.test(h))?h:t;}',
      'function push(el){send({type:"pf-edit",k:el.getAttribute("data-k"),v:val(el)});}',
      'Array.prototype.forEach.call(document.querySelectorAll("[data-k]"),function(el){',
      '  el.setAttribute("contenteditable","true");el.setAttribute("spellcheck","false");',
      '  var t=null;',
      '  el.addEventListener("input",function(){clearTimeout(t);var s=el;t=setTimeout(function(){push(s)},600);});',
      '  el.addEventListener("blur",function(){clearTimeout(t);push(el);});',
      '  el.addEventListener("keydown",function(e){if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();el.blur();}});',
      '});',
      /* 高度上报（父页面用来把 iframe 撑到内容高度） */
      'function h(){send({type:"pf-h",v:Math.max(document.body.scrollHeight,document.documentElement.scrollHeight)});}',
      'window.addEventListener("load",h);setTimeout(h,60);setTimeout(h,400);setTimeout(h,1200);',
      'Array.prototype.forEach.call(document.images,function(im){if(!im.complete)im.addEventListener("load",h);});',
      'if(window.ResizeObserver){try{new ResizeObserver(h).observe(document.body)}catch(e){}}',
      '})();'
    ].join('\n');
    return '<script>' + js + '<\/script>';
  }

  function inject(html, extra) {
    if (!extra) return html;
    var i = html.toLowerCase().lastIndexOf('</body>');
    if (i < 0) return html + extra;
    return html.slice(0, i) + extra + html.slice(i);
  }

  /* ==================== 路径读写："projects.0.title" ==================== */
  function getPath(obj, path) {
    var parts = String(path || '').split('.');
    var cur = obj;
    for (var i = 0; i < parts.length; i++) {
      if (cur == null) return undefined;
      cur = cur[parts[i]];
    }
    return cur;
  }
  function setPath(obj, path, val) {
    var parts = String(path || '').split('.');
    var cur = obj;
    for (var i = 0; i < parts.length - 1; i++) {
      var k = parts[i];
      if (cur[k] == null) cur[k] = /^\d+$/.test(parts[i + 1]) ? [] : {};
      cur = cur[k];
    }
    var last = parts[parts.length - 1];
    /* 技能百分比这类数字字段自动转数字，避免存成字符串 */
    if (last === 'pct' && /^\d+$/.test(String(val).trim())) val = Number(String(val).trim());
    cur[last] = val;
    return obj;
  }
  /* 删除路径指向的值：数组用splice，其他置空 */
  function delPath(obj, path) {
    var parts = String(path || '').split('.');
    var cur = obj, i;
    for (i = 0; i < parts.length - 1; i++) {
      if (cur == null) return false;
      cur = cur[parts[i]];
    }
    var last = parts[parts.length - 1];
    if (Array.isArray(cur) && /^-?\d+$/.test(last)) {
      var idx = Number(last);
      if (idx >= 0 && idx < cur.length) { cur.splice(idx, 1); return true; }
      return false;
    }
    cur[last] = '';
    return true;
  }

  return {
    esc: esc, raw: raw, stripTags: stripTags,
    RESUME_STYLES: RESUME_STYLES, LANDING_STYLES: LANDING_STYLES,
    tplResume: tplResume, tplLanding: tplLanding,
    editorScript: editorScript, inject: inject,
    getPath: getPath, setPath: setPath, delPath: delPath
  };
})();
