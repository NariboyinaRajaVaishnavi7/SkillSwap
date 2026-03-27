import { useState, useEffect, useRef } from "react";

// ─── DESIGN TOKENS ────────────────────────────────────────────────────────────
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,300;0,400;0,600;0,700;1,300;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --cream: #FDF6EC;
    --warm-white: #FFFBF5;
    --sand: #F0E6D3;
    --terracotta: #D4724A;
    --terracotta-light: #E8916D;
    --terracotta-dark: #B85A34;
    --sage: #7A9E7E;
    --sage-light: #A8C5AB;
    --amber: #E8A838;
    --amber-light: #F5C96A;
    --charcoal: #2C2C2C;
    --mid: #6B6460;
    --light-mid: #9B948F;
    --border: #E8DECE;
    --shadow: rgba(44,44,44,0.08);
    --shadow-md: rgba(44,44,44,0.14);
    --font-display: 'Fraunces', serif;
    --font-body: 'DM Sans', sans-serif;
    --radius: 16px;
    --radius-sm: 8px;
    --radius-lg: 24px;
  }

  body { background: var(--cream); font-family: var(--font-body); color: var(--charcoal); }

  /* ── GLOBAL ── */
  .app { min-height: 100vh; }
  .btn {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 12px 24px; border-radius: 100px; border: none;
    font-family: var(--font-body); font-size: 15px; font-weight: 500;
    cursor: pointer; transition: all 0.2s ease; text-decoration: none;
  }
  .btn-primary { background: var(--terracotta); color: #fff; }
  .btn-primary:hover { background: var(--terracotta-dark); transform: translateY(-1px); box-shadow: 0 6px 20px rgba(212,114,74,0.35); }
  .btn-secondary { background: var(--warm-white); color: var(--charcoal); border: 1.5px solid var(--border); }
  .btn-secondary:hover { background: var(--sand); transform: translateY(-1px); }
  .btn-ghost { background: transparent; color: var(--mid); }
  .btn-ghost:hover { background: var(--sand); color: var(--charcoal); }
  .btn-sm { padding: 8px 16px; font-size: 13px; }
  .btn-sage { background: var(--sage); color: #fff; }
  .btn-sage:hover { background: #668B6A; transform: translateY(-1px); }

  /* ── NAV ── */
  nav {
    position: sticky; top: 0; z-index: 100;
    background: rgba(253,246,236,0.92); backdrop-filter: blur(12px);
    border-bottom: 1px solid var(--border);
    padding: 0 32px; height: 64px;
    display: flex; align-items: center; justify-content: space-between;
  }
  .nav-logo { font-family: var(--font-display); font-size: 22px; font-weight: 600; color: var(--terracotta); cursor: pointer; }
  .nav-logo span { color: var(--charcoal); font-style: italic; }
  .nav-links { display: flex; gap: 4px; align-items: center; }

  /* ── LANDING ── */
  .landing { overflow: hidden; }
  .hero {
    padding: 100px 48px 80px;
    display: grid; grid-template-columns: 1fr 1fr; gap: 64px; align-items: center;
    max-width: 1200px; margin: 0 auto;
  }
  .hero-badge {
    display: inline-flex; align-items: center; gap: 8px;
    background: var(--amber-light); color: var(--charcoal);
    padding: 6px 14px; border-radius: 100px; font-size: 13px; font-weight: 500;
    margin-bottom: 24px;
  }
  .hero h1 {
    font-family: var(--font-display); font-size: 58px; line-height: 1.1;
    font-weight: 700; margin-bottom: 20px; color: var(--charcoal);
  }
  .hero h1 em { font-style: italic; color: var(--terracotta); }
  .hero p { font-size: 18px; color: var(--mid); line-height: 1.7; margin-bottom: 32px; }
  .hero-cta { display: flex; gap: 12px; align-items: center; }
  .hero-social { margin-top: 40px; display: flex; gap: 24px; align-items: center; }
  .hero-social-label { font-size: 13px; color: var(--light-mid); }
  .avatar-stack { display: flex; }
  .avatar-stack img, .avatar-mini {
    width: 36px; height: 36px; border-radius: 50%;
    border: 2.5px solid var(--cream); margin-left: -10px;
    background: var(--sand); display: flex; align-items: center; justify-content: center;
    font-size: 14px; font-weight: 600; color: var(--mid);
  }
  .avatar-stack .avatar-mini:first-child { margin-left: 0; }

  .hero-visual {
    position: relative; display: flex; align-items: center; justify-content: center;
  }
  .hero-card-main {
    background: #fff; border-radius: var(--radius-lg); padding: 28px;
    box-shadow: 0 20px 60px var(--shadow-md); width: 320px;
    animation: float 4s ease-in-out infinite;
  }
  @keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
  .hero-card-float {
    position: absolute; background: #fff; border-radius: var(--radius);
    padding: 14px 18px; box-shadow: 0 8px 32px var(--shadow-md);
    font-size: 13px; font-weight: 500; display: flex; align-items: center; gap: 8px;
    white-space: nowrap;
  }
  .hero-card-float.tl { top: 20px; left: -30px; animation: float 5s ease-in-out infinite 0.5s; }
  .hero-card-float.br { bottom: 20px; right: -30px; animation: float 5s ease-in-out infinite 1s; }
  .skill-pill {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 6px 12px; border-radius: 100px; font-size: 12px; font-weight: 500;
    margin: 3px;
  }
  .pill-teach { background: #FFF0E8; color: var(--terracotta); }
  .pill-learn { background: #EDF5EE; color: var(--sage); }
  .match-score {
    display: flex; align-items: center; gap: 8px; margin-top: 12px;
    padding-top: 12px; border-top: 1px solid var(--border);
    font-size: 13px; color: var(--mid);
  }
  .score-bar { flex: 1; height: 6px; background: var(--sand); border-radius: 3px; overflow: hidden; }
  .score-fill { height: 100%; background: var(--sage); border-radius: 3px; width: 87%; }

  /* ── HOW IT WORKS ── */
  .how-section { padding: 80px 48px; background: var(--warm-white); }
  .section-label { font-size: 13px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: var(--terracotta); margin-bottom: 12px; }
  .section-title { font-family: var(--font-display); font-size: 40px; font-weight: 600; color: var(--charcoal); margin-bottom: 16px; }
  .section-sub { font-size: 17px; color: var(--mid); max-width: 480px; line-height: 1.6; }
  .steps-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 32px; margin-top: 56px; max-width: 1100px; margin-left: auto; margin-right: auto; }
  .step-card { background: var(--cream); border-radius: var(--radius-lg); padding: 36px 32px; position: relative; }
  .step-number { font-family: var(--font-display); font-size: 64px; font-weight: 700; color: var(--sand); line-height: 1; margin-bottom: 20px; }
  .step-icon { font-size: 32px; margin-bottom: 16px; }
  .step-card h3 { font-family: var(--font-display); font-size: 22px; font-weight: 600; margin-bottom: 10px; }
  .step-card p { font-size: 15px; color: var(--mid); line-height: 1.6; }

  /* ── AUTH ── */
  .auth-wrap {
    min-height: 100vh; display: grid; grid-template-columns: 1fr 1fr;
  }
  .auth-left {
    background: linear-gradient(160deg, var(--terracotta) 0%, var(--terracotta-dark) 100%);
    padding: 64px; display: flex; flex-direction: column; justify-content: space-between;
    color: #fff;
  }
  .auth-left h2 { font-family: var(--font-display); font-size: 44px; font-weight: 600; line-height: 1.15; margin-bottom: 16px; }
  .auth-left p { font-size: 16px; opacity: 0.85; line-height: 1.6; }
  .auth-right {
    background: var(--warm-white); padding: 64px;
    display: flex; flex-direction: column; justify-content: center; align-items: center;
  }
  .auth-form { width: 100%; max-width: 400px; }
  .auth-form h3 { font-family: var(--font-display); font-size: 32px; font-weight: 600; margin-bottom: 8px; }
  .auth-form .sub { font-size: 15px; color: var(--mid); margin-bottom: 36px; }
  .field { margin-bottom: 20px; }
  .field label { display: block; font-size: 13px; font-weight: 600; color: var(--charcoal); margin-bottom: 6px; letter-spacing: 0.02em; }
  .field input, .field textarea, .field select {
    width: 100%; padding: 12px 16px; border: 1.5px solid var(--border);
    border-radius: var(--radius-sm); font-family: var(--font-body); font-size: 15px;
    background: var(--cream); color: var(--charcoal); outline: none;
    transition: border-color 0.2s;
  }
  .field input:focus, .field textarea:focus, .field select:focus { border-color: var(--terracotta); }
  .field textarea { resize: vertical; min-height: 100px; }
  .auth-toggle { margin-top: 20px; font-size: 14px; color: var(--mid); text-align: center; }
  .auth-toggle span { color: var(--terracotta); cursor: pointer; font-weight: 500; }

  /* ── PROFILE SETUP ── */
  .setup-wrap { max-width: 760px; margin: 0 auto; padding: 60px 32px; }
  .setup-header { margin-bottom: 48px; }
  .progress-bar { height: 4px; background: var(--sand); border-radius: 2px; margin-top: 20px; }
  .progress-fill { height: 100%; background: var(--terracotta); border-radius: 2px; transition: width 0.4s; }
  .avatar-upload {
    width: 100px; height: 100px; border-radius: 50%; background: var(--sand);
    display: flex; align-items: center; justify-content: center;
    font-size: 36px; cursor: pointer; border: 3px dashed var(--border);
    margin-bottom: 24px; transition: border-color 0.2s;
  }
  .avatar-upload:hover { border-color: var(--terracotta); }
  .skill-tag-input { display: flex; gap: 8px; margin-bottom: 12px; }
  .skill-tag-input input { flex: 1; }
  .tags-list { display: flex; flex-wrap: wrap; gap: 8px; }
  .skill-tag {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 6px 12px; border-radius: 100px; font-size: 13px; font-weight: 500;
  }
  .tag-teach { background: #FFF0E8; color: var(--terracotta); border: 1px solid #F5C5A8; }
  .tag-learn { background: #EDF5EE; color: var(--sage); border: 1px solid #B8D8BB; }
  .tag-remove { cursor: pointer; font-size: 16px; line-height: 1; opacity: 0.6; }
  .tag-remove:hover { opacity: 1; }
  .proficiency-select { display: flex; gap: 8px; margin-top: 8px; }
  .prof-btn {
    padding: 5px 12px; border-radius: 100px; border: 1.5px solid var(--border);
    font-size: 12px; cursor: pointer; background: transparent; font-family: var(--font-body);
    transition: all 0.15s;
  }
  .prof-btn.active { background: var(--terracotta); color: #fff; border-color: var(--terracotta); }

  /* ── DASHBOARD ── */
  .dashboard-layout { display: grid; grid-template-columns: 240px 1fr; min-height: calc(100vh - 64px); }
  .sidebar {
    background: var(--warm-white); border-right: 1px solid var(--border);
    padding: 32px 16px;
  }
  .sidebar-section { margin-bottom: 32px; }
  .sidebar-label { font-size: 11px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: var(--light-mid); padding: 0 12px; margin-bottom: 8px; }
  .sidebar-item {
    display: flex; align-items: center; gap: 10px; padding: 10px 12px;
    border-radius: var(--radius-sm); cursor: pointer; font-size: 14px; font-weight: 500;
    color: var(--mid); transition: all 0.15s;
  }
  .sidebar-item:hover { background: var(--sand); color: var(--charcoal); }
  .sidebar-item.active { background: #FFF0E8; color: var(--terracotta); }
  .sidebar-icon { font-size: 18px; }
  .main-content { padding: 40px; overflow-y: auto; }
  .page-title { font-family: var(--font-display); font-size: 32px; font-weight: 600; margin-bottom: 4px; }
  .page-sub { font-size: 15px; color: var(--mid); margin-bottom: 36px; }

  /* ── STATS ── */
  .stats-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 20px; margin-bottom: 40px; }
  .stat-card { background: #fff; border-radius: var(--radius); padding: 24px; border: 1px solid var(--border); }
  .stat-icon { font-size: 28px; margin-bottom: 12px; }
  .stat-value { font-family: var(--font-display); font-size: 32px; font-weight: 700; color: var(--charcoal); }
  .stat-label { font-size: 13px; color: var(--mid); margin-top: 4px; }
  .stat-change { font-size: 12px; color: var(--sage); margin-top: 6px; font-weight: 500; }

  /* ── MATCH CARDS ── */
  .matches-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
  .filter-row { display: flex; gap: 10px; flex-wrap: wrap; }
  .filter-chip {
    padding: 7px 16px; border-radius: 100px; border: 1.5px solid var(--border);
    font-size: 13px; cursor: pointer; background: #fff; font-family: var(--font-body);
    transition: all 0.15s; font-weight: 500; color: var(--mid);
  }
  .filter-chip.active { background: var(--charcoal); color: #fff; border-color: var(--charcoal); }
  .match-grid { display: grid; grid-template-columns: repeat(auto-fill,minmax(300px,1fr)); gap: 20px; }
  .match-card {
    background: #fff; border-radius: var(--radius-lg); padding: 24px;
    border: 1px solid var(--border); transition: all 0.2s; cursor: pointer;
  }
  .match-card:hover { box-shadow: 0 8px 32px var(--shadow-md); transform: translateY(-2px); border-color: var(--terracotta-light); }
  .match-card-top { display: flex; align-items: flex-start; gap: 16px; margin-bottom: 16px; }
  .match-avatar {
    width: 52px; height: 52px; border-radius: 50%; background: var(--sand);
    display: flex; align-items: center; justify-content: center; font-size: 22px; flex-shrink: 0;
  }
  .match-name { font-weight: 600; font-size: 16px; }
  .match-meta { font-size: 13px; color: var(--mid); margin-top: 3px; }
  .match-score-badge {
    margin-left: auto; background: #EDF5EE; color: var(--sage);
    padding: 4px 10px; border-radius: 100px; font-size: 12px; font-weight: 600;
  }
  .match-skills { margin-bottom: 16px; }
  .match-skills-label { font-size: 11px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: var(--light-mid); margin-bottom: 8px; }
  .match-card-actions { display: flex; gap: 8px; padding-top: 16px; border-top: 1px solid var(--border); }

  /* ── MESSAGING ── */
  .chat-layout { display: grid; grid-template-columns: 300px 1fr; height: calc(100vh - 64px); }
  .chat-list { border-right: 1px solid var(--border); overflow-y: auto; background: var(--warm-white); }
  .chat-list-header { padding: 20px; border-bottom: 1px solid var(--border); }
  .chat-list-header h3 { font-family: var(--font-display); font-size: 20px; font-weight: 600; }
  .chat-item {
    display: flex; align-items: center; gap: 12px; padding: 16px 20px;
    cursor: pointer; transition: background 0.15s; border-bottom: 1px solid var(--border);
  }
  .chat-item:hover { background: var(--sand); }
  .chat-item.active { background: #FFF0E8; }
  .chat-avatar { width: 44px; height: 44px; border-radius: 50%; background: var(--sand); display: flex; align-items: center; justify-content: center; font-size: 20px; flex-shrink: 0; }
  .chat-info { flex: 1; min-width: 0; }
  .chat-info-name { font-weight: 600; font-size: 14px; }
  .chat-info-preview { font-size: 12px; color: var(--mid); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-top: 2px; }
  .chat-time { font-size: 11px; color: var(--light-mid); }
  .chat-unread { background: var(--terracotta); color: #fff; border-radius: 100px; font-size: 11px; font-weight: 600; padding: 2px 7px; }
  .chat-main { display: flex; flex-direction: column; }
  .chat-header { padding: 16px 24px; border-bottom: 1px solid var(--border); display: flex; align-items: center; gap: 16px; background: #fff; }
  .chat-messages { flex: 1; overflow-y: auto; padding: 24px; display: flex; flex-direction: column; gap: 16px; background: var(--cream); }
  .msg { display: flex; gap: 10px; max-width: 70%; }
  .msg.mine { align-self: flex-end; flex-direction: row-reverse; }
  .msg-bubble {
    padding: 10px 16px; border-radius: 18px; font-size: 14px; line-height: 1.5;
  }
  .msg-bubble.theirs { background: #fff; border: 1px solid var(--border); border-bottom-left-radius: 4px; }
  .msg-bubble.mine { background: var(--terracotta); color: #fff; border-bottom-right-radius: 4px; }
  .msg-time { font-size: 11px; color: var(--light-mid); margin-top: 4px; text-align: right; }
  .chat-input-area { padding: 16px 24px; background: #fff; border-top: 1px solid var(--border); display: flex; gap: 12px; align-items: center; }
  .chat-input {
    flex: 1; padding: 12px 18px; border: 1.5px solid var(--border); border-radius: 100px;
    font-family: var(--font-body); font-size: 14px; background: var(--cream); outline: none;
  }
  .chat-input:focus { border-color: var(--terracotta); }

  /* ── SCHEDULING ── */
  .schedule-wrap { max-width: 900px; }
  .calendar-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; }
  .cal-month { background: #fff; border-radius: var(--radius-lg); padding: 24px; border: 1px solid var(--border); }
  .cal-nav { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
  .cal-nav h4 { font-family: var(--font-display); font-size: 18px; font-weight: 600; }
  .cal-days { display: grid; grid-template-columns: repeat(7,1fr); gap: 2px; }
  .cal-day-label { text-align: center; font-size: 11px; font-weight: 600; color: var(--light-mid); padding: 6px 0; letter-spacing: 0.05em; }
  .cal-day {
    aspect-ratio: 1; display: flex; align-items: center; justify-content: center;
    font-size: 13px; border-radius: 8px; cursor: pointer; transition: all 0.15s; font-weight: 500;
  }
  .cal-day:hover { background: var(--sand); }
  .cal-day.available { color: var(--charcoal); }
  .cal-day.today { background: var(--sand); font-weight: 700; }
  .cal-day.selected { background: var(--terracotta); color: #fff; }
  .cal-day.empty { cursor: default; }
  .cal-day.has-slot::after { content: ''; display: block; width: 4px; height: 4px; background: var(--sage); border-radius: 50%; position: absolute; bottom: 3px; }
  .cal-day { position: relative; }
  .time-slots { background: #fff; border-radius: var(--radius-lg); padding: 24px; border: 1px solid var(--border); }
  .time-slots h4 { font-family: var(--font-display); font-size: 18px; font-weight: 600; margin-bottom: 20px; }
  .slot-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
  .slot {
    padding: 10px 14px; border: 1.5px solid var(--border); border-radius: var(--radius-sm);
    font-size: 13px; text-align: center; cursor: pointer; transition: all 0.15s; font-weight: 500;
  }
  .slot:hover { border-color: var(--terracotta); color: var(--terracotta); }
  .slot.selected { background: var(--terracotta); color: #fff; border-color: var(--terracotta); }
  .slot.booked { background: var(--sand); color: var(--light-mid); cursor: default; }

  /* ── RESOURCES ── */
  .resource-grid { display: grid; grid-template-columns: repeat(auto-fill,minmax(260px,1fr)); gap: 20px; }
  .resource-card { background: #fff; border-radius: var(--radius); padding: 20px; border: 1px solid var(--border); transition: all 0.2s; cursor: pointer; }
  .resource-card:hover { box-shadow: 0 6px 24px var(--shadow); transform: translateY(-2px); }
  .resource-type { font-size: 11px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 10px; }
  .type-video { color: #E05252; }
  .type-pdf { color: #5252E0; }
  .type-notes { color: var(--sage); }
  .resource-title { font-weight: 600; font-size: 15px; margin-bottom: 6px; }
  .resource-by { font-size: 12px; color: var(--mid); }
  .resource-thumb { height: 120px; background: var(--sand); border-radius: var(--radius-sm); margin-bottom: 14px; display: flex; align-items: center; justify-content: center; font-size: 40px; }

  /* ── RATING ── */
  .rating-modal-overlay { position: fixed; inset: 0; background: rgba(44,44,44,0.5); display: flex; align-items: center; justify-content: center; z-index: 200; }
  .rating-modal { background: #fff; border-radius: var(--radius-lg); padding: 40px; width: 480px; }
  .rating-modal h3 { font-family: var(--font-display); font-size: 26px; font-weight: 600; margin-bottom: 8px; }
  .stars { display: flex; gap: 8px; margin: 24px 0; }
  .star { font-size: 36px; cursor: pointer; transition: transform 0.1s; filter: grayscale(1); opacity: 0.4; }
  .star:hover, .star.lit { filter: none; opacity: 1; transform: scale(1.15); }

  /* ── USER PROFILE ── */
  .profile-banner { height: 200px; background: linear-gradient(135deg, var(--terracotta), var(--amber)); border-radius: var(--radius-lg); margin-bottom: -60px; position: relative; overflow: hidden; }
  .profile-banner::after { content: ''; position: absolute; inset: 0; background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.08'%3E%3Ccircle cx='30' cy='30' r='12'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E"); }
  .profile-info { padding: 0 32px 32px; }
  .profile-avatar-lg { width: 100px; height: 100px; border-radius: 50%; border: 4px solid #fff; background: var(--sand); display: flex; align-items: center; justify-content: center; font-size: 40px; margin-bottom: 16px; }
  .profile-name { font-family: var(--font-display); font-size: 28px; font-weight: 700; }
  .profile-bio { font-size: 15px; color: var(--mid); margin-top: 8px; line-height: 1.6; }
  .rating-display { display: flex; align-items: center; gap: 6px; margin-top: 10px; }
  .star-filled { color: var(--amber); }

  /* ── TOASTS ── */
  .toast-wrap { position: fixed; bottom: 24px; right: 24px; z-index: 300; display: flex; flex-direction: column; gap: 10px; }
  .toast { background: var(--charcoal); color: #fff; padding: 12px 20px; border-radius: var(--radius-sm); font-size: 14px; display: flex; align-items: center; gap: 10px; box-shadow: 0 4px 20px var(--shadow-md); animation: slideUp 0.3s ease; }
  @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
  .toast.success { border-left: 4px solid var(--sage); }
  .toast.info { border-left: 4px solid var(--amber); }

  /* ── SCROLLBAR ── */
  ::-webkit-scrollbar { width: 6px; height: 6px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }

  @media (max-width: 768px) {
    .hero { grid-template-columns: 1fr; padding: 60px 24px; }
    .hero h1 { font-size: 40px; }
    .hero-visual { display: none; }
    .steps-grid { grid-template-columns: 1fr; }
    .auth-wrap { grid-template-columns: 1fr; }
    .auth-left { display: none; }
    .stats-grid { grid-template-columns: repeat(2,1fr); }
    .dashboard-layout { grid-template-columns: 1fr; }
    .sidebar { display: none; }
  }
`;

// ─── DATA ─────────────────────────────────────────────────────────────────────
const SAMPLE_USERS = [
  { id:1, name:"Priya Sharma", emoji:"🌸", bio:"UI/UX designer who loves clean interfaces and design systems.", teach:["UI/UX Design","Figma","User Research"], learn:["Python","Machine Learning"], rating:4.9, sessions:34, location:"San Francisco", method:"Video call", category:"Design" },
  { id:2, name:"Marcus Chen", emoji:"🎯", bio:"Backend engineer passionate about scalable systems and clean code.", teach:["Python","Django","System Design"], learn:["React","TypeScript"], rating:4.8, sessions:28, location:"New York", method:"In-person", category:"Backend" },
  { id:3, name:"Aisha Okonkwo", emoji:"💡", bio:"Data scientist making ML accessible to everyone.", teach:["Data Science","Machine Learning","Python"], learn:["UI/UX Design","Figma"], rating:4.9, sessions:47, location:"Chicago", method:"Video call", category:"Data" },
  { id:4, name:"James Park", emoji:"⚛️", bio:"Frontend engineer obsessed with React performance and animations.", teach:["React","TypeScript","CSS"], learn:["Node.js","System Design"], rating:4.7, sessions:19, location:"Seattle", method:"Both", category:"Frontend" },
  { id:101, name: "Rahul", emoji:"👨‍💻", bio: "Java specialist looking to learn Python.", teach: ["Java"], learn: ["Python"], rating: 4.5, sessions: 12, location: "Bangalore", method: "Video call", category: "Backend" },
  { id:102, name: "Priya", emoji:"👩‍💻", bio: "Python developer interested in Java.", teach: ["Python"], learn: ["Java"], rating: 4.8, sessions: 25, location: "Mumbai", method: "Video call", category: "Data" },
];

const RESOURCES = [
  { id:1, type:"video", title:"Figma Auto-Layout Deep Dive", by:"Priya Sharma", skill:"UI/UX Design", emoji:"🎨", duration:"24 min" },
  { id:2, type:"pdf", title:"Python for Beginners — Complete Guide", by:"Marcus Chen", skill:"Python", emoji:"🐍", pages:"48 pages" },
  { id:3, type:"notes", title:"React Hooks Cheatsheet", by:"James Park", skill:"React", emoji:"⚛️", words:"1,800 words" },
  { id:4, type:"video", title:"System Design Fundamentals", by:"Marcus Chen", skill:"System Design", emoji:"🖥️", duration:"52 min" },
  { id:5, type:"pdf", title:"Introduction to Data Science", by:"Aisha Okonkwo", skill:"Data Science", emoji:"📊", pages:"92 pages" },
  { id:6, type:"video", title:"Docker & Kubernetes Crash Course", by:"Lena Müller", skill:"DevOps", emoji:"🐳", duration:"38 min" },
];

const MESSAGES_DATA = {
  1: [
    { id:1, from:"them", text:"Hey! I saw we matched — your Python skills look amazing. I could really use help with ML basics.", time:"10:32 AM" },
    { id:2, from:"me", text:"Hi Priya! Yes, totally! I'd love to learn Figma from you in exchange 🎉", time:"10:35 AM" },
    { id:3, from:"them", text:"Perfect swap! Want to schedule a session this week?", time:"10:36 AM" },
    { id:4, from:"me", text:"Absolutely. I'm free Thursday or Friday afternoon.", time:"10:38 AM" },
  ],
  3: [
    { id:1, from:"them", text:"Hey! Saw you want to learn UI Design — I can help with Figma!", time:"Yesterday" },
    { id:2, from:"me", text:"That's great! I can teach Data Science and ML in return.", time:"Yesterday" },
  ],
};

// ─── TOAST ────────────────────────────────────────────────────────────────────
function Toast({ toasts }) {
  return <div className="toast-wrap">{toasts.map(t => <div key={t.id} className={`toast ${t.type}`}><span>{t.icon}</span>{t.msg}</div>)}</div>;
}

// ─── NAV ──────────────────────────────────────────────────────────────────────
function Nav({ page, setPage, authed, user }) {
  const pages = authed
    ? [["dashboard","Dashboard"],["browse","Browse"],["messages","Messages"],["schedule","Schedule"],["resources","Resources"]]
    : [];
  return (
    <nav>
      <div className="nav-logo" onClick={() => setPage(authed ? "dashboard" : "landing")}>
        Skill<span>Swap</span>
      </div>
      <div className="nav-links">
        {pages.map(([p,l]) => (
          <button key={p} className={`btn btn-ghost btn-sm ${page===p?"active":""}`} style={page===p?{background:"var(--sand)",color:"var(--charcoal)"}:{}} onClick={()=>setPage(p)}>{l}</button>
        ))}
        {authed ? (
          <div className="match-avatar" style={{cursor:"pointer",marginLeft:8,width:36,height:36,fontSize:18}} onClick={()=>setPage("profile")}>{user.emoji}</div>
        ) : (
          <>
            <button className="btn btn-ghost btn-sm" onClick={()=>setPage("login")}>Log in</button>
            <button className="btn btn-primary btn-sm" onClick={()=>setPage("signup")}>Get started</button>
          </>
        )}
      </div>
    </nav>
  );
}

// ─── LANDING ──────────────────────────────────────────────────────────────────
const ONBOARDING_SLIDES = [
  {
    bg: "linear-gradient(160deg, #FDF6EC 0%, #F5E6D0 100%)",
    accent: "var(--terracotta)",
    emoji: "🔄",
    label: "Welcome to SkillSwap",
    title: <>Swap tech skills.<br/><em>Grow faster.</em></>,
    desc: "The peer-to-peer platform for developers, designers, and tech professionals. Teach what you know, learn what you need — no money, just knowledge.",
    visual: (
      <div style={{position:"relative",display:"flex",alignItems:"center",justifyContent:"center",height:340}}>
        <div style={{background:"#fff",borderRadius:24,padding:28,boxShadow:"0 20px 60px rgba(44,44,44,0.14)",width:300,animation:"float 4s ease-in-out infinite"}}>
          <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:16}}>
            <div style={{width:48,height:48,borderRadius:"50%",background:"var(--sand)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:24}}>🌸</div>
            <div><div style={{fontWeight:600}}>Priya S.</div><div style={{fontSize:12,color:"var(--mid)"}}>UI Designer · San Francisco</div></div>
          </div>
          <div style={{marginBottom:8}}><div style={{fontSize:11,fontWeight:600,letterSpacing:"0.08em",textTransform:"uppercase",color:"var(--light-mid)",marginBottom:6}}>Teaches</div>
            <span className="skill-pill pill-teach">🎨 Figma</span>
            <span className="skill-pill pill-teach">🖌️ UI/UX Design</span>
          </div>
          <div><div style={{fontSize:11,fontWeight:600,letterSpacing:"0.08em",textTransform:"uppercase",color:"var(--light-mid)",marginBottom:6}}>Wants to learn</div>
            <span className="skill-pill pill-learn">🐍 Python</span>
            <span className="skill-pill pill-learn">🤖 Machine Learning</span>
          </div>
        </div>
        <div style={{position:"absolute",top:10,left:0,background:"#fff",borderRadius:12,padding:"10px 16px",boxShadow:"0 8px 24px rgba(44,44,44,0.12)",fontSize:13,fontWeight:500,whiteSpace:"nowrap",animation:"float 5s ease-in-out infinite 0.5s"}}>🎯 92% match found!</div>
        <div style={{position:"absolute",bottom:10,right:0,background:"#fff",borderRadius:12,padding:"10px 16px",boxShadow:"0 8px 24px rgba(44,44,44,0.12)",fontSize:13,fontWeight:500,whiteSpace:"nowrap",animation:"float 5s ease-in-out infinite 1s"}}>✅ Session booked!</div>
      </div>
    ),
  },
  {
    bg: "linear-gradient(160deg, #EDF5EE 0%, #D6EDD8 100%)",
    accent: "var(--sage)",
    emoji: "🔮",
    label: "Smart matching",
    title: <>Get matched<br/><em>instantly.</em></>,
    desc: "Tell us your tech stack and what you want to learn. Our engine finds someone who knows exactly what you need — and needs what you know.",
    visual: (
      <div style={{display:"flex",flexDirection:"column",gap:12,width:300}}>
        {[
          {emoji:"🎯",name:"Marcus C.",teach:"Python",learn:"React",score:92},
          {emoji:"🌸",name:"Priya S.",teach:"UI Design",learn:"Django",score:88},
          {emoji:"💡",name:"Aisha O.",teach:"Data Science",learn:"Figma",score:95},
        ].map((u,i)=>(
          <div key={u.name} style={{background:"#fff",borderRadius:16,padding:"14px 18px",boxShadow:"0 4px 20px rgba(44,44,44,0.08)",display:"flex",alignItems:"center",gap:12,animation:`float ${4+i*0.5}s ease-in-out infinite ${i*0.3}s`}}>
            <div style={{width:40,height:40,borderRadius:"50%",background:"var(--sand)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>{u.emoji}</div>
            <div style={{flex:1}}>
              <div style={{fontWeight:600,fontSize:14}}>{u.name}</div>
              <div style={{fontSize:12,color:"var(--mid)"}}>{u.teach} ↔ {u.learn}</div>
            </div>
            <div style={{background:"#EDF5EE",color:"var(--sage)",padding:"4px 10px",borderRadius:100,fontSize:12,fontWeight:600}}>{u.score}%</div>
          </div>
        ))}
      </div>
    ),
  },
  {
    bg: "linear-gradient(160deg, #FFF8EE 0%, #FDECD6 100%)",
    accent: "var(--amber)",
    emoji: "🚀",
    label: "Ready to start?",
    title: <>Build skills.<br/><em>Build careers.</em></>,
    desc: "Join 12,000+ developers and designers already swapping skills. Free forever — your expertise is the only currency.",
    visual: (
      <div style={{display:"flex",flexWrap:"wrap",gap:10,justifyContent:"center",maxWidth:320}}>
        {["⚛️ React","🐍 Python","🎨 Figma","🗄️ SQL","☁️ AWS","🤖 ML","🖥️ System Design","📱 iOS Dev","🔐 Cybersecurity","📊 Data Science","🐳 Docker","🧪 Testing"].map((s,i)=>(
          <span key={s} className="skill-pill" style={{background:"#fff",border:"1.5px solid var(--border)",color:"var(--charcoal)",fontSize:13,padding:"7px 14px",animation:`float ${3.5+i*0.2}s ease-in-out infinite ${i*0.15}s`}}>{s}</span>
        ))}
      </div>
    ),
    isLast: true,
  },
];

function Landing({ setPage }) {
  const [slide, setSlide] = useState(0);
  const [animDir, setAnimDir] = useState(1); // 1 = forward, -1 = back
  const [animating, setAnimating] = useState(false);

  const goTo = (idx) => {
    if (animating || idx === slide) return;
    setAnimDir(idx > slide ? 1 : -1);
    setAnimating(true);
    setTimeout(() => { setSlide(idx); setAnimating(false); }, 350);
  };
  const next = () => goTo(Math.min(slide + 1, 2));
  const prev = () => goTo(Math.max(slide - 1, 0));

  const s = ONBOARDING_SLIDES[slide];

  return (
    <div style={{minHeight:"100vh",background:s.bg,display:"flex",flexDirection:"column",transition:"background 0.6s ease"}}>
      {/* Top bar */}
      <div style={{padding:"24px 40px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div style={{fontFamily:"var(--font-display)",fontSize:22,fontWeight:600,color:"var(--terracotta)"}}>Skill<span style={{color:"var(--charcoal)",fontStyle:"italic"}}>Swap</span></div>
        <button className="btn btn-ghost btn-sm" onClick={()=>setPage("login")}>Already have an account? Log in</button>
      </div>

      {/* Slide content */}
      <div style={{
        flex:1, display:"flex", alignItems:"center", justifyContent:"center",
        padding:"20px 48px 40px",
        opacity: animating ? 0 : 1,
        transform: animating ? `translateX(${animDir * 40}px)` : "translateX(0)",
        transition: "opacity 0.35s ease, transform 0.35s ease",
      }}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:80,alignItems:"center",maxWidth:1000,width:"100%"}}>
          <div>
            <div style={{display:"inline-flex",alignItems:"center",gap:8,background:"rgba(255,255,255,0.7)",padding:"6px 14px",borderRadius:100,fontSize:13,fontWeight:500,marginBottom:24,color:s.accent}}>
              <span>{s.emoji}</span>{s.label}
            </div>
            <h1 style={{fontFamily:"var(--font-display)",fontSize:54,lineHeight:1.1,fontWeight:700,marginBottom:20,color:"var(--charcoal)"}}>{s.title}</h1>
            <p style={{fontSize:18,color:"var(--mid)",lineHeight:1.7,marginBottom:40}}>{s.desc}</p>

            {s.isLast ? (
              <div style={{display:"flex",flexDirection:"column",gap:12,maxWidth:320}}>
                <button className="btn btn-primary" style={{justifyContent:"center",fontSize:16,padding:"14px 28px"}} onClick={()=>setPage("signup")}>Create free account →</button>
                <button className="btn btn-secondary" style={{justifyContent:"center"}} onClick={()=>setPage("login")}>Log in instead</button>
              </div>
            ) : (
              <div style={{display:"flex",alignItems:"center",gap:16}}>
                {slide > 0 && <button className="btn btn-secondary" onClick={prev}>← Back</button>}
                <button className="btn btn-primary" style={{padding:"12px 32px"}} onClick={next}>Next →</button>
              </div>
            )}
          </div>
          <div style={{display:"flex",alignItems:"center",justifyContent:"center"}}>
            {s.visual}
          </div>
        </div>
      </div>

      {/* Dot indicators */}
      <div style={{display:"flex",justifyContent:"center",gap:10,paddingBottom:40}}>
        {ONBOARDING_SLIDES.map((_,i)=>(
          <div key={i} onClick={()=>goTo(i)} style={{
            width: i===slide ? 28 : 8, height:8, borderRadius:4,
            background: i===slide ? s.accent : "rgba(0,0,0,0.15)",
            cursor:"pointer", transition:"all 0.3s ease",
          }}/>
        ))}
      </div>
    </div>
  );
}

// ─── AUTH ─────────────────────────────────────────────────────────────────────
function Auth({ mode, setPage, onAuth, addToast }) {
  const [form, setForm] = useState({email:"",password:"",name:""});
  const isLogin = mode==="login";
  const handle = async () => {
    if(!form.email||!form.password||((!isLogin)&&!form.name)) { addToast("Please fill all fields","info","⚠️"); return; }
    try {
      const endpoint = isLogin ? "/login" : "/signup";
      const res = await fetch(`http://localhost:5000${endpoint}`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, password: form.password, name: form.name })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Authentication failed");
      
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      
      onAuth(data.user);
      addToast(isLogin?"Welcome back!":"Account created!","success","✅");
      setPage(isLogin ? "dashboard" : "setup");
    } catch (err) {
      addToast(err.message, "error", "❌");
    }
  };
  return (
    <div className="auth-wrap">
      <div className="auth-left">
        <div>
          <div className="nav-logo" style={{color:"#fff",fontSize:28,marginBottom:48}}>Skill<span style={{color:"rgba(255,255,255,0.7)"}}>Swap</span></div>
          <h2>{isLogin ? "Good to see you back 👋" : "Join 12,000+ skill swappers"}</h2>
          <p style={{marginTop:16}}>{isLogin ? "Continue your learning journey. Your matches are waiting." : "The platform where knowledge is the currency. Teach, learn, grow."}</p>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:16}}>
          {[["⚛️","React for Python — fair trade!"],["🎨","Figma for SQL? Absolutely."],["☁️","AWS for UI Design? Let's go!"]].map(([e,t])=>(
            <div key={t} style={{background:"rgba(255,255,255,0.12)",borderRadius:12,padding:"12px 16px",fontSize:14,display:"flex",gap:10,alignItems:"center"}}>
              <span style={{fontSize:22}}>{e}</span>{t}
            </div>
          ))}
        </div>
      </div>
      <div className="auth-right">
        <div className="auth-form">
          <h3>{isLogin ? "Log in" : "Create account"}</h3>
          <p className="sub">{isLogin ? "Welcome back — let's pick up where you left off." : "Set up your profile in under 2 minutes."}</p>
          {!isLogin && <div className="field"><label>Full name</label><input placeholder="Your name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></div>}
          <div className="field"><label>Email</label><input type="email" placeholder="you@example.com" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/></div>
          <div className="field"><label>Password</label><input type="password" placeholder="••••••••" value={form.password} onChange={e=>setForm({...form,password:e.target.value})}/></div>
          <button className="btn btn-primary" style={{width:"100%",justifyContent:"center",marginTop:8}} onClick={handle}>{isLogin?"Log in →":"Create account →"}</button>
          <div className="auth-toggle">{isLogin ? <>Don't have an account? <span onClick={()=>setPage("signup")}>Sign up</span></> : <>Already have an account? <span onClick={()=>setPage("login")}>Log in</span></>}</div>
        </div>
      </div>
    </div>
  );
}

// ─── PROFILE SETUP ────────────────────────────────────────────────────────────
function ProfileSetup({ user, setUser, setPage, addToast }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({name:user?.name||"",bio:user?.bio||"",emoji:user?.emoji||"🙂",careerGoal:user?.careerGoal||""});
  const [teachInput, setTeachInput] = useState("");
  const [learnInput, setLearnInput] = useState("");
  const [proficiency, setProficiency] = useState("Intermediate");
  const [teachSkills, setTeachSkills] = useState([]);
  const [learnSkills, setLearnSkills] = useState([]);
  const EMOJIS = ["🙂","🌸","🎯","🌿","📸","💡","🎸","🧠","🚀","🌊","🔥","🦋"];

  const addTeach = () => { if(teachInput.trim()){ setTeachSkills([...teachSkills,{name:teachInput.trim(),proficiency}]); setTeachInput(""); }};
  const addLearn = () => { if(learnInput.trim()){ setLearnSkills([...learnSkills,learnInput.trim()]); setLearnInput(""); }};
  const done = async () => { 
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/profile`, {
        method: "PUT", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ ...form, teach: teachSkills, learn: learnSkills })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save profile");
      
      const updatedUser = { ...user, ...data.user };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);
      addToast("Profile ready! Let's find your matches 🎉","success","✅"); 
      setPage("browse"); 
    } catch(err) {
      addToast(err.message, "error", "❌");
    }
  };

  return (
    <div className="setup-wrap">
      <div className="setup-header">
        <div className="section-label">Profile setup · Step {step} of 3</div>
        <div className="section-title">{["Who are you?","What can you teach?","What do you want to learn?"][step-1]}</div>
        <div className="progress-bar"><div className="progress-fill" style={{width:`${(step/3)*100}%`}}></div></div>
      </div>

      {step===1 && (
        <div>
          <div style={{display:"flex",gap:12,flexWrap:"wrap",marginBottom:24}}>
            {EMOJIS.map(e=>(
              <div key={e} onClick={()=>setForm({...form,emoji:e})} style={{
                width:52,height:52,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",
                fontSize:26,cursor:"pointer",border:`2px solid ${form.emoji===e?"var(--terracotta)":"var(--border)"}`,
                background:form.emoji===e?"#FFF0E8":"var(--sand)",transition:"all 0.15s"
              }}>{e}</div>
            ))}
          </div>
          <div className="field"><label>Display name</label><input placeholder="How you'll appear to others" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></div>
          <div className="field"><label>Bio</label><textarea placeholder="Tell others a bit about yourself, your background, and what excites you..." value={form.bio} onChange={e=>setForm({...form,bio:e.target.value})}/></div>
          <div className="field"><label>Career Goal (Optional)</label><input placeholder='e.g. "Web Developer", "Data Scientist"' value={form.careerGoal} onChange={e=>setForm({...form,careerGoal:e.target.value})}/></div>
          <div className="field">
            <label>Availability</label>
            <select><option>Weekends</option><option>Weekday evenings</option><option>Flexible</option><option>Mornings only</option></select>
          </div>
          <button className="btn btn-primary" onClick={()=>setStep(2)}>Continue →</button>
        </div>
      )}

      {step===2 && (
        <div>
          <p style={{color:"var(--mid)",marginBottom:24}}>Add tech skills you can teach. Be specific — "React hooks" is better than just "coding".</p>
          <div className="skill-tag-input">
            <input placeholder='e.g. "React", "Python", "Figma", "AWS"' value={teachInput} onChange={e=>setTeachInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addTeach()}/>
            <button className="btn btn-primary btn-sm" onClick={addTeach}>Add</button>
          </div>
          <div className="proficiency-select">
            {["Beginner","Intermediate","Advanced","Expert"].map(p=>(
              <button key={p} className={`prof-btn ${proficiency===p?"active":""}`} onClick={()=>setProficiency(p)}>{p}</button>
            ))}
          </div>
          <div className="tags-list" style={{marginTop:16}}>
            {teachSkills.map((s,i)=>(
              <span key={i} className="skill-tag tag-teach">{s.name} · {s.proficiency}<span className="tag-remove" onClick={()=>setTeachSkills(teachSkills.filter((_,j)=>j!==i))}>×</span></span>
            ))}
          </div>
          <div style={{display:"flex",gap:12,marginTop:32}}>
            <button className="btn btn-secondary" onClick={()=>setStep(1)}>← Back</button>
            <button className="btn btn-primary" onClick={()=>setStep(3)}>Continue →</button>
          </div>
        </div>
      )}

      {step===3 && (
        <div>
          <p style={{color:"var(--mid)",marginBottom:24}}>What tech skills are you excited to learn? We'll find someone in the community who can teach you!</p>
          <div className="skill-tag-input">
            <input placeholder='e.g. "Docker", "TypeScript", "System Design"' value={learnInput} onChange={e=>setLearnInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addLearn()}/>
            <button className="btn btn-primary btn-sm" onClick={addLearn}>Add</button>
          </div>
          <div className="tags-list" style={{marginTop:16}}>
            {learnSkills.map((s,i)=>(
              <span key={i} className="skill-tag tag-learn">{s}<span className="tag-remove" onClick={()=>setLearnSkills(learnSkills.filter((_,j)=>j!==i))}>×</span></span>
            ))}
          </div>
          <div style={{display:"flex",gap:12,marginTop:32}}>
            <button className="btn btn-secondary" onClick={()=>setStep(2)}>← Back</button>
            <button className="btn btn-primary" onClick={done}>Finish setup ✓</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── SIDEBAR NAV ──────────────────────────────────────────────────────────────
function DashLayout({ page, setPage, children }) {
  const items = [
    ["dashboard","🏠","Dashboard"],
    ["browse","🔍","Browse matches"],
    ["messages","💬","Messages"],
    ["schedule","📅","Schedule"],
    ["resources","📚","Resources"],
    ["profile","👤","My Profile"],
  ];
  return (
    <div className="dashboard-layout">
      <div className="sidebar">
        <div className="sidebar-section">
          <div className="sidebar-label">Main</div>
          {items.map(([p,icon,label])=>(
            <div key={p} className={`sidebar-item ${page===p?"active":""}`} onClick={()=>setPage(p)}>
              <span className="sidebar-icon">{icon}</span>{label}
            </div>
          ))}
          <div className="sidebar-item" onClick={() => { localStorage.clear(); window.location.reload(); }} style={{marginTop: 32, color: "var(--terracotta)"}}>
            <span className="sidebar-icon">🚪</span>Log out
          </div>
        </div>
      </div>
      <div className="main-content">{children}</div>
    </div>
  );
}

// ─── DASHBOARD HOME ───────────────────────────────────────────────────────────
function Dashboard({ user, setPage }) {
  return (
    <DashLayout page="dashboard" setPage={setPage}>
      <div className="page-title">Welcome back, {user?.name?.split(" ")[0]} {user?.emoji}</div>
      <div className="page-sub">Here's what's happening in your skill community.</div>
      <div className="stats-grid">
        {[["🔗","3","Skill matches","↑ 2 new today"],["✅","7","Sessions done","↑ 1 this week"],["⭐","4.9","Your rating","Based on 7 reviews"],["📈","62%","Progress","Toward Python goal"]].map(([icon,val,label,change])=>(
          <div key={label} className="stat-card">
            <div className="stat-icon">{icon}</div>
            <div className="stat-value">{val}</div>
            <div className="stat-label">{label}</div>
            <div className="stat-change">{change}</div>
          </div>
        ))}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:24}}>
        <div style={{background:"#fff",borderRadius:"var(--radius-lg)",padding:24,border:"1px solid var(--border)"}}>
          <div style={{fontFamily:"var(--font-display)",fontSize:18,fontWeight:600,marginBottom:16}}>Upcoming sessions</div>
          <div style={{color:"var(--mid)",fontSize:"14px",padding:"20px 0",textAlign:"center"}}>No upcoming sessions booked yet.</div>
          <button className="btn btn-secondary btn-sm" style={{marginTop:16}} onClick={()=>setPage("schedule")}>View calendar →</button>
        </div>
        <div style={{background:"#fff",borderRadius:"var(--radius-lg)",padding:24,border:"1px solid var(--border)"}}>
          <div style={{fontFamily:"var(--font-display)",fontSize:18,fontWeight:600,marginBottom:16}}>Recent matches</div>
          <div style={{color:"var(--mid)",fontSize:"14px",padding:"20px 0",textAlign:"center"}}>No new matches based on your skills yet. Check the Browse section!</div>
          <button className="btn btn-secondary btn-sm" style={{marginTop:16}} onClick={()=>setPage("browse")}>Go to Browse →</button>
        </div>
      </div>
    </DashLayout>
  );
}

// ─── BROWSE ───────────────────────────────────────────────────────────────────
function Browse({ setPage, setSelectedUser, addToast, user }) {
  const [matches, setMatches] = useState([]);
  const [requiredSkills, setRequiredSkills] = useState([]);
  const [loadingSkills, setLoadingSkills] = useState(true);
  const [loadingMatches, setLoadingMatches] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch("http://localhost:5000/matches", {
      headers: { "Authorization": `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        // Show required skills immediately
        setRequiredSkills(data.requiredSkills || []);
        setLoadingSkills(false);
        
        // Delay showing actual matches so user has time to read the skills
        setTimeout(() => {
          setMatches(data.matches || []);
          setLoadingMatches(false);
        }, 2200);
      })
      .catch(err => {
        console.error("Fetch Matches Error:", err);
        setLoadingSkills(false);
        setLoadingMatches(false);
      });
  }, [user]);

  return (
    <DashLayout page="browse" setPage={setPage}>
      <div className="page-title">Peer Matches</div>
      <div className="page-sub">
        {user?.careerGoal ? `Matches based on your career goal: ${user.careerGoal}` : "Find the perfect partner to swap skills with."}
      </div>

      <div style={{marginBottom: 24}}>
        <div style={{fontSize: 14, color: "var(--mid)", marginBottom: 12}}>
          Required skills based on your profile:
        </div>
        <div style={{display: "flex", gap: 8, flexWrap: "wrap", minHeight: "34px"}}>
          {loadingSkills ? (
             <div style={{color: "var(--amber)", fontWeight: 500}}>⏳ Analyzing your profile & finding required skills...</div>
          ) : requiredSkills.length > 0 ? (
             requiredSkills.map((s, i) => <span key={s} className="skill-pill pill-learn" style={{animation: `slideUp 0.3s ease ${i*0.05}s`}}>{s}</span>)
          ) : (
             <span style={{fontSize:13, color:"var(--light-mid)"}}>No skills identified yet</span>
          )}
        </div>
      </div>

      <div className="match-grid">
        {loadingSkills ? (
          <div style={{gridColumn: "1/-1", textAlign: "center", padding: "40px", color: "var(--mid)"}}>Getting things ready...</div>
        ) : loadingMatches ? (
          <div style={{gridColumn: "1/-1", textAlign: "center", padding: "60px 20px", color: "var(--mid)", background: "var(--warm-white)", borderRadius: "var(--radius-lg)", border: "1px dashed var(--border)", animation: "slideUp 0.4s ease"}}>
             <div style={{fontSize: "40px", marginBottom: "16px"}}>🔍</div>
             <div style={{fontFamily: "var(--font-display)", fontSize: "20px", fontWeight: 600}}>Skills mapped! Searching the community for your peer matches...</div>
             <p style={{color: "var(--mid)", marginTop: 8}}>Looking for swappers wanting to learn what you teach...</p>
          </div>
        ) : matches.length > 0 ? (
          matches.map(matchedUser => (
            <div key={matchedUser._id} style={{animation: "slideUp 0.4s ease"}} className="match-card" onClick={() => {setSelectedUser(matchedUser); setPage("userprofile");}}>
              <div className="match-card-top">
                <div className="match-avatar" style={{fontSize: 26}}>{matchedUser.emoji || "🙂"}</div>
                <div>
                  <div className="match-name">{matchedUser.name}</div>
                  <div className="match-meta">📍 {matchedUser.location || "Remote"}</div>
                </div>
                <span className="match-score-badge">{matchedUser.matchCount} skill(s) match!</span>
              </div>
              <div className="match-skills">
                <div className="match-skills-label">Teaches</div>
                <div>{(matchedUser.teach || []).map((s,i) => <span key={i} className="skill-pill pill-teach">{s.name||s}</span>)}</div>
              </div>
              <div className="match-skills">
                <div className="match-skills-label">Learning</div>
                <div>{(matchedUser.learn || []).map((s,i) => <span key={i} className="skill-pill pill-learn">{s.name||s}</span>)}</div>
              </div>
              <div className="match-card-actions">
                <button className="btn btn-primary btn-sm" onClick={e => {e.stopPropagation(); addToast(`Message sent to ${matchedUser.name}!`, "success", "✉️"); setPage("messages");}}>💬 Message</button>
                <div style={{marginLeft: "auto", fontSize: 13, color: "var(--amber)", fontWeight: 600}}>★ {matchedUser.rating || "New"}</div>
              </div>
            </div>
          ))
        ) : (
          <div style={{gridColumn: "1/-1", textAlign: "center", padding: "60px 20px", color: "var(--mid)", background: "var(--warm-white)", borderRadius: "var(--radius-lg)", border: "1px dashed var(--border)", animation: "slideUp 0.4s ease"}}>
            <div style={{fontSize: "40px", marginBottom: "16px"}}>🤷‍♂️</div>
            <div style={{fontFamily: "var(--font-display)", fontSize: "20px", fontWeight: 600}}>No match found</div>
            <p>Try adding a different career goal or learning skills. Or wait for new users to arrive!</p>
          </div>
        )}
      </div>
    </DashLayout>
  );
}

// ─── USER PROFILE ─────────────────────────────────────────────────────────────
function UserProfile({ u, setPage, addToast }) {
  const [showRating, setShowRating] = useState(false);
  if(!u) u = SAMPLE_USERS[0];
  return (
    <DashLayout page="browse" setPage={setPage}>
      <div style={{maxWidth:700}}>
        <button className="btn btn-ghost btn-sm" style={{marginBottom:20}} onClick={()=>setPage("browse")}>← Back to matches</button>
        <div className="profile-banner"></div>
        <div className="profile-info">
          <div className="profile-avatar-lg">{u.emoji || "🙂"}</div>
          <div className="profile-name">{u.name}</div>
          <div className="profile-bio">{u.bio || "No bio available."}</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:6,marginTop:14}}>
            {(u.teach || []).map((s,i)=><span key={i} className="skill-pill pill-teach" style={{fontSize:13}}>🎓 {s.name||s}</span>)}
            {(u.learn || []).map((s,i)=><span key={i} className="skill-pill pill-learn" style={{fontSize:13}}>📖 {s.name||s}</span>)}
          </div>
          <div className="rating-display" style={{marginTop:12}}><span style={{color:"var(--amber)"}}>{"★".repeat(Math.floor(u.rating || 5))}</span><span style={{fontWeight:600,marginLeft:4}}>{u.rating || "5.0"}</span><span style={{color:"var(--mid)",fontSize:13}}>({u.sessions || 0} sessions)</span></div>
          <div style={{marginTop:16,display:"flex",gap:10}}>
            <button className="btn btn-primary btn-sm" onClick={()=>{addToast("Opening chat...","info","💬");setPage("messages");}}>💬 Message</button>
            <button className="btn btn-sage btn-sm" onClick={()=>{addToast("Opening scheduler...","info","📅");setPage("schedule");}}>📅 Book session</button>
            <button className="btn btn-secondary btn-sm" onClick={()=>setShowRating(true)}>⭐ Rate</button>
          </div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:24,marginTop:24}}>
          <div style={{background:"#fff",borderRadius:"var(--radius)",padding:20,border:"1px solid var(--border)"}}>
            <div style={{fontWeight:600,marginBottom:12}}>Teaches</div>
            {(u.teach || []).map((s,i)=><span key={i} className="skill-pill pill-teach" style={{margin:3}}>{s.name||s}</span>)}
          </div>
          <div style={{background:"#fff",borderRadius:"var(--radius)",padding:20,border:"1px solid var(--border)"}}>
            <div style={{fontWeight:600,marginBottom:12}}>Learning</div>
            {(u.learn || []).map((s,i)=><span key={i} className="skill-pill pill-learn" style={{margin:3}}>{s.name||s}</span>)}
          </div>
        </div>
        <div style={{background:"#fff",borderRadius:"var(--radius)",padding:20,border:"1px solid var(--border)",marginTop:24}}>
          <div style={{fontWeight:600,marginBottom:16}}>Reviews</div>
          {[{name:"Jamie L.",text:"Amazing teacher, very patient and clear explanations!",rating:5},{name:"Sam K.",text:"Really helpful session. Would swap again!",rating:5}].map(r=>(
            <div key={r.name} style={{borderBottom:"1px solid var(--border)",paddingBottom:14,marginBottom:14}}>
              <div style={{display:"flex",justifyContent:"space-between"}}>
                <div style={{fontWeight:600,fontSize:14}}>{r.name}</div>
                <div style={{color:"var(--amber)"}}>{" ★".repeat(r.rating)}</div>
              </div>
              <div style={{fontSize:14,color:"var(--mid)",marginTop:4}}>{r.text}</div>
            </div>
          ))}
        </div>
      </div>
      {showRating && <RatingModal user={u} onClose={()=>setShowRating(false)} addToast={addToast}/>}
    </DashLayout>
  );
}

// ─── MESSAGES ─────────────────────────────────────────────────────────────────
function Messages({ setPage, selectedUser }) {
  const [active, setActive] = useState(selectedUser ? selectedUser._id : null);
  const [msgs, setMsgs] = useState({});
  const [input, setInput] = useState("");
  const [convos, setConvos] = useState(selectedUser ? [selectedUser] : []);
  const endRef = useRef(null);
  
  useEffect(() => {
    endRef.current?.scrollIntoView({behavior:"smooth"});
  }, [msgs, active]);

  useEffect(() => {
    fetch("http://localhost:5000/users")
      .then(res => res.json())
      .then(data => {
        // Find current user id from localStorage
        const localUser = JSON.parse(localStorage.getItem("user") || "{}");
        const currentUserId = localUser.id || localUser._id;
        
        let others = data.filter(u => u._id !== currentUserId && (!selectedUser || u._id !== selectedUser._id));
        others = others.slice(0, 4); // Show 4 people max to make UI feel populated

        setConvos(selectedUser ? [selectedUser, ...others] : others);
        
        if (!active && others.length > 0) {
          setActive(others[0]._id);
        }
      })
      .catch(err => console.error("Error fetching chat contacts", err));
  }, [selectedUser]); // run once on mount or when selectedUser changes
  
  const send = () => {
    if(!input.trim() || !active) return;
    const now = new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"});
    setMsgs(m=>({...m,[active]:[...(m[active]||[]),{id:Date.now(),from:"me",text:input,time:now}]}));
    setInput("");
    
    // Auto-reply bot mock
    setTimeout(() => {
      setMsgs(m=>({...m,[active]:[...(m[active]||[]),{id:Date.now()+1,from:"them",text:"Hey! That sounds super interesting. Let's definitely set up a time to swap skills. I'll get back to you with my availability shortly!",time:new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}]}));
    }, 1500);
  };

  return (
    <DashLayout page="messages" setPage={setPage}>
      <div style={{display:"grid",gridTemplateColumns:"280px 1fr",height:"calc(100vh - 200px)",background:"#fff",borderRadius:"var(--radius-lg)",border:"1px solid var(--border)",overflow:"hidden"}}>
        <div className="chat-list">
          <div className="chat-list-header"><h3>Messages</h3></div>
          {convos.length === 0 && <div style={{padding:"20px",color:"var(--mid)",fontSize:"14px",textAlign:"center"}}>No active conversations. Reach out to a match!</div>}
          {convos.map(u=>(
            <div key={u._id} className={`chat-item ${active===u._id?"active":""}`} onClick={()=>setActive(u._id)}>
              <div className="chat-avatar">{u.emoji || "🙂"}</div>
              <div className="chat-info">
                <div className="chat-info-name">{u.name}</div>
                <div className="chat-info-preview">{(msgs[u._id]||[]).slice(-1)[0]?.text||"No messages yet"}</div>
              </div>
              <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:6}}>
                <span className="chat-time">{(msgs[u._id]||[]).slice(-1)[0]?.time||""}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="chat-main">
          {active ? (
            <>
              <div className="chat-header">
                <div className="chat-avatar" style={{width:40,height:40,fontSize:20}}>{convos.find(u=>u._id===active)?.emoji || "🙂"}</div>
                <div>
                  <div style={{fontWeight:600}}>{convos.find(u=>u._id===active)?.name}</div>
                  <div style={{fontSize:12,color:"var(--sage)"}}>● Online (Auto-Reply Bot)</div>
                </div>
                <button className="btn btn-secondary btn-sm" style={{marginLeft:"auto"}}>📅 Schedule session</button>
              </div>
              <div className="chat-messages">
                {(msgs[active]||[]).map(m=>(
                  <div key={m.id} className={`msg ${m.from==="me"?"mine":""}`}>
                    {m.from!=="me"&&<div className="chat-avatar" style={{width:32,height:32,fontSize:16,flexShrink:0}}>{convos.find(u=>u._id===active)?.emoji || "🙂"}</div>}
                    <div>
                      <div className={`msg-bubble ${m.from==="me"?"mine":"theirs"}`}>{m.text}</div>
                      <div className="msg-time">{m.time}</div>
                    </div>
                  </div>
                ))}
                <div ref={endRef}/>
              </div>
              <div className="chat-input-area">
                <input className="chat-input" placeholder="Type a message..." value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()}/>
                <button className="btn btn-primary btn-sm" onClick={send}>Send →</button>
              </div>
            </>
          ) : (
             <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",flex:1,color:"var(--mid)",background:"var(--cream)"}}>
               <div style={{fontSize:"40px",marginBottom:"20px"}}>💬</div>
               <div style={{fontFamily:"var(--font-display)",fontSize:"20px",fontWeight:600}}>Select a conversation</div>
             </div>
          )}
        </div>
      </div>
    </DashLayout>
  );
}

// ─── SCHEDULE ─────────────────────────────────────────────────────────────────
function Schedule({ setPage, addToast }) {
  const [selDay, setSelDay] = useState(null);
  const [selSlot, setSelSlot] = useState(null);
  const [selUser, setSelUser] = useState(0);
  const month = "March 2026";
  const days = Array.from({length:31},(_,i)=>i+1);
  const firstDay = 0; // Sunday
  const slots = ["9:00 AM","10:00 AM","11:00 AM","1:00 PM","2:00 PM","3:00 PM","4:00 PM","5:00 PM"];
  const booked = [2,5];
  const hasDot = [8,12,15,19,22];
  const book = () => { if(!selDay||!selSlot){addToast("Pick a day and time first","info","⚠️");return;} addToast(`Session booked: Mar ${selDay} at ${selSlot}!`,"success","✅"); setSelDay(null); setSelSlot(null); };
  return (
    <DashLayout page="schedule" setPage={setPage}>
      <div className="schedule-wrap">
        <div className="page-title">Schedule a session</div>
        <div className="page-sub">Book a learning session with your matches</div>
        <div style={{marginBottom:24}}>
          <div style={{fontSize:13,fontWeight:600,color:"var(--mid)",marginBottom:10}}>With</div>
          <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
            {SAMPLE_USERS.slice(0,4).map((u,i)=>(
              <div key={u.id} onClick={()=>setSelUser(i)} style={{
                display:"flex",alignItems:"center",gap:10,padding:"10px 16px",
                borderRadius:"var(--radius)",border:`1.5px solid ${selUser===i?"var(--terracotta)":"var(--border)"}`,
                background:selUser===i?"#FFF0E8":"#fff",cursor:"pointer",transition:"all 0.15s"
              }}>
                <span style={{fontSize:20}}>{u.emoji}</span>
                <span style={{fontSize:14,fontWeight:500}}>{u.name.split(" ")[0]}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="calendar-grid">
          <div className="cal-month">
            <div className="cal-nav">
              <button className="btn btn-ghost btn-sm">‹</button>
              <h4>{month}</h4>
              <button className="btn btn-ghost btn-sm">›</button>
            </div>
            <div className="cal-days">
              {["S","M","T","W","T","F","S"].map((d,i)=><div key={i} className="cal-day-label">{d}</div>)}
              {Array(firstDay).fill(null).map((_,i)=><div key={`e${i}`} className="cal-day empty"/>)}
              {days.map(d=>(
                <div key={d} className={`cal-day available ${d===8?"today":""} ${selDay===d?"selected":""} ${hasDot.includes(d)?"has-slot":""}`} onClick={()=>setSelDay(d)}>{d}</div>
              ))}
            </div>
          </div>
          <div className="time-slots">
            <h4>{selDay ? `Mar ${selDay} — Available times` : "Select a day first"}</h4>
            {selDay ? (
              <>
                <div className="slot-grid">
                  {slots.map((s,i)=>(
                    <div key={s} className={`slot ${booked.includes(i)?"booked":""} ${selSlot===s?"selected":""}`} onClick={()=>!booked.includes(i)&&setSelSlot(s)}>
                      {booked.includes(i)?"Booked":s}
                    </div>
                  ))}
                </div>
                <button className="btn btn-primary" style={{marginTop:24,width:"100%",justifyContent:"center"}} onClick={book}>Confirm booking →</button>
              </>
            ) : (
              <div style={{color:"var(--mid)",fontSize:14,textAlign:"center",padding:"40px 0"}}>👆 Pick a date to see available slots</div>
            )}
          </div>
        </div>
        <div style={{marginTop:32,background:"#fff",borderRadius:"var(--radius-lg)",padding:24,border:"1px solid var(--border)"}}>
          <div style={{fontFamily:"var(--font-display)",fontSize:18,fontWeight:600,marginBottom:16}}>Upcoming sessions</div>
          {[{name:"Priya Sharma",emoji:"🌸",skill:"Figma basics",date:"Thu, Mar 12 · 3:00 PM"},{name:"Marcus Chen",emoji:"🎯",skill:"Python loops",date:"Fri, Mar 13 · 5:00 PM"}].map(s=>(
            <div key={s.name} style={{display:"flex",gap:16,padding:"14px 0",borderBottom:"1px solid var(--border)",alignItems:"center"}}>
              <div className="match-avatar" style={{fontSize:24,width:44,height:44}}>{s.emoji}</div>
              <div style={{flex:1}}>
                <div style={{fontWeight:600}}>{s.name}</div>
                <div style={{fontSize:13,color:"var(--mid)"}}>{s.skill}</div>
              </div>
              <div style={{textAlign:"right"}}>
                <div style={{fontSize:13,fontWeight:500}}>{s.date}</div>
                <span style={{background:"#EDF5EE",color:"var(--sage)",borderRadius:100,padding:"3px 10px",fontSize:12,fontWeight:500}}>Confirmed</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashLayout>
  );
}

// ─── RESOURCES ────────────────────────────────────────────────────────────────
function Resources({ setPage, addToast }) {
  const [filter, setFilter] = useState("All");
  const types = ["All","Video","PDF","Notes"];
  const typeEmoji = {video:"🎥",pdf:"📄",notes:"📝"};
  const filtered = filter==="All" ? RESOURCES : RESOURCES.filter(r=>r.type===filter.toLowerCase());
  return (
    <DashLayout page="resources" setPage={setPage}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
        <div>
          <div className="page-title">Resources</div>
          <div className="page-sub">Tutorials, guides, and notes shared by the community</div>
        </div>
        <button className="btn btn-primary btn-sm" onClick={()=>addToast("Upload feature coming soon!","info","📤")}>+ Upload resource</button>
      </div>
      <div className="filter-row" style={{marginBottom:28}}>
        {types.map(t=><button key={t} className={`filter-chip ${filter===t?"active":""}`} onClick={()=>setFilter(t)}>{t}</button>)}
      </div>
      <div className="resource-grid">
        {filtered.map(r=>(
          <div key={r.id} className="resource-card" onClick={()=>addToast(`Opening "${r.title}"...`,"info","📖")}>
            <div className="resource-thumb">{r.emoji}</div>
            <div className={`resource-type type-${r.type}`}>{typeEmoji[r.type]} {r.type.toUpperCase()}</div>
            <div className="resource-title">{r.title}</div>
            <div className="resource-by">by {r.by} · {r.skill}</div>
            <div style={{fontSize:12,color:"var(--light-mid)",marginTop:6}}>{r.duration||r.pages||r.words}</div>
          </div>
        ))}
      </div>
    </DashLayout>
  );
}

// ─── MY PROFILE ───────────────────────────────────────────────────────────────
function MyProfile({ user, setPage }) {
  return (
    <DashLayout page="profile" setPage={setPage}>
      <div style={{maxWidth:700}}>
        <div className="profile-banner"></div>
        <div className="profile-info">
          <div className="profile-avatar-lg">{user?.emoji||"🙂"}</div>
          <div className="profile-name">{user?.name||"Your Name"}</div>
          <div className="profile-bio">{user?.bio||"Add a bio to help others get to know you."}</div>
          {user?.careerGoal && <div style={{fontSize:14,color:"var(--terracotta)",marginTop:8,fontWeight:600}}>🎯 Career Goal: {user.careerGoal}</div>}
          <div style={{display:"flex",flexWrap:"wrap",gap:6,marginTop:14}}>
            {(user?.teach||[]).map((s,i)=><span key={i} className="skill-pill pill-teach" style={{fontSize:13}}>🎓 {s.name||s}</span>)}
            {(user?.learn||[]).map((s,i)=><span key={i} className="skill-pill pill-learn" style={{fontSize:13}}>📖 {s}</span>)}
            {(!user?.teach?.length && !user?.learn?.length) && <span style={{fontSize:13,color:"var(--light-mid)"}}>No skills yet — edit your profile to add some!</span>}
          </div>
          <div className="rating-display" style={{marginTop:12}}><span style={{color:"var(--amber)"}}>★★★★★</span><span style={{fontWeight:600,marginLeft:4}}>4.9</span><span style={{color:"var(--mid)",fontSize:13}}>(7 sessions)</span></div>
          <button className="btn btn-secondary btn-sm" style={{marginTop:16}} onClick={()=>setPage("setup")}>✏️ Edit profile</button>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:24,marginTop:24}}>
          <div style={{background:"#fff",borderRadius:"var(--radius)",padding:20,border:"1px solid var(--border)"}}>
            <div style={{fontWeight:600,marginBottom:12}}>I can teach</div>
            {(user?.teach||[{name:"Add skills"}]).map((s,i)=><span key={i} className="skill-pill pill-teach">{s.name||s}</span>)}
          </div>
          <div style={{background:"#fff",borderRadius:"var(--radius)",padding:20,border:"1px solid var(--border)"}}>
            <div style={{fontWeight:600,marginBottom:12}}>I want to learn</div>
            {(user?.learn||["Add skills"]).map((s,i)=><span key={i} className="skill-pill pill-learn">{s}</span>)}
          </div>
        </div>
      </div>
    </DashLayout>
  );
}

// ─── RATING MODAL ─────────────────────────────────────────────────────────────
function RatingModal({ user, onClose, addToast }) {
  const [stars, setStars] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const submit = () => { if(!stars){addToast("Please select a rating","info","⚠️");return;} addToast(`Thanks for rating ${user.name}!`,"success","⭐"); onClose(); };
  return (
    <div className="rating-modal-overlay" onClick={onClose}>
      <div className="rating-modal" onClick={e=>e.stopPropagation()}>
        <h3>Rate your session</h3>
        <p style={{color:"var(--mid)"}}>with {user.name}</p>
        <div className="stars">
          {[1,2,3,4,5].map(i=>(
            <span key={i} className={`star ${i<=(hover||stars)?"lit":""}`} onMouseEnter={()=>setHover(i)} onMouseLeave={()=>setHover(0)} onClick={()=>setStars(i)}>★</span>
          ))}
        </div>
        <div className="field"><label>Comment (optional)</label><textarea placeholder="How was the session? Any feedback for them?" value={comment} onChange={e=>setComment(e.target.value)}/></div>
        <div style={{display:"flex",gap:12}}>
          <button className="btn btn-primary" onClick={submit}>Submit rating</button>
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

// ─── APP ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState("landing");
  const [authed, setAuthed] = useState(false);
  const [hasSignedUp, setHasSignedUp] = useState(false);
  const [user, setUser] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  
  // Persist session across refreshes
  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
        setAuthed(true);
        setHasSignedUp(true);
        setPage("dashboard");
      } catch (e) {
        console.error("Failed to parse user session", e);
      }
    }
  }, []);
  const [toasts, setToasts] = useState([]);
  const addToast = (msg, type="success", icon="✅") => {
    const id = Date.now();
    setToasts(t=>[...t,{id,msg,type,icon}]);
    setTimeout(()=>setToasts(t=>t.filter(x=>x.id!==id)),3000);
  };
  const onAuth = (u, mode) => {
    setUser(u); setAuthed(true);
    if (mode === "signup") setHasSignedUp(true);
  };
  const goTo = (p) => {
    if (["dashboard","browse","messages","schedule","resources","profile","setup","userprofile"].includes(p) && !authed) {
      setPage(hasSignedUp ? "login" : "signup");
      return;
    }
    setPage(p);
  };
  // Once signed up, landing always redirects to login
  const goToLanding = () => setPage(hasSignedUp ? "login" : "landing");

  return (
    <div className="app">
      <style>{css}</style>
      {!["login","signup","setup","landing"].includes(page) && <Nav page={page} setPage={goTo} authed={authed} user={user}/>}
      {page==="landing" && <Landing setPage={(p) => { if(p==="signup" && hasSignedUp) setPage("login"); else setPage(p); }}/>}
      {page==="login" && <Auth mode="login" setPage={setPage} onAuth={(u)=>onAuth(u,"login")} addToast={addToast}/>}
      {page==="signup" && <Auth mode="signup" setPage={setPage} onAuth={(u)=>onAuth(u,"signup")} addToast={addToast}/>}
      {page==="setup" && <ProfileSetup user={user} setUser={setUser} setPage={setPage} addToast={addToast}/>}
      {page==="dashboard" && <Dashboard user={user} setPage={goTo}/>}
      {page==="browse" && <Browse setPage={goTo} setSelectedUser={setSelectedUser} addToast={addToast} user={user}/>}
      {page==="userprofile" && <UserProfile u={selectedUser} setPage={goTo} addToast={addToast}/>}
      {page==="messages" && <Messages setPage={goTo} selectedUser={selectedUser}/>}
      {page==="schedule" && <Schedule setPage={goTo} addToast={addToast}/>}
      {page==="resources" && <Resources setPage={goTo} addToast={addToast}/>}
      {page==="profile" && <MyProfile user={user} setPage={goTo}/>}
      <Toast toasts={toasts}/>
    </div>
  );
}