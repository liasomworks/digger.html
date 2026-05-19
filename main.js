/* ===========================
   合同会社LIASOM works — main.js
   ネイビー × シルバー × ホワイト
=========================== */

'use strict';

// ============================================================
// ハンバーガーメニュー
// ============================================================
(function initHamburger() {
  const btn = document.getElementById('hamburger');
  const nav = document.getElementById('global-nav');
  if (!btn || !nav) return;

  btn.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');
    btn.setAttribute('aria-expanded', isOpen);

    // スパンをバツに変形
    const spans = btn.querySelectorAll('span');
    if (isOpen) {
      spans[0].style.transform = 'translateY(6.5px) rotate(45deg)';
      spans[1].style.opacity  = '0';
      spans[2].style.transform = 'translateY(-6.5px) rotate(-45deg)';
    } else {
      spans[0].style.transform = '';
      spans[1].style.opacity   = '';
      spans[2].style.transform = '';
    }
  });

  // ナビリンクをクリックしたら閉じる
  nav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      nav.classList.remove('open');
      btn.querySelectorAll('span').forEach(s => {
        s.style.transform = '';
        s.style.opacity   = '';
      });
    });
  });
})();


// ============================================================
// スクロール：ヘッダーシャドウ＆トップボタン
// ============================================================
(function initScrollBehavior() {
  const header  = document.getElementById('site-header');
  const backTop = document.getElementById('back-top');
  if (!header) return;

  window.addEventListener('scroll', () => {
    const y = window.scrollY;

    // ヘッダー影
    if (y > 20) {
      header.style.boxShadow = '0 4px 24px rgba(0,0,0,0.3)';
    } else {
      header.style.boxShadow = 'none';
    }

    // トップへ戻るボタン
    if (backTop) {
      if (y > 300) {
        backTop.classList.add('visible');
      } else {
        backTop.classList.remove('visible');
      }
    }
  }, { passive: true });

  // トップへスクロール
  if (backTop) {
    backTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
})();


// ============================================================
// スムーズスクロール（アンカーリンク）
// ============================================================
(function initSmoothScroll() {
  const HEADER_H = 70;
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const href = anchor.getAttribute('href');
      if (href === '#') return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - HEADER_H;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
})();


// ============================================================
// IntersectionObserver：fade-up アニメーション
// ============================================================
(function initFadeUp() {
  const items = document.querySelectorAll('.fade-up');
  if (!items.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // 少しずつ遅延して表示（兄弟要素に連続感を出す）
        const siblings = Array.from(entry.target.parentElement.querySelectorAll('.fade-up'));
        const idx = siblings.indexOf(entry.target);
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, idx * 80);
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  });

  items.forEach(el => observer.observe(el));
})();


// ============================================================
// 採用フィルター（地方別）
// ============================================================
(function initRecruitFilter() {
  const filterWrap = document.getElementById('recruit-filter');
  const grid       = document.getElementById('prefecture-grid');
  if (!filterWrap || !grid) return;

  const cards = Array.from(grid.querySelectorAll('.pref-card'));

  filterWrap.addEventListener('click', e => {
    const btn = e.target.closest('.filter-btn');
    if (!btn) return;

    // アクティブ切替
    filterWrap.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const region = btn.dataset.region;

    cards.forEach(card => {
      if (region === 'all' || card.dataset.region === region) {
        card.style.display = '';
        // 再アニメーション
        card.classList.remove('visible');
        requestAnimationFrame(() => {
          requestAnimationFrame(() => card.classList.add('visible'));
        });
      } else {
        card.style.display = 'none';
      }
    });
  });
})();


// ============================================================
// お問い合わせフォーム
// ============================================================
(function initContactForm() {
  const form    = document.getElementById('contact-form');
  const success = document.getElementById('form-success');
  const submitBtn = document.getElementById('submit-btn');
  if (!form) return;

  // バリデーションルール
  const rules = [
    {
      fieldId: 'f-name',
      errorId: 'e-name',
      validate: v => v.trim().length > 0
    },
    {
      fieldId: 'f-email',
      errorId: 'e-email',
      validate: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())
    },
    {
      fieldId: 'f-area',
      errorId: 'e-area',
      validate: v => v !== ''
    },
    {
      fieldId: 'f-type',
      errorId: 'e-type',
      validate: v => v !== ''
    },
    {
      fieldId: 'f-message',
      errorId: 'e-message',
      validate: v => v.trim().length > 0
    }
  ];

  // リアルタイムバリデーション
  rules.forEach(({ fieldId, errorId, validate }) => {
    const field = document.getElementById(fieldId);
    const error = document.getElementById(errorId);
    if (!field || !error) return;

    field.addEventListener('blur', () => {
      if (!validate(field.value)) {
        error.style.display = 'block';
        field.style.borderColor = '#c0392b';
      } else {
        error.style.display = 'none';
        field.style.borderColor = '';
      }
    });

    field.addEventListener('input', () => {
      if (validate(field.value)) {
        error.style.display = 'none';
        field.style.borderColor = '';
      }
    });
  });

  // 送信
  form.addEventListener('submit', async e => {
    e.preventDefault();

    // 全フィールドを検証
    let isValid = true;
    rules.forEach(({ fieldId, errorId, validate }) => {
      const field = document.getElementById(fieldId);
      const error = document.getElementById(errorId);
      if (!field || !error) return;

      if (!validate(field.value)) {
        error.style.display = 'block';
        field.style.borderColor = '#c0392b';
        isValid = false;
      } else {
        error.style.display = 'none';
        field.style.borderColor = '';
      }
    });

    if (!isValid) return;

    // ボタン非活性化（二重送信防止）
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin" style="margin-right:8px;"></i>送信中...';

    const payload = {
      name:    document.getElementById('f-name').value.trim(),
      email:   document.getElementById('f-email').value.trim(),
      phone:   document.getElementById('f-phone').value.trim(),
      area:    document.getElementById('f-area').value,
      type:    document.getElementById('f-type').value,
      message: document.getElementById('f-message').value.trim(),
      site:    'LIASOM works',
      sent_at: new Date().toISOString()
    };

    try {
      await fetch('tables/liasom_contacts', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload)
      });
    } catch (err) {
      console.warn('送信エラー（無視）:', err);
    }

    // 完了表示
    form.style.display = 'none';
    if (success) success.style.display = 'block';
  });
})();


// ============================================================
// ヒーロータイトル タイピングアニメーション（任意）
// ============================================================
(function initHeroEntrance() {
  // ヒーロー要素を順番にフェードイン
  const targets = [
    '.hero-eyebrow',
    '.hero-title',
    '.hero-desc',
    '.hero-btns',
    '.hero-stats',
    '.hero-cards'
  ];

  targets.forEach((sel, i) => {
    const el = document.querySelector(sel);
    if (!el) return;
    el.style.opacity   = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = `opacity 0.65s ease ${i * 0.12}s, transform 0.65s ease ${i * 0.12}s`;

    // ページロード後に開始
    window.addEventListener('load', () => {
      requestAnimationFrame(() => {
        el.style.opacity   = '1';
        el.style.transform = 'translateY(0)';
      });
    }, { once: true });
  });
})();
