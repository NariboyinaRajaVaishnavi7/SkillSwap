import { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";

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

  /* ── VIDEO SECTION ── */
  .video-list-wrap { display: flex; flex-direction: column; gap: 32px; }
  .video-form-card { background: #fff; border-radius: var(--radius-lg); padding: 32px; border: 1px solid var(--border); box-shadow: 0 4px 12px var(--shadow); margin-bottom: 40px; }
  .video-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 24px; }
  .video-card { background: #fff; border-radius: var(--radius-lg); border: 1px solid var(--border); overflow: hidden; transition: all 0.3s ease; display: flex; flex-direction: column; }
  .video-card:hover { transform: translateY(-4px); box-shadow: 0 12px 30px var(--shadow-md); border-color: var(--terracotta-light); }
  .video-player-container { position: relative; width: 100%; aspect-ratio: 16/9; background: #000; }
  .video-player-container video { width: 100%; height: 100%; object-fit: contain; }
  .video-content { padding: 20px; flex: 1; display: flex; flex-direction: column; }
  .video-title { font-family: var(--font-display); font-size: 18px; font-weight: 600; color: var(--charcoal); margin-bottom: 8px; }
  .video-skill { font-size: 12px; font-weight: 600; text-transform: uppercase; color: var(--terracotta); background: #FFF0E8; padding: 4px 12px; border-radius: 100px; display: inline-block; width: fit-content; margin-bottom: 12px; }
  
  .course-list { display: flex; flex-direction: column; gap: 16px; }
  .course-item { display: flex; background: #fff; border-radius: var(--radius); border: 1px solid var(--border); padding: 12px; gap: 16px; align-items: center; cursor: pointer; transition: all 0.2s; }
  .course-item:hover { border-color: var(--terracotta); background: var(--warm-white); }
  .course-item-thumb { width: 140px; aspect-ratio: 16/9; background: var(--sand); border-radius: var(--radius-sm); display: flex; align-items: center; justify-content: center; font-size: 24px; flex-shrink: 0; }
  .course-item-info { flex: 1; }
  .course-item-title { font-weight: 600; font-size: 15px; margin-bottom: 4px; }
  .course-item-skill { font-size: 12px; color: var(--mid); }

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

  .badge-card:hover .badge-tooltip { opacity: 1 !important; }
  @keyframes pulse { 0% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.5); opacity: 0; } 100% { transform: scale(1); opacity: 0; } }
  @keyframes pulse-border {
    0% { border-bottom-color: var(--border); }
    50% { border-bottom-color: var(--terracotta-light); }
    100% { border-bottom-color: var(--border); }
  }

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
    .video-grid { grid-template-columns: 1fr; }
    .course-item { flex-direction: column; align-items: flex-start; }
    .course-item-thumb { width: 100%; }
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

// No hardcoded resources - now fetched from database
const RESOURCES = [];

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
    ? [["dashboard","Dashboard"],["browse","Browse"],["messages","Messages"],["schedule","Schedule"],["videos","Learning Hub"],["resources","Resources"]]
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

const API_URL = "http://127.0.0.1:5000";

// ─── AUTH ─────────────────────────────────────────────────────────────────────
function Auth({ mode, setPage, onAuth, addToast }) {
  const [form, setForm] = useState({email:"",password:"",name:""});
  const isLogin = mode==="login";
  const handle = async () => {
    if(!form.email||!form.password||((!isLogin)&&!form.name)) { addToast("Please fill all fields","info","⚠️"); return; }
    try {
      const endpoint = isLogin ? "/login" : "/signup";
      const res = await fetch(`${API_URL}${endpoint}`, {
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
      const res = await fetch(`${API_URL}/profile`, {
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
    ["videos","📺","Learning Hub"],
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
function Dashboard({ user, setPage, addToast }) {
  const [requests, setRequests] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [recentMatches, setRecentMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ matchCount: "0", sessionsDone: "0", rating: "5.0", progress: "0%", goal: "your goal" });

  const fetchRequests = () => {
    const token = localStorage.getItem("token");
    fetch(`${API_URL}/connections`, {
      headers: { "Authorization": `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        const incoming = data.filter(c => c.receiver?._id === user.id && c.status === "pending");
        setRequests(incoming);
      })
      .catch(err => console.error(err));
  };

  const fetchStats = () => {
    const token = localStorage.getItem("token");
    fetch(`${API_URL}/dashboard-stats`, {
      headers: { "Authorization": `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.error) throw new Error(data.error);
        setStats(data);
      })
      .catch(err => console.error("Error fetching stats:", err));
  };

  const fetchSessions = () => {
    const token = localStorage.getItem("token");
    fetch(`${API_URL}/sessions`, { headers: { "Authorization": `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => { setSessions(data); setLoading(false); })
      .catch(err => { console.error(err); setLoading(false); });
  };

  useEffect(() => {
    if (user) {
      fetchRequests();
      fetchStats();
      fetchSessions();
      fetchRecentMatches();
    }
  }, [user]);

  const fetchRecentMatches = () => {
    const token = localStorage.getItem("token");
    fetch(`${API_URL}/connections`, { headers: { "Authorization": `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => {
        const accepted = data.filter(c => c.status === "accepted");
        setRecentMatches(accepted);
      })
      .catch(err => console.error(err));
  };

  const handleRequest = async (id, status) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/connections/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ status })
      });
      if (!res.ok) throw new Error("Failed to update request");
      addToast(`Match ${status}!`, "success", "✅");
      fetchRequests();
      fetchStats(); // Refresh stats when connection is accepted
    } catch (err) {
      addToast(err.message, "error", "❌");
    }
  };

  return (
    <DashLayout page="dashboard" setPage={setPage}>
      <div className="page-title">Welcome back, {user?.name?.split(" ")[0]} {user?.emoji}</div>
      <div className="page-sub">Here's what's happening in your skill community.</div>
      
      {requests.length > 0 && (
        <div style={{background: "#FFF8EE", border: "1px solid var(--amber-light)", borderRadius: "var(--radius-lg)", padding: "24px", marginBottom: "32px", animation: "slideUp 0.4s ease"}}>
          <div style={{fontFamily: "var(--font-display)", fontSize: "18px", fontWeight: 600, marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px"}}>
            <span>📬</span> Match Requests ({requests.length})
          </div>
          <div style={{display: "flex", flexDirection: "column", gap: "12px"}}>
            {requests.map(req => (
              <div key={req._id} style={{background: "#fff", padding: "16px", borderRadius: "12px", display: "flex", alignItems: "center", gap: "16px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)"}}>
                <div style={{fontSize: "24px"}}>{req.requester.emoji}</div>
                <div style={{flex: 1}}>
                  <div style={{fontWeight: 600}}>{req.requester.name} wants to swap skills!</div>
                  <div style={{fontSize: "13px", color: "var(--mid)"}}>They teach: {req.requester.teach.map(s => s.name||s).join(", ")}</div>
                  {req.requesterFeedbacks && req.requesterFeedbacks.length > 0 && (
                    <div style={{marginTop: "8px", borderTop: "1px dashed var(--border)", paddingTop: "8px"}}>
                      <div style={{fontSize: "11px", fontWeight: 600, color: "var(--light-mid)", textTransform: "uppercase", marginBottom: "4px"}}>Recent Feedback:</div>
                      {req.requesterFeedbacks.map((f, i) => (
                        <div key={i} style={{fontSize: "12px", fontStyle: "italic", color: "var(--charcoal)", marginBottom: "2px"}}>
                          "{f.text && f.text.length > 60 ? f.text.substring(0, 57) + "..." : (f.text || "No text feedback")}" — {f.student?.name || f.from?.name || "Peer"}
                          {f.isDefault && <span style={{fontSize: "9px", color: "var(--light-mid)", marginLeft: "4px"}}>(Demo Review)</span>}
                        </div>
                      ))}
                    </div>
                  )}
                  {(!req.requesterFeedbacks || req.requesterFeedbacks.every(f => f.isDefault)) && (
                    <div style={{fontSize: "11px", color: "var(--terracotta)", marginTop: "4px", fontWeight: 600}}>
                      ⚠️ User is in demo mode. Requirements may vary.
                    </div>
                  )}
                  {req.requesterFeedbacks && !req.requesterFeedbacks.every(f => f.isDefault) && req.requesterFeedbacks.length < 2 && (
                    <div style={{fontSize: "11px", color: "var(--terracotta)", marginTop: "4px", fontWeight: 600}}>
                      ⚠️ This user needs more verified feedback to be eligible.
                    </div>
                  )}
                </div>
                <div style={{display: "flex", gap: "8px"}}>
                  <button 
                    className="btn btn-primary btn-sm" 
                    onClick={() => handleRequest(req._id, "accepted")}
                    disabled={req.requesterFeedbacks && req.requesterFeedbacks.length > 0 && req.requesterFeedbacks.some(f => f.isDefault) ? false : (!req.requesterFeedbacks || req.requesterFeedbacks.length < 2)}
                    style={{...(req.requesterFeedbacks && req.requesterFeedbacks.length > 0 && req.requesterFeedbacks.some(f => f.isDefault) ? {} : (!req.requesterFeedbacks || req.requesterFeedbacks.length < 2) ? {opacity: 0.5, cursor: "not-allowed"} : {})}}
                  >
                    Accept
                  </button>
                  <button className="btn btn-secondary btn-sm" onClick={() => handleRequest(req._id, "rejected")}>Decline</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="stats-grid">
        {[
          ["🔗", stats.matchCount, "Skill matches", "Active connections"],
          ["✅", stats.sessionsDone, "Sessions done", "Learning milestones"],
          ["⭐", stats.rating, "Your rating", "From your peers"],
          ["📈", stats.progress, "Progress", `Toward ${stats.goal}`]
        ].map(([icon,val,label,change])=>(
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
          <div style={{fontFamily:"var(--font-display)",fontSize:18,fontWeight:600,marginBottom:16,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            Upcoming sessions
            <button className="btn btn-ghost btn-sm" onClick={()=>setPage("schedule")} style={{fontSize:13}}>View all ↗</button>
          </div>
          {sessions.length > 0 ? (
            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              {sessions.slice(0, 3).map(s => {
                const peer = s.teacher?._id === user.id ? s.student : s.teacher;
                if (!peer) return null;
                return (
                  <div key={s._id} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 0",borderBottom:"1px solid var(--border-light)"}}>
                    <div style={{fontSize:20,width:36,height:36,background:"var(--cream)",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center"}}>{peer.emoji || "🙂"}</div>
                    <div style={{flex:1}}>
                      <div style={{fontWeight:600,fontSize:14}}>{peer.name}</div>
                      <div style={{fontSize:12,color:"var(--mid)"}}>{s.skill}</div>
                    </div>
                    <div style={{textAlign:"right",fontSize:11}}>
                      <div style={{fontWeight:600}}>{s.date}</div>
                      <div style={{color:"var(--mid)"}}>{s.time}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{color:"var(--mid)",fontSize:"14px",padding:"20px 0",textAlign:"center"}}>No upcoming sessions booked yet.</div>
          )}
        </div>
        <div style={{background:"#fff",borderRadius:"var(--radius-lg)",padding:24,border:"1px solid var(--border)"}}>
          <div style={{fontFamily:"var(--font-display)",fontSize:18,fontWeight:600,marginBottom:16,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            Recent matches
            <button className="btn btn-ghost btn-sm" onClick={()=>setPage("browse")} style={{fontSize:13}}>Explore ↗</button>
          </div>
          {recentMatches.length > 0 ? (
            <div style={{display:"flex",overflowX:"auto",gap:16,paddingBottom:8}}>
              {recentMatches.slice(0, 5).map(m => {
                const peer = m.requester._id === user.id ? m.receiver : m.requester;
                if (!peer) return null;
                return (
                  <div key={m._id} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:8,minWidth:80}}>
                    <div style={{fontSize:28,width:52,height:52,background:"var(--warm-white)",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",border:"2px solid var(--border)"}}>{peer.emoji || "🙂"}</div>
                    <div style={{fontSize:12,fontWeight:600,textAlign:"center"}}>{peer.name?.split(" ")[0]}</div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{color:"var(--mid)",fontSize:"14px",padding:"20px 0",textAlign:"center"}}>No new matches based on your skills yet. Check the Browse section!</div>
          )}
        </div>
      </div>
    </DashLayout>
  );
}

// ─── BROWSE ───────────────────────────────────────────────────────────────────
function Browse({ setPage, setSelectedUser, addToast, user }) {
  const [matches, setMatches] = useState([]);
  const [connections, setConnections] = useState([]);
  const [requiredSkills, setRequiredSkills] = useState([]);
  const [loadingSkills, setLoadingSkills] = useState(true);
  const [loadingMatches, setLoadingMatches] = useState(true);

  const fetchConnections = () => {
    const token = localStorage.getItem("token");
    fetch("http://localhost:5000/connections", {
      headers: { "Authorization": `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setConnections(data))
      .catch(err => console.error(err));
  };

  const connectUser = async (targetId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/connect`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ targetUserId: targetId })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      addToast("Request sent!", "success", "📬");
      fetchConnections();
    } catch (err) {
      addToast(err.message, "error", "❌");
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetchConnections();
    fetch(`${API_URL}/matches`, {
      headers: { "Authorization": `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setRequiredSkills(data.requiredSkills || []);
        setLoadingSkills(false);
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

  const getConnectionStatus = (targetId) => {
    const conn = connections.find(c => (c.requester._id === targetId || c.receiver._id === targetId));
    return conn ? conn.status : null;
  };

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
          matches.map(matchedUser => {
            const status = getConnectionStatus(matchedUser._id);
            return (
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
                {matchedUser.feedbacks && matchedUser.feedbacks.length > 0 && (
                  <div style={{background: "var(--warm-white)", padding: "12px", borderRadius: "12px", marginBottom: "16px", border: "1px solid var(--border-light)"}}>
                    <div className="match-skills-label">Social Proof</div>
                    {matchedUser.feedbacks.map((f, i) => (
                      <div key={i} style={{fontSize: "12px", color: "var(--mid)", marginBottom: "4px", borderBottom: i < matchedUser.feedbacks.length - 1 ? "1px solid #eee" : "none", paddingBottom: "4px"}}>
                        <span style={{color: "var(--amber)"}}>{"★".repeat(f.rating)}</span> "{f.text && f.text.length > 50 ? f.text.substring(0, 47) + "..." : (f.text || "No text feedback")}"
                        {f.isDefault && <span style={{fontSize: "9px", color: "var(--light-mid)", marginLeft: "4px"}}>(Demo)</span>}
                      </div>
                    ))}
                  </div>
                )}
                {matchedUser.feedbacks && matchedUser.feedbacks.some(f => f.isDefault) ? (
                   <div style={{fontSize: "11px", color: "var(--mid)", fontStyle: "italic", marginBottom: "16px"}}>
                     Verified peer status: <span style={{color: "var(--amber)", fontWeight: 700}}>Pending</span>
                   </div>
                ) : (!matchedUser.feedbacks || matchedUser.feedbacks.length < 2) && (
                   <div style={{fontSize: "11px", color: "var(--mid)", fontStyle: "italic", marginBottom: "16px"}}>
                     Needs {2 - (matchedUser.feedbacks?.length || 0)} more feedback(s) to become a verified match.
                   </div>
                )}
                <div className="match-card-actions">
                  {status === "accepted" ? (
                    <button className="btn btn-primary btn-sm" onClick={e => {e.stopPropagation(); setPage("messages");}}>💬 Message</button>
                  ) : status === "pending" ? (
                    <button className="btn btn-secondary btn-sm" disabled style={{opacity:0.7}}>⌛ Request Pending</button>
                  ) : (
                    <button className="btn btn-sage btn-sm" onClick={e => {e.stopPropagation(); connectUser(matchedUser._id);}}>🤝 Request Match</button>
                  )}
                  <div style={{marginLeft: "auto", fontSize: 13, color: "var(--amber)", fontWeight: 600}}>★ {matchedUser.rating || "New"}</div>
                </div>
              </div>
            );
          })
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
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [userVideos, setUserVideos] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!u) return;

    // Fetch reviews
    fetch(`${API_URL}/reviews/${u._id}`)
      .then(res => res.json())
      .then(data => { setReviews(data); setLoadingReviews(false); })
      .catch(err => console.error(err));
    
    // Check connection status
    fetch(`${API_URL}/connections`, {
      headers: { "Authorization": `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        const conn = data.find(c => (c.requester?._id === u._id || c.receiver?._id === u._id) && c.status === "accepted");
        setIsConnected(!!conn);
      });

    // Fetch authorized videos
    fetch(`${API_URL}/videos`, {
      headers: { "Authorization": `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        const filtered = data.filter(v => 
          v.uploadedBy && (v.uploadedBy._id === u._id || v.uploadedBy === u._id)
        );
        setUserVideos(filtered);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [u]);

  if (!u) return <div>User not found.</div>;

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
          <div className="rating-display" style={{marginTop:12}}>
            {u.sessions > 0 ? (
              <>
                <span style={{color:"var(--amber)"}}>{"★".repeat(Math.floor(u.rating || 5))}</span>
                <span style={{fontWeight:600,marginLeft:4}}>{(u.rating || 5.0).toFixed(1)}</span>
                <span style={{color:"var(--mid)",fontSize:13,marginLeft:4}}>({u.sessions} sessions)</span>
              </>
            ) : (
              <span style={{color:"var(--mid)",fontSize:13,fontStyle:"italic"}}>No sessions yet — be the first to book!</span>
            )}
          </div>
          <div style={{marginTop:16,display:"flex",gap:10}}>
            <button className="btn btn-primary btn-sm" onClick={()=>{addToast("Opening chat...","info","💬");setPage("messages");}}>💬 Message</button>
            <button className="btn btn-sage btn-sm" onClick={()=>{addToast("Opening scheduler...","info","📅");setPage("schedule");}}>📅 Book session</button>
          </div>
        </div>

        {u.badges && u.badges.length > 0 && (
          <div style={{background:"#fff",borderRadius:"var(--radius)",padding:24,border:"1px solid var(--border)",marginTop:32}}>
            <div style={{fontWeight:600,fontSize:18,marginBottom:16,display:"flex",alignItems:"center",gap:8}}>
              <span>🏆</span> Badges & Achievements
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill, minmax(140px, 1fr))",gap:16}}>
              {u.badges.map((b,i)=>(
                <div key={i} className="badge-card" style={{
                  padding:16, borderRadius:16, background:"var(--warm-white)", border:"1px solid var(--border-light)", textAlign:"center",
                  display:"flex", flexDirection:"column", alignItems:"center", gap:8
                }} title={b.description}>
                  <div style={{fontSize:32}}>{b.icon}</div>
                  <div style={{fontWeight:700, fontSize:13}}>{b.name}</div>
                  <div style={{fontSize:11, color:"var(--mid)"}}>{b.category}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{background:"#fff",borderRadius:"var(--radius)",padding:24,border:"1px solid var(--border)",marginTop:32}}>
          <div style={{fontWeight:600,fontSize:18,marginBottom:20}}>Recent Feedbacks</div>
          {loadingReviews ? (
            <div style={{color:"var(--mid)",fontSize:14}}>Loading feedbacks...</div>
          ) : reviews.length > 0 ? (
            reviews.map(r=>(
              <div key={r._id} style={{borderBottom:"1px solid var(--border)",padding:"16px 0"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <span style={{fontSize:18}}>{r.student.emoji}</span>
                    <span style={{fontWeight:600,fontSize:14}}>{r.student.name}</span>
                  </div>
                  <div style={{color:"var(--amber)",fontSize:13}}>{"★".repeat(r.rating)}</div>
                </div>
                <div style={{fontSize:14,color:"var(--charcoal)",lineHeight:1.5}}>{r.text || "No written feedback provided."}</div>
                <div style={{fontSize:12,color:"var(--mid)",marginTop:8}}>{new Date(r.createdAt).toLocaleDateString()}</div>
              </div>
            ))
          ) : (
            <div style={{color:"var(--mid)",fontSize:14,padding:"20px 0",textAlign:"center"}}>No feedback yet.</div>
          )}
        </div>

        <div style={{background:"#fff",borderRadius:"var(--radius)",padding:20,border:"1px solid var(--border)",marginTop:24}}>
          <div style={{fontWeight:600,marginBottom:16,display:"flex",alignItems:"center",gap:8}}>
            <span>📺</span> Shared Content
            {!isConnected && <span style={{fontSize:12,fontWeight:400,color:"var(--mid)",marginLeft:"auto"}}>(Connect to view private videos)</span>}
          </div>
          
          {loading ? (
            <div style={{textAlign:"center",padding:20,color:"var(--mid)"}}>Loading content...</div>
          ) : isConnected ? (
            userVideos.length > 0 ? (
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
                {userVideos.map(v => (
                  <div key={v._id} style={{background:"var(--cream)",borderRadius:12,overflow:"hidden",border:"1px solid var(--border)"}}>
                    <VideoPlayer url={v.videoUrl} />
                    <div style={{padding:10}}>
                      <div style={{fontWeight:600,fontSize:13}}>{v.title}</div>
                      <div style={{fontSize:11,color:"var(--terracotta)",marginTop:4}}>{v.skill}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{textAlign:"center",padding:40,color:"var(--mid)",fontSize:14}}>No videos shared yet.</div>
            )
          ) : (
            <div style={{textAlign:"center",padding:40,background:"var(--warm-white)",borderRadius:12,border:"1px dashed var(--border)"}}>
              <div style={{fontSize:24,marginBottom:12}}>🔒</div>
              <div style={{fontSize:14,color:"var(--mid)"}}>Match and accept {u.name}'s request to unlock their learning materials.</div>
            </div>
          )}
        </div>
      </div>
    </DashLayout>
  );
}

function ResumeModal({ user, onClose }) {
  const badgeText = (user?.badges || []).map(b => `• Earned '${b.name}' badge for ${b.description.toLowerCase().replace("you've ","").replace("your ","")}`).join("\n");
  const resumeSummary = `SkillSwap Achievements for ${user?.name}:\n\n${badgeText || "No badges earned yet."}\n\nVerified on SkillSwap Platform`;

  return (
    <div className="modal-overlay" style={{position:"fixed",top:0,left:0,right:0,bottom:0,background:"rgba(0,0,0,0.5)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000}}>
      <div style={{background:"#fff",padding:40,borderRadius:24,width:550,maxWidth:"95%",boxShadow:"0 30px 60px rgba(0,0,0,0.3)"}}>
        <div style={{fontSize:40,marginBottom:16}}>📝</div>
        <h3 style={{fontFamily:"var(--font-display)",fontSize:24,marginBottom:8}}>Resume Integration</h3>
        <p style={{fontSize:14,color:"var(--mid)",marginBottom:24, lineHeight:1.5}}>Copy these achievements to your LinkedIn or CV to showcase your peer-learning contributions!</p>
        
        <div style={{background: "var(--cream)", padding: "24px", borderRadius: "20px", border: "1px solid var(--border)", marginBottom: 24, textAlign: "left", whiteSpace: "pre-wrap", fontSize: 13, fontFamily: "monospace", color: "var(--charcoal)", lineHeight: 1.6}}>
          {resumeSummary}
        </div>

        <div style={{display:"flex",gap:12}}>
          <button className="btn btn-secondary" style={{flex:1}} onClick={() => { navigator.clipboard.writeText(resumeSummary); alert("Summary copied to clipboard!"); }}>📋 Copy for CV</button>
          <button className="btn btn-primary" style={{flex:1}} onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

// ─── MESSAGES ─────────────────────────────────────────────────────────────────
function Messages({ setPage, selectedUser, user }) {
  const [active, setActive] = useState(selectedUser ? selectedUser._id : null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [convos, setConvos] = useState(selectedUser ? [selectedUser] : []);
  const [typing, setTyping] = useState(false);
  const [isPeerTyping, setIsPeerTyping] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const socketRef = useRef(null);
  const endRef = useRef(null);
  
  const fetchMessages = () => {
    if (!active) return;
    const token = localStorage.getItem("token");
    fetch(`${API_URL}/messages/${active}`, {
      headers: { "Authorization": `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setMessages(data))
      .catch(err => console.error("Error fetching messages", err));
  };

  useEffect(() => {
    socketRef.current = io("http://localhost:5000");
    const currentUserId = user?.id || user?._id;

    if (currentUserId) {
      socketRef.current.emit("join", currentUserId);
    }

    socketRef.current.on("receive-message", (msg) => {
      // Only add message if it's from current active chat or for current user
      if (msg.sender === active || msg.receiver === active) {
        setMessages(prev => [...prev, msg]);
      }
    });

    socketRef.current.on("user-typing", (data) => {
      if (data.userId === active) {
        setIsPeerTyping(data.typing);
      }
    });

    socketRef.current.on("user-status", (data) => {
      setOnlineUsers(prev => {
        const next = new Set(prev);
        if (data.online) next.add(data.userId);
        else next.delete(data.userId);
        return next;
      });
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [user]);

  useEffect(() => {
    fetchMessages();
    setIsPeerTyping(false);
  }, [active]);

  useEffect(() => {
    endRef.current?.scrollIntoView({behavior:"smooth"});
  }, [messages, active]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const currentUserId = user?.id || user?._id;

    fetch("http://localhost:5000/connections", {
      headers: { "Authorization": `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        const accepted = data.filter(c => c.status === "accepted");
        const contacts = accepted.map(c => 
          c.requester._id === currentUserId ? c.receiver : c.requester
        );
        setConvos(contacts);
        if (!active && contacts.length > 0) {
          setActive(contacts[0]._id);
        }
      })
      .catch(err => console.error("Error fetching chat contacts", err));
  }, [selectedUser, user]);
  
  const handleTyping = (e) => {
    setInput(e.target.value);
    if (!socketRef.current || !active) return;
    
    socketRef.current.emit("typing", { 
      receiverId: active, 
      userId: user?.id || user?._id, 
      typing: e.target.value.length > 0 
    });
  };

  const send = async () => {
    if(!input.trim() || !active) return;
    const currentUserId = user?.id || user?._id;

    // Send via socket
    socketRef.current.emit("send-message", {
      senderId: currentUserId,
      receiverId: active,
      text: input
    });

    // Update UI locally
    const placeholderMsg = {
      _id: Date.now().toString(),
      sender: currentUserId,
      receiver: active,
      text: input,
      createdAt: new Date().toISOString()
    };
    setMessages(prev => [...prev, placeholderMsg]);
    setInput("");
    socketRef.current.emit("typing", { receiverId: active, userId: currentUserId, typing: false });
  };

  return (
    <DashLayout page="messages" setPage={setPage}>
      <div style={{display:"grid",gridTemplateColumns:"280px 1fr",height:"calc(100vh - 200px)",background:"#fff",borderRadius:"var(--radius-lg)",border:"1px solid var(--border)",overflow:"hidden"}}>
        <div className="chat-list">
          <div className="chat-list-header"><h3>Messages</h3></div>
          {convos.length === 0 && <div style={{padding:"20px",color:"var(--mid)",fontSize:"14px",textAlign:"center"}}>No active conversations. Reach out to a match!</div>}
          {convos.map(u=>(
            <div key={u._id} className={`chat-item ${active===u._id?"active":""}`} onClick={()=>setActive(u._id)}>
              <div style={{position:"relative"}}>
                <div className="chat-avatar">{u.emoji || "🙂"}</div>
                {onlineUsers.has(u._id) && <div style={{position:"absolute",bottom:2,right:2,width:10,height:10,background:"#4CAF50",borderRadius:"50%",border:"2px solid #fff"}}/>}
              </div>
              <div className="chat-info">
                <div className="chat-info-name">{u.name}</div>
                <div className="chat-info-preview">{onlineUsers.has(u._id) ? "Online" : "Offline"}</div>
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
                  <div style={{fontSize:12,color:"var(--sage)"}}>{isPeerTyping ? "Typing..." : (onlineUsers.has(active) ? "Online" : "Offline")}</div>
                </div>
                <button className="btn btn-secondary btn-sm" style={{marginLeft:"auto"}} onClick={()=>setPage("schedule")}>📅 Schedule session</button>
              </div>
              <div className="chat-messages">
                {messages.map(m=>(
                  <div key={m._id} className={`msg ${m.sender === (user?.id || user?._id) ? "mine" : ""}`}>
                    {m.sender !== (user?.id || user?._id) && <div className="chat-avatar" style={{width:32,height:32,fontSize:16,flexShrink:0}}>{convos.find(u=>u._id===active)?.emoji || "🙂"}</div>}
                    <div>
                      <div className={`msg-bubble ${m.sender === (user?.id || user?._id) ? "mine" : "theirs"}`}>{m.text}</div>
                      <div className="msg-time">{new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
                    </div>
                  </div>
                ))}
                <div ref={endRef}/>
              </div>
              <div className="chat-input-area">
                <input className="chat-input" placeholder="Type a message..." value={input} onChange={handleTyping} onKeyDown={e=>e.key==="Enter"&&send()}/>
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

function Schedule({ setPage, addToast }) {
  const [selDay, setSelDay] = useState(null);
  const [selSlot, setSelSlot] = useState(null);
  const [selUserIdx, setSelUserIdx] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRating, setShowRating] = useState(false);
  const [sessionToRate, setSessionToRate] = useState(null);
  const [lastBookedSession, setLastBookedSession] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  
  // Calendar state
  const [viewDate, setViewDate] = useState(new Date(2026, 3, 1)); // Start at April 2026
  
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const dayLabels = ["S", "M", "T", "W", "T", "F", "S"];
  
  const currentMonth = viewDate.getMonth();
  const currentYear = viewDate.getFullYear();
  
  // Calculate days in month
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const monthDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const slots = ["9:00 AM", "10:00 AM", "11:00 AM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM"];

  useEffect(() => {
    const token = localStorage.getItem("token");
    const localUser = JSON.parse(localStorage.getItem("user") || "{}");
    const myId = localUser.id || localUser._id;

    fetch("http://localhost:5000/connections", { headers: { "Authorization": `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => {
        const accepted = data.filter(c => c.status === "accepted");
        const peerContacts = accepted.map(c => c.requester._id === myId ? c.receiver : c.requester);
        setContacts(peerContacts);
        if (peerContacts.length > 0) setSelUserIdx(0);
      })
      .catch(err => console.error(err));

    fetchSessions();
  }, []);

  const fetchSessions = () => {
    const token = localStorage.getItem("token");
    fetch(`${API_URL}/sessions`, { headers: { "Authorization": `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => { setSessions(data); setLoading(false); })
      .catch(err => { console.error(err); setLoading(false); });
  };

  const changeMonth = (offset) => {
    const newDate = new Date(currentYear, currentMonth + offset, 1);
    setViewDate(newDate);
    setSelDay(null);
    setSelSlot(null);
  };

  const book = async () => {
    if (selUserIdx === null) return addToast("Connect with someone first!", "info", "⚠️");
    if (!selDay || !selSlot) return addToast("Pick a day and time first", "info", "⚠️");
    
    try {
      const token = localStorage.getItem("token");
      const peer = contacts[selUserIdx];
      const res = await fetch(`${API_URL}/book-session`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({
          teacherId: peer._id,
          date: `${monthNames[currentMonth].slice(0,3)} ${selDay}`,
          time: selSlot,
          skill: peer.teach?.[0]?.name || peer.teach?.[0] || "Doubt Clearing"
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      addToast(`Session booked with ${peer.name}!`, "success", "✅");
      setLastBookedSession({ ...data.session, teacher: peer, student: JSON.parse(localStorage.getItem("user") || "{}") });
      setShowConfirmation(true);
      setSelDay(null);
      setSelSlot(null);
      fetchSessions();
    } catch (err) {
      addToast(err.message, "error", "❌");
    }
  };

  const isBooked = (day, slot) => {
    if (selUserIdx === null) return false;
    const peer = contacts[selUserIdx];
    const dateStr = `${monthNames[currentMonth].slice(0,3)} ${day}`;
    return sessions.some(s => s.teacher._id === peer._id && s.date === dateStr && s.time === slot);
  };

  return (
    <DashLayout page="schedule" setPage={setPage}>
      <div className="schedule-wrap">
        <div className="page-title">Schedule a doubt session</div>
        <div className="page-sub">Connect with your matches to clear doubts and learn faster.</div>
        
        <div style={{marginBottom:32}}>
          <div style={{fontSize:13,fontWeight:600,color:"var(--mid)",marginBottom:12,textTransform:"uppercase",letterSpacing:"0.05em"}}>1. Select Match</div>
          {contacts.length > 0 ? (
            <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
              {contacts.map((u,i)=>(
                <div key={u._id} onClick={()=>setSelUserIdx(i)} style={{
                  display:"flex",alignItems:"center",gap:10,padding:"12px 20px",
                  borderRadius:"var(--radius)",border:`2px solid ${selUserIdx===i?"var(--terracotta)":"var(--border)"}`,
                  background:selUserIdx===i?"#FFF0E8":"#fff",cursor:"pointer",transition:"all 0.2s"
                }}>
                  <span style={{fontSize:22}}>{u.emoji || "🙂"}</span>
                  <span style={{fontSize:14,fontWeight:600}}>{u.name}</span>
                </div>
              ))}
            </div>
          ) : (
            <div style={{padding:20,background:"#fff",borderRadius:12,border:"1px dashed var(--border)",color:"var(--mid)",fontSize:14}}>
              No active matches found. Browse the community to find a peer!
            </div>
          )}
        </div>

        <div className="calendar-grid">
          <div className="cal-month">
            <div className="cal-nav">
              <button className="btn btn-ghost btn-sm" onClick={() => changeMonth(-1)}>‹</button>
              <h4 style={{fontSize:18}}>{monthNames[currentMonth]} {currentYear}</h4>
              <button className="btn btn-ghost btn-sm" onClick={() => changeMonth(1)}>›</button>
            </div>
            <div className="cal-days">
              {dayLabels.map((d,i)=><div key={i} className="cal-day-label">{d}</div>)}
              {Array(firstDayOfMonth).fill(null).map((_,i)=><div key={`e${i}`} className="cal-day empty"/>)}
              {monthDays.map(d=>(
                <div key={d} className={`cal-day available ${d===new Date().getDate() && currentMonth === new Date().getMonth() ? "today" : ""} ${selDay===d?"selected":""}`} onClick={()=>setSelDay(d)}>{d}</div>
              ))}
            </div>
          </div>
          <div className="time-slots">
            <div style={{fontSize:13,fontWeight:600,color:"var(--mid)",marginBottom:12,textTransform:"uppercase",letterSpacing:"0.05em"}}>2. Available slots</div>
            {selDay ? (
              <>
                <div className="slot-grid">
                  {slots.map((s)=>(
                    <div key={s} className={`slot ${isBooked(selDay, s)?"booked":""} ${selSlot===s?"selected":""}`} onClick={()=>!isBooked(selDay, s)&&setSelSlot(s)}>
                      {isBooked(selDay, s) ? "Booked" : s}
                    </div>
                  ))}
                </div>
                <button className="btn btn-primary" style={{marginTop:24,width:"100%",justifyContent:"center"}} onClick={book}>Confirm booking →</button>
              </>
            ) : (
              <div style={{color:"var(--mid)",fontSize:14,textAlign:"center",padding:"60px 0"}}>👆 Pick a date to see available slots</div>
            )}
          </div>
        </div>

        <div style={{marginTop:40,background:"#fff",borderRadius:"var(--radius-lg)",padding:32,border:"1px solid var(--border)"}}>
          <div style={{fontFamily:"var(--font-display)",fontSize:22,fontWeight:600,marginBottom:24}}>Upcoming doubt-clearing sessions</div>
          {loading ? (
             <div style={{textAlign:"center",padding:20,color:"var(--mid)"}}>Loading sessions...</div>
          ) : sessions.length > 0 ? (
            <div style={{display:"flex",flexDirection:"column",gap:4}}>
              {sessions.map(s=>{
                const getStatus = () => {
                  const [m, d] = s.date.split(" ");
                  const [t, ampm] = s.time.split(" ");
                  const [h, min] = t.split(":");
                  let hour = parseInt(h);
                  if (ampm === "PM" && hour < 12) hour += 12;
                  if (ampm === "AM" && hour === 12) hour = 0;
                  
                  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                  const fullMonths = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
                  let monthIdx = months.indexOf(m);
                  if (monthIdx === -1) monthIdx = fullMonths.indexOf(m);
                  
                  if (monthIdx === -1) return { label: "Scheduled", color: "var(--mid)", status: "upcoming", disabled: true };

                  const sessionDate = new Date(currentYear, monthIdx, parseInt(d), hour, parseInt(min));
                  const now = new Date();
                  const diff = (sessionDate - now) / (1000 * 60); // minutes

                  if (diff > 30) return { label: "Upcoming Meeting", color: "var(--mid)", status: "upcoming", disabled: false }; // Allow entering early
                  if (diff <= 30 && diff >= -60) return { label: "Join Live", color: "#2E7D32", status: "live", disabled: false };
                  return { label: "Completed", color: "var(--light-mid)", status: "done", disabled: true };
                };
                const stat = getStatus();

                return (
                  <div key={s._id} style={{display:"flex",gap:16,padding:"24px 0",borderBottom:"1px solid var(--border)",alignItems:"center", animation: stat.status === 'live' ? 'pulse-border 2s infinite' : 'none'}}>
                    <div className="match-avatar" style={{fontSize:24,width:52,height:52, position: "relative"}}>
                      {s.teacher._id === JSON.parse(localStorage.getItem("user") || "{}").id ? s.student.emoji : s.teacher.emoji}
                      {stat.status === 'live' && <div style={{position:"absolute", top: -2, right: -2, width: 12, height: 12, background: "#f44336", borderRadius: "50%", border: "2px solid #fff", animation: "pulse 1.5s infinite"}} />}
                    </div>
                    <div style={{flex:1}}>
                      <div style={{display: "flex", alignItems: "center", gap: 8}}>
                        <div style={{fontWeight:600,fontSize:16}}>
                          {s.teacher._id === (JSON.parse(localStorage.getItem("user") || "{}").id || JSON.parse(localStorage.getItem("user") || "{}")._id) 
                            ? `Teaching ${s.student?.name || 'Student'}` 
                            : `Learning from ${s.teacher?.name || 'Teacher'}`}
                          <span style={{fontSize: 12, fontWeight: 400, color: "var(--mid)", marginLeft: 8}}>
                            (Student: {s.student?.name || 'Me'})
                          </span>
                        </div>
                        <span style={{fontSize: 10, background: "var(--sand)", padding: "2px 8px", borderRadius: 100, fontWeight: 700, color: "var(--mid)", letterSpacing: "0.03em", textTransform: "uppercase"}}>Virtual Meeting</span>
                      </div>
                      <div style={{fontSize:13,color:"var(--terracotta)",fontWeight:500,marginTop:2}}>{s.skill}</div>
                    </div>
                    <div style={{textAlign:"right"}}>
                      <div style={{fontSize:14,fontWeight:600,color:"var(--charcoal)"}}>{s.date} · {s.time}</div>
                      <div style={{marginTop:8,display:"flex",gap:12,justifyContent:"flex-end",alignItems:"center"}}>
                        <button 
                          className="btn btn-sm" 
                          style={{
                            background: stat.status === 'live' ? "#E8F5E9" : stat.status === 'upcoming' ? "var(--sand)" : "var(--warm-white)",
                            color: stat.color, border: "none", fontSize: 11, padding: "6px 14px", 
                            fontWeight: 700, textTransform: "uppercase", display: "flex", alignItems: "center", gap: 6,
                            boxShadow: stat.status === 'live' ? "0 4px 12px rgba(46, 125, 50, 0.2)" : "none"
                          }}
                          disabled={stat.disabled}
                          onClick={() => goTo("session-room", s.meetingId)}
                        >
                          {stat.status === 'live' ? <span>🔴 {stat.label}</span> : <span>📅 {stat.label}</span>}
                        </button>
                        <button 
                          className="btn btn-ghost btn-sm" 
                          style={{color:"var(--mid)",fontSize:11,padding: "6px 0", display: "flex", alignItems: "center", gap: 4}}
                          onClick={() => {
                            navigator.clipboard.writeText(s.meetingLink);
                            addToast("Meeting link copied!", "success", "📋");
                          }}
                        >
                          <span>🔗</span> Copy Link
                        </button>
                        {s.teacher._id !== (JSON.parse(localStorage.getItem("user") || "{}").id || JSON.parse(localStorage.getItem("user") || "{}")._id) && (stat.status === 'done' || stat.status === 'live') && (
                          <button className="btn btn-primary btn-sm" style={{fontSize: 11, padding: "6px 14px"}} onClick={()=>{setSessionToRate(s);setShowRating(true);}}>⭐ Rate Session</button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{textAlign:"center",padding:40,color:"var(--mid)",fontSize:15}}>No sessions booked yet. Start connecting!</div>
          )}
        </div>
      </div>
      {showRating && <RatingModal session={sessionToRate} onClose={()=>{setShowRating(false);fetchSessions();}} addToast={addToast}/>}
      {showConfirmation && (
        <BookingConfirmationModal 
          session={lastBookedSession} 
          onClose={() => setShowConfirmation(false)} 
          addToast={addToast} 
        />
      )}
    </DashLayout>
  );
}

function BookingConfirmationModal({ session, onClose, addToast }) {
  const link = session?.meetingLink;
  const studentName = session?.student?.name || "you";
  const teacherName = session?.teacher?.name || "your mentor";

  const copyToClipboard = () => {
    navigator.clipboard.writeText(link);
    addToast("Link copied to clipboard!", "success", "📋");
  };

  return (
    <div className="modal-overlay" style={{position:"fixed",top:0,left:0,right:0,bottom:0,background:"rgba(0,0,0,0.5)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000}}>
      <div style={{background:"#fff",padding:32,borderRadius:24,width:450,maxWidth:"95%",boxShadow:"0 20px 60px rgba(0,0,0,0.2)", textAlign: "center"}}>
        <div style={{fontSize:48, marginBottom: 16}}>🎉</div>
        <h3 style={{fontFamily:"var(--font-display)",fontSize:24,marginBottom:8}}>Session Booked!</h3>
        <p style={{fontSize:15,color:"var(--charcoal)",fontWeight:600,marginBottom:4}}>Booked for: {studentName}</p>
        <p style={{fontSize:14,color:"var(--mid)",marginBottom:24}}>With: {teacherName}</p>
        <p style={{fontSize:14,color:"var(--mid)",marginBottom:24}}>Your doubt clearing session on <strong>{session?.date}</strong> at <strong>{session?.time}</strong> has been scheduled.</p>
        
        <div style={{background: "var(--cream)", padding: "16px", borderRadius: "12px", border: "1px dashed var(--border)", marginBottom: 24, wordBreak: "break-all"}}>
           <div style={{fontSize: 12, color: "var(--light-mid)", marginBottom: 8, fontWeight: 600, textTransform: "uppercase"}}>Virtual Meeting Room</div>
           <div style={{fontSize: 14, fontWeight: 500, color: "var(--terracotta)"}}>{link}</div>
        </div>

        <div style={{display:"flex",gap:12}}>
          <button className="btn btn-secondary" style={{flex:1}} onClick={copyToClipboard}>📋 Copy Link</button>
          <button className="btn btn-primary" style={{flex:1}} onClick={onClose}>Done</button>
        </div>
      </div>
    </div>
  );
}

function RatingModal({ session, onClose, addToast }) {
  const [rating, setRating] = useState(5);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/rate-teacher`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({
          teacherId: session.teacher._id,
          sessionId: session._id,
          rating,
          text
        })
      });
      if (!res.ok) throw new Error("Failed to submit rating");
      addToast("Thank you for your feedback!", "success", "⭐");
      onClose();
    } catch (err) {
      addToast(err.message, "error", "❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" style={{position:"fixed",top:0,left:0,right:0,bottom:0,background:"rgba(0,0,0,0.5)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000}}>
      <div style={{background:"#fff",padding:32,borderRadius:20,width:400,maxWidth:"90%",boxShadow:"0 20px 40px rgba(0,0,0,0.2)"}}>
        <h3 style={{fontFamily:"var(--font-display)",fontSize:22,marginBottom:12}}>Rate your session</h3>
        <p style={{fontSize:14,color:"var(--mid)",marginBottom:24}}>How was your learning experience with {session.teacher.name}?</p>
        
        <div style={{display:"flex",gap:8,justifyContent:"center",fontSize:32,marginBottom:24,cursor:"pointer"}}>
          {[1,2,3,4,5].map(v => (
            <span key={v} onClick={()=>setRating(v)} style={{color:v <= rating ? "var(--amber)" : "var(--border)"}}>★</span>
          ))}
        </div>

        <div className="field" style={{marginBottom:24}}>
          <label>Any feedback? (Optional)</label>
          <textarea placeholder="Tell others how it went..." value={text} onChange={e=>setText(e.target.value)} style={{width:"100%",padding:12,borderRadius:12,border:"1px solid var(--border)",height:100,resize:"none"}}/>
        </div>

        <div style={{display:"flex",gap:12}}>
          <button className="btn btn-secondary" style={{flex:1}} onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" style={{flex:1}} onClick={submit} disabled={loading}>{loading ? "Saving..." : "Submit Rating"}</button>
        </div>
      </div>
    </div>
  );
}


// ─── RESOURCES ────────────────────────────────────────────────────────────────
function ResourceForm({ onAdded, addToast }) {
  const [form, setForm] = useState({ title: "", skill: "", type: "pdf", url: "", pages: "", words: "" });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState("file");

  const submit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.skill) return addToast("Title and skill required", "info", "⚠️");
    setLoading(true);
    try {
      let finalUrl = form.url;
      if (mode === "file" && file) {
        const formData = new FormData();
        formData.append("file", file);
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_URL}/upload`, {
          method: "POST", headers: { "Authorization": `Bearer ${token}` },
          body: formData
        });
        if (!res.ok) throw new Error("Upload failed");
        const data = await res.json();
        finalUrl = data.url;
      }
      if (!finalUrl) throw new Error("Please provide a file or URL");

      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/add-resource`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ ...form, url: finalUrl })
      });
      if (!res.ok) throw new Error("Failed to save resource");
      addToast("Resource shared!", "success", "✅");
      setForm({ title: "", skill: "", type: "pdf", url: "", pages: "", words: "" });
      setFile(null);
      onAdded();
    } catch (err) {
      addToast(err.message, "error", "❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{background:"#fff",borderRadius:"var(--radius-lg)",padding:32,border:"1px solid var(--border)",marginBottom:32}}>
      <h3 style={{fontFamily:"var(--font-display)",fontSize:22,marginBottom:20}}>Share a resource</h3>
      <div style={{display:"flex",gap:12,marginBottom:20}}>
        {["file","url"].map(m=>(
          <button key={m} className={`btn btn-sm ${mode===m?"btn-primary":"btn-secondary"}`} onClick={()=>setMode(m)}>{m==="file"?"📁 Upload File":"🔗 Link URL"}</button>
        ))}
      </div>
      <form onSubmit={submit} style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
        <div className="field" style={{gridColumn:"1/-1"}}><label>Title</label><input placeholder="e.g. React Patterns Guide" value={form.title} onChange={e=>setForm({...form,title:e.target.value})}/></div>
        <div className="field"><label>Type</label>
          <select value={form.type} onChange={e=>setForm({...form,type:e.target.value})}>
            <option value="pdf">PDF Document</option>
            <option value="video">Video Lesson</option>
            <option value="notes">Study Notes</option>
          </select>
        </div>
        <div className="field"><label>Skill</label><input placeholder="e.g. React, Python" value={form.skill} onChange={e=>setForm({...form,skill:e.target.value})}/></div>
        <div className="field">
          {mode==="file" ? (
            <><label>File</label><input type="file" onChange={e=>setFile(e.target.files[0])}/></>
          ) : (
            <><label>URL</label><input placeholder="https://..." value={form.url} onChange={e=>setForm({...form,url:e.target.value})}/></>
          )}
        </div>
        <div className="field">
          {form.type==="pdf" ? (
            <><label>Pages (optional)</label><input placeholder="e.g. 12 pages" value={form.pages} onChange={e=>setForm({...form,pages:e.target.value})}/></>
          ) : (
            <><label>Words/Duration (optional)</label><input placeholder="e.g. 500 words" value={form.words} onChange={e=>setForm({...form,words:e.target.value})}/></>
          )}
        </div>
        <button className="btn btn-primary" style={{gridColumn:"1/-1",justifyContent:"center"}} disabled={loading}>{loading?"Uploading...":"Share Resource →"}</button>
      </form>
    </div>
  );
}

function Resources({ setPage, addToast }) {
  const [filter, setFilter] = useState("All");
  const [resources, setResources] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const types = ["All","Video","PDF","Notes"];
  const typeEmoji = {video:"🎥",pdf:"📄",notes:"📝"};

  const fetchResources = () => {
    const token = localStorage.getItem("token");
    fetch(`${API_URL}/resources`, {
      headers: { "Authorization": `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => { setResources(data); setLoading(false); })
      .catch(err => { console.error(err); setLoading(false); });
  };

  useEffect(() => { fetchResources(); }, []);

  const filtered = filter==="All" ? resources : resources.filter(r=>r.type===filter.toLowerCase());

  return (
    <DashLayout page="resources" setPage={setPage}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:24}}>
        <div>
          <div className="page-title">Resources</div>
          <div className="page-sub">Tutorials, guides, and notes shared by the community</div>
        </div>
        <button className="btn btn-primary btn-sm" onClick={()=>setShowForm(!showForm)}>{showForm ? "Cancel" : "+ Upload resource"}</button>
      </div>

      {showForm && <ResourceForm onAdded={()=>{fetchResources(); setShowForm(false);}} addToast={addToast}/>}

      <div className="filter-row" style={{marginBottom:28}}>
        {types.map(t=><button key={t} className={`filter-chip ${filter===t?"active":""}`} onClick={()=>setFilter(t)}>{t}</button>)}
      </div>

      {loading ? (
        <div style={{textAlign:"center",padding:40,color:"var(--mid)"}}>Loading resources...</div>
      ) : filtered.length > 0 ? (
        <div className="resource-grid">
          {filtered.map(r=>(
            <div key={r.id} className="resource-card" onClick={()=>window.open(r.url, "_blank")}>
              <div className="resource-thumb">{r.emoji}</div>
              <div className={`resource-type type-${r.type}`}>{typeEmoji[r.type]} {r.type.toUpperCase()}</div>
              <div className="resource-title">{r.title}</div>
              <div className="resource-by">by {r.by} · {r.skill}</div>
              <div style={{fontSize:12,color:"var(--light-mid)",marginTop:6}}>{r.pages || r.words || r.duration || "View resource"}</div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{textAlign:"center",padding:60,background:"var(--warm-white)",borderRadius:"var(--radius-lg)",border:"1px dashed var(--border)"}}>
          <div style={{fontSize:40,marginBottom:16}}>📚</div>
          <div style={{fontFamily:"var(--font-display)",fontSize:20,fontWeight:600}}>No resources found</div>
          <p style={{color:"var(--mid)",marginTop:8}}>Be the first to share a guide or tutorial with the community!</p>
        </div>
      )}
    </DashLayout>
  );
}

// ─── MY PROFILE ───────────────────────────────────────────────────────────────
function MyProfile({ user, setPage }) {
  const [showResume, setShowResume] = useState(false);
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
          <div className="rating-display" style={{marginTop:12}}>
            {((user?.sessions||0) + (user?.attendCount||0)) > 0 ? (
              <>
                <span style={{color:"var(--amber)"}}>{"★".repeat(Math.floor(user?.rating || 5))}</span>
                <span style={{fontWeight:600,marginLeft:4}}>{(user?.rating || 5).toFixed(1)}</span>
                <span style={{color:"var(--mid)",fontSize:13,marginLeft:4}}>({(user?.sessions||0) + (user?.attendCount||0)} total sessions)</span>
              </>
            ) : (
              <span style={{color:"var(--mid)",fontSize:13,fontStyle:"italic"}}>No sessions completed yet</span>
            )}
          </div>
          <div style={{display:"flex",gap:12,marginTop:16}}>
            <button className="btn btn-secondary btn-sm" onClick={()=>setPage("setup")}>✏️ Edit profile</button>
            <button className="btn btn-sage btn-sm" onClick={() => setShowResume(true)}>📝 Export to Resume</button>
          </div>
        </div>

        {/* Badges Section */}
        <div style={{background:"#fff",borderRadius:"var(--radius)",padding:24,border:"1px solid var(--border)",marginTop:24}}>
          <div style={{fontWeight:600,fontSize:18,marginBottom:16,display:"flex",alignItems:"center",gap:8}}>
            <span>🏆</span> Your Badges ({user?.badges?.length || 0})
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill, minmax(150px, 1fr))",gap:16}}>
            {(user?.badges || []).map((b,i)=>(
              <div key={i} className="badge-card" style={{
                padding:16, borderRadius:16, background:"var(--warm-white)", border:"1px solid var(--border-light)", textAlign:"center",
                display:"flex", flexDirection:"column", alignItems:"center", gap:8, position: "relative"
              }} title={b.description}>
                <div style={{fontSize:32}}>{b.icon}</div>
                <div style={{fontWeight:700, fontSize:14}}>{b.name}</div>
                <div style={{fontSize:11, color:"var(--mid)"}}>{b.category}</div>
                <div className="badge-tooltip" style={{
                  position: "absolute", bottom: "100%", left: "50%", transform: "translateX(-50%)",
                  background: "#333", color: "#fff", padding: "8px 12px", borderRadius: 8, fontSize: 11,
                  width: 180, pointerEvents: "none", opacity: 0, transition: "opacity 0.2s", marginBottom: 10, zIndex: 10
                }}>{b.description}</div>
              </div>
            ))}
            {(!user?.badges || user.badges.length === 0) && (
              <div style={{gridColumn:"1/-1", padding: 20, textAlign: "center", color: "var(--mid)", fontSize: 14, border: "1px dashed var(--border)", borderRadius: 12}}>
                Complete your first session to earn a badge! 🌱
              </div>
            )}
          </div>
        </div>

        {/* Progress to Next Achievement */}
        <div style={{background:"#fff",borderRadius:"var(--radius)",padding:24,border:"1px solid var(--border)",marginTop:24}}>
          <div style={{fontWeight:600,fontSize:16,marginBottom:12,display:"flex",justifyContent:"space-between"}}>
            <span>Next Achievement Progress</span>
            <span style={{fontSize:12, color:"var(--sage)", fontWeight:700}}>
              {((user?.sessions||0) + (user?.attendCount||0)) < 5 ? "Active Learner" : "Expert"}
            </span>
          </div>
          {(() => {
            const total = (user?.sessions||0) + (user?.attendCount||0);
            let target = total < 5 ? 5 : 10;
            let percent = Math.min((total / target) * 100, 100);
            return (
              <>
                <div style={{width:"100%",height:10,background:"var(--border-light)",borderRadius:10,overflow:"hidden"}}>
                  <div style={{width:`${percent}%`,height:"100%",background:"var(--sage)",transition:"width 0.6s ease"}}/>
                </div>
                <div style={{fontSize:11, color:"var(--mid)", marginTop:8, textAlign:"right"}}>
                  {total} / {target} sessions completed
                </div>
              </>
            )
          })()}
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
        {showResume && <ResumeModal user={user} onClose={() => setShowResume(false)} />}
      </DashLayout>
    );
  }

// ─── RATING MODAL (Old Placeholder Removed) ──────────────────────────────────

// ─── VIDEO LEARNING ───────────────────────────────────────────────────────────
const getYoutubeEmbed = (url) => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : null;
};

function VideoPlayer({ url }) {
  const embed = getYoutubeEmbed(url);
  if (embed) {
    return (
      <iframe 
        style={{width:"100%",aspectRatio:"16/9",border:"none",background:"#000"}} 
        src={`${embed}?rel=0&autoplay=0&mute=0`} 
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
        allowFullScreen
        title="Video Player"
      ></iframe>
    );
  }
  return <video key={url} controls crossOrigin="anonymous" playsInline style={{width:"100%",aspectRatio:"16/9",background:"#000"}} src={url} />;
}

function VideoForm({ onVideoAdded, addToast }) {
  const [form, setForm] = useState({ title: "", skill: "", videoUrl: "" });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadMode, setUploadMode] = useState("file"); // "file" or "url"

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.skill) return addToast("Please fill title and skill", "info", "⚠️");
    
    setLoading(true);
    try {
      let videoUrl = form.videoUrl;

      // If in file mode, upload the file first
      if (uploadMode === "file" && file) {
        const formData = new FormData();
        formData.append("file", file);
        
        const token = localStorage.getItem("token");
        const uploadRes = await fetch(`${API_URL}/upload`, {
          method: "POST",
          headers: { "Authorization": `Bearer ${token}` },
          body: formData
        });
        
        if (!uploadRes.ok) throw new Error("File upload failed");
        const uploadData = await uploadRes.json();
        videoUrl = uploadData.url;
      }

      if (!videoUrl) return addToast("Please provide a video file or URL", "info", "⚠️");

      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/add-video`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ ...form, videoUrl })
      });
      if (!res.ok) throw new Error("Failed to add video");
      addToast("Video shared successfully!", "success", "🎥");
      setForm({ title: "", skill: "", videoUrl: "" });
      setFile(null);
      onVideoAdded();
    } catch (err) {
      addToast(err.message, "error", "❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="video-form-card">
      <h3 style={{ fontFamily: "var(--font-display)", fontSize: "22px", marginBottom: "20px" }}>Share a learning video</h3>
      
      <div style={{ display: "flex", gap: "12px", marginBottom: "20px" }}>
        <button 
          className={`btn btn-sm ${uploadMode === "file" ? "btn-primary" : "btn-secondary"}`}
          onClick={() => setUploadMode("file")}
        >
          📁 Upload File
        </button>
        <button 
          className={`btn btn-sm ${uploadMode === "url" ? "btn-primary" : "btn-secondary"}`}
          onClick={() => setUploadMode("url")}
        >
          🔗 Link URL
        </button>
      </div>

      <form onSubmit={handleSubmit} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
        <div className="field" style={{ gridColumn: "1 / -1" }}>
          <label>Video Title</label>
          <input placeholder="e.g. Master React Hooks in 10 minutes" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
        </div>
        <div className="field">
          <label>Skill / Category</label>
          <input placeholder="e.g. React, Python, UI Design" value={form.skill} onChange={e => setForm({ ...form, skill: e.target.value })} />
        </div>
        
        <div className="field">
          {uploadMode === "file" ? (
            <>
              <label>Choose Video File</label>
              <input type="file" accept="video/mp4,video/x-m4v,video/*" onChange={e => setFile(e.target.files[0])} />
            </>
          ) : (
            <>
              <label>Video URL (direct link)</label>
              <input placeholder="https://example.com/video.mp4" value={form.videoUrl} onChange={e => setForm({ ...form, videoUrl: e.target.value })} />
            </>
          )}
        </div>
        
        <button className="btn btn-primary" type="submit" disabled={loading} style={{ gridColumn: "1 / -1", justifyContent: "center" }}>
          {loading ? "Processing..." : "Share Video →"}
        </button>
      </form>
    </div>
  );
}

function VideoList({ videos, loading, filter, setFilter, onVideoDeleted, addToast, progress, onVideoWatched }) {
  const currentUserId = JSON.parse(localStorage.getItem("user") || "{}").id;
  const skills = ["All", ...new Set(videos.map(v => v.skill))];

  return (
    <div className="video-list-wrap">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
        <h3 style={{ fontFamily: "var(--font-display)", fontSize: "24px" }}>Community Videos</h3>
        <div className="filter-row">
          {skills.map(s => (
            <button key={s} className={`filter-chip ${filter === s ? "active" : ""}`} onClick={() => setFilter(s)}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "40px", color: "var(--mid)" }}>Loading videos...</div>
      ) : videos.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px", background: "#fff", borderRadius: "var(--radius-lg)", border: "1px dashed var(--border)" }}>
          <div style={{ fontSize: "40px", marginBottom: "16px" }}>📺</div>
          <p style={{ color: "var(--mid)" }}>No videos shared yet for this skill.</p>
        </div>
      ) : (
        <div className="video-grid">
          {videos.filter(v => filter === "All" || v.skill === filter).map(v => {
            const isCompleted = progress?.completedVideoIds?.includes(v._id);
            return (
              <div key={v._id} className="video-card">
                <div className="video-player-container">
                  <VideoPlayer url={v.videoUrl} />
                </div>
                <div className="video-content">
                  <div className="video-skill">{v.skill}</div>
                  <div className="video-title">{v.title}</div>
                  <div style={{ marginTop: "auto", display: "flex", gap: "8px", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginRight: "auto" }}>
                       <div style={{ fontSize: 13, fontWeight: 600 }}>By {v.uploadedBy?.name || "Global"}</div>
                    </div>
                    {!isCompleted ? (
                      <button className="btn btn-primary btn-sm" onClick={() => onVideoWatched(v._id, v.skill)}>✓ Watch</button>
                    ) : (
                      <span style={{ fontSize: 12, color: "var(--sage)", fontWeight: 700 }}>✅ WATCHED</span>
                    )}
                    {(v.uploadedBy?._id === currentUserId || v.uploadedBy === currentUserId) && (
                      <button className="btn btn-sm" style={{ background: "#FFEFEF", color: "#D32F2F" }} onClick={() => deleteVideo(v._id)}>🗑️</button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function SkillFeedbackModal({ skill, toUserId, onClose, addToast }) {
  const [rating, setRating] = useState(5);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/skill-feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ skill, toUserId, rating, text })
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Failed to submit");
      }
      addToast("Thanks for the detailed feedback!", "success", "📬");
      onClose();
    } catch (err) {
      addToast(err.message, "error", "❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" style={{position:"fixed",top:0,left:0,right:0,bottom:0,background:"rgba(0,0,0,0.5)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000}}>
      <div style={{background:"#fff",padding:40,borderRadius:24,width:450,maxWidth:"95%",boxShadow:"0 30px 60px rgba(0,0,0,0.2)"}}>
        <div style={{fontSize:40,marginBottom:16}}>🏆</div>
        <h3 style={{fontFamily:"var(--font-display)",fontSize:24,marginBottom:8}}>Skill Mastered!</h3>
        <p style={{fontSize:14,color:"var(--mid)",marginBottom:24}}>You've watched all videos for <b>{skill}</b>. How was the teacher's content?</p>
        
        <div style={{display:"flex",gap:10,justifyContent:"center",fontSize:36,marginBottom:32,cursor:"pointer"}}>
          {[1,2,3,4,5].map(v => (
            <span key={v} onClick={()=>setRating(v)} style={{color:v <= rating ? "#FFC107" : "#E0E0E0", transition: "transform 0.2s"}}>★</span>
          ))}
        </div>

        <div className="field" style={{marginBottom:24}}>
          <label>Detailed Feedback</label>
          <textarea placeholder="Was this course helpful? What could be improved?" value={text} onChange={e=>setText(e.target.value)} style={{width:"100%",padding:14,borderRadius:16,border:"1px solid var(--border)",height:120,resize:"none"}}/>
        </div>

        <div style={{display:"flex",gap:12}}>
          <button className="btn btn-secondary" style={{flex:1}} onClick={onClose}>Later</button>
          <button className="btn btn-primary" style={{flex:1}} onClick={submit} disabled={loading}>{loading ? "Sending..." : "Submit Review →"}</button>
        </div>
      </div>
    </div>
  );
}

function VideoLearning({ setPage, addToast }) {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [progress, setProgress] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);

  const fetchVideos = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/videos`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      setVideos(data);
      // Immediately scan for completion once videos are known
      const uniqueSkills = [...new Set(data.map(v => v.skill))];
      let finishedSkill = null;
      for (const s of uniqueSkills) {
        const r2 = await fetch(`${API_URL}/skill-progress/${s}`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        const d2 = await r2.json();
        if (d2.isCourseCompleted) { finishedSkill = s; break; }
      }
      setProgress(prev => ({ ...(prev||{}), autoFeedbackSkill: finishedSkill }));
    } catch (err) {
      addToast("Failed to load videos", "error", "❌");
    } finally {
      setLoading(false);
    }
  };

  const fetchProgress = async (skill) => {
    const token = localStorage.getItem("token");
    try {
      // Find which skills are finished
      const uniqueSkills = [...new Set(videos.map(v => v.skill))];
      let finishedSkill = null;
      for (const s of uniqueSkills) {
        const res = await fetch(`${API_URL}/skill-progress/${s}`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        const d = await res.json();
        if (d.isCourseCompleted) { finishedSkill = s; break; }
      }
      
      // Also fetch progress for current filter if not "All"
      if (skill !== "All") {
        const res = await fetch(`${API_URL}/skill-progress/${skill}`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        const d = await res.json();
        setProgress({ ...d, autoFeedbackSkill: finishedSkill });
      } else {
        setProgress({ totalVideos: 0, percent: 0, autoFeedbackSkill: finishedSkill });
      }
    } catch (err) {}
  };

  const onVideoWatched = async (videoId, skill) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/video-complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ videoId, skill })
      });
      if (res.ok) {
        addToast("Progress saved!", "success", "📖");
        fetchProgress(filter);
      }
    } catch (err) {}
  };

  useEffect(() => { fetchVideos(); }, []);
  useEffect(() => { fetchProgress(filter); }, [filter]);

  return (
    <DashLayout page="videos" setPage={setPage}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginBottom:32}}>
        <div>
          <div className="page-title">Learning Hub</div>
          <div className="page-sub">Watch skill-based content shared by your peers</div>
        </div>
        {progress && progress.totalVideos > 0 && (
          <div style={{textAlign:"right"}}>
            <div style={{fontSize:13,fontWeight:600,color:"var(--mid)",marginBottom:6}}>{progress.percent}% Completed</div>
            <div style={{width:200,height:8,background:"var(--border)",borderRadius:10,overflow:"hidden"}}>
              <div style={{width:`${progress.percent}%`,height:"100%",background:"var(--sage)",transition:"width 0.5s cubic-bezier(0.4, 0, 0.2, 1)"}}/>
            </div>
          </div>
        )}
      </div>

      {progress?.autoFeedbackSkill && (
        <div style={{background:"#F0FDF4",border:"1px solid #BBF7D0",borderRadius:16,padding:20,marginBottom:32,display:"flex",alignItems:"center",gap:20,animation:"slideDown 0.4s ease"}}>
          <div style={{fontSize:32}}>🎓</div>
          <div style={{flex:1}}>
            <div style={{fontWeight:700,color:"#166534"}}>Course Completed!</div>
            <div style={{fontSize:14,color:"#15803d"}}>You've mastered the <b>{progress.autoFeedbackSkill}</b> skill. Help the community by leaving feedback.</div>
          </div>
          <button className="btn btn-primary" onClick={() => setShowFeedback(true)}>Leave Feedback ⭐</button>
        </div>
      )}

      <VideoForm onVideoAdded={fetchVideos} addToast={addToast} />
      <VideoList 
        videos={videos} loading={loading} filter={filter} setFilter={setFilter} 
        onVideoDeleted={fetchVideos} addToast={addToast} 
        progress={progress} onVideoWatched={onVideoWatched}
      />
      
      {showFeedback && (
        <SkillFeedbackModal 
          skill={progress.autoFeedbackSkill} 
          toUserId={videos.find(v=>v.skill===progress.autoFeedbackSkill)?.uploadedBy?._id || videos.find(v=>v.skill===progress.autoFeedbackSkill)?.uploadedBy} 
          onClose={() => {setShowFeedback(false); fetchProgress(filter);}} 
          addToast={addToast}
        />
      )}
    </DashLayout>
  );
}

function SessionRoom({ setPage, meetingId, user }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!meetingId) return;
    fetch(`${API_URL}/session-details/${meetingId}`)
      .then(res => res.json())
      .then(data => {
        setSession(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [meetingId]);

  if (loading) return <DashLayout page="schedule" setPage={setPage}><div style={{padding: 40}}>Loading session details...</div></DashLayout>;
  if (!session) return <DashLayout page="schedule" setPage={setPage}><div style={{padding: 40}}>Session not found or link is invalid.</div></DashLayout>;

  const isTeacher = session.teacher?._id === (user?.id || user?._id);
  const partner = isTeacher ? session.student : session.teacher;

  return (
    <DashLayout page="schedule" setPage={setPage}>
      <div style={{maxHeight: "calc(100vh - 100px)", display: "flex", flexDirection: "column", gap: 24}}>
        <div style={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
           <button className="btn btn-ghost" style={{alignSelf: "flex-start"}} onClick={() => setPage("schedule")}>← Back to Schedule</button>
           <div style={{background: "#FFF0E8", color: "var(--terracotta)", padding: "4px 12px", borderRadius: 100, fontSize: 13, fontWeight: 700}}>
             ID: {meetingId.slice(0, 8)}
           </div>
        </div>
        <div style={{background: "#000", borderRadius: 24, flex: 1, position: "relative", minHeight: 400, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff"}}>
          <div style={{textAlign: "center"}}>
            <div style={{fontSize: 60, marginBottom: 20}}>🌍</div>
            <div style={{fontFamily: "var(--font-display)", fontSize: 32}}>Dummy Session Room</div>
            <p style={{color: "rgba(255,255,255,0.6)", marginTop: 8}}>Meeting with {partner?.name} · {session.date} at {session.time}</p>
            <div style={{marginTop: 24, background: "rgba(255,255,255,0.1)", padding: "12px 24px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.2)", maxWidth: 400, margin: "24px auto"}}>
               <div style={{fontSize: 13, opacity: 0.8}}>This is a dummy session room (no real video call integration yet). In a future update, this will integrate with Zoom or Google Meet.</div>
            </div>
          </div>
          <div style={{position: "absolute", bottom: 20, left: 20, background: "#D32F2F", padding: "8px 16px", borderRadius: 100, fontSize: 13}}>🔴 WAITING FOR VIDEO API</div>
        </div>
        <div style={{display: "grid", gridTemplateColumns: "1fr 300px", gap: 24}}>
          <div style={{background: "#fff", padding: 24, borderRadius: 20, border: "1px solid var(--border)"}}>
            <h4 style={{marginBottom: 12}}>Session Info</h4>
            <div style={{display: "flex", gap: 20}}>
               <div style={{flex: 1}}>
                  <div style={{fontSize: 12, color: "var(--light-mid)", fontWeight: 600, textTransform: "uppercase"}}>Subject</div>
                  <div style={{fontSize: 16, fontWeight: 600}}>{session.skill}</div>
               </div>
               <div style={{flex: 1}}>
                  <div style={{fontSize: 12, color: "var(--light-mid)", fontWeight: 600, textTransform: "uppercase"}}>Scheduled Time</div>
                  <div style={{fontSize: 16, fontWeight: 600}}>{session.date}, {session.time}</div>
               </div>
            </div>
            {isTeacher && <div style={{marginTop: 16, color: "var(--sage)", fontSize: 14}}>You are the <b>Mentor</b> for this session.</div>}
          </div>
          <div style={{background: "#fff", padding: 24, borderRadius: 20, border: "1px solid var(--border)"}}>
             <h4 style={{marginBottom: 12}}>Participants</h4>
             <div style={{display: "flex", gap: 10, alignItems: "center", marginBottom: 12}}>
               <div style={{width: 32, height: 32, borderRadius: 100, background: "var(--warm-white)", display: "flex", alignItems: "center", justifyContent: "center"}}>{user?.emoji}</div>
               <div style={{fontSize: 14, fontWeight: 600}}>{user?.name} (You)</div>
             </div>
             <div style={{display: "flex", gap: 10, alignItems: "center", marginBottom: 12}}>
               <div style={{width: 32, height: 32, borderRadius: 100, background: "var(--warm-white)", display: "flex", alignItems: "center", justifyContent: "center"}}>{partner?.emoji}</div>
               <div style={{fontSize: 14, fontWeight: 600}}>{partner?.name}</div>
             </div>
             <button className="btn btn-secondary btn-sm" style={{width: "100%", marginTop: 20}} onClick={() => setPage("schedule")}>Leave Room</button>
          </div>
        </div>
      </div>
    </DashLayout>
  );
}

// ─── APP ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState("landing");
  const [authed, setAuthed] = useState(false);
  const [hasSignedUp, setHasSignedUp] = useState(false);
  const [user, setUser] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [meetingId, setMeetingId] = useState(null);
  
  // Persist session across refreshes
  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    
    // Check if URL is a session link
    const path = window.location.pathname;
    if (path.startsWith("/session/")) {
      const id = path.split("/session/")[1];
      if (id) {
        setMeetingId(id);
        setPage("session-room");
      }
    }

    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
        setAuthed(true);
        setHasSignedUp(true);
        // Only go to dashboard if we aren't already on a session page
        if (!path.startsWith("/session/")) setPage("dashboard");
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
  const goTo = (p, mId = null) => {
    if (["dashboard","browse","messages","videos","schedule","resources","profile","setup","userprofile"].includes(p) && !authed) {
      setPage(hasSignedUp ? "login" : "signup");
      return;
    }
    if (mId) setMeetingId(mId);
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
      {page==="dashboard" && <Dashboard user={user} setPage={goTo} addToast={addToast}/>}
      {page==="browse" && <Browse setPage={goTo} setSelectedUser={setSelectedUser} addToast={addToast} user={user}/>}
      {page==="userprofile" && <UserProfile u={selectedUser} setPage={goTo} addToast={addToast}/>}
      {page === "messages" && <Messages setPage={goTo} selectedUser={selectedUser} user={user} />}
      {page==="schedule" && <Schedule setPage={goTo} addToast={addToast}/>}
      {page==="videos" && <VideoLearning setPage={goTo} addToast={addToast}/>}
      {page==="resources" && <Resources setPage={goTo} addToast={addToast}/>}
      {page==="profile" && <MyProfile user={user} setPage={goTo}/>}
      {page==="session-room" && <SessionRoom setPage={goTo} meetingId={meetingId} user={user} />}
      <Toast toasts={toasts}/>
    </div>
  );
}