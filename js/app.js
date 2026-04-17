// Core Application State & Functions Exposed Globally for GitHub/Cloudflare Compatibility
const sections = document.querySelectorAll('.section, #home');
const navLinks = document.querySelectorAll('.nav-links a');
const header = document.getElementById('main-header');

// Global rule: ensure only one video plays at a time
    document.addEventListener('play', function(e) {
        if(e.target && e.target.nodeName === 'VIDEO') {
            const allVideos = document.querySelectorAll('video');
            allVideos.forEach(v => {
                if(v !== e.target && !v.paused) {
                    v.pause();
                }
            });
        }
    }, true);

    // Data State Management
    let APP_DATA = JSON.parse(localStorage.getItem('amanecer_data')) || INITIAL_DATA;
    // Force sync the static team array so that removed members (like Tomioka/Vert) update automatically
    if (APP_DATA && INITIAL_DATA) {
        APP_DATA.team = INITIAL_DATA.team;
        localStorage.setItem('amanecer_data', JSON.stringify(APP_DATA));
    }
    
    // Auto-migrate old data versions
    if (APP_DATA) {
        const hasOldPaths = APP_DATA.squads && APP_DATA.squads[0].logo && !APP_DATA.squads[0].logo.startsWith('images/');
        const hasOldTournamentData = APP_DATA.tournaments && (APP_DATA.tournaments.length < 9 || APP_DATA.tournaments.some(t => 
            (t.format === 'bracket' && t.data && t.data.round1 !== undefined) || 
            (t.id === 'verano-2026' && t.status === 'live') ||
            (!t.image)
        ));
        const hasOldTeamData = !APP_DATA.team[0] || !APP_DATA.team[0].photo || !APP_DATA.team[0].bio || !APP_DATA.team.some(m => m.name === 'Akaza');
        const hasOldSquadsData = !APP_DATA.squads || APP_DATA.squads[0].roster.starters[0].name === "Jugador 1" || (APP_DATA.squads[0].roster.starters[2].photo && APP_DATA.squads[0].roster.starters[2].photo.includes('..')) || (APP_DATA.squads.length > 1 && APP_DATA.squads[1].roster.starters[0].name === "Por Definir") || !APP_DATA.squads[0].roster.managers || (APP_DATA.squads.length > 1 && !APP_DATA.squads[1].roster.managers);
        const hasOldBranding = APP_DATA.organization.name !== 'Amanecer Gaming';
        const hasAllStarsOctavos = APP_DATA.tournaments.some(t => t.id === 'liga-amanecer-all-stars' && t.data.octavos !== undefined);
        const isMissingThaiAmanecer = APP_DATA.squads && APP_DATA.squads[0] && APP_DATA.squads[0].roster.starters && !APP_DATA.squads[0].roster.starters.some(s => s.name === "Thai");
        
        if (hasOldPaths || hasOldTournamentData || hasOldTeamData || hasOldSquadsData || hasOldBranding || hasAllStarsOctavos || isMissingThaiAmanecer) {
            APP_DATA = INITIAL_DATA;
            localStorage.setItem('amanecer_data', JSON.stringify(APP_DATA));
            localStorage.setItem('amanecer_data_v', '7.0'); // Bump version to 7.0
        }
    }
    
    let currentLang = localStorage.getItem('amanecer_lang') || 'es';
    
    function t(key) {
        return TRANSLATIONS[currentLang][key] || key;
    }

    function updateStaticTranslations() {
        document.querySelectorAll('[data-t]').forEach(el => {
            const key = el.getAttribute('data-t');
            el.innerHTML = t(key);
        });
        document.documentElement.lang = currentLang;
    }

    function changeLanguage(lang) {
        currentLang = lang;
        localStorage.setItem('amanecer_lang', lang);
        
        // Update active class on buttons
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.classList.toggle('active', btn.id === `lang-${lang}`);
        });

        updateStaticTranslations();
        renderAll();
    }

    // Set up language button listeners
    const langEsBtn = document.getElementById('lang-es');
    const langPtBtn = document.getElementById('lang-pt');
    if (langEsBtn) langEsBtn.onclick = () => changeLanguage('es');
    if (langPtBtn) langPtBtn.onclick = () => changeLanguage('pt');

    // Initial translation run
    updateStaticTranslations();

    // Nexus Master Cloud Engine (Amanecer Gaming Key)
    const MASTER_CONFIG = {
        apiKey: "AIzaSyAbAf4s0d43gqq4Hcz4Mb57eZm-YQNk3ik",
        authDomain: "amanecer-gaming.firebaseapp.com",
        databaseURL: "https://amanecer-gaming-default-rtdb.firebaseio.com",
        projectId: "amanecer-gaming",
        storageBucket: "amanecer-gaming.firebasestorage.app",
        messagingSenderId: "777879623088",
        appId: "1:777879623088:web:bbfe23eea1fa735f7a7275",
        measurementId: "G-02E706S4L9"
    };

    let db = null;
    let FIREBASE_CONFIG = JSON.parse(localStorage.getItem('amanecer_firebase_config')) || MASTER_CONFIG;

    function initFirebase() {
        if (FIREBASE_CONFIG && !db) {
            try {
                if (firebase.apps.length === 0) {
                    firebase.initializeApp(FIREBASE_CONFIG);
                }
                db = firebase.firestore();
                console.log("Nexus: Global Cloud Connection Active.");
                syncFromCloud();
            } catch (e) { 
                console.error("Nexus Sync Error:", e); 
            }
        }
    }
    initFirebase();

    function syncFromCloud() {
        if (!db) return;
        
        console.log("Nexus Architect: Monitorizando flujo de datos en tiempo real...");
        
        // App Data Sync with Conflict Protection
        db.collection('settings').doc('app_data').onSnapshot((doc) => {
            if (doc.exists) {
                const cloudData = doc.data().data;
                
                // Si el Admin está escribiendo (syncTimer activo), ignoramos la bajada de datos para evitar rebotes
                if (syncTimer) return;

                const oldSocial = JSON.stringify(APP_DATA.organization.communityInfo.socialData);
                const newSocial = JSON.stringify(cloudData.organization?.communityInfo?.socialData || {});
                
                // Merge solo los datos dinámicos (torneos y redes sociales) para no sobrescribir las rutas de las imágenes locales
                const updatedAppData = JSON.parse(JSON.stringify(INITIAL_DATA));
                if (cloudData.tournaments) {
                    updatedAppData.tournaments = updatedAppData.tournaments.map(localT => {
                        const cloudT = cloudData.tournaments.find(t => t.id === localT.id);
                        if (cloudT) {
                            localT.data = cloudT.data;
                            if (cloudT.status) localT.status = cloudT.status;
                        }
                        return localT;
                    });
                }
                if (cloudData.organization && cloudData.organization.communityInfo && cloudData.organization.communityInfo.socialData) {
                    updatedAppData.organization.communityInfo.socialData = cloudData.organization.communityInfo.socialData;
                }
                
                APP_DATA = updatedAppData;
                localStorage.setItem('amanecer_data', JSON.stringify(APP_DATA));

                if (oldSocial !== newSocial) {
                    updateSocialStatsUI();
                } else {
                    renderAll();
                }
            }
        }, (error) => console.error("Cloud Flow Disrupted:", error));

        // Restore Users Sync
        db.collection('settings').doc('users').onSnapshot((doc) => {
            if (doc.exists && doc.data().list) {
                const newList = doc.data().list;
                if (JSON.stringify(registeredUsers) !== JSON.stringify(newList)) {
                    registeredUsers = newList;
                    localStorage.setItem('amanecer_users_db', JSON.stringify(registeredUsers));
                    updateAuthState();
                    
                    const tbody = document.getElementById('user-list-body');
                    if (tbody) {
                        tbody.innerHTML = registeredUsers.map(u => `
                            <tr>
                                <td style="padding: 10px; border-bottom: 1px solid var(--glass-border);">${u.username}</td>
                                <td style="padding: 10px; border-bottom: 1px solid var(--glass-border);">${u.email}</td>
                                <td style="padding: 10px; border-bottom: 1px solid var(--glass-border); color: #00ff88;">Verificado</td>
                            </tr>
                        `).join('');
                    }
                }
            }
        });
    }

    function updateSocialStatsUI() {
        const socialData = getSocialData();
        Object.keys(socialData).forEach(key => {
            const countEl = document.getElementById(`count-${key}`);
            if (countEl) {
                const newVal = formatCount(socialData[key].count);
                if (countEl.innerText !== newVal) {
                    countEl.innerText = newVal;
                    countEl.classList.add('inc-update');
                    setTimeout(() => countEl.classList.remove('inc-update'), 1000);
                }
            }
        });
    }

    function formatCount(num) {
        if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
        return num.toString();
    }

    async function syncToCloud() {
        if (!db) return;
        try {
            await db.collection('settings').doc('app_data').set({ data: APP_DATA });
            await db.collection('settings').doc('users').set({ list: registeredUsers });
            console.log("Nexus: Cloud Upload Inbound Successful.");
        } catch (e) { 
            console.error("Nexus Cloud Error:", e);
            if (e.code === 'permission-denied') {
                alert("❌ ERROR DE PERMISOS: Revisa que las Reglas de Firebase Firestore permitan lectura/escritura.");
            } else if (e.code === 'unavailable') {
                alert("❌ NUBE NO DISPONIBLE: Revisa los dominios autorizados en Firebase (Agrega tu Netlify URL).");
            } else {
                alert("⚠️ FALLO DE NUBE: " + e.message);
            }
        }
    }
    window.syncToCloud = syncToCloud;

    let syncTimer = null;
    function saveData() {
        localStorage.setItem('amanecer_data', JSON.stringify(APP_DATA));
        
        // Debounce Logic: Wait for inactivity before uploading to Cloud
        if (syncTimer) clearTimeout(syncTimer);
        
        syncTimer = setTimeout(() => {
            if (db) syncToCloud();
            renderAll();
            syncTimer = null; // Reset lock
        }, 1200); // 1.2s delay for stability
    }

    // Authentication State
    let currentUser = JSON.parse(localStorage.getItem('amanecer_user')) || null;
    let registeredUsers = JSON.parse(localStorage.getItem('amanecer_users_db')) || [];

    const GMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;

    function updateAuthState() {
        const accountBtn = document.getElementById('account-btn');
        const adminBtn = document.getElementById('admin-btn');
        const heroBtns = document.querySelector('.hero-btns');
        
        if (currentUser) {
            const isAdmin = currentUser.email === 'admin@gmail.com' || currentUser.username === 'admin';
            if (adminBtn) adminBtn.style.display = isAdmin ? 'inline-block' : 'none';
            accountBtn.innerHTML = `<i class="fas fa-user-circle"></i> ${t('my_account')} (${currentUser.username})`;
            accountBtn.onclick = () => {
                showUserDashboard();
            };
            if(heroBtns) heroBtns.style.display = 'none';
        } else {
            if (adminBtn) adminBtn.style.display = 'none';
            accountBtn.innerHTML = `<i class="fas fa-user-circle"></i> ${t('account')}`;
            accountBtn.onclick = () => showModal('login');
            if(heroBtns) heroBtns.style.display = 'flex';
        }
    }

    if(document.getElementById('admin-btn')) {
        document.getElementById('admin-btn').onclick = () => {
            navLinks.forEach(l => l.classList.remove('active'));
            sections.forEach(sec => {
                sec.classList.remove('active-section');
                if (sec.id === 'admin') {
                    sec.classList.add('active-section');
                    renderAdminPanel();
                }
            });
        };
    }

    // Modal Logic
    const loginModal = document.getElementById('login-modal');
    const loginView = document.getElementById('login-view');
    const registerView = document.getElementById('register-view');
    const verificationView = document.getElementById('verification-view');
    const closeBtn = document.querySelector('.close');

    let tempRegistrationUser = null;
    let expectedVerificationCode = null;

    function showModal(view = 'login') {
        loginModal.style.display = 'flex';
        loginView.style.display = 'none';
        registerView.style.display = 'none';
        if(verificationView) verificationView.style.display = 'none';

        if (view === 'login') {
            loginView.style.display = 'block';
        } else if (view === 'verification') {
            if(verificationView) verificationView.style.display = 'block';
        } else {
            registerView.style.display = 'block';
        }
    }
    window.showModal = showModal;

    if(closeBtn) closeBtn.onclick = () => loginModal.style.display = 'none';
    window.onclick = (event) => { if (event.target == loginModal) loginModal.style.display = 'none'; };

    // Form Submissions
    document.getElementById('login-form').onsubmit = (e) => {
        e.preventDefault();
        const userInput = e.target.querySelector('input[type="text"]').value.toLowerCase();

        if (!GMAIL_REGEX.test(userInput)) {
            alert(t('only_gmail'));
            return;
        }

        const user = registeredUsers.find(u => u.email === userInput);
        if (!user) {
            alert("Este correo no está registrado en el portal de Amanecer.");
            return;
        }

        currentUser = user;
        localStorage.setItem('amanecer_user', JSON.stringify(currentUser));
        loginModal.style.display = 'none';
        updateAuthState();
        renderAll();
    };

    document.getElementById('register-form').onsubmit = (e) => {
        e.preventDefault();
        const email = e.target.querySelector('input[type="email"]').value.toLowerCase();
        const user = e.target.querySelector('input[type="text"]').value;

        if (!GMAIL_REGEX.test(email)) {
            alert(t('error_gmail'));
            return;
        }

        if (registeredUsers.some(u => u.email === email)) {
            alert("Este correo ya se encuentra registrado.");
            return;
        }

        tempRegistrationUser = { 
            username: user, 
            email: email,
            verified: true, // They will be verified after this
            stats: { rank: 'UNRANKED', matches: 0, winrate: '0%', mvps: 0, mains: [] }
        };

        // Generate 6-digit code
        expectedVerificationCode = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Simulate email sending popup
        const notif = document.createElement('div');
        notif.style.position = 'fixed';
        notif.style.top = '20px';
        notif.style.right = '20px';
        notif.style.background = 'rgba(20,20,30,0.95)';
        notif.style.border = '2px solid var(--accent-orange)';
        notif.style.borderRadius = '15px';
        notif.style.padding = '20px';
        notif.style.color = 'white';
        notif.style.zIndex = '9999';
        notif.style.boxShadow = '0 10px 30px rgba(255,140,0,0.4)';
        notif.style.minWidth = '300px';
        notif.style.animation = 'slideUpFade 0.5s ease-out';
        notif.innerHTML = `
            <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:15px; border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:10px;">
                <div style="display:flex; align-items:center; gap:10px;">
                    <i class="fas fa-envelope-open-text fa-2x" style="color: var(--accent-orange);"></i>
                    <div>
                        <strong style="display:block; font-size:1.1rem; line-height: 1.2;">Bandeja de Entrada</strong>
                        <span style="font-size:0.75rem; color:#aaa;">soporte@amaneceresports.com</span>
                    </div>
                </div>
            </div>
            <p style="font-size:0.9rem; margin-bottom:10px;">Hola <b>${tempRegistrationUser.username}</b>,</p>
            <p style="font-size:0.9rem; margin-bottom:15px;">Tu código secreto de verificación es:</p>
            <div style="background:#000; padding:15px; text-align:center; border-radius:10px; border:1px dashed var(--accent-orange); margin-bottom:15px;">
                <span style="font-size:2rem; font-weight:900; letter-spacing:8px; color:var(--accent-orange);">${expectedVerificationCode}</span>
            </div>
            <p style="font-size:0.8rem; opacity:0.7; text-align:center;">Esta ventana desaparecerá pronto.</p>
        `;
        document.body.appendChild(notif);
        
        setTimeout(() => {
            if(notif.parentNode) notif.parentNode.removeChild(notif);
        }, 12000);
        
        showModal('verification');
    };

    const verifyForm = document.getElementById('verify-form');
    if (verifyForm) {
        verifyForm.onsubmit = (e) => {
            e.preventDefault();
            const inputCode = document.getElementById('verify-code').value.trim();
            
            if (inputCode === expectedVerificationCode && tempRegistrationUser) {
                // Verified!
                currentUser = tempRegistrationUser;
                registeredUsers.push(currentUser);
                localStorage.setItem('amanecer_users_db', JSON.stringify(registeredUsers));
                localStorage.setItem('amanecer_user', JSON.stringify(currentUser));
                if (db) {
                    db.collection('settings').doc('users').set({ list: registeredUsers });
                }

                tempRegistrationUser = null;
                expectedVerificationCode = null;

                loginModal.style.display = 'none';
                updateAuthState();
                renderAll();
                alert("¡Cuenta verificada y creada exitosamente! Bienvenido a Amanecer Gaming.");
            } else {
                alert("Código incorrecto, por favor revisa nuevamente el código que te enviamos.");
            }
        };
    }

    const switchBackRegisterBtn = document.getElementById('switch-back-register');
    if (switchBackRegisterBtn) switchBackRegisterBtn.onclick = (e) => { e.preventDefault(); showModal('register'); };

    document.getElementById('switch-to-register').onclick = (e) => { e.preventDefault(); showModal('register'); };
    document.getElementById('switch-to-login').onclick = (e) => { e.preventDefault(); showModal('login'); };

    function showUserDashboard() {
        if (!currentUser) return;
        
        const container = document.getElementById('profile-content');
        if (!container) return;

        // Activate profile section
        navLinks.forEach(l => l.classList.remove('active'));
        sections.forEach(sec => {
            sec.classList.remove('active-section');
            if (sec.id === 'profile') sec.classList.add('active-section');
        });

        const stats = currentUser.stats || { rank: 'UNRANKED', matches: 0, winrate: '0%', mvps: 0, mains: [] };


        container.innerHTML = `
            <div class="profile-dashboard-wrapper" style="animation: fadeIn 0.5s ease;">
                <div class="user-info-section glass" style="padding: 30px; border-radius: 20px; display: flex; align-items: center; gap: 30px; flex-wrap: wrap;">
                    <div class="user-avatar" style="position: relative; width: 80px; height: 80px; background: var(--accent-orange); color: #000; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 2.5rem; font-weight: 900;">
                        ${currentUser.username[0].toUpperCase()}
                        ${currentUser.verified ? '<div class="verified-badge" style="position:absolute; bottom:0; right:0; background:#3897f0; color:#fff; width:25px; height:25px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:0.7rem; border:2px solid #000;"><i class="fas fa-check"></i></div>' : ''}
                    </div>
                    <div style="flex: 1; min-width: 200px;">
                        <h3 style="font-size: 1.5rem; margin-bottom: 5px; display:flex; align-items:center; gap:8px;">
                            ${currentUser.username}
                            ${currentUser.verified ? '<span style="color:#3897f0; font-size:1rem;" title="Verificado"><i class="fas fa-check-circle"></i></span>' : ''}
                        </h3>
                        <p style="opacity: 0.6; font-size: 0.9rem;">${currentUser.email}</p>
                    </div>
                    <button class="logout-btn btn btn-outline btn-sm" style="color: #ff4444; border-color: #ff4444;" onclick="logoutUser()">
                        <i class="fas fa-sign-out-alt"></i> Cerrar Sesión
                    </button>
                </div>

            </div>
        `;
    }
    window.showUserDashboard = showUserDashboard;

    window.updatePlayerStats = () => {
        const rank = document.getElementById('edit-rank').value;
        const matches = document.getElementById('edit-matches').value;
        const wr = document.getElementById('edit-wr').value;
        const mvps = document.getElementById('edit-mvps').value;
        const proof = document.getElementById('proof-file').files[0];

        if(!rank || !matches || !wr) {
            alert("Por favor completa los datos principales.");
            return;
        }

        if(!proof) {
            alert("Es obligatorio subir una captura de tu perfil oficial para validar que los datos son verídicos.");
            return;
        }

        currentUser.stats = {
            rank: rank.toUpperCase(),
            matches: parseInt(matches) || 0,
            winrate: wr.includes('%') ? wr : wr + '%',
            mvps: parseInt(mvps) || 0,
            mains: currentUser.stats.mains || []
        };
        
        currentUser.hasPendingVerification = true;
        
        alert("¡Evidencia recibida! Tu perfil está en revisión técnica por el Staff de Amanecer. La insignia de Verificado aparecerá en las próximas 24hs tras validar tu screenshot.");
        
        localStorage.setItem('amanecer_user', JSON.stringify(currentUser));
        showUserDashboard();
    };

    window.logoutUser = () => {
        if(confirm(t('logout_confirm'))) {
            currentUser = null;
            localStorage.removeItem('amanecer_user');
            updateAuthState();
            
            // Go back to home
            navLinks.forEach(l => l.classList.remove('active'));
            sections.forEach(sec => {
                sec.classList.remove('active-section');
                if (sec.id === 'home') {
                    sec.classList.add('active-section');
                    const link = document.querySelector('[data-section="home"]');
                    if(link) link.classList.add('active');
                }
            });
            renderAll();
        }
    };

    // Navigation
    navLinks.forEach(link => {

        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('data-section');
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            sections.forEach(sec => {
                sec.classList.remove('active-section');
                if (sec.id === targetId) sec.classList.add('active-section');
            });
            const nav = document.querySelector('.nav-links');
            if(nav && nav.classList.contains('nav-active')) {
                nav.classList.remove('nav-active');
                const burger = document.querySelector('.burger');
                if(burger) burger.innerHTML = '<i class="fas fa-bars"></i>';
            }
        });
    });

    const burger = document.querySelector('.burger');
    const nav = document.querySelector('.nav-links');
    if(burger && nav) {
        burger.onclick = () => {
            nav.classList.toggle('nav-active');
            burger.innerHTML = nav.classList.contains('nav-active') ? '<i class="fas fa-times"></i>' : '<i class="fas fa-bars"></i>';
        };
    }

    // --- Tournament System ---
    function renderFilteredTournaments(format) {
        const container = document.getElementById('tournament-content');
        if(!container) return;
        const tournaments = format === 'all' 
            ? APP_DATA.tournaments
            : APP_DATA.tournaments.filter(tourn => tourn.format === format);
        
        container.innerHTML = `
            <div class="tourney-grid">
                ${tournaments.map(tourn => `
                    <div class="tourney-card glass status-${tourn.status}" onclick="showTourneyDetail('${tourn.id}')">
                        <div class="tourney-card-header" style="background-image: linear-gradient(to bottom, rgba(0,0,0,0.5), transparent), url('${tourn.image || APP_DATA.games?.find(g => g.id === tourn.game)?.image || ''}')">
                            <span class="status-badge">
                                ${tourn.status === 'live' ? '<span class="live-dot"></span>' : ''} ${tourn.status.toUpperCase()}
                            </span>
                        </div>
                        <div class="tourney-card-body">
                            <h3>${TRANSLATIONS[currentLang][tourn.id + '_name'] || tourn.name}</h3>
                            <div class="tourney-info-pills">
                                <span class="pill"><i class="fas fa-trophy"></i> ${tourn.prize}</span>
                                <span class="pill"><i class="fas fa-layer-group"></i> ${tourn.format === 'liga' ? t('view_liga') : t('tournaments')}</span>
                            </div>
                            <p style="margin-top: 15px; font-size: 0.8rem; color: var(--text-secondary); line-height: 1.4;">
                                ${TRANSLATIONS[currentLang][tourn.id + '_desc_short'] || (currentLang === 'es' ? 'Haz clic para ver la tabla de posiciones, brackets y transmisión en vivo por Kick.' : 'Click to view standings, brackets and live stream on Kick.')}
                            </p>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }
    window.renderFilteredTournaments = renderFilteredTournaments;

    function showTourneyDetail(id) {
        const tourney = APP_DATA.tournaments.find(t => t.id === id);
        if(!tourney) return;

        const container = document.getElementById('tournament-content');
        container.innerHTML = `
            <div class="detail-view glass" style="padding: clamp(20px, 5vw, 40px); border-radius: 20px; animation: fadeIn 0.4s ease;">
                <button class="btn btn-outline btn-sm mb-20" onclick="window.renderFilteredTournaments('${tourney.format}')">
                    <i class="fas fa-arrow-left"></i> ${t('back_to')} ${tourney.format === 'liga' ? t('view_liga') : t('tournaments')}
                </button>
                
                <div class="detail-header" style="margin-bottom: 30px; border-bottom: 1px solid var(--glass-border); padding-bottom: 20px; display: flex; justify-content: space-between; align-items: start; flex-wrap: wrap; gap: 20px;">
                    <div>
                        ${tourney.image ? `<img src="${tourney.image}" alt="${tourney.name}" style="height: 100px; object-fit: contain; margin-bottom: 15px; border-radius: 10px;">` : ''}
                        <h2 style="color: var(--accent-orange); font-size: 2.2rem; margin-bottom: 5px;">${tourney.name}</h2>
                        <div style="display: flex; gap: 15px; color: var(--text-secondary); font-size: 0.9rem;">
                            <span><i class="fas fa-calendar"></i> ${tourney.date}</span>
                            <span><i class="fas fa-clock"></i> 20:00 [ARG]</span>
                        </div>
                    </div>
                    ${tourney.status === 'live' ? `
                        <a href="https://kick.com/elamanecer" target="_blank" class="btn btn-primary" style="background: #53FC18; border-color: #53FC18; color: #000; font-weight: 900;">
                            <i class="fas fa-video"></i> ${t('watch_on_kick')}
                        </a>
                    ` : ''}
                </div>

                <div id="dynamic-detail-content">
                    ${tourney.format === 'liga' ? renderFullStandings(id) : renderFullBracket(id)}
                </div>

                <div class="detail-actions mt-40" style="text-align: center;">
                    ${tourney.status === 'finalizado' ? 
                        `<div class="completed-status-pill" style="display:inline-block; padding: 10px 25px; background: rgba(255,165,0,0.1); border: 1px solid var(--accent-orange); color: var(--accent-orange); border-radius: 50px; font-weight: bold;">
                            <i class="fas fa-check-circle"></i> ${t('tournament_finished')}
                        </div>` :
                        (tourney.status === 'live' ? 
                            `<div class="live-status-pill" style="display:inline-block; padding: 10px 25px; background: rgba(255,68,68,0.1); border: 1px solid #ff4444; color: #ff4444; border-radius: 50px; font-weight: bold;">
                                <span class="live-dot"></span> ${t('event_in_progress')} - ${t('registration_closed')}
                            </div>` :
                            (tourney.status === 'abierto' ? 
                                `<a href="https://wa.me/5493764748643?text=${encodeURIComponent(`Hola Equipo Amanecer, vengo desde la web oficial. Nos interesa inscribir a nuestro squad en el *${tourney.name}*. Entendemos que el valor de la inscripción por equipo es de *${tourney.price || 'a consultar'}*. \n\n¿Me podrán enviar los métodos de pago disponibles y los datos que necesitan para registrar nuestro roster?`)}" target="_blank" class="btn btn-primary" style="text-decoration: none; display: inline-block;">${t('join_now')}</a>` :
                                `<div class="proximamente-status-pill" style="display:inline-block; padding: 10px 25px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.2); color: var(--text-secondary); border-radius: 50px; font-weight: bold; cursor: default;">
                                    <i class="fas fa-clock"></i> PRÓXIMAMENTE
                                </div>`
                            )
                        )
                    }
                </div>
            </div>
        `;
    }
    window.showTourneyDetail = showTourneyDetail;

    window.joinTournament = function(id) {
        const tourney = APP_DATA.tournaments.find(t => t.id === id);
        if(!tourney) return;
        
        const message = `Hola Equipo Amanecer, vengo desde la web oficial. Nos interesa inscribir a nuestro squad en el *${tourney.name}*. Entendemos que el valor de la inscripción por equipo es de *${tourney.price || 'a consultar'}*. \n\n¿Me podrán enviar los métodos de pago disponibles y los datos que necesitan para registrar nuestro roster?`;
        const whatsappUrl = `https://wa.me/5493764748643?text=${encodeURIComponent(message)}`;
        
        window.open(whatsappUrl, '_blank');
    };

    function renderFullStandings(id) {
        const tourney = APP_DATA.tournaments.find(t => t.id === id);
        if(!tourney || !tourney.data) return '<p>No hay datos de liga disponibles.</p>';

        // Calculate and sort standings
        const standings = tourney.data.map(team => {
            const calculatedPj = (team.g || 0) + (team.p || 0);
            const calculatedPts = (team.g || 0) * 3; // Win = 3pts, Loss = 0pts
            return {
                ...team,
                pj: calculatedPj,
                pts: calculatedPts
            };
        }).sort((a, b) => b.pts - a.pts);

        return `
            <div class="full-standings">
                <h3 style="margin-bottom: 20px; font-size: 1.2rem;">${t('standings_table')}: ${tourney.name}</h3>
                <div class="glass" style="padding: 20px; border-radius: 12px; overflow-x: auto;">
                    <table style="width: 100%; border-collapse: collapse; text-align: left; min-width: 500px;">
                        <thead>
                            <tr style="border-bottom: 1px solid var(--glass-border); opacity: 0.6; font-size: 0.8rem;">
                                <th style="padding: 10px;">${t('pos')}</th>
                                <th style="padding: 10px;">${t('team')}</th>
                                <th style="padding: 10px; text-align:center;">${t('pj')}</th>
                                <th style="padding: 10px; text-align:center;">${t('pg')}</th>
                                <th style="padding: 10px; text-align:center;">${t('pp')}</th>
                                <th style="padding: 10px; text-align:center;">${t('pts')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${standings.map((row, index) => `
                                <tr style="border-bottom: 1px solid rgba(255,255,255,0.05); font-size: 0.9rem;">
                                    <td style="padding: 15px;">${index + 1}</td>
                                    <td style="padding: 15px; font-weight: bold;">${row.team}</td>
                                    <td style="padding: 15px; text-align:center;">${row.pj}</td>
                                    <td style="padding: 15px; text-align:center;">${row.g}</td>
                                    <td style="padding: 15px; text-align:center;">${row.p}</td>
                                    <td style="padding: 15px; text-align:center; color: var(--accent-orange); font-weight: 900;">${row.pts}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }

    function renderFullBracket(id) {
        const tourney = APP_DATA.tournaments.find(t => t.id === id);
        if(!tourney || !tourney.data) return '<p>No hay datos de bracket disponibles.</p>';
        
        const { octavos, cuartos, semis, final } = tourney.data;

        const renderMatch = (match) => `
            <div class="match glass mb-20" style="padding:12px; width:180px; font-size:0.8rem; border-left: 3px solid ${match && match.winner ? 'var(--accent-orange)' : 'rgba(255,255,255,0.1)'};">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <span style="${match && match.winner === match.teamA ? 'color:var(--accent-orange); font-weight:bold;' : ''}">${match ? match.teamA : 'TBD'}</span> 
                    <span style="opacity:0.6;">${match ? match.scoreA : '-'}</span>
                </div>
                <div style="display:flex; justify-content:space-between; align-items:center; margin-top:8px; padding-top:8px; border-top:1px solid rgba(255,255,255,0.05);">
                    <span style="${match && match.winner === match.teamB ? 'color:var(--accent-orange); font-weight:bold;' : ''}">${match ? match.teamB : 'TBD'}</span> 
                    <span style="opacity:0.6;">${match ? match.scoreB : '-'}</span>
                </div>
            </div>
        `;

        return `
            <div class="full-bracket">
                <h3 style="margin-bottom: 20px; font-size: 1.2rem;">${t('competitive_bracket')}</h3>
                <div class="bracket-scroll-container" style="overflow-x: auto; padding: 20px 0;">
                    <div style="display: flex; gap: 40px; min-width: 900px; justify-content: flex-start; padding: 10px;">
                        
                        ${(octavos && octavos.length > 0) ? `
                        <div class="bracket-col" style="display:flex; flex-direction:column; justify-content:space-around;">
                            <h4 style="text-align:center; opacity:0.5; margin-bottom:20px; font-size:0.75rem; text-transform:uppercase; letter-spacing:1px;">Octavos de Final</h4>
                            ${octavos.map(m => renderMatch(m)).join('')}
                        </div>` : ''}
                        
                        <div class="bracket-col" style="display:flex; flex-direction:column; justify-content:space-around;">
                            <h4 style="text-align:center; opacity:0.5; margin-bottom:20px; font-size:0.75rem; text-transform:uppercase; letter-spacing:1px;">Cuartos de Final</h4>
                            ${(cuartos && cuartos.length > 0) ? cuartos.map(m => renderMatch(m)).join('') : '<p style="opacity:0.5;font-size:0.8rem;text-align:center;">Pendiente</p>'}
                        </div>
                        
                        <div class="bracket-col" style="display:flex; flex-direction:column; justify-content:space-around;">
                            <h4 style="text-align:center; opacity:0.5; margin-bottom:20px; font-size:0.75rem; text-transform:uppercase; letter-spacing:1px;">Semifinales</h4>
                            ${(semis && semis.length > 0) ? semis.map(m => renderMatch(m)).join('') : '<p style="opacity:0.5;font-size:0.8rem;text-align:center;">Pendiente</p>'}
                        </div>

                        <div class="bracket-col" style="display:flex; flex-direction:column; justify-content:center;">
                            <h4 style="text-align:center; color: var(--accent-orange); margin-bottom:20px; font-size:0.75rem; text-transform:uppercase; letter-spacing:1px;">Gran Final</h4>
                            <div class="final-match-wrap" style="position:relative;">
                                <div class="trophy-icon" style="text-align:center; margin-bottom:15px;">
                                    <i class="fas fa-trophy" style="font-size: 2rem; color: var(--accent-orange); filter: drop-shadow(0 0 10px rgba(255,165,0,0.3));"></i>
                                </div>
                                ${Array.isArray(final) ? renderMatch(final[0]) : (final ? renderMatch(final) : '<p style="opacity:0.5;font-size:0.8rem;text-align:center;">Pendiente</p>')}
                                ${(final && !Array.isArray(final) && final.winner) ? `
                                    <div style="text-align:center; margin-top:10px; color:var(--accent-orange); font-weight:bold; font-size:0.8rem;">
                                        ${t('winner')}: ${final.winner}
                                    </div>
                                ` : (final && Array.isArray(final) && final[0].winner ? `
                                    <div style="text-align:center; margin-top:10px; color:var(--accent-orange); font-weight:bold; font-size:0.8rem;">
                                        ${t('winner')}: ${final[0].winner}
                                    </div>
                                ` : '')}
                            </div>
                        </div>
                    </div>
                </div>
                <p style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 15px; font-style: italic;">
                    ${t('horizontal_scroll')}
                </p>
            </div>
        `;
    }

    // --- Community & Content ---
    const getSocialData = () => {
        return APP_DATA.organization.communityInfo.socialData || {
            instagram: { count: 242, label: 'Seguidores' },
            kick: { count: 271, label: 'Seguidores' },
            tiktok: { count: 1358, label: 'Seguidores' },
            youtube: { count: 119, label: 'Suscriptores' },
            discord: { count: 350, label: 'Miembros' },
            whatsapp: { count: 180, label: 'Comunidad' }
        };
    };

    function renderCommunity() {
        const milestonesGrid = document.getElementById('milestones-container');
        const commWall = document.getElementById('community-wall');
        if (milestonesGrid && APP_DATA.organization.communityInfo.milestones) {
            milestonesGrid.innerHTML = APP_DATA.organization.communityInfo.milestones.map(m => `
                <div class="milestone-card glass">
                    <i class="fas ${m.icon}"></i>
                    <span class="val">${m.value}</span>
                    <span class="lbl">${m.label}</span>
                </div>
            `).join('');
        }
        if (commWall) {
            commWall.innerHTML = `
                <div class="comm-grid" style="display: flex; flex-direction: column; gap: 30px;">
                    <div class="comm-main glass" style="padding: 40px; border-radius: 20px;">
                        <h3 style="color: var(--accent-orange); margin-bottom: 20px;">${t('impact_region')}</h3>
                        <p style="font-size: 1.1rem; line-height: 1.6; margin-bottom: 30px; font-weight: 300;">
                            ${t('impact_desc')}
                        </p>
                        
                        <div class="social-live-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 15px;">
                            ${renderSocialItem('instagram', 'https://www.instagram.com/elamanecermlbb', 'fab fa-instagram', '#E1306C')}
                            ${renderSocialItem('tiktok', 'https://www.tiktok.com/@elamanecermlbb', 'fab fa-tiktok', '#FFF')}
                            ${renderSocialItem('kick', 'https://kick.com/elamanecer', '', '#53FC18')}
                            ${renderSocialItem('youtube', 'https://youtube.com/@comunidadamanecer1', 'fab fa-youtube', '#FF0000')}
                            ${renderSocialItem('discord', 'https://discord.gg/kGQFFnmBuG', 'fab fa-discord', '#5865F2')}
                            ${renderSocialItem('whatsapp', 'https://chat.whatsapp.com/LPUb3w7lbgILbDFVf54AX3?mode=ac_t', 'fab fa-whatsapp', '#25D366')}
                        </div>
                    </div>
                </div>
            `;
        }
    }

    function renderSocialItem(id, url, iconClass, color) {
        const socialData = getSocialData();
        const data = socialData[id] || { count: 0, label: 'Seguidores' };
        let translatedLabel = t('followers');
        if (id === 'youtube') translatedLabel = t('subscribers');
        if (id === 'discord') translatedLabel = t('members');
        if (id === 'whatsapp') translatedLabel = t('community_label');

        let iconHtml = `<i class="${iconClass}"></i>`;
        
        if(id === 'kick') {
            // Updated SVG with em-based sizing to match FontAwesome icons and better vertical alignment
            iconHtml = `<svg width="1em" height="1em" viewBox="0 0 24 24" fill="${color}" xmlns="http://www.w3.org/2000/svg" style="display:block;"><path d="M4 3H9V8H10V9H9V10H10V11H11V12H10V13H9V14H10V15H9V20H4V3ZM16 3H21V8H20V9H21V10H20V11H19V12H20V13H21V14H20V15H21V20H16V15H17V14H18V13H17V12H16V11H17V10H18V9H17V8H16V3Z"/></svg>`;
        }

        return `
            <a href="${url}" target="_blank" class="glass social-card-item" style="text-decoration:none; padding: 20px 15px; text-align:center; border-radius: 12px; display:block; transition: 0.3s; border: 1px solid rgba(255,140,0,0.1);">
                <div class="icon-wrap" style="height: 40px; font-size: 2.2rem; color: ${color}; margin-bottom: 20px; display:flex; justify-content:center; align-items:center; filter: drop-shadow(0 0 10px ${color}44);">${iconHtml}</div>
                <div class="network-name" style="font-size: 0.8rem; font-weight: 900; color: var(--accent-orange); text-transform: uppercase; letter-spacing: 2px; margin-bottom: 5px;">${id}</div>
                <div class="count-num" style="font-size: 1rem; font-weight: 700; color: var(--accent-orange); opacity: 0.9;">${data.count.toLocaleString()}</div>
                <div class="label-text" style="font-size: 0.55rem; text-transform: uppercase; color: var(--accent-orange); opacity: 0.5; letter-spacing: 1px;">${translatedLabel}</div>
            </a>
        `;
    }

    function renderAbout() {
        const container = document.getElementById('about-timeline');
        if (!container) return;
        
        const staffCards = APP_DATA.team.map(member => `
            <div class="staff-card glass" style="display: flex; flex-direction: column; align-items: center; text-align: center; padding: 25px; border-radius: 20px; border: 1px solid rgba(255,165,0,0.1); transition: 0.3s; background: rgba(0,0,0,0.2); height: 100%;">
                <div class="staff-photo-wrapper" style="width: 120px; height: 120px; margin-bottom: 20px; flex-shrink: 0;">
                    <img src="${member.photo}" 
                         alt="${member.name}" 
                         style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%; border: 3px solid var(--accent-orange); box-shadow: 0 0 15px rgba(255,165,0,0.2);"
                         onerror="if(!this.triedUpper){this.src=this.src.replace('.jpeg', '.JPEG'); this.triedUpper=true;} else if(!this.triedJpg){this.src=this.src.replace('.JPEG', '.jpg'); this.triedJpg=true;}">
                </div>
                <div class="staff-info" style="flex-grow: 1; display: flex; flex-direction: column; gap: 8px; width: 100%;">
                    <h4 style="color: #fff; font-size: 1.1rem; margin: 0; font-weight: 900; letter-spacing: 1px; text-transform: uppercase;">${member.name}</h4>
                    <p style="color: var(--accent-orange); font-size: 0.75rem; font-weight: bold; text-transform: uppercase; margin: 0; letter-spacing: 1px;">${member.role}</p>
                    <div style="height: 1px; background: linear-gradient(to right, transparent, rgba(255,165,0,0.2), transparent); margin: 5px 0;"></div>
                    <p style="font-size: 0.8rem; line-height: 1.5; opacity: 0.8; font-style: italic; margin: 0;">
                        "${member.bio || ''}"
                    </p>
                </div>
            </div>
        `).join('');

        container.innerHTML = `
            <div class="about-layout" style="display: flex; flex-direction: column; gap: 60px; animation: fadeIn 0.6s ease;">
                <!-- Mission Section -->
                <div class="mission-section glass" style="padding: clamp(30px, 5vw, 60px); border-radius: 30px; background: linear-gradient(135deg, rgba(255,255,255,0.02), rgba(255,165,0,0.02)); border: 1px solid rgba(255,165,0,0.1);">
                    <div style="display: flex; align-items: center; gap: 20px; margin-bottom: 25px;">
                        <i class="fas fa-sun fa-3x" style="color: var(--accent-orange);"></i>
                        <h2 style="font-size: clamp(1.8rem, 4vw, 2.8rem); color: #fff; letter-spacing: -1px;">${t('mission_vision')}</h2>
                    </div>
                    <p style="line-height: 1.8; font-size: 1.15rem; opacity: 0.9; max-width: 900px; color: var(--text-secondary);">
                        ${APP_DATA.organization.mission}
                    </p>
                    <div class="values-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-top: 40px;">
                        ${APP_DATA.organization.values.map(v => `
                            <div style="background: rgba(255,255,255,0.03); padding: 18px; border-radius: 15px; font-size: 0.95rem; border-left: 4px solid var(--accent-orange); font-weight: bold; display: flex; align-items: center; gap: 12px; transition: 0.3s; cursor: default;" onmouseover="this.style.background='rgba(255,165,0,0.05)'" onmouseout="this.style.background='rgba(255,255,255,0.03)'">
                                <i class="fas fa-check-circle" style="color: var(--accent-orange);"></i> ${v}
                            </div>
                        `).join('')}
                    </div>
                </div>

                <!-- Staff Section -->
                <div class="staff-section">
                    <div style="text-align: center; margin-bottom: 50px;">
                        <h3 style="color: #fff; font-size: 2.2rem; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 4px; font-weight: 900;">
                            NUESTRO <span style="color: var(--accent-orange);">STAFF</span>
                        </h3>
                        <p style="color: var(--text-secondary); font-size: 0.9rem; opacity: 0.6;">El equipo detrás de Amanecer Gaming eSports</p>
                    </div>
                    <div class="staff-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 25px;">
                        ${staffCards}
                    </div>
                </div>
            </div>
        `;
    }

    let currentEsportsViews = {}; // store view per squad index

    window.switchEsportsView = (index, view) => {
        currentEsportsViews[index] = view;
        renderEsports();
    };

    function renderEsports() {
        const container = document.getElementById('esports-dashboard');
        if (!container) return;
        
        const squadsList = APP_DATA.squads || (APP_DATA.squad ? [APP_DATA.squad] : []);
        
        let allSquadsHtml = squadsList.map((squad, index) => {
            const roster = squad.roster || { starters: [], substitutes: [] };
            const achievements = squad.achievements || [];
            const currentEsportsView = currentEsportsViews[index] || 'main';

            let dynamicContent = '';
            
            if (currentEsportsView === 'main') {
                dynamicContent = `
                    <div class="esports-nav" style="display: flex; gap: 20px; justify-content: center; margin: 40px 0; flex-wrap: wrap;">
                        <button class="btn btn-outline" onclick="switchEsportsView(${index}, 'team')" style="border-radius: 50px; padding: 15px 35px; border-width: 2px;">
                            <i class="fas fa-users"></i> VER EQUIPO ${squad.title.replace('SQUAD ', '')}
                        </button>
                        <button class="btn btn-outline" onclick="switchEsportsView(${index}, 'trophies')" style="border-radius: 50px; padding: 15px 35px; border-width: 2px;">
                            <i class="fas fa-trophy"></i> ${t('view_trophies')}
                        </button>
                    </div>
                `;
            } else if (currentEsportsView === 'team') {
                dynamicContent = `
                    <div style="margin-bottom: 30px;">
                        <button class="btn btn-sm btn-outline" onclick="switchEsportsView(${index}, 'main')" style="border-radius: 50px;">
                            <i class="fas fa-arrow-left"></i> Volver
                        </button>
                    </div>
                    ${renderTeamView(roster)}
                `;
            } else if (currentEsportsView === 'trophies') {
                dynamicContent = `
                    <div style="margin-bottom: 30px;">
                        <button class="btn btn-sm btn-outline" onclick="switchEsportsView(${index}, 'main')" style="border-radius: 50px;">
                            <i class="fas fa-arrow-left"></i> Volver
                        </button>
                    </div>
                    ${renderTrophiesView(achievements)}
                `;
            }

            return `
                <div class="glass" style="padding: clamp(20px, 5vw, 40px); border-radius: 20px; position: relative; overflow: hidden; background: linear-gradient(135deg, rgba(45,0,85,0.6), rgba(26,0,51,0.8)); margin-bottom: 40px;">
                    <div class="squad-header" style="display: flex; align-items: center; gap: 30px; margin-bottom: 30px; flex-wrap: wrap;">
                        <div class="logo-wrapper">
                            <img src="${squad.logo}" alt="Logo ${squad.title}" style="width: 150px; height: 150px; border-radius: 15px;" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                            <div class="logo-fallback" style="display: none; width: 150px; height: 150px; background: rgba(255,140,0,0.1); border: 2px dashed var(--accent-orange); border-radius: 15px; justify-content: center; align-items: center; color: var(--accent-orange);">
                                <i class="fas fa-sun fa-2x"></i>
                            </div>
                        </div>
                        <div style="flex: 1; min-width: 300px;">
                            <h3 style="color: var(--accent-orange); margin-bottom: 5px; font-size: 2.2rem; font-weight: 900;">${squad.title || t('squad_title')}</h3>
                            <p style="color: var(--text-secondary); text-transform: uppercase; letter-spacing: 4px; font-size: 0.8rem; font-weight: 900;">${t('squad_tagline') || 'AMANECER GAMING ESPORTS'}</p>
                        </div>
                    </div>
                    <p style="line-height: 1.8; font-size: 1rem; opacity: 0.8; max-width: 900px;">
                        ${squad.description}
                    </p>
                    <div id="esports-dynamic-content-${index}" style="animation: fadeIn 0.4s ease;">
                        ${dynamicContent}
                    </div>
                </div>
            `;
        }).join('');

        container.innerHTML = `
            <div class="esports-grid" style="display: grid; grid-template-columns: 1fr; gap: 40px;">
                ${allSquadsHtml}

                <!-- Footer Reclutamiento Always Visible -->
                <div class="glass" style="padding: 30px; border-radius: 20px; border: 1px solid rgba(255,165,0,0.3); text-align: center;">
                    <h3 style="color: var(--accent-orange); margin-bottom: 10px;">Contacto eSports</h3>
                    <p style="margin-bottom: 25px; line-height: 1.5; font-size: 0.9rem; max-width: 700px; margin-left: auto; margin-right: auto;">
                        Comunícate con nosotros para unirte a Amanecer Gaming, organizar una scrim / vs con nuestros squads, o postularte para formar parte de nuestro staff. ¡Las puertas están abiertas!
                    </p>
                    <a href="https://wa.me/5493764748643?text=${encodeURIComponent('Hola Amanecer, vengo desde la web oficial. Me gustaría contactarme para: ')}" target="_blank" class="btn btn-primary" style="padding: 12px 40px; text-decoration: none; display: inline-block;">
                        <i class="fab fa-whatsapp"></i> Contactar por WhatsApp
                    </a>
                </div>
            </div>
        `;
    }

    function renderTeamView(roster) {
        function renderPlayerSquare(player) {
            const hasHighlight = !!player.highlightVideo;
            const photoHtml = player.photo ? 
                `<img src="${player.photo}" 
                      alt="${player.name}" 
                      style="width: 100%; height: 100%; object-fit: cover; border-radius: 8px;" 
                      onerror="if(!this.triedUpper){this.src=this.src.replace('.jpeg', '.JPEG'); this.triedUpper=true;} else if(!this.triedJpg){this.src=this.src.replace('.JPEG', '.jpg'); this.triedJpg=true;} else {this.style.display='none'; this.nextElementSibling.style.display='flex';}">
                 <div style="display:none; width:100%; height:100%; align-items:center; justify-content:center;"><i class="fas fa-user"></i></div>` : 
                `<i class="fas fa-user"></i>`;

            return `
                <div class="player-square glass" style="display: flex; flex-direction: column; align-items: center; padding: 25px 15px; text-align: center; border-radius: 20px; border: 1px solid rgba(255,140,0,0.1); position:relative; overflow:hidden; justify-content: flex-start; cursor: pointer; transition: all 0.3s ease;" onclick="this.classList.toggle('expanded')">
                    <div class="player-avatar-placeholder" style="margin-bottom: 10px;">
                        ${photoHtml}
                    </div>
                    <div style="font-weight: 900; color: #fff; font-size: 0.9rem; text-transform: uppercase;">${player.name}</div>
                    
                    <div class="player-info-content">
                        <div style="font-size: 0.7rem; color: var(--accent-orange); font-weight: bold; margin-top: 5px;">${player.role}</div>
                        <div style="font-size: 0.65rem; opacity: 0.5; margin-top: 5px;">${player.specialty || ''}</div>
                        ${player.bio ? `<div style="font-size: 0.75rem; line-height: 1.4; opacity: 0.8; font-style: italic; margin-top: 10px; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 10px;">"${player.bio}"</div>` : ''}
                        
                        ${hasHighlight ? `
                            <button class="highlight-btn" onclick="event.stopPropagation(); toggleHighlight('video-${player.name.replace(/\\s+/g, '')}')">
                                <i class="fas fa-play-circle"></i> ${t('best_play')}
                            </button>
                            <div id="video-${player.name.replace(/\\s+/g, '')}" class="player-highlight-container hidden-video" onclick="event.stopPropagation()">
                                <video controls playsinline muted class="player-highlight-video" src="${player.highlightVideo}"></video>
                                <button class="expand-btn" onclick="showHighlightVideo('${player.highlightVideo}', '${player.name}')">
                                    <i class="fas fa-expand-alt"></i>
                                </button>
                                <div class="video-label">${t('best_play')}</div>
                            </div>
                        ` : ''}
                    </div>
                    <div class="expand-indicator" style="margin-top: 10px; opacity: 0.5; font-size: 0.8rem; pointer-events: none;">
                        <i class="fas fa-chevron-down"></i>
                    </div>
                </div>
            `;
        }

        window.toggleHighlight = (id) => {
            const container = document.getElementById(id);
            const video = container.querySelector('video');
            container.classList.toggle('visible-video');
            if (container.classList.contains('visible-video')) {
                video.play();
            } else {
                video.pause();
            }
        };

        window.showHighlightVideo = (url, playerName) => {
            let modal = document.getElementById('video-highlight-modal');
            if(!modal) {
                modal = document.createElement('div');
                modal.id = 'video-highlight-modal';
                modal.className = 'highlight-modal-overlay';
                document.body.appendChild(modal);
            }

            modal.innerHTML = `
                <div class="highlight-modal-content">
                    <span class="close-highlight" onclick="this.closest('.highlight-modal-overlay').style.display='none'; this.closest('.highlight-modal-overlay').querySelector('video').pause()">&times;</span>
                    <div class="video-frame-outer">
                        <div class="video-frame-inner">
                            <video controls autoplay playsinline muted class="highlight-video" src="${url}"></video>
                        </div>
                    </div>
                    <h3 class="highlight-player-name">MEJOR JUGADA | ${playerName}</h3>
                </div>
            `;
            modal.style.display = 'flex';
        };

        let managersHtml = '';
        if (roster.managers && roster.managers.length > 0) {
            managersHtml = `
                <h4 style="color: var(--accent-orange); text-transform: uppercase; letter-spacing: 3px; font-size: 0.8rem; margin-top: 40px; margin-bottom: 20px; text-align: center;">Managers</h4>
                <div class="roster-grid" style="display: grid; grid-template-columns: repeat(${roster.managers.length}, 1fr); gap: 10px; max-width: ${roster.managers.length * 150}px; margin: 0 auto;">
                    ${roster.managers.map(p => renderPlayerSquare(p)).join('')}
                </div>
            `;
        }

        return `
            <div class="team-view" style="animation: fadeInUp 0.5s ease;">
                <h4 style="color: var(--accent-orange); text-transform: uppercase; letter-spacing: 3px; font-size: 0.8rem; margin-bottom: 20px; text-align: center;">${t('starters')}</h4>
                <div class="roster-grid roster-grid-starters" style="margin-bottom: 30px;">
                    ${roster.starters.map(p => renderPlayerSquare(p)).join('')}
                </div>

                ${roster.substitutes && roster.substitutes.length > 0 ? `
                <h4 style="color: var(--accent-orange); text-transform: uppercase; letter-spacing: 3px; font-size: 0.8rem; margin-bottom: 20px; text-align: center;">${t('substitutes')}</h4>
                <div class="roster-grid" style="display: grid; grid-template-columns: repeat(${roster.substitutes.length}, 1fr); gap: 10px; max-width: ${roster.substitutes.length * 150}px; margin: 0 auto;">
                    ${roster.substitutes.map(p => renderPlayerSquare(p)).join('')}
                </div>
                ` : ''}

                ${managersHtml}
            </div>
        `;
    }

    function renderTrophiesView(achievements) {
        return `
            <div class="trophies-view" style="animation: fadeInUp 0.5s ease;">
                <h4 style="color: var(--accent-orange); text-transform: uppercase; letter-spacing: 3px; font-size: 0.8rem; margin-bottom: 30px; text-align: center;">${t('trophy_cabinet')}</h4>
                <div class="trophy-wall" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
                    ${achievements.map(item => `
                        <div class="trophy-item glass" style="padding: 25px; border-radius: 15px; text-align: center; border-bottom: 3px solid #ffd700;">
                            <i class="fas ${item.icon}" style="font-size: 2.5rem; color: #ffd700; margin-bottom: 15px;"></i>
                            <div style="font-size: 0.8rem; font-weight: 900; color: #fff;">${item.title}</div>
                            <div style="color: #ffd700; font-size: 0.7rem; font-weight: bold; margin-top: 5px;">${item.rank} (${item.year})</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    function renderAll() {
        renderFilteredTournaments('all');
        renderCommunity();
        renderAbout();
        renderEsports();
    }

    const btnAll = document.getElementById('view-all');
    const btnLiga = document.getElementById('view-liga');
    const btnBracket = document.getElementById('view-bracket');
    if(btnAll && btnLiga && btnBracket) {
        btnAll.onclick = () => { renderFilteredTournaments('all'); btnAll.classList.add('active'); btnLiga.classList.remove('active'); btnBracket.classList.remove('active'); };
        btnLiga.onclick = () => { renderFilteredTournaments('liga'); btnLiga.classList.add('active'); btnAll.classList.remove('active'); btnBracket.classList.remove('active'); };
        btnBracket.onclick = () => { renderFilteredTournaments('bracket'); btnBracket.classList.add('active'); btnAll.classList.remove('active'); btnLiga.classList.remove('active'); };
    }

    // --- Admin Panel Logic ---
    function renderAdminPanel() {
        const container = document.getElementById('admin-panel-content');
        if (!container) return;

        container.innerHTML = `
            <div class="admin-tabs" style="display:flex; gap:10px; margin-bottom:20px; border-bottom:1px solid var(--glass-border); padding-bottom:15px; flex-wrap: wrap;">
                <button class="btn btn-sm btn-outline active" onclick="this.parentElement.querySelectorAll('button').forEach(b => b.classList.remove('active')); this.classList.add('active'); document.querySelectorAll('.admin-tab-content').forEach(d => d.style.display='none'); document.getElementById('admin-tourneys-tab').style.display='block';">Torneos</button>
                <button class="btn btn-sm btn-outline" onclick="this.parentElement.querySelectorAll('button').forEach(b => b.classList.remove('active')); this.classList.add('active'); document.querySelectorAll('.admin-tab-content').forEach(d => d.style.display='none'); document.getElementById('admin-users-tab').style.display='block';">Usuarios (${registeredUsers.length})</button>
                <button class="btn btn-sm btn-outline" onclick="this.parentElement.querySelectorAll('button').forEach(b => b.classList.remove('active')); this.classList.add('active'); document.querySelectorAll('.admin-tab-content').forEach(d => d.style.display='none'); document.getElementById('admin-social-tab').style.display='block';">Redes</button>
                <button class="btn btn-sm btn-outline" onclick="this.parentElement.querySelectorAll('button').forEach(b => b.classList.remove('active')); this.classList.add('active'); document.querySelectorAll('.admin-tab-content').forEach(d => d.style.display='none'); document.getElementById('admin-cloud-tab').style.display='block';"><i class="fas fa-cloud"></i> Nube</button>
            </div>

            <div id="admin-social-tab" class="admin-tab-content" style="display:none;">
                <h4 style="margin-bottom: 20px; color:var(--accent-orange);">Seguidores en Tiempo Real</h4>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px;">
                    ${Object.keys(getSocialData()).map(key => `
                        <div class="glass" style="padding: 15px; border-radius: 12px; border: 1px solid rgba(255,140,0,0.1);">
                            <label style="display:block; font-size: 0.65rem; text-transform: uppercase; color: var(--accent-orange); margin-bottom: 8px;">${key}</label>
                            <input type="number" 
                                   value="${getSocialData()[key].count}" 
                                   onchange="updateSocialCount('${key}', this.value)"
                                   style="width: 100%; padding: 8px; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); color: #fff; border-radius: 8px;">
                        </div>
                    `).join('')}
                </div>
                <p style="font-size: 0.75rem; margin-top: 20px; opacity: 0.6; font-style: italic;">
                    * Los cambios se sincronizan automáticamente con la nube y se reflejan en las pantallas de todos los usuarios.
                </p>
            </div>

            <div id="admin-tourneys-tab" class="admin-tab-content">
                <div style="margin-bottom: 30px;">
                    <label style="display:block; margin-bottom:10px; font-weight:bold; color:var(--accent-orange);">Seleccionar Torneo a Gestionar:</label>
                    <select id="admin-tourney-select" class="glass" style="width:100%; padding:12px; border-radius:10px; background:rgba(0,0,0,0.3); color:#fff; border:1px solid var(--glass-border);">
                        <option value="">-- Elige un torneo --</option>
                        ${APP_DATA.tournaments.map(t => `<option value="${t.id}">${t.name} (${t.format === 'liga' ? 'Liga' : 'Bracket'})</option>`).join('')}
                    </select>
                </div>
                <div id="admin-editor-area"></div>
                
                <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid var(--glass-border); text-align: center;">
                    <h4 style="margin-bottom: 15px; color: var(--accent-orange);">Guardar Cambios Permanentes</h4>
                    <p style="font-size: 0.8rem; opacity: 0.7; margin-bottom: 20px;">Para que los cambios que realices sean visibles para todos los usuarios, debes descargar el archivo data.js actualizado y enviárselo al desarrollador o subirlo al servidor.</p>
                    <div style="display: flex; gap: 10px; justify-content: center;">
                        <button class="btn btn-primary" onclick="exportAppData()">
                            <i class="fas fa-download"></i> Descargar data.js
                        </button>
                        <button class="btn btn-outline" onclick="if(confirm('¿Seguro que quieres borrar tus cambios locales y volver a los que hay en data.js?')){ localStorage.removeItem('amanecer_data'); location.reload(); }">
                            <i class="fas fa-undo"></i> Resetear a Original
                        </button>
                    </div>
                </div>
            </div>

            <div id="admin-users-tab" class="admin-tab-content" style="display:none;">
                <h4 style="margin-bottom: 20px; color:var(--accent-orange);">Lista de Usuarios Registrados</h4>
                <div class="glass" style="padding: 20px; border-radius: 12px; overflow-x: auto;">
                    <table style="width: 100%; border-collapse: collapse; text-align: left; min-width: 600px;">
                        <thead>
                            <tr style="border-bottom: 1px solid var(--glass-border); opacity: 0.6; font-size: 0.8rem;">
                                <th style="padding: 10px;">Usuario</th>
                                <th style="padding: 10px;">Email</th>
                                <th style="padding: 10px;">MLBB ID</th>
                                <th style="padding: 10px;">Estado</th>
                                <th style="padding: 10px; text-align:center;">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${registeredUsers.length === 0 ? '<tr><td colspan="5" style="text-align:center; padding:20px; opacity:0.5;">No hay usuarios registrados aún.</td></tr>' : 
                                registeredUsers.map((user, idx) => `
                                <tr style="border-bottom: 1px solid rgba(255,255,255,0.05); font-size: 0.9rem;">
                                    <td style="padding: 15px; font-weight: bold;">${user.username}</td>
                                    <td style="padding: 15px;">${user.email}</td>
                                    <td style="padding: 15px;">${user.mlbbId || 'N/A'}</td>
                                    <td style="padding: 15px;">
                                        <span style="color: ${user.verified ? '#3897f0' : '#ffaa00'}; font-size: 0.8rem;">
                                            <i class="fas ${user.verified ? 'fa-check-circle' : 'fa-clock'}"></i> ${user.verified ? 'Verificado' : 'Pendiente'}
                                        </span>
                                    </td>
                                    <td style="padding: 15px; text-align:center;">
                                        ${!user.verified ? `<button class="btn btn-sm btn-outline" style="font-size:0.7rem; border-color:var(--accent-orange); color:var(--accent-orange);" onclick="adminVerifyUser(${idx})">Verificar</button>` : '<span style="opacity:0.3; font-size:0.7rem;">Ninguna</span>'}
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>

            <div id="admin-cloud-tab" class="admin-tab-content" style="display:none;">
                <h4 style="margin-bottom: 10px; color:var(--accent-orange);">Configuración de Nube (Sync Global)</h4>
                <p style="font-size: 0.8rem; opacity: 0.7; margin-bottom: 20px;">Esta configuración permite que todos los usuarios vean los cambios en tiempo real sin descargar archivos.</p>
                
                <div class="glass" style="padding: 20px; border-radius: 12px;">
                    <label style="display:block; font-size:0.7rem; opacity:0.6; margin-bottom:5px;">Configuración de Firebase (JSON format):</label>
                    <textarea id="firebase-config-input" class="glass" style="width:100%; height:150px; padding:10px; font-family:monospace; font-size:0.75rem;" placeholder='{ "apiKey": "...", "authDomain": "...", "projectId": "...", "storageBucket": "...", "messagingSenderId": "...", "appId": "..." }'>${FIREBASE_CONFIG ? JSON.stringify(FIREBASE_CONFIG, null, 2) : ''}</textarea>
                    
                    <button class="btn btn-primary w-100 mt-20" onclick="saveCloudConfig()">
                        <i class="fas fa-save"></i> Guardar y Conectar Nube
                    </button>
                    
                    ${db ? `
                        <div class="mt-20 p-15 glass" style="border: 1px solid #00ff88; text-align: center; background: rgba(0,255,136,0.05);">
                            <span style="color:#00ff88; font-weight:bold;"><i class="fas fa-check-circle"></i> Sincronización Global Activa</span>
                            <p style="font-size:0.7rem; margin-top:5px;">Cada vez que edites algo, se guardará directamente en la nube.</p>
                        </div>
                        <button class="btn btn-outline w-100 mt-20" style="color:#ffcc00; border-color:#ffcc00; font-size:0.7rem;" onclick="forceLocalToCloud()">
                            <i class="fas fa-sync-alt"></i> SINCRONIZAR LOCAL A NUBE (FORZAR)
                        </button>
                    ` : ''}
                    <button class="btn btn-outline w-100 mt-10" style="color:#ff4444; border-color:#ff4444; font-size:0.7rem;" onclick="if(confirm('¿Borrar toda la configuración de conexión? Deberás pegarla de nuevo.')){ localStorage.removeItem('amanecer_firebase_config'); location.reload(); }">
                        <i class="fas fa-trash-alt"></i> RESET CONFIGURACIÓN NUBE
                    </button>
                </div>
            </div>
        `;

        const select = document.getElementById('admin-tourney-select');
        select.addEventListener('change', (e) => {
            const tourneyId = e.target.value;
            if (tourneyId) renderTourneyEditor(tourneyId);
        });
    }

    function renderTourneyEditor(id) {
        const tourney = APP_DATA.tournaments.find(t => t.id === id);
        const editorArea = document.getElementById('admin-editor-area');
        if (!tourney || !editorArea) return;

        let editorHtml = '';

        if (tourney.format === 'liga') {
            editorHtml = `
                <div class="liga-editor">
                    <h4 style="margin-bottom: 20px; color:var(--accent-orange);">Gestión de Tabla de Posiciones</h4>
                    <div style="display: grid; grid-template-columns: 3fr 1fr 1fr 1fr 1fr 1fr; gap: 5px; margin-bottom: 15px; font-size: 0.75rem; opacity:0.6; padding-right:10px;">
                        <div>Nombre del Equipo</div>
                        <div style="text-align:center;">PJ</div>
                        <div style="text-align:center;">PG</div>
                        <div style="text-align:center;">PP</div>
                        <div style="text-align:center;">Pts</div>
                        <div style="text-align:center;">Borrar</div>
                    </div>
                    <div id="team-inputs-container">
                        ${tourney.data.map((team, idx) => `
                            <div class="team-edit-row" style="display: grid; grid-template-columns: 3fr 1fr 1fr 1fr 1fr 1fr; gap: 5px; margin-bottom: 15px;">
                                <input type="text" value="${team.team}" onchange="updateTeamData('${id}', ${idx}, 'team', this.value)" class="glass" style="padding:10px; border-radius:5px; font-size:0.8rem;">
                                <input type="number" value="${team.pj !== undefined ? team.pj : 0}" onchange="updateTeamData('${id}', ${idx}, 'pj', this.value)" class="glass" style="padding:10px; text-align:center; border-radius:5px; font-size:0.8rem;">
                                <input type="number" value="${team.g}" onchange="updateTeamData('${id}', ${idx}, 'g', this.value)" class="glass" style="padding:10px; text-align:center; border-radius:5px; font-size:0.8rem;">
                                <input type="number" value="${team.p}" onchange="updateTeamData('${id}', ${idx}, 'p', this.value)" class="glass" style="padding:10px; text-align:center; border-radius:5px; font-size:0.8rem;">
                                <input type="number" value="${team.pts !== undefined ? team.pts : 0}" onchange="updateTeamData('${id}', ${idx}, 'pts', this.value)" class="glass" style="padding:10px; text-align:center; border-radius:5px; font-size:0.8rem;" placeholder="Puntos">
                                <button class="btn btn-sm btn-outline" style="color:#ff4444; border-color:#ff4444; padding:5px;" onclick="removeTeamFromLiga('${id}', ${idx})">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        `).join('')}
                    </div>
                    <button class="btn btn-outline btn-sm w-100 mt-10" onclick="addTeamToLiga('${id}')">
                        <i class="fas fa-plus"></i> Añadir Nuevo Equipo
                    </button>
                </div>
            `;
        } else {
            // Full Bracket Editor
            editorHtml = `
                <div class="bracket-editor">
                    <h4 style="margin-bottom: 20px; color:var(--accent-orange);">Editor Completo del Bracket</h4>
            `;

            const phases = [
                { key: 'octavos', label: 'Octavos de Final' },
                { key: 'cuartos', label: 'Cuartos de Final' },
                { key: 'semis', label: 'Semifinales' },
                { key: 'final', label: 'Gran Final' }
            ];

            phases.forEach(phase => {
                const matches = phase.key === 'final' ? (tourney.data.final && tourney.data.final.teamA ? [tourney.data.final] : []) : (tourney.data[phase.key] || []);
                if (matches.length > 0) {
                    editorHtml += `<h5 style="margin-top:20px; margin-bottom:10px; color:var(--accent-orange); text-transform:uppercase;">${phase.label}</h5>`;
                    editorHtml += `<div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 15px; margin-bottom:20px;">`;
                    matches.forEach((m, idx) => {
                        editorHtml += `
                            <div class="glass" style="padding:15px; border-radius:10px; border: 1px solid rgba(255,255,255,0.1);">
                                <div style="display:flex; justify-content:space-between; gap:10px; margin-bottom:8px;">
                                    <input type="text" value="${m.teamA}" onchange="updateBracketStage('${id}', '${phase.key}', ${idx}, 'teamA', this.value)" style="width:70%; padding:8px; font-size:0.75rem;" class="glass" placeholder="Equipo A">
                                    <input type="number" value="${m.scoreA}" onchange="updateBracketStage('${id}', '${phase.key}', ${idx}, 'scoreA', this.value)" style="width:25%; padding:8px; text-align:center; font-size:0.75rem;" class="glass">
                                </div>
                                <div style="display:flex; justify-content:space-between; gap:10px; margin-bottom:8px;">
                                    <input type="text" value="${m.teamB}" onchange="updateBracketStage('${id}', '${phase.key}', ${idx}, 'teamB', this.value)" style="width:70%; padding:8px; font-size:0.75rem;" class="glass" placeholder="Equipo B">
                                    <input type="number" value="${m.scoreB}" onchange="updateBracketStage('${id}', '${phase.key}', ${idx}, 'scoreB', this.value)" style="width:25%; padding:8px; text-align:center; font-size:0.75rem;" class="glass">
                                </div>
                                <input type="text" value="${m.winner || ''}" onchange="updateBracketStage('${id}', '${phase.key}', ${idx}, 'winner', this.value)" style="width:100%; padding:8px; font-size:0.75rem;" class="glass" placeholder="Ganador (Dejar vacío si no hay)">
                            </div>
                        `;
                    });
                    editorHtml += `</div>`;
                }
            });

            editorHtml += `</div>`;
        }

        editorArea.innerHTML = editorHtml;
    }

    window.updateTeamData = (tourneyId, idx, field, value) => {
        const tourney = APP_DATA.tournaments.find(t => t.id === tourneyId);
        if (['g', 'p', 'pj', 'pts'].includes(field)) value = parseInt(value) || 0;
        tourney.data[idx][field] = value;
        saveData();
    };

    window.addTeamToLiga = (tourneyId) => {
        const tourney = APP_DATA.tournaments.find(t => t.id === tourneyId);
        tourney.data.push({ rank: tourney.data.length + 1, team: "Nuevo Equipo", pj: 0, g: 0, p: 0, pts: 0 });
        saveData();
        renderTourneyEditor(tourneyId);
    };

    window.removeTeamFromLiga = (tourneyId, idx) => {
        if (!confirm('¿Seguro que quieres eliminar este equipo de la liga?')) return;
        const tourney = APP_DATA.tournaments.find(t => t.id === tourneyId);
        tourney.data.splice(idx, 1);
        saveData();
        renderTourneyEditor(tourneyId);
    };

    window.updateBracketStage = (tourneyId, phase, idx, field, value) => {
        const tourney = APP_DATA.tournaments.find(t => t.id === tourneyId);
        if (field === 'scoreA' || field === 'scoreB') value = parseInt(value) || 0;
        
        let targetMatch = phase === 'final' ? tourney.data.final : tourney.data[phase][idx];
        if (targetMatch) {
            targetMatch[field] = value;
            saveData();
        }
    };

    window.exportAppData = () => {
        const code = `const INITIAL_DATA = ${JSON.stringify(APP_DATA, null, 4)};`;
        const blob = new Blob([code], { type: 'text/javascript' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'data.js';
        a.click();
        
        // También mostrar modal para copiar
        alert('Se ha descargado el nuevo archivo data.js. Reemplázalo en tu carpeta del proyecto para que los cambios sean permanentes para todos.');
    };

    window.adminVerifyUser = (idx) => {
        if (!confirm('¿Seguro que quieres verificar a este usuario? Esto validará su perfil y le otorgará la insignia verídica.')) return;
        
        registeredUsers[idx].verified = true;
        registeredUsers[idx].hasPendingVerification = false;
        
        // Save to DB
        localStorage.setItem('amanecer_users_db', JSON.stringify(registeredUsers));
        
        // If the verified user is the one currently logged in, update current session
        if (currentUser && currentUser.email === registeredUsers[idx].email) {
            currentUser = registeredUsers[idx];
            localStorage.setItem('amanecer_user', JSON.stringify(currentUser));
        }
        
        if (db) syncToCloud();
        alert("Usuario verificado con éxito.");
        renderAdminPanel(); // Refresh view
    };

    window.updateSocialCount = (key, val) => {
        if (!APP_DATA.organization.communityInfo.socialData) {
            APP_DATA.organization.communityInfo.socialData = {
                instagram: { count: 242 }, kick: { count: 271 }, tiktok: { count: 1358 },
                youtube: { count: 119 }, discord: { count: 350 }, whatsapp: { count: 180 }
            };
        }
        APP_DATA.organization.communityInfo.socialData[key].count = parseInt(val) || 0;
        saveData(); // Guitly: Trigger auto-sync to Cloud
    };

    window.saveCloudConfig = () => {
        let input = document.getElementById('firebase-config-input').value.trim();
        
        // Remove variable declaration if present (e.g., const firebaseConfig =)
        if (input.includes('=')) input = input.split('=')[1].trim();
        if (input.endsWith(';')) input = input.slice(0, -1).trim();

        try {
            // Robustly convert JS object-like string to JSON
            const fixedJson = input
                .replace(/([{,])\s*([a-zA-Z0-9_]+)\s*:/g, '$1"$2":') // Add quotes to keys
                .replace(/'/g, '"') // Replace single quotes with double quotes
                .replace(/,\s*([\]}])/g, '$1'); // Remove trailing commas
            
            const config = JSON.parse(fixedJson);
            localStorage.setItem('amanecer_firebase_config', JSON.stringify(config));
            alert("¡Conexión de Nube Exitosa! Reiniciando plataforma...");
            location.reload();
        } catch (e) {
            alert("Error de Formato: Asegúrate de copiar el bloque que empieza con { y termina con } desde tu consola de Firebase.");
        }
    };

    window.forceLocalToCloud = async () => {
        if (!db) return alert("❌ ERROR: No hay una base de datos conectada. Ve a la pestaña 'Nube' y pega tu código JSON de Firebase primero.");
        if (!confirm("⚠️ ¡PELIGRO! Esto borrará los datos de internet y pondrá lo que tienes en pantalla. ¿Confirmas?")) return;
        
        try {
            await db.collection('settings').doc('app_data').set({ data: APP_DATA });
            await db.collection('settings').doc('users').set({ list: registeredUsers });
            alert("✅ ¡ÉXITO! Datos sincronizados. Refresca la página en tus otros dispositivos.");
            location.reload();
        } catch (e) {
            console.error(e);
            if (e.message.includes('permission-denied')) {
                alert("❌ ERROR DE PERMISOS: Debes entrar a tu Consola de Firebase > Cloud Firestore > Reglas y ponerlas en 'Modo Prueba' o permitir lectura/escritura (allow read, write: if true;).");
            } else {
                alert("❌ ERROR DE CONEXIÓN: " + e.message + "\n\nRevisa que el dominio de Netlify esté autorizado en Firebase > Autenticación > Ajustes.");
            }
        }
    };

    // --- Nexus Engine: Automatic Social Counter ---
    const PROXY_URL = "https://api.allorigins.win/get?url=";
    let isScraping = false;
    let scrapeInterval = 30000; // Base: 30s
    let failureCount = 0;

    async function scrapeSocialStats() {
        if (!db || isScraping) return;
        const isAdmin = currentUser && (currentUser.email === 'admin@gmail.com' || currentUser.username === 'admin');
        if (!isAdmin) return;

        isScraping = true;
        const links = INITIAL_DATA.organization.communityInfo.socialLinks;
        const socialData = getSocialData();
        let changed = false;

        async function fetchCount(id, url, regex) {
            try {
                const cleanUrl = url.split('?')[0];
                const response = await fetch(`${PROXY_URL}${encodeURIComponent(cleanUrl)}`);
                const data = await response.json();
                const match = data.contents.match(regex);
                if (match && match[1]) {
                    let countStr = match[1].toLowerCase().replace(/[^0-9.km]/g, '');
                    let count = 0;
                    if (countStr.includes('k')) count = parseFloat(countStr) * 1000;
                    else if (countStr.includes('m')) count = parseFloat(countStr) * 1000000;
                    else count = parseInt(countStr);
                    
                    if (!isNaN(count) && count !== socialData[id].count) {
                        socialData[id].count = count;
                        changed = true;
                    }
                    failureCount = 0;
                    scrapeInterval = 30000; 
                }
            } catch (e) { 
                failureCount++;
                scrapeInterval = Math.min(scrapeInterval * 2, 600000);
            }
        }

        // YouTube: @comunidadamanecer1 (Busca texto de suscriptores)
        await fetchCount('youtube', links.youtube, /"subscriberCountText":\{"accessibility":\{"accessibilityData":\{"label":"([\d.kKmM]+)/);
        
        // Kick: elamanecer (Busca metadato de seguidores)
        await fetchCount('kick', links.kick, /followers_count":(\d+)/);

        // TikTok: @elamanecermlbb
        await fetchCount('tiktok', links.tiktok, /"followerCount":(\d+)/);

        // Instagram fallback
        await fetchCount('instagram', links.instagram, /"edge_followed_by":\{"count":(\d+)/);

        if (changed) {
            APP_DATA.organization.communityInfo.socialData = socialData;
            saveData();
        }
        
        isScraping = false;
        setTimeout(scrapeSocialStats, scrapeInterval);
    }

    if (currentUser && (currentUser.email === 'admin@gmail.com' || currentUser.username === 'admin')) {
        setTimeout(scrapeSocialStats, 5000);
    }

    // --- Nexus Engine: Scroll & Reveal Observer ---
    const revealOptions = { threshold: 0.1, rootMargin: "0px 0px -50px 0px" };
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active-section');
            }
        });
    }, revealOptions);

    document.querySelectorAll('.section, .hero-content').forEach(el => {
        revealObserver.observe(el);
    });

    // --- Nexus Video Sentry: Intelligently Manage Video HW Resources ---
    const videoSentry = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const v = entry.target;
            if (v && v.nodeName === 'VIDEO') {
                if (entry.isIntersecting) {
                    // Play only if visible
                    v.play().catch(() => {}); 
                } else {
                    // Pause immediately to free CPU/Memory/Data
                    v.pause();
                }
            }
        });
    }, { threshold: 0.1 }); // Trigger as soon as 10% is visible

    document.querySelectorAll('video').forEach(vid => videoSentry.observe(vid));

    updateAuthState();
    renderAll();