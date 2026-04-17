const INITIAL_DATA = {
    organization: {
        name: "Amanecer Gaming",
        mission: "Amanecer viene a elevar el escenario competitivo de la región, buscando profesionalizar y crear un equipo de trabajo experto en respuesta a los anhelos a seguir avanzando en el e-Sport de Latinoamérica Sur.",
        values: ["Profesionalismo", "Excelencia", "Comunidad", "Innovación"],
        services: ["Organización de eventos", "Producción Audiovisual", "Gestión de Talento", "Marketing Digital"],
        history: "Amanecer nace de la necesidad de suplir y elevar el nivel competitivo de la región, proyectando un equipo de profesionales hacia una aspiración de ProLeague.",
        communityInfo: {
            growth: "Logramos un crecimiento avanzado en un periodo de seis meses (Aun no cumplimos el año).",
            views: "Más de 1.000.000 de visualizaciones en nuestras redes sociales.",
            partners: ["Creadores Oficiales de Moonton", "Marcas Líderes del Sector e-Sport LS"],
            milestones: [
                { id: 1, label: "Visualizaciones", value: "1M+", icon: "fa-eye" },
                { id: 2, label: "Crecimiento", value: "6 Meses", icon: "fa-chart-line" },
                { id: 3, label: "Partners", value: "Oficial Moonton", icon: "fa-check-circle" },
                { id: 4, label: "Impacto", value: "Regional Sur", icon: "fa-globe-americas" }
            ],
            socialLinks: {
                instagram: "https://www.instagram.com/elamanecermlbb?igsh=MXVvZng1cWFrcnptcg==",
                kick: "https://kick.com/elamanecer",
                tiktok: "https://www.tiktok.com/@elamanecermlbb?_r=1&_t=ZS-9515UcpC5C4",
                discord: "https://discord.gg/kGQFFnmBuG",
                youtube: "https://youtube.com/@comunidadamanecer1?si=iAAQHnveTqejkNLT",
                whatsapp: "https://chat.whatsapp.com/LPUb3w7lbgILbDFVf54AX3?mode=ac_t"
            },
            socialReach: "Amanecer viene a elevar el escenario competitivo de la región, buscando profesionalizar y crear un equipo de trabajo experto en respuesta a los anhelos a seguir avanzando en el e-Sport de Latinoamérica Sur."
        }
    },
    squads: [
        {
            title: "SQUAD AMANECER",
            logo: "images/squad-logo.png",
            description: "Amanecer Squad nace de la idea de construir un equipo serio, con disciplina y mentalidad competitiva, con un equipo de trabajo dedicado a él compuesto por managers, coaching, marketing y publicidad para poder trascender, enfocarse en lo importante y lograr los objetivos a futuro. Construimos una identidad reconocible para poder desarrollar un estilo de juego definido y poder destacar en el circuito competitivo. Para ello, valores como la disciplina a la hora de cumplir horarios, la mentalidad competitiva, la comunicación efectiva y la motivación son los pilares más destacables a la hora de hablar de este squad.",
            roster: {
                starters: [
                    { name: "Kyse2K.", role: "Jungla", photo: "images/valeninho.jpeg", specialty: "Suyou", bio: "Hola soy Kyse2K. (mas conocido como mono con navaja o valen) soy main jg pero juego mejor fuera de la partida, mi héroe favorito es suyou pq es muy versátil y bueno soy la vrg de jg", highlightVideo: "video/video-mejor-jugada.mp4" },
                    { name: "Thai", role: "Exp Lane", photo: "images/thai exp.jpeg", specialty: "Exp", bio: "Thai, titular en la línea de experiencia de Amanecer." },
                    { name: "ᴀʏᴀɴᴀᴍɪ.", role: "Mid Lane", photo: "images/ayanami.jpeg", specialty: "Gord", bio: "soy ayanami, soy main y mid me gusta mucho gord pq es medio inútil y me representa" },
                    { name: "ToquinhoSSJ:v", role: "Gold Lane (Líder)", photo: "images/toqui.jpeg", specialty: "Moskov", bio: "Soy Toqui, soy main moskov y a su vez es mi pj favorito, me gusta mucho por su movilidad y la facilidad de poder hacer separar a los enemigos" },
                    { name: "Husky", role: "Roamer", photo: "images/husky.jpeg", specialty: "Roam", bio: "Soy Husky, el nuevo Roamer y me gusta jugar con héroes de soporte y tanques." }
                ],
                substitutes: [
                    { name: "Matinho.", role: "Roam Suplente", photo: "images/matinho.jpeg", specialty: "Roam", bio: "" },
                    { name: "Jszy", role: "Exp Suplente", photo: "images/jszy.jpeg", specialty: "Badang", bio: "Hola, soy Jszy. Soy \"main\" Exp y mi personaje favorito es Badang, aunque me caigo mucho a pedazos, me gusta mucho por el simple hecho de salir de la nada y armar tf, o regalarme como un campeon." }
                ],
                managers: [
                    { name: "Karma", role: "Coach", photo: "images/karma coach.jpeg", bio: "Coach del equipo encargado de las estrategias y formación." },
                    { name: "Mia", role: "Manager Amanecer", photo: "images/mia-squad.jpeg", bio: "Sociable, empática y perfeccionista. Encargada de gestionar y acompañar al squad de Amanecer." },
                    { name: "Rodri", role: "Manager Amanecer", photo: "images/rodri.jpeg", bio: "Siempre predispuesto a ayudar y garantizar que al equipo competitivo no le falte nada." }
                ]
            },
            achievements: [
                { title: "Copa Amanecer I", year: "2025", rank: "1st Place", icon: "fa-trophy" },
                { title: "Liga Regional Sur", year: "2025", rank: "Finalist", icon: "fa-medal" },
                { title: "Invitacional MLBB", year: "2024", rank: "Champion", icon: "fa-award" }
            ]
        },
        {
            title: "SQUAD ATARDECER",
            logo: "images/logo-sq-atardecer.png",
            description: "El nuevo equipo de Amanecer Gaming eSports, formado para sumar nuevas estrategias, competir al más alto nivel y ampliar nuestra representación en los circuitos regionales. Atardecer llega para demostrar que el talento y la disciplina son los cimientos de nuestra organización.",
            roster: {
                starters: [
                    { name: "Akenoholic. ౨ৎ", role: "Jungla", photo: "images/akenoholic.jpeg", specialty: "Fanny / Franco", bio: "Soy main Fanny, y mi personaje favorito es Franco." },
                    { name: "Qiqi", role: "Exp Lane", photo: "images/qiqi.jpeg", specialty: "Lapu Lapu / Gloo", bio: "Soy qiqi, soy Main jg pero estoy haciendo reroll para xp, mi personaje favorito es lapu lapu y mi pick confort es gloo" },
                    { name: "Himmel.", role: "Mid Lane", photo: "images/himmel.jpeg", specialty: "Valentina", bio: "Liga mvp y glamou" },
                    { name: "Pro Tetris", role: "Gold Lane (Líder)", photo: "images/pro-tetris.jpeg", specialty: "Moskov / Benedetta", bio: "Líder del equipo. Soy main moskov y mi personaje favorito benedetta" },
                    { name: "•|Y̷o̷u̷t̷h̷", role: "Roamer", photo: "images/youth.jpeg", specialty: "Grock", bio: "Liga mvp, glamur, torneos por diamantes y por plata" }
                ],
                substitutes: [],
                managers: [
                    { name: "Moon", role: "Manager Atardecer", photo: "images/moon.jpeg", bio: "Encargada de acompañar y guiar al nuevo squad Atardecer en cada uno de sus pasos." },
                    { name: "Xoan", role: "Manager Atardecer", photo: "images/xoan.jpeg", bio: "Apoyo fundamental en la gestión, buscando que el equipo brille en el escenario competitivo." }
                ]
            },
            achievements: []
        }
    ],
    team: [
        { name: "Akaza", role: "Edición y Programación", photo: "images/andres-esports.jpeg", bio: "Soy una persona que siempre aspira a más, me encanta ir por todo y darlo todo, siempre pensando en cosas cada vez más grandes y mejores hechas." },
        { name: "Anto", role: "Marketing y Diseño", photo: "images/anto-mkt.jpeg", bio: "Capaz de amoldarme a cualquier situación. Resolutiva, responsable y diligente. Me apasiona ayudar en todo lo posible." },
        { name: "Dami", role: "Casteo y Stream", photo: "images/dami-stream.jpeg", bio: "Disfruto crear sinergias con mis compañeros para que todo fluya. Atento al chat para mejorar en tiempo real junto a los espectadores." },
        { name: "Bel", role: "Gabinete Psicológico y Admin de eSports", photo: "images/bel-psico.jpeg", bio: "Empática y en constante aprendizaje. Mi meta es ayudar a tener un buen mental ante cualquier escenario competitivo." },
        { name: "Jona", role: "Casteo y Stream", photo: "images/jona-stream.jpeg", bio: "Proactivo y enfocado en brindar una experiencia atractiva. Mi formación técnica me permite dar lo mejor en cualquier escenario." },
        { name: "Mia", role: "Marketing y Diseño", photo: "images/mia-mkt.jpeg", bio: "Sociable, empática y perfeccionista. Me gusta el trabajo en equipo y aprender constantemente de los procesos de Amanecer." },
        { name: "Pink", role: "Marketing y Diseño", photo: "images/pink-mkt.jpeg", bio: "Amanecer nace para dar respuesta a la necesidad de la comunidad de tener un espacio para jugar, competir y socializar." }
    ],
    games: [
        { id: 'mlbb', name: 'Mobile Legends: Bang Bang', image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80', description: 'Nuestro enfoque principal en MOBA mobile.' },
        { id: 'minecraft', name: 'Minecraft', image: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?auto=format&fit=crop&w=800&q=80', description: 'Torneos de construcción y supervivencia.' },
        { id: 'among-us', name: 'Among Us', image: 'https://images.unsplash.com/photo-1605899435973-ca241a8861fd?auto=format&fit=crop&w=800&q=80', description: 'Partidas competitivas de deducción social.' }
    ],
    tournaments: [
        {
            id: 'verano-2026',
            name: 'Torneo de Verano',
            image: 'images/logo-torneo-verano.png',
            game: 'mlbb',
            format: 'bracket',
            status: 'proximamente',
            prize: '100.000 ARG',
            price: '10.000 ARG / 8 USD',
            date: '6 y 7 de Febrero',
            server: 'Argentina',
            slots: '16 Squads',
            rules: 'Eliminación directa (Bo1 Octavos/Cuartos, Bo3 Semi/Final)',
            participants: [],
            data: {
                octavos: Array(8).fill(null).map((_, i) => ({ id: i, teamA: "Por definir", teamB: "Por definir", scoreA: 0, scoreB: 0 })),
                cuartos: Array(4).fill(null).map((_, i) => ({ id: i + 8, teamA: "Por definir", teamB: "Por definir", scoreA: 0, scoreB: 0 })),
                semis: Array(2).fill(null).map((_, i) => ({ id: i + 12, teamA: "Por definir", teamB: "Por definir", scoreA: 0, scoreB: 0 })),
                final: { id: 14, teamA: "Por definir", teamB: "Por definir", winner: null, scoreA: 0, scoreB: 0 }
            }
        },
        {
            id: 'valentin-2026',
            name: 'Torneo de San Valentín',
            image: 'images/logo-torneo-san-valentin.png',
            game: 'mlbb',
            format: 'bracket',
            status: 'proximamente',
            prize: '100.000 ARG',
            price: '10.000 ARG / 8 USD',
            date: '20 y 21 de Febrero',
            server: 'Argentina',
            slots: '16 Squads',
            description: 'Celebrando la unión de compañeros y amigos con jugosos premios.',
            participants: [],
            data: {
                octavos: Array(8).fill(null).map((_, i) => ({ id: i, teamA: "TBD", teamB: "TBD", scoreA: 0, scoreB: 0 })),
                cuartos: Array(4).fill(null).map((_, i) => ({ id: i + 8, teamA: "TBD", teamB: "TBD", scoreA: 0, scoreB: 0 })),
                semis: Array(2).fill(null).map((_, i) => ({ id: i + 12, teamA: "TBD", teamB: "TBD", scoreA: 0, scoreB: 0 })),
                final: { id: 14, teamA: "TBD", teamB: "TBD", scoreA: 0, scoreB: 0 }
            }
        },
        {
            id: 'spooky-cup',
            name: 'Spooky Cup (Halloween)',
            image: 'images/logo-spooky-cup.png',
            game: 'mlbb',
            format: 'bracket',
            status: 'proximamente',
            prize: '100.000 ARG',
            price: '10.000 ARG / 8 USD',
            date: '7 y 8 de Noviembre',
            server: 'Argentina',
            slots: '16 Squads',
            participants: ['Nightmares', 'Ghost Squad', 'Dark Lords', 'Shadows', 'Wizards', 'Zombies', 'Pumpkins', 'Spooks'],
            data: {
                octavos: Array(8).fill(null).map((_, i) => ({ id: i+100, teamA: "TBD", teamB: "TBD", scoreA: 0, scoreB: 0 })),
                cuartos: [
                    { id: 1, teamA: "Nightmares", teamB: "Zombies", winner: "Nightmares", scoreA: 2, scoreB: 0 },
                    { id: 2, teamA: "Ghost Squad", teamB: "Shadows", winner: "Ghost Squad", scoreA: 2, scoreB: 1 },
                    { id: 3, teamA: "Dark Lords", teamB: "Wizards", winner: "Dark Lords", scoreA: 2, scoreB: 0 },
                    { id: 4, teamA: "Pumpkins", teamB: "Spooks", winner: "Pumpkins", scoreA: 2, scoreB: 1 }
                ],
                semis: [
                    { id: 5, teamA: "Nightmares", teamB: "Ghost Squad", winner: "Ghost Squad", scoreA: 1, scoreB: 2 },
                    { id: 6, teamA: "Dark Lords", teamB: "Pumpkins", winner: "Dark Lords", scoreA: 2, scoreB: 0 }
                ],
                final: { id: 7, teamA: "Ghost Squad", teamB: "Dark Lords", winner: "Dark Lords", scoreA: 1, scoreB: 3 }
            }
        },
        {
            id: 'navidarks',
            name: 'Torneo Navidarks',
            image: 'images/logo-torneo-navidarks.png',
            game: 'mlbb',
            format: 'bracket',
            status: 'proximamente',
            prize: '100.000 ARG',
            price: '10.000 ARG / 8 USD',
            date: '19 y 20 de Diciembre',
            server: 'Argentina',
            slots: '16 Squads',
            participants: ['Grinch Squad', 'Elf Warriors', 'Santa Kings', 'Snow Storm'],
            data: {
                octavos: Array(8).fill(null).map((_, i) => ({ id: i+10, teamA: "TBD", teamB: "TBD", scoreA: 0, scoreB: 0 })),
                cuartos: Array(4).fill(null).map((_, i) => ({ id: i+20, teamA: "TBD", teamB: "TBD", scoreA: 0, scoreB: 0 })),
                semis: [
                    { id: 1, teamA: "Grinch Squad", teamB: "Snow Storm", winner: "Grinch Squad", scoreA: 2, scoreB: 0 },
                    { id: 2, teamA: "Elf Warriors", teamB: "Santa Kings", winner: "Elf Warriors", scoreA: 2, scoreB: 1 }
                ],
                final: { id: 3, teamA: "Grinch Squad", teamB: "Elf Warriors", winner: "Grinch Squad", scoreA: 3, scoreB: 2 }
            }
        },
        {
            id: 'primavera',
            name: 'Torneo Primavera',
            image: 'images/logo-torneo-primavera.png',
            game: 'mlbb',
            format: 'bracket',
            status: 'proximamente',
            prize: '100.000 ARG',
            price: '10.000 ARG / 8 USD',
            date: '26 y 27 de Septiembre',
            server: 'Argentina',
            slots: '16 Squads',
            participants: [],
            data: {
                octavos: Array(8).fill(null).map((_, i) => ({ id: i, teamA: "TBD", teamB: "TBD", scoreA: 0, scoreB: 0 })),
                cuartos: Array(4).fill(null).map((_, i) => ({ id: i + 8, teamA: "TBD", teamB: "TBD", scoreA: 0, scoreB: 0 })),
                semis: Array(2).fill(null).map((_, i) => ({ id: i + 12, teamA: "TBD", teamB: "TBD", scoreA: 0, scoreB: 0 })),
                final: { id: 14, teamA: "TBD", teamB: "TBD", scoreA: 0, scoreB: 0 }
            }
        },
        {
            id: 'amanecer-mensual',
            name: 'Torneo Amanecer Mensual',
            image: 'images/logo-torneo-amanecer.png',
            game: 'mlbb',
            format: 'bracket',
            status: 'abierto',
            prize: '100.000 ARG',
            price: '10.000 ARG / 8 USD',
            date: '02 y 03 de Mayo',
            server: 'Argentina',
            slots: '16 Squads',
            description: 'Espacio para medir nivel antes de eventos de alta gama. Clasifica a la Liga Amanecer.',
            participants: [],
            data: {
                octavos: Array(8).fill(null).map((_, i) => ({ id: i, teamA: "TBD", teamB: "TBD", scoreA: 0, scoreB: 0 })),
                cuartos: Array(4).fill(null).map((_, i) => ({ id: i + 8, teamA: "TBD", teamB: "TBD", scoreA: 0, scoreB: 0 })),
                semis: Array(2).fill(null).map((_, i) => ({ id: i + 12, teamA: "TBD", teamB: "TBD", scoreA: 0, scoreB: 0 })),
                final: { id: 14, teamA: "TBD", teamB: "TBD", scoreA: 0, scoreB: 0 }
            }
        },
        {
            id: 'liga-sakura',
            name: 'Liga Sakura (Femenina)',
            image: 'images/logo-liga-sakura.png',
            game: 'mlbb',
            format: 'liga',
            status: 'proximamente',
            prize: '80.000 ARG',
            price: '15.000 ARG / 11 USD',
            date: '2 Semanas',
            server: 'Argentina',
            slots: '2 Divisiones, 5 Squads por div',
            description: 'Plataforma para que equipos femeninos demuestren su habilidad.',
            participants: ['Sakura Warriors', 'Flower Power', 'Moonlight', 'Sunlight', 'Starlight'],
            data: [
                { rank: 1, team: "Sakura Warriors", pj: 0, g: 0, p: 0, pts: 0 },
                { rank: 2, team: "Flower Power", pj: 0, g: 0, p: 0, pts: 0 },
                { rank: 3, team: "Moonlight", pj: 0, g: 0, p: 0, pts: 0 },
                { rank: 4, team: "Sunlight", pj: 0, g: 0, p: 0, pts: 0 },
                { rank: 5, team: "Starlight", pj: 0, g: 0, p: 0, pts: 0 }
            ]
        },
        {
            id: 'liga-amanecer-pro',
            name: 'Liga Amanecer (Alto Rendimiento)',
            image: 'images/logo-liga-amanecer.png',
            game: 'mlbb',
            format: 'liga',
            status: 'proximamente',
            prize: '150.000 ARG + Art. Electrónico',
            price: '15.000 ARG / 11 USD',
            date: '14 Ago - 6 Sep',
            server: 'Argentina',
            slots: '2 Divisiones, 10 Squads por div',
            description: 'Liga de alto rendimiento aspirando a ProLeague.',
            participants: ['Amanecer Elite', 'Titan eSports', 'Redemption', 'Vortex', 'Pulse', 'Zenith', 'Nova', 'Echo', 'Frost', 'Blaze'],
            data: [
                { rank: 1, team: "Amanecer Elite", pj: 0, g: 0, p: 0, pts: 0 },
                { rank: 2, team: "Titan eSports", pj: 0, g: 0, p: 0, pts: 0 },
                { rank: 3, team: "Redemption", pj: 0, g: 0, p: 0, pts: 0 },
                { rank: 4, team: "Vortex", pj: 0, g: 0, p: 0, pts: 0 },
                { rank: 5, team: "Pulse", pj: 0, g: 0, p: 0, pts: 0 },
                { rank: 6, team: "Zenith", pj: 0, g: 0, p: 0, pts: 0 },
                { rank: 7, team: "Nova", pj: 0, g: 0, p: 0, pts: 0 },
                { rank: 8, team: "Echo", pj: 0, g: 0, p: 0, pts: 0 },
                { rank: 9, team: "Frost", pj: 0, g: 0, p: 0, pts: 0 },
                { rank: 10, team: "Blaze", pj: 0, g: 0, p: 0, pts: 0 }
            ]
        },
        {
            id: 'liga-amanecer-all-stars',
            name: 'Liga Amanecer: All Stars',
            image: 'images/logo-liga-all-stars.png',
            game: 'mlbb',
            format: 'bracket',
            status: 'proximamente',
            prize: 'Por definir',
            price: 'Por definir',
            date: 'Por definir',
            server: 'Argentina',
            slots: '8 cupos',
            description: 'Solo pueden acceder aquellos que hayan ganado un torneo o una liga del amanecer. Se celebra 1 vez al año, solo las leyendas pueden enfrentarse entre sí.',
            participants: ['Campeón 1', 'Campeón 2', 'Campeón 3', 'Campeón 4', 'Campeón 5', 'Campeón 6', 'Campeón 7', 'Campeón 8'],
            data: {
                cuartos: [
                    { id: 301, teamA: "Por Definir", scoreA: 0, teamB: "Por Definir", scoreB: 0, status: "pending" },
                    { id: 302, teamA: "Por Definir", scoreA: 0, teamB: "Por Definir", scoreB: 0, status: "pending" },
                    { id: 303, teamA: "Por Definir", scoreA: 0, teamB: "Por Definir", scoreB: 0, status: "pending" },
                    { id: 304, teamA: "Por Definir", scoreA: 0, teamB: "Por Definir", scoreB: 0, status: "pending" }
                ],
                semis: [
                    { id: 305, teamA: "TBD", scoreA: 0, teamB: "TBD", scoreB: 0, status: "pending" },
                    { id: 306, teamA: "TBD", scoreA: 0, teamB: "TBD", scoreB: 0, status: "pending" }
                ],
                final: { id: 307, teamA: "TBD", scoreA: 0, teamB: "TBD", scoreB: 0, status: "pending" }
            }
        }
    ],
    community: [
        { user: "Pink", action: "se unió a la Liga Sakura", time: "hace 2 min" },
        { user: "DarkLila", action: "registró su squad para el Torneo de Verano", time: "hace 10 min" },
        { user: "NeonRunner", action: "ganó un MVP en Spooky Cup", time: "hace 1 hora" },
        { user: "Moonton_Official", action: "verificó la nueva liga", time: "hace 3 horas" }
    ]
};
