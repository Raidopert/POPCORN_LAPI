(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/components/game/boss-intro.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "BossIntroOverlay",
    ()=>BossIntroOverlay
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
/**
 * «КАК ПОБЕДИТЬ?» — интро-карточка перед каждым босс-уровнем (0.0.42).
 *
 * Босс-уровень стартует на паузе (движок держит introHold): игрок читает
 * инструкцию и видит портрет босса, кнопка «В БОЙ!» отпускает геймплей.
 * Инструкция у каждого своя:
 *   МАЛЫШ          — толкай попкорн резким махом, малыш наестся и отвалит;
 *   КУНИЦА ЛАНА    — перерезай её длинные лапки свайпом;
 *   МЕГА-ГОЛУБЬ    — тело неуязвимо, бей точно по глазам;
 *   ЦЫГАНСКАЯ РУКА — шлёпай по ладони, уворачивайся от летящих зёрен.
 *
 * Портрет — пиксельный спрайт (sprites.makeBossPortraitSprite), рисуется
 * на канвасе с imageSmoothingEnabled=false: честный 8-бит, как в игре.
 * Текст — настоящий HTML поверх арта: чётко на любом из 4 языков.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/render/components/motion/proxy.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$game$2f$audio$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/game/audio.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$game$2f$sprites$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/game/sprites.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
/** Ключ имени босса в HUD-словаре (МАЛЫШ / ЛАНА / ГОЛУБЬ / РУКА / ЛЬВ) */ const BOSS_NAME_KEY = {
    kid: 'hud.boss',
    marten: 'hud.bossMarten',
    pigeon: 'hud.bossPigeon',
    gypsy: 'hud.bossGypsy',
    lion: 'hud.bossLion'
};
/** Иконка-эмодзи рядом с портретом — как в HUD */ const BOSS_ICON = {
    kid: '👶',
    marten: '🦡',
    pigeon: '🐦',
    gypsy: '💍',
    lion: '🦁'
};
/** Королевский тронный зал с почестями — фон босс-файта с ОНЛИФАНСИЕМ (0.0.48).
 *  Ужат в WebP (1440px, q62, ~82 КБ). Тёмный градиент-скрим сверху — читаемость текста. */ const THRONE_BG = '/throne.webp';
function BossIntroOverlay({ t, level, kind, onGo }) {
    _s();
    const canvasRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    /* Портрет: рисуем пиксельный спрайт крупно без сглаживания */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "BossIntroOverlay.useEffect": ()=>{
            const cv = canvasRef.current;
            if (!cv) return;
            const spr = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$game$2f$sprites$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["makeBossPortraitSprite"])(kind);
            const SCALE = 7;
            const w = spr.w * SCALE;
            const h = spr.h * SCALE;
            cv.width = w;
            cv.height = h;
            const ctx = cv.getContext('2d');
            if (!ctx) return;
            ctx.imageSmoothingEnabled = false;
            ctx.clearRect(0, 0, w, h);
            ctx.drawImage(spr.canvas, 0, 0, spr.w, spr.h, 0, 0, w, h);
        }
    }["BossIntroOverlay.useEffect"], [
        kind
    ]);
    /* Барабанная дробь перед боем: вход в босс-бой — событие.
      0.0.44: свой мрачный звук вместо общего штрафа */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "BossIntroOverlay.useEffect": ()=>{
            const tm = window.setTimeout({
                "BossIntroOverlay.useEffect.tm": ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$game$2f$audio$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["audio"].play('bossIntro')
            }["BossIntroOverlay.useEffect.tm"], 260);
            return ({
                "BossIntroOverlay.useEffect": ()=>window.clearTimeout(tm)
            })["BossIntroOverlay.useEffect"];
        }
    }["BossIntroOverlay.useEffect"], []);
    /* v0.0.59: Esc = «В БОЙ!» — доступность клавиатуры для модалки */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "BossIntroOverlay.useEffect": ()=>{
            const onKey = {
                "BossIntroOverlay.useEffect.onKey": (e)=>{
                    if (e.key === 'Escape') {
                        e.preventDefault();
                        onGo();
                    }
                }
            }["BossIntroOverlay.useEffect.onKey"];
            window.addEventListener('keydown', onKey);
            return ({
                "BossIntroOverlay.useEffect": ()=>window.removeEventListener('keydown', onKey)
            })["BossIntroOverlay.useEffect"];
        }
    }["BossIntroOverlay.useEffect"], [
        onGo
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
        className: "absolute inset-0 z-50 flex flex-col items-center overflow-y-auto bg-[#1d0f06]/95 p-3 backdrop-blur-sm [@media(max-height:520px)]:p-2 sm:p-5",
        /* Только у финального босса ОНЛИФАНСИЯ: за спиной — тронный зал королевы.
       * Фон через CSS-бэкграунд: тянется на всю прокручиваемую область,
       * скрим (тёмный градиент) поверх — чтобы все тексты остались читаемы. */ style: kind === 'lion' ? {
            backgroundImage: `linear-gradient(rgba(29,15,6,0.70), rgba(29,15,6,0.70)), url("${THRONE_BG}")`,
            backgroundSize: 'cover, cover',
            backgroundPosition: 'center, center',
            backgroundRepeat: 'no-repeat, no-repeat'
        } : undefined,
        initial: {
            opacity: 0
        },
        animate: {
            opacity: 1
        },
        exit: {
            opacity: 0,
            pointerEvents: 'none'
        },
        role: "dialog",
        "aria-modal": "true",
        "aria-label": t('bossintro.title'),
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                "aria-hidden": true,
                className: "pointer-events-none absolute inset-0 opacity-[0.08]",
                style: {
                    background: 'repeating-conic-gradient(from 0deg at 50% 38%, #e24b3b 0deg 6deg, transparent 6deg 18deg)'
                }
            }, void 0, false, {
                fileName: "[project]/src/components/game/boss-intro.tsx",
                lineNumber: 120,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                className: "z-10 mt-1 flex shrink-0 items-center gap-2 rounded-full border-2 border-[#e3cba4]/40 bg-[#B33A26] px-4 py-1.5 shadow-[0_6px_20px_rgba(0,0,0,0.45)] [@media(max-height:520px)]:py-1",
                initial: {
                    y: -18,
                    opacity: 0
                },
                animate: {
                    y: 0,
                    opacity: 1
                },
                transition: {
                    delay: 0.08,
                    type: 'spring',
                    stiffness: 300,
                    damping: 22
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        "aria-hidden": true,
                        className: "text-sm leading-none",
                        children: "⚔"
                    }, void 0, false, {
                        fileName: "[project]/src/components/game/boss-intro.tsx",
                        lineNumber: 136,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "font-pixel text-sm font-bold tracking-wide text-[#FFF3DC] [@media(max-height:520px)]:text-xs sm:text-base",
                        children: t('bossintro.title')
                    }, void 0, false, {
                        fileName: "[project]/src/components/game/boss-intro.tsx",
                        lineNumber: 139,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        "aria-hidden": true,
                        className: "text-sm leading-none",
                        children: "⚔"
                    }, void 0, false, {
                        fileName: "[project]/src/components/game/boss-intro.tsx",
                        lineNumber: 142,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/game/boss-intro.tsx",
                lineNumber: 130,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].p, {
                className: "relative z-20 mt-1.5 shrink-0 rounded-full border border-amber-300/40 bg-black/40 px-3 py-1 font-pixel text-[11px] font-bold text-amber-100",
                initial: {
                    opacity: 0
                },
                animate: {
                    opacity: 1
                },
                transition: {
                    delay: 0.12
                },
                children: [
                    t('bossintro.tag'),
                    " · ",
                    t('bossintro.lvl', {
                        n: level
                    }),
                    " · ",
                    t(BOSS_NAME_KEY[kind]),
                    ' ',
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        "aria-hidden": true,
                        children: BOSS_ICON[kind]
                    }, void 0, false, {
                        fileName: "[project]/src/components/game/boss-intro.tsx",
                        lineNumber: 156,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/game/boss-intro.tsx",
                lineNumber: 149,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "z-10 flex min-h-0 w-full flex-1 items-center justify-center py-2 [@media(max-height:520px)]:py-1",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                    className: "flex items-center justify-center rounded-lg border-[6px] border-[#f6e7c9] bg-[#f6e7c9] p-2 shadow-[0_18px_50px_rgba(0,0,0,0.6)] [@media(max-height:520px)]:border-4 sm:border-[8px]",
                    initial: {
                        scale: 0.82,
                        rotate: -5,
                        opacity: 0
                    },
                    animate: {
                        scale: 1,
                        rotate: -1.5,
                        opacity: 1
                    },
                    transition: {
                        delay: 0.14,
                        type: 'spring',
                        stiffness: 210,
                        damping: 20
                    },
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("canvas", {
                        ref: canvasRef,
                        "aria-hidden": true,
                        /* 0.0.51: размер от высоты (vmin от меньшей стороны) — на низких окнах
             * рамка больше не наезжает на подпись и кнопку «В БОЙ!» */ className: "h-[clamp(88px,20vmin,140px)] w-auto",
                        style: {
                            imageRendering: 'pixelated'
                        }
                    }, void 0, false, {
                        fileName: "[project]/src/components/game/boss-intro.tsx",
                        lineNumber: 167,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/components/game/boss-intro.tsx",
                    lineNumber: 161,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/game/boss-intro.tsx",
                lineNumber: 160,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                className: "z-10 flex w-full max-w-md shrink-0 flex-col items-center gap-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] [@media(max-height:520px)]:gap-1",
                initial: {
                    y: 22,
                    opacity: 0
                },
                animate: {
                    y: 0,
                    opacity: 1
                },
                transition: {
                    delay: 0.22,
                    type: 'spring',
                    stiffness: 260,
                    damping: 22
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "rounded-lg bg-[#f6e7c9] px-4 py-2 text-center font-ui text-[13px] font-semibold leading-snug text-[#4A2A12] [@media(max-height:520px)]:px-3 [@media(max-height:520px)]:text-[11px] sm:text-sm",
                        children: t(`bossintro.${kind}`)
                    }, void 0, false, {
                        fileName: "[project]/src/components/game/boss-intro.tsx",
                        lineNumber: 185,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "button",
                        autoFocus: true,
                        onClick: ()=>{
                            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$game$2f$audio$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["audio"].play('click');
                            onGo();
                        },
                        className: "mt-0.5 w-full rounded-xl bg-[#E24B3B] px-6 py-3 font-pixel text-base text-white shadow-[0_5px_0_#9c2f22] transition-all hover:bg-[#ef5a4a] active:translate-y-[3px] active:shadow-[0_2px_0_#9c2f22] [@media(max-height:520px)]:py-2 sm:text-lg",
                        children: t('bossintro.go')
                    }, void 0, false, {
                        fileName: "[project]/src/components/game/boss-intro.tsx",
                        lineNumber: 188,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/game/boss-intro.tsx",
                lineNumber: 179,
                columnNumber: 7
            }, this)
        ]
    }, "boss-intro", true, {
        fileName: "[project]/src/components/game/boss-intro.tsx",
        lineNumber: 96,
        columnNumber: 5
    }, this);
}
_s(BossIntroOverlay, "3TxLUT4G/2bchvsDEZDuuiCxAL8=");
_c = BossIntroOverlay;
var _c;
__turbopack_context__.k.register(_c, "BossIntroOverlay");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/game/marten-scene.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>MartenScene
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
/**
 * MartenScene — «живая куница» для главного меню
 * «POPCORN PAWS».
 *
 * Полностью процедурная canvas-сцена без внешних зависимостей (импортируется
 * только react; аудио и i18n не используются):
 *  - уютная комната: тёплая стена (градиент), деревянный пол с досками, плинтус;
 *  - декор комнаты богатеет вместе со стадией роста stage 0..6;
 *  - куница — конечный автомат состояний idle / walk / bat / happy:
 *    ходьба с лапами в противофазе, удары лапой по зерну, двойной подскок
 *    с сердечками, моргание, пышный хвост с бегущей синусоидой;
 *  - 3 зерна попкорна с физикой: гравитация, отскоки с затуханием, вращение,
 *    переспавн за краем экрана;
 *  - тап по кунице → happy + сердечки, тап по полу → куница идёт к точке;
 *  - КЛИКЕР: каждый тап по комнате (пока NANA дома) даёт валюту — наружу
 *    торчит колбэк onTap, сцена рисует летящие «+1» и не даёт фермить
 *    автокликером быстрее ~6 тапов в секунду.
 *
 * Один rAF-цикл, dt капается до 50 мс, пауза рендера при document.hidden,
 * DPR-масштабирование (кап 2) через ResizeObserver, полная очистка в cleanup.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
/* ──────────────────────────── Утилиты ──────────────────────────── */ const clamp = (v, min, max)=>Math.min(max, Math.max(min, v));
const rand = (min, max)=>min + Math.random() * (max - min);
const dirOf = (dx)=>dx >= 0 ? 1 : -1;
/** Детерминированный псевдорандом — статичный декор не мерцает между кадрами */ const prand = (n)=>{
    const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
    return x - Math.floor(x);
};
/** Безопасный выбор цвета из палитры по индексу */ const pickColor = (arr, i)=>arr[i % arr.length] ?? '#FFD166';
/* ── геометрия куницы по стадии роста ── */ const stageNorm = (stage)=>clamp(stage, 0, 6) / 6;
/** масштаб зверя: 0.55 (котёнок) … 1.15 (взрослая куница) */ const martenScale = (stage)=>0.55 + 0.1 * clamp(stage, 0, 6);
/** длина корпуса в локальных единицах (растёт со стадией) */ const bodyLenOf = (stage)=>88 + 34 * stageNorm(stage);
/* ── палитры и мелкие константы ── */ const GARLAND_COLORS = [
    '#E24B3B',
    '#F2A24B',
    '#FFD166',
    '#7FB069'
];
const CONFETTI_COLORS = [
    '#FFD166',
    '#F2A24B',
    '#E24B3B',
    '#7FB069',
    '#FFE066'
];
/** Лепестки пухлого зерна попкорна: [offsetX, offsetY, радиус] */ const KERNEL_LOBES = [
    [
        -4.6,
        0.6,
        5.6
    ],
    [
        4.6,
        0.6,
        5.6
    ],
    [
        0,
        -4,
        6
    ],
    [
        0,
        0.6,
        4.8
    ]
];
/** Усы: [наклон рад, длина как доля headR] */ const WHISKERS = [
    [
        -0.3,
        0.85
    ],
    [
        0.05,
        1
    ],
    [
        0.42,
        0.8
    ]
];
function MartenScene({ stage, away = false, onTap, tapCoins = 1, tapXp = 1, className, ariaLabel }) {
    _s();
    const canvasRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const stageRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(stage);
    const awayRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(away);
    const onTapRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(onTap);
    const tapGainRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])({
        coins: tapCoins,
        xp: tapXp
    });
    // стадия и «отъезд» меняются без перезапуска анимационного эффекта
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "MartenScene.useEffect": ()=>{
            stageRef.current = stage;
        }
    }["MartenScene.useEffect"], [
        stage
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "MartenScene.useEffect": ()=>{
            awayRef.current = away;
        }
    }["MartenScene.useEffect"], [
        away
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "MartenScene.useEffect": ()=>{
            onTapRef.current = onTap;
        }
    }["MartenScene.useEffect"], [
        onTap
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "MartenScene.useEffect": ()=>{
            tapGainRef.current = {
                coins: tapCoins,
                xp: tapXp
            };
        }
    }["MartenScene.useEffect"], [
        tapCoins,
        tapXp
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "MartenScene.useEffect": ()=>{
            const canvas = canvasRef.current;
            if (!canvas) return;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;
            /* ────────────── Размеры / DPR / общее состояние ────────────── */ let w = 1;
            let h = 1;
            let dpr = 1;
            let inited = false;
            let rafId = 0;
            let lastTime = performance.now();
            let visible = !document.hidden;
            let time = 0;
            const floorY = {
                "MartenScene.useEffect.floorY": ()=>h * 0.64 // граница стены и пола
            }["MartenScene.useEffect.floorY"];
            const gy = {
                "MartenScene.useEffect.gy": ()=>floorY() + (h - floorY()) * 0.42 // уровень пола под лапами
            }["MartenScene.useEffect.gy"];
            /* ────────────── Состояние сцены ────────────── */ const marten = {
                x: 160,
                dir: 1,
                state: 'idle',
                timer: 2.2,
                targetX: 160,
                chaseMode: 'point',
                chaseIdx: 0,
                walkPhase: 0,
                tailPhase: 0,
                blinkTimer: 2.4,
                blinkT: -1,
                blink: 1,
                batT: 0,
                struck: false,
                strikeIdx: -1,
                happyT: 0
            };
            const kernels = [
                0,
                1,
                2
            ].map({
                "MartenScene.useEffect.kernels": (i)=>({
                        x: 120 + i * 60,
                        y: 60,
                        vx: 0,
                        vy: 0,
                        rot: prand(i * 3.7) * Math.PI,
                        vrot: 0,
                        seed: Math.floor(prand(i * 9.1) * 1000)
                    })
            }["MartenScene.useEffect.kernels"]);
            const particles = [];
            let confettiTimer = 1;
            /** Время последнего кликер-начисления (анти-автоклик, ~160 мс) */ let lastGain = -1e9;
            /** Допустимые границы ходьбы с учётом хвоста и морды */ const walkBounds = {
                "MartenScene.useEffect.walkBounds": ()=>{
                    const s = martenScale(stageRef.current);
                    const bl = bodyLenOf(stageRef.current);
                    const minX = (0.9 * bl + 6) * s;
                    const maxX = w - (0.86 * bl + 6) * s;
                    if (maxX <= minX + 8) return [
                        w / 2 - 5,
                        w / 2 + 5
                    ] // очень узкий канвас
                    ;
                    return [
                        minX,
                        maxX
                    ];
                }
            }["MartenScene.useEffect.walkBounds"];
            /* ────────────── Resize / DPR-буфер ────────────── */ const resize = {
                "MartenScene.useEffect.resize": ()=>{
                    const rect = canvas.getBoundingClientRect();
                    const nw = Math.max(1, Math.round(rect.width));
                    const nh = Math.max(1, Math.round(rect.height));
                    const ndpr = Math.min(window.devicePixelRatio || 1, 2) // кап DPR = 2
                    ;
                    if (nw === w && nh === h && ndpr === dpr) return;
                    w = nw;
                    h = nh;
                    dpr = ndpr;
                    canvas.width = Math.round(w * dpr); // перенастройка буфера
                    canvas.height = Math.round(h * dpr);
                    if (inited) {
                        const [b0, b1] = walkBounds();
                        marten.x = clamp(marten.x, b0, b1);
                        for (const k of kernels)k.x = clamp(k.x, 8, Math.max(9, w - 8));
                    }
                }
            }["MartenScene.useEffect.resize"];
            /* ────────────── Взаимодействие (тап) ────────────── */ /** Сердечки при радости: 4–6 частиц вверх с затуханием */ const spawnHearts = {
                "MartenScene.useEffect.spawnHearts": ()=>{
                    const s = martenScale(stageRef.current);
                    const baseY = gy() - 34 * s;
                    const count = 4 + Math.floor(Math.random() * 3) // 4–6
                    ;
                    for(let i = 0; i < count && particles.length < 90; i++){
                        const life = rand(0.9, 1.5);
                        particles.push({
                            kind: 'heart',
                            x: marten.x + rand(-16, 16),
                            y: baseY + rand(-10, 6),
                            vx: rand(-16, 16),
                            vy: -rand(42, 80),
                            life,
                            maxLife: life,
                            size: rand(5, 9),
                            phase: rand(0, Math.PI * 2),
                            rot: 0,
                            vrot: 0,
                            color: '#E24B3B'
                        });
                    }
                }
            }["MartenScene.useEffect.spawnHearts"];
            /** Летящие «+N» кликера: честные монетки и опыт из точки тапа */ const spawnGain = {
                "MartenScene.useEffect.spawnGain": (px, py)=>{
                    const { coins, xp } = tapGainRef.current;
                    const push = {
                        "MartenScene.useEffect.spawnGain.push": (label, dx, dy, color)=>{
                            if (particles.length >= 110) return;
                            const life = rand(0.65, 0.9);
                            particles.push({
                                kind: 'gain',
                                x: px + dx,
                                y: py + dy,
                                vx: rand(-8, 8),
                                vy: -rand(46, 64),
                                life,
                                maxLife: life,
                                size: 13,
                                phase: rand(0, Math.PI * 2),
                                rot: 0,
                                vrot: 0,
                                color,
                                label
                            });
                        }
                    }["MartenScene.useEffect.spawnGain.push"];
                    push(`+${coins}🪙`, -10, -6, '#FFE066');
                    push(`+${xp}🐾`, 14, -26, '#FF9E8C');
                }
            }["MartenScene.useEffect.spawnGain"];
            const handleTap = {
                "MartenScene.useEffect.handleTap": (px, py)=>{
                    if (awayRef.current) return; // куница в походе — тапы ни к чему
                    // КЛИКЕР: тап по комнате приносит валюту; анти-автоклик ~160 мс
                    const now = performance.now();
                    if (now - lastGain >= 160) {
                        lastGain = now;
                        spawnGain(px, py);
                        onTapRef.current?.(px, py);
                    }
                    const st = stageRef.current;
                    const s = martenScale(st);
                    const bl = bodyLenOf(st) * s;
                    // щедрый эллипс попадания вокруг куницы
                    const rx = bl * 0.62 + 10;
                    const ry = 42 * s + 12;
                    const nx = (px - marten.x) / rx;
                    const ny = (py - (gy() - 32 * s)) / ry;
                    if (nx * nx + ny * ny <= 1) {
                        // тап по кунице → радость (двойной подскок + сердечки)
                        marten.state = 'happy';
                        marten.happyT = 0;
                        spawnHearts();
                    } else {
                        // тап по комнате → идём к точке тапа
                        const [b0, b1] = walkBounds();
                        marten.state = 'walk';
                        marten.chaseMode = 'point';
                        marten.targetX = clamp(px, b0, b1);
                        marten.struck = false;
                    }
                }
            }["MartenScene.useEffect.handleTap"];
            /* ────────────── Конечный автомат куницы ────────────── */ const nearestKernelIdx = {
                "MartenScene.useEffect.nearestKernelIdx": ()=>{
                    let best = 0;
                    let bestD = Infinity;
                    for(let i = 0; i < kernels.length; i++){
                        const d = Math.abs(kernels[i].x - marten.x);
                        if (d < bestD) {
                            bestD = d;
                            best = i;
                        }
                    }
                    return best;
                }
            }["MartenScene.useEffect.nearestKernelIdx"];
            const startBat = {
                "MartenScene.useEffect.startBat": (idx)=>{
                    marten.state = 'bat';
                    marten.batT = 0;
                    marten.struck = false;
                    marten.strikeIdx = idx;
                    marten.dir = dirOf(kernels[idx].x - marten.x);
                }
            }["MartenScene.useEffect.startBat"];
            /** Импульс зерну от удара лапой: отлёт от куницы с вращением */ const strikeKernel = {
                "MartenScene.useEffect.strikeKernel": ()=>{
                    const k = kernels[marten.strikeIdx];
                    if (!k) return;
                    const dir = dirOf(k.x - marten.x);
                    k.vx = dir * rand(100, 170);
                    k.vy = -rand(120, 210);
                    k.vrot = dir * rand(5, 11);
                }
            }["MartenScene.useEffect.strikeKernel"];
            const updateMarten = {
                "MartenScene.useEffect.updateMarten": (dt)=>{
                    const st = stageRef.current;
                    const s = martenScale(st);
                    const bl = bodyLenOf(st) * s;
                    const speed = 92 * s // крупная куница ходит бодрее
                    ;
                    const reach = bl * 0.58 // дистанция удара лапой
                    ;
                    // хвост шевелится и глаз моргает во всех состояниях
                    marten.tailPhase += dt * (marten.state === 'walk' ? 8 : 5);
                    if (marten.blinkT >= 0) {
                        marten.blinkT += dt;
                        if (marten.blinkT >= 0.24) {
                            marten.blinkT = -1;
                            marten.blinkTimer = rand(2.2, 6);
                        }
                    } else {
                        marten.blinkTimer -= dt;
                        if (marten.blinkTimer <= 0) marten.blinkT = 0;
                    }
                    marten.blink = marten.blinkT >= 0 ? 1 - Math.sin(clamp(marten.blinkT / 0.24, 0, 1) * Math.PI) : 1;
                    const [minX, maxX] = walkBounds();
                    switch(marten.state){
                        case 'idle':
                            {
                                // сидит: дышит, виляет хвостом, моргает; через ≈2.5–5.5 c решает новое действие
                                marten.timer -= dt;
                                if (marten.timer <= 0) {
                                    const idx = nearestKernelIdx();
                                    const k = kernels[idx];
                                    if (Math.abs(k.x - marten.x) <= reach) {
                                        startBat(idx); // зерно под носом — бить сразу
                                    } else {
                                        marten.state = 'walk';
                                        marten.chaseMode = 'kernel';
                                        marten.chaseIdx = idx;
                                        marten.struck = false;
                                    }
                                }
                                break;
                            }
                        case 'walk':
                            {
                                if (marten.chaseMode === 'kernel') {
                                    // догоняем выбранное зерно (оно могло сдвинуться)
                                    const k = kernels[marten.chaseIdx];
                                    marten.targetX = k.x;
                                    if (Math.abs(k.x - marten.x) <= reach) {
                                        startBat(marten.chaseIdx);
                                        break;
                                    }
                                }
                                const dx = marten.targetX - marten.x;
                                const arrived = Math.abs(dx) < 8 || marten.x <= minX + 0.5 && dx < 0 || marten.x >= maxX - 0.5 && dx > 0;
                                if (arrived) {
                                    // дошли: если рядом зерно — бьём, иначе отдыхаем
                                    const idx = nearestKernelIdx();
                                    const k = kernels[idx];
                                    if (Math.abs(k.x - marten.x) <= reach) {
                                        startBat(idx);
                                    } else {
                                        marten.state = 'idle';
                                        marten.timer = rand(2.5, 5.5);
                                    }
                                    break;
                                }
                                marten.dir = dirOf(dx);
                                marten.x = clamp(marten.x + marten.dir * speed * dt, minX, maxX);
                                marten.walkPhase += dt * 10.5;
                                break;
                            }
                        case 'bat':
                            {
                                // подскок и взмах: на пике взмаха зерно получает импульс
                                marten.batT += dt;
                                if (!marten.struck && marten.batT >= 0.32) {
                                    marten.struck = true;
                                    strikeKernel();
                                }
                                if (marten.batT >= 0.64) {
                                    marten.state = 'idle';
                                    marten.timer = rand(2.5, 5.5);
                                }
                                break;
                            }
                        case 'happy':
                            {
                                // двойной подскок с сердечками
                                marten.happyT += dt;
                                if (marten.happyT >= 1.35) {
                                    marten.state = 'idle';
                                    marten.timer = rand(2.5, 5.5);
                                }
                                break;
                            }
                    }
                }
            }["MartenScene.useEffect.updateMarten"];
            /* ────────────── Физика зёрен попкорна ────────────── */ const updateKernels = {
                "MartenScene.useEffect.updateKernels": (dt)=>{
                    const ground = gy();
                    for (const k of kernels){
                        k.vy += 430 * dt; // гравитация
                        k.vx += (prand(k.seed) - 0.5) * 26 * dt; // лёгкий горизонтальный дрейф
                        k.x += k.vx * dt;
                        k.y += k.vy * dt;
                        k.rot += k.vrot * dt;
                        k.vrot *= Math.exp(-0.9 * dt);
                        if (k.y >= ground) {
                            k.y = ground;
                            if (k.vy > 30) {
                                // отскок с затуханием
                                k.vy = -k.vy * 0.45;
                                k.vx *= 0.75;
                                k.vrot *= 0.6;
                            } else {
                                // лёг на пол — трение
                                k.vy = 0;
                                k.vx *= Math.exp(-3.2 * dt);
                                k.vrot *= Math.exp(-6 * dt);
                            }
                        }
                        // улетело за край — переспавн с противоположной стороны
                        if (k.x < -26) {
                            k.x = w + 20;
                            k.y = ground - rand(30, 90);
                            k.vx = -rand(35, 70);
                            k.vy = 0;
                            k.vrot = -rand(3, 7);
                        } else if (k.x > w + 26) {
                            k.x = -20;
                            k.y = ground - rand(30, 90);
                            k.vx = rand(35, 70);
                            k.vy = 0;
                            k.vrot = rand(3, 7);
                        }
                    }
                }
            }["MartenScene.useEffect.updateKernels"];
            /* ────────────── Частицы: сердечки и конфетти ────────────── */ const updateParticles = {
                "MartenScene.useEffect.updateParticles": (dt)=>{
                    // фоновые конфетти-искры, плавающие вверх (stage >= 6)
                    if (stageRef.current >= 6) {
                        confettiTimer -= dt;
                        if (confettiTimer <= 0 && particles.length < 90) {
                            confettiTimer = rand(0.25, 0.7);
                            const life = rand(3.5, 6);
                            particles.push({
                                kind: 'confetti',
                                x: rand(0, w),
                                y: h + 8,
                                vx: rand(-9, 9),
                                vy: -rand(16, 38),
                                life,
                                maxLife: life,
                                size: rand(2, 3.6),
                                phase: rand(0, Math.PI * 2),
                                rot: rand(0, Math.PI),
                                vrot: rand(-3, 3),
                                color: pickColor(CONFETTI_COLORS, Math.floor(prand(time * 7.31) * 9973))
                            });
                        }
                    }
                    for(let i = particles.length - 1; i >= 0; i--){
                        const p = particles[i];
                        p.life -= dt;
                        if (p.kind === 'heart') {
                            p.vy -= 12 * dt; // ускоряется вверх
                            p.vx += Math.sin(time * 4 + p.phase) * 22 * dt;
                        } else if (p.kind === 'gain') {
                            p.vy -= 18 * dt; // текст разгоняется вверх
                            p.vx += Math.sin(time * 6 + p.phase) * 16 * dt;
                        } else {
                            p.vy -= 5 * dt;
                            p.vx += Math.sin(time * 2 + p.phase) * 14 * dt;
                            p.rot += p.vrot * dt;
                        }
                        p.x += p.vx * dt;
                        p.y += p.vy * dt;
                        if (p.life <= 0 || p.y < -14 || p.x < -20 || p.x > w + 20) particles.splice(i, 1);
                    }
                }
            }["MartenScene.useEffect.updateParticles"];
            /** Вертикальное смещение прыжка (≤0; 0 — на земле) */ const hopOffsetOf = {
                "MartenScene.useEffect.hopOffsetOf": (m)=>{
                    if (m.state === 'bat') {
                        if (m.batT < 0.3) return -Math.sin(m.batT / 0.3 * Math.PI) * 14;
                        return 0;
                    }
                    if (m.state === 'happy') {
                        const t = m.happyT;
                        const h1 = t < 0.55 ? Math.sin(t / 0.55 * Math.PI) : 0;
                        const h2 = t > 0.62 && t < 1.2 ? Math.sin((t - 0.62) / 0.58 * Math.PI) : 0;
                        return -(h1 + h2) * 16;
                    }
                    return 0;
                }
            }["MartenScene.useEffect.hopOffsetOf"];
            /* ────────────── Отрисовка: комната ────────────── */ const drawRoom = {
                "MartenScene.useEffect.drawRoom": ()=>{
                    const fy = floorY();
                    // тёплая стена: вертикальный градиент
                    const grad = ctx.createLinearGradient(0, 0, 0, fy);
                    grad.addColorStop(0, '#FFF0D8');
                    grad.addColorStop(1, '#F3DFBC');
                    ctx.fillStyle = grad;
                    ctx.fillRect(0, 0, w, fy);
                    // деревянный пол с досками
                    ctx.fillStyle = '#C98F4F';
                    ctx.fillRect(0, fy, w, h - fy);
                    const rowH = 22;
                    const rows = Math.ceil((h - fy) / rowH) + 1;
                    for(let i = 0; i < rows; i++){
                        const top = fy + i * rowH;
                        if (i % 2 === 0) {
                            ctx.fillStyle = 'rgba(255, 255, 255, 0.05)'; // чередование оттенка досок
                            ctx.fillRect(0, top, w, rowH);
                        }
                        ctx.fillStyle = '#B07A3F';
                        ctx.fillRect(0, top + rowH - 1.5, w, 1.5); // горизонтальный стык
                        const s1 = prand(i * 7.31 + 2) * w // вертикальные стыки
                        ;
                        ctx.fillRect(s1 - 1, top, 2, rowH);
                        const s2 = (prand(i * 5.13 + 9) * w + w * 0.5) % w;
                        ctx.fillRect(s2 - 1, top, 2, rowH);
                    }
                    // плинтус
                    ctx.fillStyle = '#F8E9CC';
                    ctx.fillRect(0, fy - 10, w, 10);
                    ctx.fillStyle = '#DDBE8F';
                    ctx.fillRect(0, fy - 2.5, w, 2.5);
                }
            }["MartenScene.useEffect.drawRoom"];
            /* ────────────── Отрисовка: окно с закатным небом ────────────── */ /** Геометрия окна: тёплая рама, закатное небо, плывущие облака, солнце */ const windowGeom = {
                "MartenScene.useEffect.windowGeom": ()=>{
                    const ww = clamp(w * 0.24, 54, 92);
                    const wh = clamp(floorY() * 0.42, 46, 64);
                    return {
                        x: clamp(w * 0.12, 12, w - ww - 12),
                        y: 42,
                        w: ww,
                        h: wh
                    };
                }
            }["MartenScene.useEffect.windowGeom"];
            const drawWindow = {
                "MartenScene.useEffect.drawWindow": ()=>{
                    const wg = windowGeom();
                    const fy = floorY();
                    /* Пятно закатного света на полу: косой параллелограмм от окна вправо */ ctx.save();
                    ctx.globalAlpha = 0.1 + 0.02 * Math.sin(time * 0.7);
                    ctx.fillStyle = '#FFD98A';
                    ctx.beginPath();
                    ctx.moveTo(wg.x + 4, fy);
                    ctx.lineTo(wg.x + wg.w - 4, fy);
                    ctx.lineTo(wg.x + wg.w + 26, h);
                    ctx.lineTo(wg.x + 34, h);
                    ctx.closePath();
                    ctx.fill();
                    ctx.restore();
                    /* Стекло: закатное небо от персикового к янтарному */ const sky = ctx.createLinearGradient(0, wg.y, 0, wg.y + wg.h);
                    sky.addColorStop(0, '#FFE9B8');
                    sky.addColorStop(0.6, '#FFDC9E');
                    sky.addColorStop(1, '#FFC98A');
                    ctx.fillStyle = sky;
                    ctx.fillRect(wg.x, wg.y, wg.w, wg.h);
                    /* Солнце в верхнем стекле: тёплый диск с мягким ореолом */ const sx = wg.x + wg.w * 0.68;
                    const sy = wg.y + wg.h * 0.3;
                    const halo = ctx.createRadialGradient(sx, sy, 1, sx, sy, wg.w * 0.3);
                    halo.addColorStop(0, 'rgba(255, 214, 102, 0.55)');
                    halo.addColorStop(1, 'rgba(255, 214, 102, 0)');
                    ctx.fillStyle = halo;
                    ctx.fillRect(wg.x, wg.y, wg.w, wg.h);
                    ctx.fillStyle = '#FFD166';
                    ctx.beginPath();
                    ctx.arc(sx, sy, wg.w * 0.1, 0, Math.PI * 2);
                    ctx.fill();
                    /* Два облака плывут через окно и заворачиваются по кругу */ const cloud = {
                        "MartenScene.useEffect.drawWindow.cloud": (cx, cy, sc)=>{
                            ctx.fillStyle = 'rgba(255, 250, 238, 0.92)';
                            ctx.beginPath();
                            ctx.arc(cx, cy, 6 * sc, 0, Math.PI * 2);
                            ctx.arc(cx + 7 * sc, cy - 3 * sc, 5 * sc, 0, Math.PI * 2);
                            ctx.arc(cx + 14 * sc, cy, 6.5 * sc, 0, Math.PI * 2);
                            ctx.fill();
                            ctx.fillRect(cx - 6 * sc, cy, 22 * sc, 5 * sc);
                        }
                    }["MartenScene.useEffect.drawWindow.cloud"];
                    const span = wg.w + 70;
                    const c1x = wg.x + (time * 7 + 20) % span - 30;
                    const c2x = wg.x + (time * 4.5 + span * 0.55) % span - 30;
                    ctx.save();
                    ctx.beginPath();
                    ctx.rect(wg.x, wg.y, wg.w, wg.h);
                    ctx.clip();
                    cloud(c1x, wg.y + wg.h * 0.62, 1);
                    cloud(c2x, wg.y + wg.h * 0.34, 0.7);
                    ctx.restore();
                    /* Рама: внешняя коробка + крестовина + подоконник */ ctx.strokeStyle = '#8A5330';
                    ctx.lineWidth = 5;
                    ctx.strokeRect(wg.x + 0.5, wg.y + 0.5, wg.w - 1, wg.h - 1);
                    ctx.lineWidth = 3;
                    ctx.beginPath();
                    ctx.moveTo(wg.x + wg.w / 2, wg.y + 2);
                    ctx.lineTo(wg.x + wg.w / 2, wg.y + wg.h - 2);
                    ctx.moveTo(wg.x + 2, wg.y + wg.h / 2);
                    ctx.lineTo(wg.x + wg.w - 2, wg.y + wg.h / 2);
                    ctx.stroke();
                    ctx.fillStyle = '#A9713F'; // подоконник
                    ctx.fillRect(wg.x - 6, wg.y + wg.h + 2, wg.w + 12, 6);
                    ctx.fillStyle = '#7A5730'; // тень под подоконником
                    ctx.fillRect(wg.x - 6, wg.y + wg.h + 8, wg.w + 12, 2.5);
                }
            }["MartenScene.useEffect.drawWindow"];
            /** Постер «Попкорн» на стене справа: рама, паспарту, стаканчик с паром */ const drawPoster = {
                "MartenScene.useEffect.drawPoster": ()=>{
                    const pw = clamp(w * 0.15, 38, 52);
                    const ph = pw * 1.24;
                    const px = clamp(w * 0.66, 12, w - pw - 12);
                    const py = 44;
                    ctx.save();
                    ctx.translate(px + pw / 2, py);
                    ctx.rotate(Math.sin(time * 0.9) * 0.018); // лёгкое покачивание на гвозде
                    // рама
                    ctx.fillStyle = '#6B421F';
                    ctx.fillRect(-pw / 2 - 3, -3, pw + 6, ph + 6);
                    // паспарту
                    ctx.fillStyle = '#FFF6E6';
                    ctx.fillRect(-pw / 2, 0, pw, ph);
                    // мини-стаканчик: трапеция в красную полоску
                    const cupHh = ph * 0.34;
                    const cupWt = pw * 0.46;
                    const cupWb = pw * 0.3;
                    const ccy = ph * 0.56;
                    ctx.fillStyle = '#E24B3B';
                    ctx.beginPath();
                    ctx.moveTo(-cupWt / 2, ccy - cupHh / 2);
                    ctx.lineTo(cupWt / 2, ccy - cupHh / 2);
                    ctx.lineTo(cupWb / 2, ccy + cupHh / 2);
                    ctx.lineTo(-cupWb / 2, ccy + cupHh / 2);
                    ctx.closePath();
                    ctx.fill();
                    ctx.fillStyle = '#FFF6EC'; // белые полосы
                    for(let i = 0; i < 2; i++){
                        const yy = ccy - cupHh / 2 + (i + 0.5) * cupHh / 2.2;
                        const ww2 = cupWt + (cupWb - cupWt) * (yy - (ccy - cupHh / 2)) / cupHh;
                        ctx.fillRect(-ww2 / 2, yy, ww2, cupHh * 0.12);
                    }
                    // попкорн-шапка над стаканчиком
                    ctx.fillStyle = '#FFFFFF';
                    ctx.beginPath();
                    ctx.arc(-4, ccy - cupHh / 2 - 3, 4.5, 0, Math.PI * 2);
                    ctx.arc(3, ccy - cupHh / 2 - 4.5, 5, 0, Math.PI * 2);
                    ctx.arc(4.5, ccy - cupHh / 2 - 2, 3.6, 0, Math.PI * 2);
                    ctx.fill();
                    // пар: три волнистые линии, дышат
                    ctx.strokeStyle = 'rgba(170, 120, 80, 0.5)';
                    ctx.lineWidth = 1.4;
                    ctx.lineCap = 'round';
                    for(let i = 0; i < 3; i++){
                        const ox = (i - 1) * 5;
                        const sway = Math.sin(time * 2 + i * 1.7) * 1.6;
                        ctx.beginPath();
                        ctx.moveTo(ox + sway, ccy - cupHh / 2 - 9);
                        ctx.quadraticCurveTo(ox + sway + 2.4, ccy - cupHh / 2 - 14, ox, ccy - cupHh / 2 - 19);
                        ctx.stroke();
                    }
                    ctx.restore();
                }
            }["MartenScene.useEffect.drawPoster"];
            /** Лампа под потолком: провод, абажур, тёплый ореол света */ const drawLamp = {
                "MartenScene.useEffect.drawLamp": ()=>{
                    const lx = clamp(w * 0.86, 20, w - 14);
                    const ly = 24;
                    const sway = Math.sin(time * 1.1) * 0.03;
                    ctx.save();
                    ctx.translate(lx, 0);
                    ctx.rotate(sway);
                    ctx.strokeStyle = '#5C3A1E';
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.moveTo(0, 0);
                    ctx.lineTo(0, ly - 6);
                    ctx.stroke();
                    // абажур-конус
                    ctx.fillStyle = '#E2B13C';
                    ctx.beginPath();
                    ctx.moveTo(-11, ly);
                    ctx.lineTo(11, ly);
                    ctx.lineTo(4.5, ly - 8);
                    ctx.lineTo(-4.5, ly - 8);
                    ctx.closePath();
                    ctx.fill();
                    ctx.fillStyle = '#C98F2F';
                    ctx.fillRect(-11, ly, 22, 3);
                    // лампочка
                    ctx.fillStyle = '#FFF0B8';
                    ctx.beginPath();
                    ctx.arc(0, ly + 5, 4.5, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.restore();
                    // тёплый ореол на стену
                    const g = ctx.createRadialGradient(lx, ly + 6, 4, lx, ly + 6, 46);
                    g.addColorStop(0, 'rgba(255, 210, 120, 0.20)');
                    g.addColorStop(1, 'rgba(255, 210, 120, 0)');
                    ctx.fillStyle = g;
                    ctx.fillRect(lx - 46, ly - 10, 92, 100);
                }
            }["MartenScene.useEffect.drawLamp"];
            /** Пылинки в луче лампы: лениво дрейфуют по комнате */ const dust = [];
            const ensureDust = {
                "MartenScene.useEffect.ensureDust": ()=>{
                    if (dust.length > 0 || w < 10) return;
                    const n = Math.max(6, Math.min(10, Math.round(w / 40)));
                    for(let i = 0; i < n; i++){
                        dust.push({
                            x: prand(i * 13.7 + 3) * w,
                            y: prand(i * 7.9 + 11) * floorY(),
                            ph: prand(i * 5.3 + 1) * Math.PI * 2,
                            sp: 4 + prand(i * 9.1 + 5) * 6,
                            r: 1 + prand(i * 3.3 + 7) * 1.2
                        });
                    }
                }
            }["MartenScene.useEffect.ensureDust"];
            const drawDust = {
                "MartenScene.useEffect.drawDust": ()=>{
                    ensureDust();
                    ctx.fillStyle = '#FFF6E0';
                    for (const d of dust){
                        const yy = (d.y - time * d.sp) % floorY();
                        const y2 = yy < 0 ? yy + floorY() : yy;
                        ctx.globalAlpha = 0.14 + 0.08 * Math.sin(d.ph + time * 1.8);
                        ctx.beginPath();
                        ctx.arc(d.x + Math.sin(time * 0.8 + d.ph) * 5, y2, d.r, 0, Math.PI * 2);
                        ctx.fill();
                    }
                    ctx.globalAlpha = 1;
                }
            }["MartenScene.useEffect.drawDust"];
            /** Провисающая нитка с флажками / лапками / золотом, лёгкое покачивание */ const drawGarland = {
                "MartenScene.useEffect.drawGarland": (x0, x1, baseY, sag, mode)=>{
                    const cx = (x0 + x1) / 2;
                    const cy = baseY + sag * 2 // контрольная точка даёт провис ≈ sag
                    ;
                    ctx.strokeStyle = 'rgba(122, 87, 49, 0.75)';
                    ctx.lineWidth = 1.5;
                    ctx.beginPath();
                    ctx.moveTo(x0, baseY);
                    ctx.quadraticCurveTo(cx, cy, x1, baseY);
                    ctx.stroke();
                    const n = 9;
                    for(let i = 1; i <= n; i++){
                        const u = i / (n + 1);
                        const v = 1 - u;
                        const px = v * v * x0 + 2 * u * v * cx + u * u * x1;
                        const py = v * v * baseY + 2 * u * v * cy + u * u * baseY;
                        const sway = Math.sin(time * 1.7 + i * 1.25) * 0.09;
                        ctx.save();
                        ctx.translate(px, py);
                        ctx.rotate(sway);
                        if (mode === 'paws') {
                            // отпечаток лапы: 1 большой + 3 малых кружочка, чередование цветов
                            ctx.fillStyle = i % 2 === 0 ? '#E24B3B' : '#F2A24B';
                            ctx.beginPath();
                            ctx.arc(0, 5.2, 3.4, 0, Math.PI * 2);
                            ctx.moveTo(-1.8, 0.6);
                            ctx.arc(-3.6, 0.6, 1.8, 0, Math.PI * 2);
                            ctx.moveTo(1.8, -0.4);
                            ctx.arc(0, -0.4, 1.8, 0, Math.PI * 2);
                            ctx.moveTo(5.4, 0.6);
                            ctx.arc(3.6, 0.6, 1.8, 0, Math.PI * 2);
                            ctx.fill();
                        } else {
                            const sz = 8.5;
                            ctx.fillStyle = mode === 'gold' ? '#FFE066' : pickColor(GARLAND_COLORS, i);
                            ctx.beginPath();
                            ctx.moveTo(-sz, 0);
                            ctx.lineTo(sz, 0);
                            ctx.lineTo(0, sz * 1.6);
                            ctx.closePath();
                            ctx.fill();
                            if (mode === 'gold') {
                                // блик на золотом флажке
                                ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
                                ctx.lineWidth = 1.6;
                                ctx.beginPath();
                                ctx.moveTo(-sz * 0.45, 2);
                                ctx.lineTo(-sz * 0.12, sz * 1.05);
                                ctx.stroke();
                            }
                        }
                        ctx.restore();
                    }
                }
            }["MartenScene.useEffect.drawGarland"];
            /* ────────────── Отрисовка: декор пола по стадиям ────────────── */ /** Золотая монета: кружочек с бликом и лёгким мерцанием */ const drawCoin = {
                "MartenScene.useEffect.drawCoin": (x, y, ph)=>{
                    ctx.save();
                    ctx.globalAlpha = 0.85 + 0.15 * Math.sin(time * 2.2 + ph);
                    ctx.fillStyle = '#FFE066';
                    ctx.strokeStyle = '#D9A93C';
                    ctx.lineWidth = 1.6;
                    ctx.beginPath();
                    ctx.ellipse(x, y, 7.2, 6.2, 0, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.stroke();
                    ctx.strokeStyle = 'rgba(217, 169, 60, 0.6)';
                    ctx.lineWidth = 1.2;
                    ctx.beginPath();
                    ctx.ellipse(x, y, 4.6, 3.8, 0, 0, Math.PI * 2);
                    ctx.stroke();
                    ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
                    ctx.lineWidth = 1.6;
                    ctx.beginPath();
                    ctx.arc(x - 1.5, y - 1.5, 4.4, Math.PI * 1.05, Math.PI * 1.5);
                    ctx.stroke();
                    ctx.restore();
                }
            }["MartenScene.useEffect.drawCoin"];
            /** Мигающий плюсик-искра */ const drawSparkle = {
                "MartenScene.useEffect.drawSparkle": (x, y, size, alpha)=>{
                    ctx.save();
                    ctx.globalAlpha = alpha;
                    ctx.strokeStyle = '#FFF3C4';
                    ctx.lineWidth = 2;
                    ctx.lineCap = 'round';
                    ctx.beginPath();
                    ctx.moveTo(x - size, y);
                    ctx.lineTo(x + size, y);
                    ctx.moveTo(x, y - size);
                    ctx.lineTo(x, y + size);
                    ctx.stroke();
                    ctx.restore();
                }
            }["MartenScene.useEffect.drawSparkle"];
            const drawFloorDecor = {
                "MartenScene.useEffect.drawFloorDecor": ()=>{
                    const st = stageRef.current;
                    const fy = floorY();
                    const fh = h - fy;
                    const cx = w * 0.5;
                    const rx = clamp(w * 0.2, 60, 120);
                    const cy = fy + fh * 0.52 // центр ковра на полу
                    ;
                    const ry = rx * 0.34;
                    if (st >= 2) {
                        // леопардовый ковёр: эллипс с каймой и тёмными пятнами
                        ctx.fillStyle = '#8A5330';
                        ctx.beginPath();
                        ctx.ellipse(cx, cy, rx + 5, ry + 2.5, 0, 0, Math.PI * 2);
                        ctx.fill();
                        ctx.fillStyle = '#D9A05B';
                        ctx.beginPath();
                        ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
                        ctx.fill();
                        for(let i = 0; i < 12; i++){
                            const a = prand(i * 11.3 + 2) * Math.PI * 2;
                            const rr = Math.sqrt(prand(i * 13.7 + 5)) * 0.72;
                            const sxp = cx + Math.cos(a) * rr * rx;
                            const syp = cy + Math.sin(a) * rr * ry * 0.8;
                            const sr = 2.6 + prand(i * 17.9 + 7) * 3.2;
                            ctx.fillStyle = 'rgba(138, 83, 48, 0.85)';
                            ctx.beginPath();
                            ctx.ellipse(sxp, syp, sr, sr * 0.8, a, 0, Math.PI * 2);
                            ctx.fill();
                        }
                    }
                    if (st >= 5) {
                        // корона с зубцами и самоцветом на ковре
                        ctx.save();
                        ctx.translate(cx - rx * 0.42, cy - ry * 0.3);
                        ctx.rotate(-0.08);
                        ctx.fillStyle = '#FFD166';
                        ctx.strokeStyle = '#E2B13C';
                        ctx.lineWidth = 1.4;
                        ctx.beginPath();
                        ctx.moveTo(-11, 0);
                        ctx.lineTo(-11, -8);
                        ctx.lineTo(-5.5, -2.5);
                        ctx.lineTo(0, -10);
                        ctx.lineTo(5.5, -2.5);
                        ctx.lineTo(11, -8);
                        ctx.lineTo(11, 0);
                        ctx.closePath();
                        ctx.fill();
                        ctx.stroke();
                        ctx.fillStyle = '#E24B3B';
                        ctx.beginPath();
                        ctx.arc(0, -3.2, 2.4, 0, Math.PI * 2);
                        ctx.fill();
                        ctx.restore();
                    }
                    if (st >= 3) {
                        // клубок пряжи с нитяными дугами и хвостиком нити
                        const yx = Math.max(18, cx - rx - 54);
                        const yy = cy + 10;
                        ctx.save();
                        ctx.beginPath();
                        ctx.arc(yx, yy, 13, 0, Math.PI * 2);
                        ctx.clip();
                        ctx.fillStyle = '#E2725B';
                        ctx.fillRect(yx - 13, yy - 13, 26, 26);
                        ctx.lineWidth = 2;
                        for(let i = 0; i < 4; i++){
                            ctx.strokeStyle = i % 2 === 0 ? '#C9584A' : '#F0937F';
                            ctx.beginPath();
                            ctx.ellipse(yx, yy, 13, 4.5 + i * 2.4, 0.5 + i * 0.7, 0, Math.PI * 2);
                            ctx.stroke();
                        }
                        ctx.restore();
                        ctx.strokeStyle = '#E2725B';
                        ctx.lineWidth = 1.6;
                        ctx.beginPath();
                        ctx.moveTo(yx + 12, yy - 6);
                        ctx.quadraticCurveTo(yx + 26, yy - 14 + Math.sin(time * 2) * 2, yx + 34, yy - 4);
                        ctx.stroke();
                        // игрушечная мышь с хвостиком-ниткой
                        const mxp = Math.min(w - 18, cx + rx + 32);
                        const myp = cy + 4;
                        ctx.strokeStyle = '#C9B8A6';
                        ctx.lineWidth = 1.5;
                        ctx.beginPath();
                        ctx.moveTo(mxp + 8, myp - 1);
                        ctx.quadraticCurveTo(mxp + 18, myp - 6 + Math.sin(time * 3) * 2.5, mxp + 24, myp + 1);
                        ctx.stroke();
                        ctx.fillStyle = '#B7A99A';
                        ctx.beginPath();
                        ctx.ellipse(mxp, myp, 9, 6.2, -0.15, 0, Math.PI * 2);
                        ctx.fill();
                        ctx.beginPath();
                        ctx.arc(mxp - 4, myp - 6.4, 3, 0, Math.PI * 2);
                        ctx.fill();
                        ctx.fillStyle = '#3E2A18';
                        ctx.beginPath();
                        ctx.arc(mxp + 5.5, myp - 2.4, 1.1, 0, Math.PI * 2);
                        ctx.fill();
                        ctx.fillStyle = '#E8A0A0';
                        ctx.beginPath();
                        ctx.arc(mxp + 9.4, myp - 1.4, 1.5, 0, Math.PI * 2);
                        ctx.fill();
                    }
                    if (st >= 4) {
                        // рыбья подушечка с глазом и плавником
                        const fx = Math.min(w - 20, cx + rx + 56);
                        const fyp = cy + 18;
                        ctx.save();
                        ctx.translate(fx, fyp);
                        ctx.rotate(-0.12);
                        ctx.fillStyle = '#F4A259';
                        ctx.beginPath();
                        ctx.ellipse(0, 0, 16, 9, 0, 0, Math.PI * 2);
                        ctx.fill();
                        ctx.fillStyle = '#E88F3C';
                        ctx.beginPath();
                        ctx.moveTo(-2, -8.5);
                        ctx.lineTo(5, -14);
                        ctx.lineTo(7, -7);
                        ctx.closePath();
                        ctx.fill();
                        ctx.beginPath();
                        ctx.moveTo(14, 0);
                        ctx.lineTo(21, -5);
                        ctx.lineTo(21, 5);
                        ctx.closePath();
                        ctx.fill();
                        ctx.fillStyle = '#FFF6E8';
                        ctx.beginPath();
                        ctx.arc(-8, -2.5, 2.6, 0, Math.PI * 2);
                        ctx.fill();
                        ctx.fillStyle = '#3E2A18';
                        ctx.beginPath();
                        ctx.arc(-8.6, -2.5, 1.3, 0, Math.PI * 2);
                        ctx.fill();
                        ctx.restore();
                    }
                    if (st >= 2) {
                        // монеты рядом с ковром (+2 на stage >= 4)
                        drawCoin(cx - rx - 16, cy + 2, 0);
                        drawCoin(cx + rx + 14, cy - 4, 1.7);
                        if (st >= 4) {
                            drawCoin(cx - rx - 34, cy + 18, 3.1);
                            drawCoin(cx + rx + 24, cy + 18, 4.4);
                        }
                    }
                    if (st >= 5) {
                        // кучка монет столбиком и мигающие плюсики-искры
                        const px = cx + rx * 0.5;
                        const py = cy + ry * 0.42;
                        for(let i = 0; i < 4; i++){
                            drawCoin(px + (i % 2 === 0 ? -2 : 2.4), py - i * 6.4, i * 1.3);
                        }
                        for(let i = 0; i < 3; i++){
                            const a = 0.35 + 0.65 * Math.max(0, Math.sin(time * 2.6 + i * 2.1));
                            drawSparkle(px - 10 + i * 9, py - 20 - i % 2 * 7, 4.2, a);
                        }
                    }
                    if (st >= 6) {
                        // кубок-трофей рядом с ковром
                        const tx = Math.max(18, cx - rx - 74);
                        ctx.save();
                        ctx.translate(tx, cy + 2);
                        ctx.fillStyle = '#FFD166';
                        ctx.strokeStyle = '#E2B13C';
                        ctx.lineWidth = 1.6;
                        // чаша
                        ctx.beginPath();
                        ctx.moveTo(-9, -18);
                        ctx.lineTo(9, -18);
                        ctx.quadraticCurveTo(9, -6, 0, -4);
                        ctx.quadraticCurveTo(-9, -6, -9, -18);
                        ctx.closePath();
                        ctx.fill();
                        ctx.stroke();
                        // ручки
                        ctx.beginPath();
                        ctx.arc(-11, -14, 4, Math.PI * 0.6, Math.PI * 1.5);
                        ctx.stroke();
                        ctx.beginPath();
                        ctx.arc(11, -14, 4, -Math.PI * 0.5, Math.PI * 0.4);
                        ctx.stroke();
                        // ножка и основание
                        ctx.fillRect(-2.2, -4, 4.4, 6);
                        ctx.strokeRect(-2.2, -4, 4.4, 6);
                        ctx.fillRect(-7, 2, 14, 3.4);
                        ctx.strokeRect(-7, 2, 14, 3.4);
                        // блик
                        ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
                        ctx.lineWidth = 1.6;
                        ctx.beginPath();
                        ctx.moveTo(-5, -15.5);
                        ctx.lineTo(-5, -8);
                        ctx.stroke();
                        ctx.restore();
                    }
                }
            }["MartenScene.useEffect.drawFloorDecor"];
            /* ────────────── Отрисовка: зерно попкорна ────────────── */ /** Пухлое 3-лепестковое облачко: белое с жёлтой тенью */ const drawKernel = {
                "MartenScene.useEffect.drawKernel": (k)=>{
                    const sc = 0.9 + prand(k.seed) * 0.3;
                    ctx.save();
                    ctx.translate(k.x, k.y);
                    ctx.rotate(k.rot);
                    ctx.scale(sc, sc);
                    ctx.fillStyle = 'rgba(242, 193, 78, 0.85)'; // жёлтая тень-подложка
                    for (const [ox, oy, r] of KERNEL_LOBES){
                        ctx.beginPath();
                        ctx.arc(ox, oy + 2, r, 0, Math.PI * 2);
                        ctx.fill();
                    }
                    ctx.fillStyle = '#FFFFFF'; // белые лепестки
                    for (const [ox, oy, r] of KERNEL_LOBES){
                        ctx.beginPath();
                        ctx.arc(ox, oy, r, 0, Math.PI * 2);
                        ctx.fill();
                    }
                    ctx.strokeStyle = 'rgba(238, 217, 160, 0.9)'; // лёгкие складки
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.arc(-3.5, -1, 3.4, 0.4, 2.4);
                    ctx.stroke();
                    ctx.beginPath();
                    ctx.arc(3, 0.5, 3, 3.5, 5.6);
                    ctx.stroke();
                    ctx.restore();
                }
            }["MartenScene.useEffect.drawKernel"];
            /* ────────────── Отрисовка: куница ────────────── */ const drawMartenShadow = {
                "MartenScene.useEffect.drawMartenShadow": ()=>{
                    const st = stageRef.current;
                    const s = martenScale(st);
                    const bl = bodyLenOf(st);
                    const air = clamp(-hopOffsetOf(marten) / 60, 0, 0.45) // тень сжимается в прыжке
                    ;
                    ctx.fillStyle = 'rgba(90, 58, 28, 0.16)';
                    ctx.beginPath();
                    ctx.ellipse(marten.x, gy() + 3, bl * 0.44 * s * (1 - air), 4.2 * s * (1 - air), 0, 0, Math.PI * 2);
                    ctx.fill();
                }
            }["MartenScene.useEffect.drawMartenShadow"];
            const drawMarten = {
                "MartenScene.useEffect.drawMarten": ()=>{
                    const st = stageRef.current;
                    const sn = stageNorm(st);
                    const s = martenScale(st);
                    const bl = bodyLenOf(st);
                    const bh = 30;
                    const headR = bl * (0.5 - 0.15 * sn) / 2 // у котёнка голова пропорционально крупнее
                    ;
                    const rearX = -bl * 0.48;
                    const frontX = bl * 0.4;
                    const walking = marten.state === 'walk';
                    const breath = 1 + 0.025 * Math.sin(time * 2.1) // дыхание в покое
                    ;
                    const bob = walking ? Math.abs(Math.sin(marten.walkPhase)) * 1.5 : 0.5 * Math.sin(time * 2.1);
                    const hop = hopOffsetOf(marten);
                    ctx.save();
                    ctx.translate(marten.x, gy() + hop);
                    ctx.scale(marten.dir * s, s); // масштаб роста + разворот по направлению
                    // взмах передней лапой в состоянии bat
                    let batSwing = 0;
                    let batLift = 0;
                    if (marten.state === 'bat') {
                        const p = (marten.batT - 0.3) / 0.24;
                        if (p > 0 && p < 1) {
                            const k = Math.sin(p * Math.PI);
                            batSwing = k * 19;
                            batLift = k * 6;
                        }
                    }
                    // лапка: линия от бедра до стопы; пары ходят в противофазе
                    const drawLeg = {
                        "MartenScene.useEffect.drawMarten.drawLeg": (hx, hy, phase, far, extraSwing, extraLift)=>{
                            const sw = (walking ? Math.sin(marten.walkPhase + phase) * 7 : 0) + extraSwing;
                            const lift = walking ? Math.max(0, -Math.cos(marten.walkPhase + phase)) * 2.6 : 0;
                            const footX = hx + sw;
                            const footY = -lift - extraLift;
                            ctx.strokeStyle = far ? '#8A5330' : '#5C3A22';
                            ctx.lineWidth = 4.6;
                            ctx.lineCap = 'round';
                            ctx.beginPath();
                            ctx.moveTo(hx, hy);
                            ctx.lineTo(footX, footY);
                            ctx.stroke();
                            ctx.fillStyle = far ? '#8A5330' : '#5C3A22';
                            ctx.beginPath();
                            ctx.arc(footX, footY, 2.7, 0, Math.PI * 2);
                            ctx.fill();
                        }
                    }["MartenScene.useEffect.drawMarten.drawLeg"];
                    /* — ПУШИСТЫЙ ХВОСТ с бегущей синусоидой (2 прохода: тень + шерсть) — */ const tailBaseX = rearX + 4;
                    const tailBaseY = -bh * 0.5;
                    const tailLen = bl * 0.52;
                    const segs = 9;
                    const step = tailLen / segs;
                    const wagAmp = marten.state === 'happy' ? 0.3 : walking ? 0.22 : 0.14;
                    for(let pass = 0; pass < 2; pass++){
                        for(let i = segs; i >= 0; i--){
                            const t = i / segs;
                            const ang = Math.PI + 0.72 + Math.sin(t * 2.8 - marten.tailPhase) * wagAmp * t;
                            const px = tailBaseX + Math.cos(ang) * step * i;
                            const py = tailBaseY + Math.sin(ang) * step * i + (pass === 0 ? 1.4 : 0);
                            const r = bh * 0.3 - (bh * 0.3 - 3.4) * t // сужение к кончику
                            ;
                            ctx.fillStyle = pass === 0 ? 'rgba(138, 83, 48, 0.9)' : t > 0.7 ? '#F6DCA8' : '#A2673D';
                            ctx.beginPath();
                            ctx.arc(px, py, r, 0, Math.PI * 2);
                            ctx.fill();
                        }
                    }
                    /* — дальние лапки — */ drawLeg(rearX + 8, -bh * 0.34, 0, true, 0, 0);
                    drawLeg(frontX - 10, -bh * 0.32, Math.PI, true, 0, 0);
                    /* — КОРПУС: дуга спины, круп, грудь, кремовое брюшко — */ ctx.save();
                    ctx.translate(0, -bob);
                    ctx.fillStyle = '#A2673D';
                    ctx.beginPath();
                    ctx.arc(rearX + 14, -bh * 0.52, bh * 0.46, 0, Math.PI * 2); // круп
                    ctx.fill();
                    ctx.beginPath();
                    ctx.ellipse(0, -bh * 0.52, bl * 0.46, bh * 0.46 * breath, -0.05, 0, Math.PI * 2); // торс
                    ctx.fill();
                    ctx.beginPath();
                    ctx.arc(frontX - 2, -bh * 0.48, bh * 0.4, 0, Math.PI * 2); // грудь
                    ctx.fill();
                    ctx.strokeStyle = 'rgba(138, 83, 48, 0.45)'; // контур спины (тень)
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.ellipse(0, -bh * 0.52, bl * 0.46, bh * 0.46 * breath, -0.05, Math.PI * 1.05, Math.PI * 1.95);
                    ctx.stroke();
                    ctx.fillStyle = '#F6DCA8'; // брюшко
                    ctx.beginPath();
                    ctx.ellipse(2, -bh * 0.34, bl * 0.33, bh * 0.17, 0, 0, Math.PI * 2);
                    ctx.fill();
                    /* — ГОЛОВА: уши, мордочка, нос, глаз, усы — */ const headX = frontX + headR * 0.52;
                    const headY = -bh * 0.72 + Math.sin(time * 2.1) * 0.6 + (walking ? Math.sin(marten.walkPhase) * 0.9 : 0);
                    ctx.fillStyle = '#8A5330'; // дальнее ухо
                    ctx.beginPath();
                    ctx.arc(headX - headR * 0.5, headY - headR * 0.72, headR * 0.27, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.fillStyle = '#A2673D'; // ближнее ухо
                    ctx.beginPath();
                    ctx.arc(headX - headR * 0.16, headY - headR * 0.86, headR * 0.34, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.fillStyle = '#E8C08F'; // внутренняя часть ушка
                    ctx.beginPath();
                    ctx.arc(headX - headR * 0.2, headY - headR * 0.8, headR * 0.18, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.fillStyle = '#A2673D'; // череп
                    ctx.beginPath();
                    ctx.arc(headX, headY, headR, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.fillStyle = '#F6DCA8'; // светлая мордочка
                    ctx.beginPath();
                    ctx.ellipse(headX + headR * 0.68, headY + headR * 0.32, headR * 0.62, headR * 0.5, 0.1, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.fillStyle = '#4A2E17'; // нос
                    ctx.beginPath();
                    ctx.arc(headX + headR * 1.14, headY + headR * 0.2, headR * 0.17, 0, Math.PI * 2);
                    ctx.fill();
                    const ex = headX + headR * 0.3;
                    const ey = headY - headR * 0.02;
                    if (marten.state === 'happy') {
                        // счастливый прищур дугой + улыбка
                        ctx.strokeStyle = '#2E1D12';
                        ctx.lineWidth = 2.2;
                        ctx.lineCap = 'round';
                        ctx.beginPath();
                        ctx.arc(ex, ey + headR * 0.06, headR * 0.17, Math.PI * 1.15, Math.PI * 1.85);
                        ctx.stroke();
                        ctx.strokeStyle = '#4A2E17';
                        ctx.lineWidth = 1.6;
                        ctx.beginPath();
                        ctx.arc(headX + headR * 0.8, headY + headR * 0.42, headR * 0.24, 0.3, Math.PI - 0.5);
                        ctx.stroke();
                    } else {
                        // глаз с морганием и бликом
                        ctx.fillStyle = '#2E1D12';
                        ctx.beginPath();
                        ctx.ellipse(ex, ey, headR * 0.15, headR * 0.17 * Math.max(0.1, marten.blink), 0, 0, Math.PI * 2);
                        ctx.fill();
                        if (marten.blink > 0.6) {
                            ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
                            ctx.beginPath();
                            ctx.arc(ex - headR * 0.05, ey - headR * 0.06, headR * 0.05, 0, Math.PI * 2);
                            ctx.fill();
                        }
                    }
                    // усы: 3 тонкие линии
                    ctx.strokeStyle = 'rgba(74, 46, 23, 0.5)';
                    ctx.lineWidth = 1;
                    const wsx = headX + headR * 0.9;
                    const wsy = headY + headR * 0.4;
                    for (const [wa, wl] of WHISKERS){
                        const len = headR * wl;
                        ctx.beginPath();
                        ctx.moveTo(wsx, wsy);
                        ctx.lineTo(wsx + Math.cos(wa) * len, wsy + Math.sin(wa) * len);
                        ctx.stroke();
                    }
                    ctx.restore(); // конец корпуса
                    /* — ближние лапки (передняя бьёт по зерну в состоянии bat) — */ drawLeg(rearX + 16, -bh * 0.3, Math.PI, false, 0, 0);
                    drawLeg(frontX - 3, -bh * 0.28, 0, false, batSwing, batLift);
                    ctx.restore();
                }
            }["MartenScene.useEffect.drawMarten"];
            /* ────────────── Отрисовка: частицы ────────────── */ const drawParticles = {
                "MartenScene.useEffect.drawParticles": (kind)=>{
                    for (const p of particles){
                        if (p.kind !== kind) continue;
                        const lifeK = clamp(p.life / p.maxLife, 0, 1);
                        ctx.save();
                        if (p.kind === 'heart') {
                            ctx.globalAlpha = lifeK;
                            ctx.translate(p.x, p.y);
                            const sc = p.size / 4.4;
                            ctx.scale(sc, sc);
                            ctx.fillStyle = p.color;
                            ctx.beginPath();
                            ctx.arc(-1.9, -1.6, 2.1, 0, Math.PI * 2);
                            ctx.moveTo(4, -1.6);
                            ctx.arc(1.9, -1.6, 2.1, 0, Math.PI * 2);
                            ctx.moveTo(-3.9, -0.6);
                            ctx.lineTo(0, 4.2);
                            ctx.lineTo(3.9, -0.6);
                            ctx.closePath();
                            ctx.fill();
                        } else if (p.kind === 'gain') {
                            // летящий текст «+1🪙 / +1🐾»: жирный монospace с тёмной обводкой
                            ctx.globalAlpha = Math.min(1, lifeK * 1.6);
                            ctx.font = '700 13px ui-monospace, SFMono-Regular, Menlo, monospace';
                            ctx.textAlign = 'center';
                            ctx.textBaseline = 'middle';
                            ctx.lineWidth = 3;
                            ctx.lineJoin = 'round';
                            ctx.strokeStyle = 'rgba(43, 26, 14, 0.85)';
                            ctx.strokeText(p.label ?? '+1', p.x, p.y);
                            ctx.fillStyle = p.color;
                            ctx.fillText(p.label ?? '+1', p.x, p.y);
                        } else {
                            ctx.globalAlpha = 0.55 * lifeK;
                            ctx.translate(p.x, p.y);
                            ctx.rotate(p.rot);
                            ctx.fillStyle = p.color;
                            ctx.fillRect(-p.size / 2, -p.size * 0.75, p.size, p.size * 1.5);
                        }
                        ctx.restore();
                    }
                }
            }["MartenScene.useEffect.drawParticles"];
            /* ────────────── Настройка и запуск ────────────── */ resize();
            const [b0, b1] = walkBounds();
            marten.x = clamp(w * 0.5, b0, b1);
            marten.targetX = marten.x;
            for(let i = 0; i < kernels.length; i++){
                const k = kernels[i];
                k.x = clamp(w * (0.22 + 0.28 * i) + (prand(k.seed) - 0.5) * 24, 20, Math.max(21, w - 20));
                k.y = gy() - rand(30, 110); // зёрна падают и подпрыгивают при старте
            }
            inited = true;
            const ro = new ResizeObserver(resize);
            ro.observe(canvas);
            const onVisibility = {
                "MartenScene.useEffect.onVisibility": ()=>{
                    visible = !document.hidden;
                    if (visible) lastTime = performance.now(); // без скачка dt после паузы
                }
            }["MartenScene.useEffect.onVisibility"];
            document.addEventListener('visibilitychange', onVisibility);
            const onPointerDown = {
                "MartenScene.useEffect.onPointerDown": (e)=>{
                    const rect = canvas.getBoundingClientRect();
                    handleTap(e.clientX - rect.left, e.clientY - rect.top);
                }
            }["MartenScene.useEffect.onPointerDown"];
            canvas.addEventListener('pointerdown', onPointerDown);
            /* ────────────── Единственный rAF-цикл ────────────── */ const frame = {
                "MartenScene.useEffect.frame": (now)=>{
                    rafId = requestAnimationFrame(frame);
                    if (!visible) {
                        lastTime = now; // пауза рендера при скрытой вкладке
                        return;
                    }
                    let dt = (now - lastTime) / 1000;
                    lastTime = now;
                    if (dt <= 0) return;
                    if (dt > 0.05) dt = 0.05; // кап 50 мс
                    time += dt;
                    if (!awayRef.current) updateMarten(dt);
                    updateKernels(dt);
                    updateParticles(dt);
                    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
                    drawRoom();
                    const st = stageRef.current;
                    /* Уют комнаты: окно с закатом, лампа; постер появляется со стадией 3 —
         стена наполняется жизнью вместе с ростом NANA */ drawWindow();
                    drawLamp();
                    if (st >= 3) drawPoster();
                    // гирлянды на стене по стадиям
                    if (st >= 1) drawGarland(w * 0.06, w * 0.94, 16, 19 + Math.sin(time * 0.9) * 2, 'flags');
                    if (st >= 4) drawGarland(w * 0.12, w * 0.88, 54, 12 + Math.sin(time * 1.05 + 1.3) * 1.6, 'paws');
                    if (st >= 6) drawGarland(w * 0.04, w * 0.96, 8, 22 + Math.sin(time * 0.8) * 2.2, 'gold');
                    drawFloorDecor();
                    drawParticles('confetti'); // фоновые конфетти-искры
                    drawDust(); // пылинки в луче света
                    if (!awayRef.current) {
                        drawMartenShadow();
                        drawMarten();
                    }
                    for (const k of kernels)drawKernel(k);
                    drawParticles('heart');
                    drawParticles('gain');
                }
            }["MartenScene.useEffect.frame"];
            rafId = requestAnimationFrame(frame);
            /* ────────────── Полная очистка ────────────── */ return ({
                "MartenScene.useEffect": ()=>{
                    cancelAnimationFrame(rafId);
                    ro.disconnect();
                    document.removeEventListener('visibilitychange', onVisibility);
                    canvas.removeEventListener('pointerdown', onPointerDown);
                }
            })["MartenScene.useEffect"];
        }
    }["MartenScene.useEffect"], []);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("canvas", {
        ref: canvasRef,
        className: className ? `block ${className}` : 'block h-44 w-full',
        style: {
            touchAction: 'none',
            cursor: 'pointer'
        },
        role: "img",
        "aria-label": ariaLabel ?? 'Живая куница в уютной комнате: растёт с прогрессом и играет с зёрнами попкорна'
    }, void 0, false, {
        fileName: "[project]/src/components/game/marten-scene.tsx",
        lineNumber: 1458,
        columnNumber: 5
    }, this);
}
_s(MartenScene, "JaoV7POxZD8phpo8ZcXeugWjJoM=");
_c = MartenScene;
var _c;
__turbopack_context__.k.register(_c, "MartenScene");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/game/popcorn-slicer.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "PopcornSlicer",
    ()=>PopcornSlicer
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
/**
 * «НАРЕЗКА ПОПКОРНА» — бонус-мини-игра в конце уровня.
 *
 * Когда норма выполнена, на экране появляется ГИГАНТСКИЙ взорванный
 * попкорн (белый с жёлтым) — бонусная цель `is_bonus_target`, которая
 * не убивает игрока, а только раздаёт очки. Лапкой (свайпом) нужно
 * водить по ней как можно чаще, пока идёт таймер:
 *
 * 1. Ввод и «разрезание»: ловим ТРЕЙЛ пальца/курсора. Каждый кадр
 *    строится отрезок между предыдущей и текущей точкой касания.
 *    Отрезок пересёк коллайдер — засчитан «тик урона». Один свайп
 *    может дать много тиков: зигзаг через попкорн = серия попаданий.
 *
 * 2. Комбо за темп: тики, между которыми прошло меньше COMBO_GAP
 *    секунд, копят серию. Каждые MULT_STEP тиков множитель растёт
 *    (×1 → ×2 → ×3 → ×4). Пропало больше COMBO_GAP секунд — серия
 *    сгорела, множитель сброшен: надо «держать темп».
 *
 * 3. Крит: случайный шанс (не зависит от точности) добавить +10.
 *
 * 4. Физика разреза: каждый тик откалывает кусочки пуха, трещины
 *    идут по кукурузине; когда пул HP исчерпан — попкорн ВЗРЫВАЕТСЯ:
 *    две половинки разлетаются под гравитацией с импульсом свайпа,
 *    зёрна скачут по полу, +финальный бонус.
 *
 * Технические рамки из гейм-дизайна: хитбокс на 15% БОЛЬШЕ спрайта
 * (игроку кажется, что он «задел» кукурузину даже при лёгком промахе);
 * HUD (таймер, очки, полоска HP, комбо) рисуется на канвасе — без
 * перерисовок React в рантайме.
 *
 * БАЛАНС v0.0.23 (запрос игрока: «всегда 380–400, нужно сложнее»):
 * HP-пул 56 тиков — нарезка длится все 7 секунд; цель СЖИМАЕТСЯ с уроном
 * (радиус до 52%) и МЕДЛЕННО ПЛАВАЕТ по эллипсу — очки решает скилл:
 * обычный прогон ~300–400, сильный 600–800, потолок ≈1000–1100 только
 * при очень больших усилиях. Звёзды: 300 / 600 / 900.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/render/components/motion/proxy.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$game$2f$audio$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/game/audio.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
/* ══════════════ Жёсткие рамки баланса (гейм-дизайн) ══════════════ */ /** Сколько секунд идёт нарезка. Запрос игрока (0.0.31): было 7 — стало 5:
    окно короче → тиков меньше → до старого потолка добирают только
    самые быстрые лапки. Компенсация: база очков чуть выше (5 вместо 4) */ const SLICE_SECONDS = 5;
/** Серия живёт, пока между тиками меньше этого (сброс комбо по ТЗ) */ const COMBO_GAP = 1.5;
/** Антидребезг: минимальная пауза между тиками одного свайпа */ const TICK_COOLDOWN = 0.055;
/** v0.0.59: отдельный кулдаун золотых зёрен — вдвое короче тика попкорна */ const GOLD_COOLDOWN = 0.025;
/** Крит: случайный шанс (не зависит от точности) */ const CRIT_CHANCE = 0.12;
const CRIT_BONUS = 10;
const INTRO_SECONDS = 1.15;
const BURST_SECONDS = 1.5;
const SLICE_VARIANTS = {
    caramel: {
        chance: 0.6,
        base: 5,
        hp: 56,
        multStep: 5,
        maxMult: 4,
        doubleStep: false,
        shrinkMin: 0.52,
        driftAmp: 0.08,
        driftSpeed: 0.85,
        hitboxMul: 1.15,
        burst: 80,
        stars: [
            300,
            600,
            900
        ],
        name: '#FFC93C',
        lobeHi: '#FFFEFA',
        lobeMid: '#FFF4D8',
        lobeLo: '#F7D678',
        lobeEdge: '#E0A83C',
        kernelHi: '#FFDF7E',
        kernelLo: '#F0B93C',
        kernelEdge: '#D9A441',
        glow: '255, 214, 92',
        crack: '#C98A2B',
        ring: '255, 214, 92'
    },
    cherry: {
        chance: 0.29,
        base: 7,
        hp: 66,
        multStep: 4,
        maxMult: 10,
        doubleStep: false,
        shrinkMin: 0.46,
        driftAmp: 0.11,
        driftSpeed: 1.15,
        hitboxMul: 1.08,
        burst: 120,
        stars: [
            500,
            1300,
            2200
        ],
        name: '#FF7A5E',
        lobeHi: '#FFF5F2',
        lobeMid: '#FFC9BC',
        lobeLo: '#F0755F',
        lobeEdge: '#C43D2F',
        kernelHi: '#FFE08A',
        kernelLo: '#EDA93C',
        kernelEdge: '#C98A2B',
        glow: '255, 122, 94',
        crack: '#A83226',
        ring: '255, 122, 94'
    },
    grape: {
        chance: 0.11,
        base: 10,
        hp: 84,
        multStep: 5,
        maxMult: 16,
        doubleStep: true,
        shrinkMin: 0.42,
        driftAmp: 0.14,
        driftSpeed: 1.45,
        hitboxMul: 1.02,
        burst: 200,
        stars: [
            1200,
            3000,
            4400
        ],
        name: '#C98AFF',
        lobeHi: '#F8F0FC',
        lobeMid: '#DFB9F2',
        lobeLo: '#A566CB',
        lobeEdge: '#7A3D99',
        kernelHi: '#E9D2FF',
        kernelLo: '#B27FD8',
        kernelEdge: '#8A55AB',
        glow: '201, 138, 255',
        crack: '#6B3487',
        ring: '201, 138, 255'
    }
};
/** Взвешенный ролл сорта нарезки (карамель 60% · вишня 29% · виноград 11%) */ function rollSliceKind() {
    const r = Math.random();
    let acc = 0;
    for (const k of Object.keys(SLICE_VARIANTS)){
        acc += SLICE_VARIANTS[k].chance;
        if (r < acc) return k;
    }
    return 'caramel';
}
/** Ключ перевода и цвет имени сорта — для интро и карточки результата */ const KIND_KEY = {
    caramel: 'slicer.kindCaramel',
    cherry: 'slicer.kindCherry',
    grape: 'slicer.kindGrape'
};
const KIND_COLOR = {
    caramel: '#E8A93C',
    cherry: '#D95A45',
    grape: '#9A5FC0'
};
/* ── Награды в стиле Fruit Ninja ──
   Золотые зёрна-бонусы пролетают через экран дважды за нарезку: срез
   даёт жирные очки и МОНЕТКИ (обычные тики монеток не дают). Итог
   нарезки конвертируется в карманные монетки + оценка звёздами. */ /** Сколько золотых зёрен за одну нарезку */ const GOLDEN_COUNT = 2;
/** Очки и монетки за срез одного золотого (экономика 0.0.31: монеток 8) */ const GOLDEN_POINTS = 50;
const GOLDEN_COINS = 8;
/** Радиус золотого в долях радиуса попкорна */ const GOLDEN_R = 0.17;
/** Моменты спавна золотых (секунды от начала нарезки) — под 5-секундное окно */ const GOLDEN_SPAWN_AT = [
    1.2,
    3.5
];
/** Конверсия очков нарезки в монетки (экономика 0.0.31: 1🪙 за 18 очков, мин. 3) */ const COINS_PER_POINT = 1 / 18;
const MIN_SLICER_COINS = 3;
/** Антидребезг-движение: отрезок короче столько пикселей тик не даёт.
    Лечит фарм зажатием: палец лежит на месте — сегменты нулевые — очков нет. */ const MIN_MOVE = 13;
/** Ближайшая точка отрезка A→B к центру C не дальше радиуса r —
    свайп «прошёл по» коллайдеру (вход, выход или движение внутри). */ function segCircleNear(ax, ay, bx, by, cx, cy, r) {
    const dx = bx - ax;
    const dy = by - ay;
    const l2 = dx * dx + dy * dy;
    let k = 0;
    if (l2 > 1e-9) {
        k = ((cx - ax) * dx + (cy - ay) * dy) / l2;
        k = Math.max(0, Math.min(1, k));
    }
    const px = ax + dx * k - cx;
    const py = ay + dy * k - cy;
    return px * px + py * py <= r * r;
}
function PopcornSlicer({ t, level, onDone, onBank, dropClaw = null }) {
    _s();
    const canvasRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const wrapRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const [stage, setStage] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('intro');
    /* Сорт этой нарезки: ролл один раз при монтаже (?sliceKind= — DEV-фикс для QA) */ const [kind] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        "PopcornSlicer.useState": ()=>{
            try {
                const q = new URLSearchParams(window.location.search).get('sliceKind');
                if (q === 'caramel' || q === 'cherry' || q === 'grape') return q;
            } catch  {
            /* нет window — обычный ролл */ }
            return rollSliceKind();
        }
    }["PopcornSlicer.useState"]);
    const [result, setResult] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    /* Строки и колбэк — через ref, чтобы игровой цикл не перезапускался */ const tRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(t);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "PopcornSlicer.useEffect": ()=>{
            tRef.current = t;
        }
    }["PopcornSlicer.useEffect"], [
        t
    ]);
    const onDoneRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(onDone);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "PopcornSlicer.useEffect": ()=>{
            onDoneRef.current = onDone;
        }
    }["PopcornSlicer.useEffect"], [
        onDone
    ]);
    const onBankRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(onBank);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "PopcornSlicer.useEffect": ()=>{
            onBankRef.current = onBank;
        }
    }["PopcornSlicer.useEffect"], [
        onBank
    ]);
    /** v0.0.59: награда уже засчитана (защита от двойной выдачи) */ const paidRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(false);
    /** v0.0.59: флаг «Пропустить» — этап нарезки обрывается с уже набранными очками */ const skipRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(false);
    /* ════ Игровое состояние: один мутабельный объект в ref ════ */ const gRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    /* ════ Игровой цикл: рисование + физика + ввод обработан в слушателях ════ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "PopcornSlicer.useEffect": ()=>{
            const canvas = canvasRef.current;
            const wrap = wrapRef.current;
            if (!canvas || !wrap) return;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;
            const g = gRef.current ??= {
                kind,
                stage: 'intro',
                stageT: 0,
                W: 0,
                H: 0,
                u: 1,
                cx: 0,
                cy: 0,
                R: 80,
                hp: SLICE_VARIANTS[kind].hp,
                ticks: 0,
                total: 0,
                combo: 0,
                mult: 1,
                maxMult: 1,
                lastTickAt: -9,
                lastGoldAt: -9,
                lastPlopAt: -9,
                timeLeft: SLICE_SECONDS,
                exploded: false,
                wobble: 0,
                hitFlash: 0,
                burstFlash: 0,
                comboPopT: -9,
                down: false,
                pid: -1,
                px: 0,
                py: 0,
                ox: 0,
                oy: 0,
                trail: [],
                chunks: [],
                halves: [],
                goldens: [],
                goldSpawned: 0,
                goldCoins: 0,
                floats: [],
                sparks: [],
                lobes: [],
                kernels: [],
                ridges: [],
                cracks: []
            };
            /* DEV-отладка: состояние слайсера из консоли (window.__slicerDbg()) — только в dev */ if ("TURBOPACK compile-time truthy", 1) {
                ;
                window.__slicerDbg = ({
                    "PopcornSlicer.useEffect": ()=>`kind=${g.kind} stage=${g.stage} stageT=${g.stageT.toFixed(2)} timeLeft=${g.timeLeft.toFixed(2)} hp=${g.hp} ticks=${g.ticks} total=${g.total} mult=${g.mult} R=${g.R.toFixed(1)} cx=${g.cx} cy=${g.cy} u=${g.u} W=${g.W} H=${g.H} down=${g.down}`
                })["PopcornSlicer.useEffect"];
                window.__slicerG = g;
            }
            /* ── Геометрия гигантской кукурузины: генерируется один раз.
          Все координаты — в ДОЛЯХ радиуса R (0..1), масштабируются при рисовании ── */ const buildPopcorn = {
                "PopcornSlicer.useEffect.buildPopcorn": ()=>{
                    const rnd = Math.random;
                    g.lobes = [];
                    g.kernels = [];
                    g.ridges = [];
                    g.cracks = [];
                    const nL = 10 + Math.floor(rnd() * 4);
                    for(let i = 0; i < nL; i++){
                        const a = i / nL * Math.PI * 2 + rnd() * 0.7;
                        const d = 0.18 + rnd() * 0.5;
                        g.lobes.push({
                            ox: Math.cos(a) * d,
                            oy: Math.sin(a) * d * 0.92,
                            r: 0.3 + rnd() * 0.26
                        });
                    }
                    /* Центральная макушка покрупнее */ g.lobes.push({
                        ox: 0.04,
                        oy: -0.3,
                        r: 0.42
                    });
                    g.lobes.push({
                        ox: -0.26,
                        oy: 0.22,
                        r: 0.38
                    });
                    g.lobes.push({
                        ox: 0.28,
                        oy: 0.24,
                        r: 0.36
                    });
                    /* Жёлтые зёрнышки выглядывают между белыми пузырями */ for(let i = 0; i < 3; i++){
                        const a = rnd() * Math.PI * 2;
                        const d = 0.45 + rnd() * 0.35;
                        g.kernels.push({
                            ox: Math.cos(a) * d,
                            oy: Math.sin(a) * d,
                            r: 0.1 + rnd() * 0.08
                        });
                    }
                    /* Пушные «гребешки» — текстура взорванного зерна */ for(let i = 0; i < 7; i++){
                        const a = rnd() * Math.PI * 2;
                        const d = 0.15 + rnd() * 0.5;
                        g.ridges.push({
                            x: Math.cos(a) * d,
                            y: Math.sin(a) * d,
                            r: 0.1 + rnd() * 0.12,
                            a0: rnd() * Math.PI * 2,
                            a1: rnd() * Math.PI + Math.PI
                        });
                    }
                    /* Трещины: ломаные от края к центру, открываются по мере урона */ for(let i = 0; i < 7; i++){
                        const a = rnd() * Math.PI * 2;
                        const pts = [];
                        let rr = 0.95;
                        let aa = a;
                        for(let k = 0; k < 4; k++){
                            pts.push([
                                Math.cos(aa) * rr,
                                Math.sin(aa) * rr
                            ]);
                            rr *= 0.72;
                            aa += (rnd() - 0.5) * 1.1;
                        }
                        g.cracks.push(pts);
                    }
                }
            }["PopcornSlicer.useEffect.buildPopcorn"];
            /* ── Размер канваса: DPR + единица масштаба ── */ const resize = {
                "PopcornSlicer.useEffect.resize": ()=>{
                    const rect = wrap.getBoundingClientRect();
                    const dpr = Math.min(2.5, window.devicePixelRatio || 1);
                    g.W = Math.max(1, rect.width);
                    g.H = Math.max(1, rect.height);
                    canvas.width = Math.round(g.W * dpr);
                    canvas.height = Math.round(g.H * dpr);
                    canvas.style.width = `${g.W}px`;
                    canvas.style.height = `${g.H}px`;
                    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
                    g.u = Math.max(0.75, Math.min(g.W, g.H) / 430);
                    g.cx = g.W / 2;
                    g.cy = g.H * 0.46;
                    g.R = Math.min(g.W, g.H) * 0.21;
                    /* v0.0.59: геометрия кукурузины (трещины/доли) пересобирается ТОЛЬКО
         в интро/между стадиями — посреди нарезки поворот экрана больше
         не «телепортирует» трещины, счёт и урон сохраняются */ if (g.stage === 'intro' || g.stage === 'results') buildPopcorn();
                }
            }["PopcornSlicer.useEffect.resize"];
            resize();
            const ro = new ResizeObserver(resize);
            ro.observe(wrap);
            /** Параметры текущего сорта (карамель/вишня/виноград) */ const VR = {
                "PopcornSlicer.useEffect.VR": ()=>SLICE_VARIANTS[g.kind]
            }["PopcornSlicer.useEffect.VR"];
            /** Текущий радиус цели: сжимается по мере урона (1 → shrinkMin сорта).
        Главный скилл-гейт нарезки: сдуваешь HP — цель мельчает, и
        цеплять её свайпами всё труднее (у вишни и винограда — сильнее) */ const curR = {
                "PopcornSlicer.useEffect.curR": ()=>{
                    const V = VR();
                    return g.R * (1 - (1 - V.shrinkMin) * Math.min(1, g.ticks / V.hp));
                }
            }["PopcornSlicer.useEffect.curR"];
            /* ── Спавн кусочков при тике урона ── */ const spawnChunks = {
                "PopcornSlicer.useEffect.spawnChunks": (x, y, n, kernel)=>{
                    for(let i = 0; i < n; i++){
                        const a = Math.random() * Math.PI * 2;
                        const sp = (90 + Math.random() * 200) * g.u;
                        g.chunks.push({
                            x,
                            y,
                            vx: Math.cos(a) * sp,
                            vy: Math.sin(a) * sp - 160 * g.u,
                            r: (3.5 + Math.random() * 4.5) * g.u,
                            rot: Math.random() * Math.PI * 2,
                            vr: (Math.random() - 0.5) * 12,
                            t: 0,
                            ttl: 0.8 + Math.random() * 0.5,
                            kernel
                        });
                    }
                    if (g.chunks.length > 90) g.chunks.splice(0, g.chunks.length - 90);
                }
            }["PopcornSlicer.useEffect.spawnChunks"];
            /* ── Тик урона: комбо, множитель сорта, крит, очки ── */ const tick = {
                "PopcornSlicer.useEffect.tick": (hx, hy, now)=>{
                    const V = VR();
                    g.combo = now - g.lastTickAt <= COMBO_GAP ? g.combo + 1 : 1;
                    g.lastTickAt = now;
                    /* Множитель сорта: у карамели/вишни +1 за ступень (у вишни потолок выше),
          у винограда УДВОЕНИЕ за ступень: ×1→×2→×4→×8→×16 */ const step = Math.floor((g.combo - 1) / V.multStep);
                    const mult = V.doubleStep ? Math.min(V.maxMult, 2 ** step) : Math.min(V.maxMult, 1 + step);
                    if (mult > g.mult) {
                        g.mult = mult;
                        g.comboPopT = now;
                        if (mult > g.maxMult) g.maxMult = mult;
                    }
                    const crit = Math.random() < CRIT_CHANCE;
                    const gained = V.base * g.mult + (crit ? CRIT_BONUS : 0);
                    g.total += gained;
                    g.ticks++;
                    g.hp--;
                    g.wobble = 1;
                    g.hitFlash = 0.22;
                    const S = tRef.current;
                    g.floats.push({
                        x: hx,
                        y: hy - 14 * g.u,
                        vy: -70 * g.u,
                        text: crit ? `${S('slicer.crit')} +${gained}` : `+${gained}`,
                        crit,
                        t: 0
                    });
                    if (g.floats.length > 14) g.floats.shift();
                    g.sparks.push({
                        x: hx,
                        y: hy,
                        t: 0
                    });
                    spawnChunks(hx, hy, crit ? 5 : 3, false);
                    if (now - g.lastPlopAt >= 0.07) {
                        g.lastPlopAt = now;
                        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$game$2f$audio$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["audio"].play('plop');
                    }
                    if (g.hp <= 0) doBurst(now, true);
                }
            }["PopcornSlicer.useEffect.tick"];
            /** Золотое зерно срезано (Fruit Ninja): жирные очки + монетки в кошелёк */ const hitGolden = {
                "PopcornSlicer.useEffect.hitGolden": (hx, hy, idx)=>{
                    const gr = g.goldens[idx];
                    if (!gr) return;
                    g.goldens.splice(idx, 1);
                    g.total += GOLDEN_POINTS;
                    g.goldCoins += GOLDEN_COINS;
                    g.floats.push({
                        x: hx,
                        y: hy - 14 * g.u,
                        vy: -70 * g.u,
                        text: `✨ +${GOLDEN_POINTS}`,
                        crit: true,
                        t: 0
                    });
                    g.sparks.push({
                        x: hx,
                        y: hy,
                        t: 0
                    });
                    spawnChunks(hx, hy, 8, true);
                    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$game$2f$audio$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["audio"].play('plopGold');
                }
            }["PopcornSlicer.useEffect.hitGolden"];
            /* ── ВЗРЫВ: половинки разлетаются с импульсом, зёрна скачут ── */ const doBurst = {
                "PopcornSlicer.useEffect.doBurst": (now, exploded)=>{
                    if (g.stage !== 'slice') return;
                    const V = VR();
                    const bx = g.cx + g.ox;
                    const by = g.cy + g.oy;
                    g.stage = 'burst';
                    g.stageT = 0;
                    g.exploded = exploded;
                    g.burstFlash = 0.5;
                    if (exploded) {
                        g.total += V.burst;
                        const S = tRef.current;
                        g.floats.push({
                            x: bx,
                            y: by - curR() * 0.4,
                            vy: -60 * g.u,
                            text: S('slicer.burst', {
                                n: V.burst
                            }),
                            crit: true,
                            t: 0
                        });
                        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$game$2f$audio$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["audio"].play('fever');
                    }
                    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$game$2f$audio$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["audio"].play('plopGold');
                    spawnChunks(bx, by, 16, true);
                    spawnChunks(bx, by, 10, false);
                    /* Импульс разреза: половинки гарантированно разлетаются в стороны */ const ix = (150 + Math.random() * 100) * g.u;
                    const iy = -(180 + Math.random() * 140) * g.u;
                    g.halves.push({
                        x: bx,
                        y: by,
                        vx: ix,
                        vy: iy,
                        rot: 0,
                        vr: (2 + Math.random() * 2) * (Math.random() < 0.5 ? -1 : 1),
                        side: -1
                    });
                    g.halves.push({
                        x: bx,
                        y: by,
                        vx: -ix,
                        vy: iy,
                        rot: 0,
                        vr: (2 + Math.random() * 2) * (Math.random() < 0.5 ? -1 : 1),
                        side: 1
                    });
                    setStage('burst');
                }
            }["PopcornSlicer.useEffect.doBurst"];
            /* ── Ввод: трейл пальца/курсора → отрезки → пересечения ── */ const toLocal = {
                "PopcornSlicer.useEffect.toLocal": (e)=>{
                    const rect = canvas.getBoundingClientRect();
                    return {
                        x: e.clientX - rect.left,
                        y: e.clientY - rect.top
                    };
                }
            }["PopcornSlicer.useEffect.toLocal"];
            const perfNow = {
                "PopcornSlicer.useEffect.perfNow": ()=>performance.now() / 1000
            }["PopcornSlicer.useEffect.perfNow"];
            const onDown = {
                "PopcornSlicer.useEffect.onDown": (e)=>{
                    e.preventDefault();
                    const p = toLocal(e);
                    g.down = true;
                    g.pid = e.pointerId;
                    g.px = p.x;
                    g.py = p.y;
                    g.trail.push({
                        x: p.x,
                        y: p.y,
                        t: perfNow()
                    });
                    try {
                        canvas.setPointerCapture(e.pointerId);
                    } catch  {
                    /* старые браузеры без capture — не страшно */ }
                }
            }["PopcornSlicer.useEffect.onDown"];
            const onMove = {
                "PopcornSlicer.useEffect.onMove": (e)=>{
                    if (!g.down || e.pointerId !== g.pid) return;
                    const now = perfNow();
                    const p = toLocal(e);
                    const ax = g.px;
                    const ay = g.py;
                    g.px = p.x;
                    g.py = p.y;
                    g.trail.push({
                        x: p.x,
                        y: p.y,
                        t: now
                    });
                    if (g.trail.length > 40) g.trail.shift();
                    /* Детекция пересечения отрезком ПОПКОРНА: хитбокс на 15% шире спрайта.
          Сегменты короче MIN_MOVE не считаем — зажатие на месте не фармит */ const mdx = p.x - ax;
                    const mdy = p.y - ay;
                    const enough = mdx * mdx + mdy * mdy >= MIN_MOVE * MIN_MOVE;
                    const cooled = now - g.lastTickAt >= TICK_COOLDOWN;
                    /* v0.0.59: золотые зёрна со СВОИМ коротким кулдауном — срез золота
         сразу после тика попкорна больше не игнорируется (был несправедливый
         «промах» из-за общего кулдауна 55 мс) */ const goldCooled = now - g.lastGoldAt >= GOLD_COOLDOWN;
                    /* Золотые зёрна проверяем ПЕРВЫМИ: их срез не тратит тик попкорна */ if (g.stage === 'slice' && enough && goldCooled) {
                        for(let i = g.goldens.length - 1; i >= 0; i--){
                            const gr = g.goldens[i];
                            if (!gr) continue;
                            const gy = gr.y0 + Math.sin(gr.t * 3.2) * 30 * g.u;
                            if (segCircleNear(ax, ay, p.x, p.y, gr.x, gy, gr.r * 1.3)) {
                                g.lastGoldAt = now;
                                hitGolden((ax + p.x) / 2, (ay + p.y) / 2, i);
                                break;
                            }
                        }
                    }
                    if (g.stage === 'slice' && enough && cooled && segCircleNear(ax, ay, p.x, p.y, g.cx + g.ox, g.cy + g.oy, curR() * VR().hitboxMul)) {
                        const mx = (ax + p.x) / 2;
                        const my = (ay + p.y) / 2;
                        tick(mx, my, now);
                    }
                }
            }["PopcornSlicer.useEffect.onMove"];
            const onUp = {
                "PopcornSlicer.useEffect.onUp": (e)=>{
                    if (e.pointerId !== g.pid) return;
                    g.down = false;
                    g.pid = -1;
                }
            }["PopcornSlicer.useEffect.onUp"];
            canvas.addEventListener('pointerdown', onDown);
            canvas.addEventListener('pointermove', onMove);
            canvas.addEventListener('pointerup', onUp);
            canvas.addEventListener('pointercancel', onUp);
            let raf = 0;
            let last = perfNow();
            /* ════ Рисование ════ */ /** Гигантский попкорн сорта: пузыри-доли, зёрнышки, пух, трещины */ const drawPopcorn = {
                "PopcornSlicer.useEffect.drawPopcorn": (cx, cy, R, now, damage)=>{
                    const u = g.u;
                    const V = VR();
                    ctx.save();
                    ctx.translate(cx, cy);
                    /* Мягкий цветной ореол под кукурузиной — она «светится» сортовым теплом */ const glow = ctx.createRadialGradient(0, 0, R * 0.2, 0, 0, R * 1.55);
                    glow.addColorStop(0, `rgba(${V.glow}, 0.4)`);
                    glow.addColorStop(0.65, `rgba(${V.glow}, 0.12)`);
                    glow.addColorStop(1, `rgba(${V.glow}, 0)`);
                    ctx.fillStyle = glow;
                    ctx.beginPath();
                    ctx.arc(0, 0, R * 1.55, 0, Math.PI * 2);
                    ctx.fill();
                    /* Тень на «полу» */ ctx.fillStyle = 'rgba(10, 5, 2, 0.3)';
                    ctx.beginPath();
                    ctx.ellipse(0, R * 1.12, R * 0.85, R * 0.18, 0, 0, Math.PI * 2);
                    ctx.fill();
                    /* Покачивание при попаданиях + лёгкое дыхание */ const w = g.wobble;
                    ctx.rotate(Math.sin(now * 0.9) * 0.025 + w * (Math.sin(now * 40) * 0.05));
                    ctx.scale(1 + w * 0.07, 1 - w * 0.07);
                    /* Зёрнышки выглядывают между пузырями сорта (рисуем первыми — они «внутри») */ for (const k of g.kernels){
                        const kx = k.ox * R;
                        const ky = k.oy * R;
                        const kr = k.r * R;
                        const kg = ctx.createRadialGradient(kx, ky, kr * 0.15, kx, ky, kr);
                        kg.addColorStop(0, V.kernelHi);
                        kg.addColorStop(1, V.kernelLo);
                        ctx.fillStyle = kg;
                        ctx.beginPath();
                        ctx.arc(kx, ky, kr, 0, Math.PI * 2);
                        ctx.fill();
                        ctx.strokeStyle = V.kernelEdge;
                        ctx.lineWidth = Math.max(1, 1.6 * u);
                        ctx.stroke();
                    }
                    /* Белые «взорванные» доли (координаты долей — в долях R) */ for (const l of g.lobes){
                        const lx = l.ox * R;
                        const ly = l.oy * R;
                        const lr = l.r * R;
                        const lg = ctx.createRadialGradient(lx - lr * 0.35, ly - lr * 0.4, lr * 0.1, lx, ly, lr);
                        lg.addColorStop(0, V.lobeHi);
                        lg.addColorStop(0.55, V.lobeMid);
                        lg.addColorStop(1, V.lobeLo);
                        ctx.fillStyle = lg;
                        ctx.beginPath();
                        ctx.arc(lx, ly, lr, 0, Math.PI * 2);
                        ctx.fill();
                        ctx.strokeStyle = V.lobeEdge;
                        ctx.lineWidth = Math.max(1.5, 2.2 * u);
                        ctx.stroke();
                    }
                    /* Пушные гребешки — текстура взорванного зерна */ ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
                    ctx.lineWidth = Math.max(1.2, 2 * u);
                    for (const r of g.ridges){
                        ctx.beginPath();
                        ctx.arc(r.x * R, r.y * R, r.r * R, r.a0, r.a1);
                        ctx.stroke();
                    }
                    /* Трещины: по мере урона их всё больше */ const nC = Math.floor(damage * g.cracks.length);
                    ctx.strokeStyle = V.crack;
                    ctx.lineWidth = Math.max(1.5, 2.4 * u);
                    for(let i = 0; i < nC; i++){
                        const pts = g.cracks[i];
                        if (!pts) continue;
                        ctx.beginPath();
                        ctx.moveTo(pts[0][0] * R, pts[0][1] * R);
                        for(let k = 1; k < pts.length; k++){
                            const pt = pts[k];
                            ctx.lineTo(pt[0] * R, pt[1] * R);
                        }
                        ctx.stroke();
                    }
                    /* Вспышка от попадания */ if (g.hitFlash > 0) {
                        ctx.globalAlpha = Math.min(1, g.hitFlash / 0.22) * 0.4;
                        ctx.fillStyle = '#FFFFFF';
                        ctx.beginPath();
                        ctx.arc(0, 0, R * 1.02, 0, Math.PI * 2);
                        ctx.fill();
                        ctx.globalAlpha = 1;
                    }
                    ctx.restore();
                }
            }["PopcornSlicer.useEffect.drawPopcorn"];
            /** Половинка: та же кукурузина, обрезанная плоскостью разреза */ const drawHalf = {
                "PopcornSlicer.useEffect.drawHalf": (h, now)=>{
                    ctx.save();
                    ctx.translate(h.x, h.y);
                    ctx.rotate(h.rot);
                    ctx.beginPath();
                    const far = g.R * 2.2;
                    if (h.side < 0) ctx.rect(-far, -far, far, far * 2);
                    else ctx.rect(0, -far, far, far * 2);
                    ctx.clip();
                    drawPopcorn(0, 0, g.R, now, 1);
                    /* Срез: светлая линия по плоскости разреза */ ctx.strokeStyle = 'rgba(255, 251, 235, 0.95)';
                    ctx.lineWidth = Math.max(2, 3 * g.u);
                    ctx.beginPath();
                    ctx.moveTo(0, -g.R * 1.1);
                    ctx.lineTo(0, g.R * 1.1);
                    ctx.stroke();
                    ctx.restore();
                }
            }["PopcornSlicer.useEffect.drawHalf"];
            const drawChunk = {
                "PopcornSlicer.useEffect.drawChunk": (c)=>{
                    const alpha = c.t > c.ttl - 0.25 ? Math.max(0, (c.ttl - c.t) / 0.25) : 1;
                    const V = VR();
                    ctx.save();
                    ctx.globalAlpha = alpha;
                    ctx.translate(c.x, c.y);
                    ctx.rotate(c.rot);
                    const grad = ctx.createRadialGradient(-c.r * 0.3, -c.r * 0.3, c.r * 0.1, 0, 0, c.r);
                    if (c.kernel) {
                        grad.addColorStop(0, V.kernelHi);
                        grad.addColorStop(1, V.kernelLo);
                    } else {
                        grad.addColorStop(0, V.lobeHi);
                        grad.addColorStop(1, V.lobeLo);
                    }
                    ctx.fillStyle = grad;
                    ctx.beginPath();
                    ctx.arc(0, 0, c.r, 0, Math.PI * 2);
                    ctx.fill();
                    if (!c.kernel) {
                        ctx.strokeStyle = V.lobeEdge;
                        ctx.lineWidth = Math.max(1, 1.4 * g.u);
                        ctx.stroke();
                    }
                    ctx.restore();
                }
            }["PopcornSlicer.useEffect.drawChunk"];
            const pixelFont = {
                "PopcornSlicer.useEffect.pixelFont": (size)=>`700 ${Math.round(size)}px "Handjet", system-ui, sans-serif`
            }["PopcornSlicer.useEffect.pixelFont"];
            /** Текст с тёмной обводкой — как баннеры в движке */ const outlineText = {
                "PopcornSlicer.useEffect.outlineText": (text, x, y, size, fill, align = 'center')=>{
                    ctx.font = pixelFont(size);
                    ctx.textAlign = align;
                    ctx.textBaseline = 'middle';
                    ctx.lineJoin = 'round';
                    ctx.strokeStyle = 'rgba(20, 8, 2, 0.85)';
                    ctx.lineWidth = Math.max(3, size * 0.22);
                    ctx.strokeText(text, x, y);
                    ctx.fillStyle = fill;
                    ctx.fillText(text, x, y);
                }
            }["PopcornSlicer.useEffect.outlineText"];
            /* ════ Главный цикл ════ */ const frame = {
                "PopcornSlicer.useEffect.frame": ()=>{
                    raf = requestAnimationFrame(frame);
                    try {
                        step();
                    } catch (err) {
                        ;
                        window.__slicerErr = String(err);
                    }
                }
            }["PopcornSlicer.useEffect.frame"];
            const step = {
                "PopcornSlicer.useEffect.step": ()=>{
                    const now = perfNow();
                    let dt = now - last;
                    last = now;
                    if (dt > 0.05) dt = 0.05; // прыжок таба — не даём физике улететь
                    g.stageT += dt;
                    const u = g.u;
                    const S = tRef.current;
                    /* ── Переходы стадий ── */ if (g.stage === 'intro' && g.stageT >= INTRO_SECONDS) {
                        g.stage = 'slice';
                        g.stageT = 0;
                        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$game$2f$audio$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["audio"].play('fever');
                        setStage('slice');
                    } else if (g.stage === 'slice') {
                        g.timeLeft -= dt;
                        /* v0.0.59: «Пропустить» — обрываем этап, очки уже набранные засчитываются */ if (skipRef.current) {
                            skipRef.current = false;
                            g.timeLeft = 0;
                        }
                        /* Плавание цели: центр гуляет по эллипсу вокруг точки покоя —
            скорость и амплитуда у СОРТА: виноград вертится заметно резче.
            Свайп по неподвижной мишени фармил бы очки, по бегущей — требует внимания */ const V = VR();
                        g.ox = Math.sin(now * V.driftSpeed) * V.driftAmp * g.R;
                        g.oy = Math.cos(now * V.driftSpeed * 0.8) * V.driftAmp * g.R * 0.7;
                        /* Сброс комбо: больше COMBO_GAP без нарезки — серия сгорела */ if (g.mult > 1 && now - g.lastTickAt > COMBO_GAP) {
                            g.combo = 0;
                            g.mult = 1;
                        }
                        /* ЗОЛОТЫЕ ЗЁРНА (Fruit Ninja): спавн по графику нарезки, плывут через экран */ while(g.goldSpawned < GOLDEN_COUNT && SLICE_SECONDS - g.timeLeft >= (GOLDEN_SPAWN_AT[g.goldSpawned] ?? 99)){
                            const dir = g.goldSpawned % 2 === 0 ? 1 : -1;
                            g.goldens.push({
                                x: dir > 0 ? -24 * u : g.W + 24 * u,
                                y0: g.H * (0.2 + Math.random() * 0.16),
                                vx: dir * (70 + Math.random() * 40) * u,
                                t: 0,
                                r: g.R * GOLDEN_R
                            });
                            g.goldSpawned++;
                        }
                        for(let i = g.goldens.length - 1; i >= 0; i--){
                            const gr = g.goldens[i];
                            if (!gr) continue;
                            gr.t += dt;
                            gr.x += gr.vx * dt;
                            if (gr.t > 4.5 || gr.x < -50 * u || gr.x > g.W + 50 * u) g.goldens.splice(i, 1);
                        }
                        if (g.timeLeft <= 0) {
                            g.timeLeft = 0;
                            doBurst(now, false);
                        }
                    } else if (g.stage === 'burst' && g.stageT >= BURST_SECONDS) {
                        g.stage = 'results';
                        g.stageT = 0;
                        setStage('results');
                        const rewardCoins = g.goldCoins + Math.max(MIN_SLICER_COINS, Math.round(g.total * COINS_PER_POINT));
                        setResult({
                            total: g.total,
                            swipes: g.ticks,
                            maxMult: g.maxMult,
                            /* Награды Fruit Ninja: конверсия очков в монетки (мин. 3) + золото по 8 */ coins: rewardCoins,
                            stars: ({
                                "PopcornSlicer.useEffect.step": ()=>{
                                    const st = VR().stars;
                                    return g.total >= st[2] ? 3 : g.total >= st[1] ? 2 : g.total >= st[0] ? 1 : 0;
                                }
                            })["PopcornSlicer.useEffect.step"](),
                            kind: g.kind
                        });
                        /* v0.0.59: награда ЗАСЧИТЫВАЕТСЯ прямо на переходе к итогу — раньше
           монетки/коготок начислялись только по клику «ЗАБРАТЬ», и закрытие
           вкладки на карточке результата теряло всё заработанное */ if (!paidRef.current) {
                            paidRef.current = true;
                            if (onBankRef.current) onBankRef.current(g.total, {
                                coins: rewardCoins
                            }, {
                                kind: g.kind
                            });
                            else onDoneRef.current(g.total, {
                                coins: rewardCoins
                            }, {
                                kind: g.kind
                            });
                        }
                    }
                    /* ── Физика кусочков: гравитация, пол, отскок ──
         Слоу-мо: первый полсекунды взрыва растянуты (×0.35) — разлёт
         половинок читается «кинематографично», потом время догоняет */ const pdt = g.stage === 'burst' && g.stageT < 0.5 ? dt * 0.35 : dt;
                    for(let i = g.chunks.length - 1; i >= 0; i--){
                        const c = g.chunks[i];
                        if (!c) continue;
                        c.t += pdt;
                        c.vy += 1500 * u * pdt;
                        c.x += c.vx * pdt;
                        c.y += c.vy * pdt;
                        c.rot += c.vr * pdt;
                        const floor = g.H - 14 * u;
                        if (c.y > floor && c.vy > 0) {
                            c.y = floor;
                            c.vy *= -0.42;
                            c.vx *= 0.72;
                            if (Math.abs(c.vy) < 40 * u) c.vy = 0;
                        }
                        if (c.t >= c.ttl) g.chunks.splice(i, 1);
                    }
                    /* ── Половинки: гравитация + вращение (улетают за экран) ── */ for (const h of g.halves){
                        h.vy += 1400 * u * pdt;
                        h.x += h.vx * pdt;
                        h.y += h.vy * pdt;
                        h.rot += h.vr * pdt;
                    }
                    /* ── Затухания ── */ g.wobble *= Math.exp(-dt * 6.5);
                    if (g.hitFlash > 0) g.hitFlash -= dt;
                    if (g.burstFlash > 0) g.burstFlash -= dt * 1.6;
                    for(let i = g.floats.length - 1; i >= 0; i--){
                        const f = g.floats[i];
                        if (!f) continue;
                        f.t += dt;
                        f.y += f.vy * dt;
                        if (f.t > 0.9) g.floats.splice(i, 1);
                    }
                    for(let i = g.sparks.length - 1; i >= 0; i--){
                        const s = g.sparks[i];
                        if (!s) continue;
                        s.t += dt;
                        if (s.t > 0.18) g.sparks.splice(i, 1);
                    }
                    while(g.trail.length > 0 && now - (g.trail[0]?.t ?? now) > 0.22)g.trail.shift();
                    /* ════ Отрисовка ════ */ ctx.clearRect(0, 0, g.W, g.H);
                    /* Попкорн или половинки: центр с плаванием, радиус сжат по урону */ if (g.stage === 'burst' || g.stage === 'results') {
                        for (const h of g.halves)drawHalf(h, now);
                    } else {
                        const bob = Math.sin(now * 1.6) * 4 * u;
                        drawPopcorn(g.cx + g.ox, g.cy + g.oy + bob, curR(), now, g.ticks / VR().hp);
                    }
                    for (const c of g.chunks)drawChunk(c);
                    /* Золотые зёрна-бонусы (Fruit Ninja): сияющий комочек плывёт по синусоиде */ for (const gr of g.goldens){
                        const gy = gr.y0 + Math.sin(gr.t * 3.2) * 30 * u;
                        const pulse = 1 + Math.sin(gr.t * 9) * 0.08;
                        ctx.save();
                        ctx.translate(gr.x, gy);
                        const halo = ctx.createRadialGradient(0, 0, gr.r * 0.2, 0, 0, gr.r * 2.2);
                        halo.addColorStop(0, 'rgba(255, 214, 92, 0.55)');
                        halo.addColorStop(1, 'rgba(255, 214, 92, 0)');
                        ctx.fillStyle = halo;
                        ctx.beginPath();
                        ctx.arc(0, 0, gr.r * 2.2 * pulse, 0, Math.PI * 2);
                        ctx.fill();
                        const core = ctx.createRadialGradient(-gr.r * 0.3, -gr.r * 0.35, gr.r * 0.1, 0, 0, gr.r);
                        core.addColorStop(0, '#FFF6D0');
                        core.addColorStop(0.55, '#FFC93C');
                        core.addColorStop(1, '#E5A31F');
                        ctx.fillStyle = core;
                        ctx.beginPath();
                        ctx.arc(0, 0, gr.r * pulse, 0, Math.PI * 2);
                        ctx.fill();
                        ctx.strokeStyle = '#D98E1B';
                        ctx.lineWidth = Math.max(1.4, 2 * u);
                        ctx.stroke();
                        ctx.strokeStyle = 'rgba(255, 246, 208, 0.9)';
                        ctx.lineWidth = Math.max(1, 1.6 * u);
                        for(let i = 0; i < 4; i++){
                            const a = i / 4 * Math.PI * 2 + gr.t * 2.4;
                            ctx.beginPath();
                            ctx.moveTo(Math.cos(a) * gr.r * 1.25, Math.sin(a) * gr.r * 1.25);
                            ctx.lineTo(Math.cos(a) * gr.r * 1.8, Math.sin(a) * gr.r * 1.8);
                            ctx.stroke();
                        }
                        ctx.restore();
                    }
                    /* Искры от попаданий: 4 коротких луча */ ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
                    ctx.lineWidth = Math.max(1.5, 2 * u);
                    for (const s of g.sparks){
                        const k = 1 - s.t / 0.18;
                        const rr = g.R * 0.14 + s.t * 260 * u;
                        ctx.globalAlpha = k;
                        for(let i = 0; i < 4; i++){
                            const a = i / 4 * Math.PI * 2 + s.t * 6;
                            ctx.beginPath();
                            ctx.moveTo(s.x + Math.cos(a) * rr * 0.5, s.y + Math.sin(a) * rr * 0.5);
                            ctx.lineTo(s.x + Math.cos(a) * rr, s.y + Math.sin(a) * rr);
                            ctx.stroke();
                        }
                        ctx.globalAlpha = 1;
                    }
                    /* Трейл лапки: янтарный ореол + белая сердцевина, сужается к хвосту */ if (g.trail.length > 1) {
                        ctx.lineCap = 'round';
                        ctx.lineJoin = 'round';
                        for(let pass = 0; pass < 2; pass++){
                            for(let i = 1; i < g.trail.length; i++){
                                const a = g.trail[i - 1];
                                const b = g.trail[i];
                                if (!a || !b) continue;
                                const age = now - b.t;
                                const k = Math.max(0, 1 - age / 0.22);
                                if (pass === 0) {
                                    ctx.strokeStyle = `rgba(255, 214, 92, ${0.4 * k})`;
                                    ctx.lineWidth = Math.max(2, 13 * u * k);
                                } else {
                                    ctx.strokeStyle = `rgba(255, 255, 255, ${0.92 * k})`;
                                    ctx.lineWidth = Math.max(1, 5.5 * u * k);
                                }
                                ctx.beginPath();
                                ctx.moveTo(a.x, a.y);
                                ctx.lineTo(b.x, b.y);
                                ctx.stroke();
                            }
                        }
                    }
                    /* Лапка-курсор: 🐾 качается у точки касания */ if (g.down) {
                        ctx.save();
                        ctx.translate(g.px, g.py);
                        ctx.rotate(Math.sin(now * 9) * 0.18);
                        ctx.font = `${Math.round(24 * u)}px system-ui, sans-serif`;
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';
                        ctx.fillText('🐾', 0, 0);
                        ctx.restore();
                    }
                    /* Всплывающие очки */ for (const f of g.floats){
                        const k = f.t < 0.12 ? f.t / 0.12 : Math.max(0, 1 - (f.t - 0.12) / 0.78);
                        ctx.globalAlpha = k;
                        outlineText(f.text, f.x, f.y, (f.crit ? 21 : 17) * u, f.crit ? '#FFC93C' : '#FFFFFF');
                        ctx.globalAlpha = 1;
                    }
                    /* Вспышка взрыва (кольцо в цвете сорта) */ if (g.burstFlash > 0) {
                        ctx.fillStyle = `rgba(255, 244, 214, ${Math.min(0.75, g.burstFlash)})`;
                        ctx.fillRect(0, 0, g.W, g.H);
                        const ringK = 1 - Math.min(1, g.burstFlash / 0.5);
                        ctx.strokeStyle = `rgba(${VR().ring}, ${0.7 * (1 - ringK)})`;
                        ctx.lineWidth = Math.max(3, 8 * u);
                        ctx.beginPath();
                        ctx.arc(g.cx, g.cy, g.R * (0.8 + ringK * 2.4), 0, Math.PI * 2);
                        ctx.stroke();
                    }
                    /* ════ HUD (канвас, без React-перерисовок) ════ */ if (g.stage === 'intro') {
                        /* Заставка: заголовок + ИМЯ СОРТА в его цвете + подсказка */ const k = Math.min(1, g.stageT / 0.35);
                        const V = VR();
                        ctx.globalAlpha = k;
                        outlineText(S('slicer.title'), g.cx, g.cy - g.R * 1.7, 26 * u * (0.7 + 0.3 * k), '#FFC93C');
                        outlineText(S(KIND_KEY[g.kind]), g.cx, g.cy - g.R * 1.7 + 24 * u, 19 * u * (0.7 + 0.3 * k), V.name);
                        const hint = S('slicer.hint');
                        ctx.font = `600 ${Math.round(13 * u)}px system-ui, sans-serif`;
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';
                        ctx.lineJoin = 'round';
                        ctx.strokeStyle = 'rgba(20, 8, 2, 0.8)';
                        ctx.lineWidth = 3;
                        const lines = wrapHint(hint, g.W * 0.82);
                        lines.forEach({
                            "PopcornSlicer.useEffect.step": (ln, i)=>{
                                ctx.strokeText(ln, g.cx, g.cy + g.R * 1.55 + i * 17 * u);
                                ctx.fillStyle = '#FFF4D8';
                                ctx.fillText(ln, g.cx, g.cy + g.R * 1.55 + i * 17 * u);
                            }
                        }["PopcornSlicer.useEffect.step"]);
                        ctx.globalAlpha = 1;
                    } else {
                        /* Заголовок сверху + таймер-полоска */ if (g.stage === 'slice') {
                            outlineText(S('slicer.title'), g.cx, 16 * u, 15 * u, '#FFE9B0');
                            const bw = Math.min(g.W * 0.6, 300 * u);
                            const bh = 8 * u;
                            const bx = g.cx - bw / 2;
                            const by = 30 * u;
                            ctx.fillStyle = 'rgba(24, 10, 4, 0.9)';
                            roundRect(bx - 2 * u, by - 2 * u, bw + 4 * u, bh + 4 * u, 5 * u);
                            ctx.fill();
                            ctx.fillStyle = '#3A2410';
                            roundRect(bx, by, bw, bh, 4 * u);
                            ctx.fill();
                            const frac = Math.max(0, g.timeLeft / SLICE_SECONDS);
                            const grad = ctx.createLinearGradient(bx, 0, bx + bw, 0);
                            grad.addColorStop(0, frac < 0.3 ? '#E5342E' : '#FFC93C');
                            grad.addColorStop(1, frac < 0.3 ? '#FF6B4A' : '#FFDF7E');
                            ctx.fillStyle = grad;
                            roundRect(bx, by, Math.max(0, bw * frac), bh, 4 * u);
                            ctx.fill();
                        }
                        /* Очки: правый верхний угол */ outlineText(`+${g.total}`, g.W - 14 * u, 26 * u, 26 * u, '#FFC93C', 'right');
                        /* Уровень: левый верхний угол */ outlineText(`🍿${level}`, 14 * u, 26 * u, 20 * u, '#FFF4D8', 'left');
                        /* Комбо: пружинная плашка над кукурузиной в цвете сорта */ if (g.stage === 'slice' && g.mult >= 2) {
                            const pop = Math.max(0, 1 - (now - g.comboPopT) / 0.3);
                            const size = (20 + pop * 10) * u;
                            outlineText(S('slicer.combo', {
                                n: g.mult
                            }), g.cx + g.ox, g.cy + g.oy - curR() * 1.28, size, pop > 0.5 ? '#FFF4D8' : VR().name);
                        }
                        /* Полоска HP кукурузины (как у голубя-воришки) */ if (g.stage === 'slice') {
                            const bw = 150 * u;
                            const bh = 8 * u;
                            const bx = g.cx + g.ox - bw / 2;
                            const by = g.cy + g.oy + curR() * 1.22;
                            ctx.fillStyle = 'rgba(24, 10, 4, 0.9)';
                            roundRect(bx - 2 * u, by - 2 * u, bw + 4 * u, bh + 4 * u, 5 * u);
                            ctx.fill();
                            ctx.fillStyle = '#3A2410';
                            roundRect(bx, by, bw, bh, 4 * u);
                            ctx.fill();
                            const frac = Math.max(0, g.hp / VR().hp);
                            ctx.fillStyle = frac > 0.5 ? '#7ED957' : frac > 0.25 ? '#FFC93C' : '#E5342E';
                            roundRect(bx, by, bw * frac, bh, 4 * u);
                            ctx.fill();
                        }
                    }
                }
            }["PopcornSlicer.useEffect.step"];
            raf = requestAnimationFrame(frame);
            /** Перенос строки подсказки по словам (canvas без wordwrap) */ const wrapHint = {
                "PopcornSlicer.useEffect.wrapHint": (text, maxW)=>{
                    ctx.font = `600 ${Math.round(13 * g.u)}px system-ui, sans-serif`;
                    const words = text.split(' ');
                    const lines = [];
                    let cur = '';
                    for (const w of words){
                        const next = cur ? `${cur} ${w}` : w;
                        if (ctx.measureText(next).width > maxW && cur) {
                            lines.push(cur);
                            cur = w;
                        } else {
                            cur = next;
                        }
                    }
                    if (cur) lines.push(cur);
                    return lines.slice(0, 4);
                }
            }["PopcornSlicer.useEffect.wrapHint"];
            /** Скруглённый прямоугольник (path-only, заливка снаружи) */ const roundRect = {
                "PopcornSlicer.useEffect.roundRect": (x, y, w, h, r)=>{
                    ctx.beginPath();
                    ctx.moveTo(x + r, y);
                    ctx.arcTo(x + w, y, x + w, y + h, Math.max(0.1, Math.min(r, w / 2, h / 2)));
                    ctx.arcTo(x + w, y + h, x, y + h, Math.max(0.1, Math.min(r, w / 2, h / 2)));
                    ctx.arcTo(x, y + h, x, y, Math.max(0.1, Math.min(r, w / 2, h / 2)));
                    ctx.arcTo(x, y, x + w, y, Math.max(0.1, Math.min(r, w / 2, h / 2)));
                    ctx.closePath();
                }
            }["PopcornSlicer.useEffect.roundRect"];
            return ({
                "PopcornSlicer.useEffect": ()=>{
                    cancelAnimationFrame(raf);
                    ro.disconnect();
                    canvas.removeEventListener('pointerdown', onDown);
                    canvas.removeEventListener('pointermove', onMove);
                    canvas.removeEventListener('pointerup', onUp);
                    canvas.removeEventListener('pointercancel', onUp);
                }
            })["PopcornSlicer.useEffect"];
        }
    }["PopcornSlicer.useEffect"], []);
    /* ════ Обёртка-оверлей + карточка результата ════ */ return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
        ref: wrapRef,
        className: "absolute inset-0 z-30 overflow-hidden bg-black/75",
        /* v0.0.59: backdrop-blur убран — блюр поверх живого канваса ронял
         FPS на слабых телефонах (прямо противоречил Pill-комментарию) */ initial: {
            opacity: 0
        },
        animate: {
            opacity: 1
        },
        exit: {
            opacity: 0,
            pointerEvents: 'none'
        },
        "aria-label": t('slicer.aria'),
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("canvas", {
                ref: canvasRef,
                className: "absolute inset-0 touch-none",
                onContextMenu: (e)=>e.preventDefault()
            }, void 0, false, {
                fileName: "[project]/src/components/game/popcorn-slicer.tsx",
                lineNumber: 1317,
                columnNumber: 7
            }, this),
            dropClaw && stage === 'results' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "pointer-events-none absolute inset-0 z-30",
                "aria-hidden": true,
                children: [
                    [
                        {
                            x: -46,
                            y: -34,
                            d: 0
                        },
                        {
                            x: 52,
                            y: -18,
                            d: 0.08
                        },
                        {
                            x: -20,
                            y: 46,
                            d: 0.16
                        },
                        {
                            x: 34,
                            y: 40,
                            d: 0.24
                        },
                        {
                            x: 60,
                            y: 8,
                            d: 0.12
                        },
                        {
                            x: -58,
                            y: 6,
                            d: 0.2
                        }
                    ].map((s, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].span, {
                            className: "absolute left-1/2 top-1/2 h-1.5 w-1.5 rounded-full bg-amber-300",
                            initial: {
                                x: s.x,
                                y: s.y,
                                scale: 0,
                                opacity: 0
                            },
                            animate: {
                                scale: [
                                    0,
                                    1.6,
                                    0
                                ],
                                opacity: [
                                    0,
                                    1,
                                    0
                                ]
                            },
                            transition: {
                                duration: 0.55,
                                delay: s.d,
                                ease: 'easeOut'
                            }
                        }, `spark-${i}`, false, {
                            fileName: "[project]/src/components/game/popcorn-slicer.tsx",
                            lineNumber: 1335,
                            columnNumber: 13
                        }, this)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].img, {
                        src: dropClaw,
                        alt: "",
                        draggable: false,
                        className: "absolute left-1/2 top-1/2 h-16 w-16 rounded-xl border-2 border-[#e3cba4] object-cover shadow-lg",
                        initial: {
                            x: '-50%',
                            y: '-50%',
                            scale: 0,
                            rotate: -30,
                            opacity: 0
                        },
                        animate: {
                            x: [
                                '-50%',
                                '-50%',
                                '10%',
                                '16%'
                            ],
                            y: [
                                '-50%',
                                '-50%',
                                '-120%',
                                '-130%'
                            ],
                            scale: [
                                0,
                                1.3,
                                1,
                                1
                            ],
                            rotate: [
                                -30,
                                12,
                                -6,
                                -6
                            ],
                            opacity: [
                                0,
                                1,
                                1,
                                1
                            ]
                        },
                        transition: {
                            duration: 1.05,
                            times: [
                                0,
                                0.3,
                                0.85,
                                1
                            ],
                            ease: 'easeOut'
                        }
                    }, void 0, false, {
                        fileName: "[project]/src/components/game/popcorn-slicer.tsx",
                        lineNumber: 1343,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].span, {
                        className: "absolute left-1/2 top-[16%] -translate-x-1/2 whitespace-nowrap rounded-full bg-[#5C3A1E]/90 px-2.5 py-1 font-pixel text-[9px] font-bold text-[#FFF3DC] sm:text-[10px]",
                        initial: {
                            opacity: 0,
                            y: 8
                        },
                        animate: {
                            opacity: 1,
                            y: 0
                        },
                        transition: {
                            delay: 0.5,
                            duration: 0.3
                        },
                        children: t('claw.slice')
                    }, void 0, false, {
                        fileName: "[project]/src/components/game/popcorn-slicer.tsx",
                        lineNumber: 1358,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/game/popcorn-slicer.tsx",
                lineNumber: 1326,
                columnNumber: 9
            }, this),
            stage === 'slice' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                type: "button",
                onClick: ()=>{
                    skipRef.current = true;
                    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$game$2f$audio$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["audio"].play('click');
                },
                className: "absolute right-2.5 top-2.5 z-20 min-h-11 rounded-xl border-2 border-white/25 bg-black/55 px-3 py-2 font-pixel text-[10px] font-bold text-white/85 transition hover:bg-black/75 active:scale-95",
                children: t('slicer.skip')
            }, void 0, false, {
                fileName: "[project]/src/components/game/popcorn-slicer.tsx",
                lineNumber: 1372,
                columnNumber: 9
            }, this),
            stage === 'results' && result && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                className: "pointer-events-auto absolute inset-0 z-20 flex items-center justify-center p-4",
                initial: {
                    opacity: 0
                },
                animate: {
                    opacity: 1
                },
                transition: {
                    duration: 0.2
                },
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                    className: "w-full max-w-xs rounded-2xl border-4 border-[#8a5330] bg-[#FFF6E6] p-4 text-center shadow-[0_18px_50px_rgba(0,0,0,0.55)]",
                    initial: {
                        scale: 0.85,
                        y: 16
                    },
                    animate: {
                        scale: 1,
                        y: 0
                    },
                    transition: {
                        type: 'spring',
                        stiffness: 300,
                        damping: 20
                    },
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            "aria-hidden": true,
                            className: "text-3xl",
                            children: "🍿"
                        }, void 0, false, {
                            fileName: "[project]/src/components/game/popcorn-slicer.tsx",
                            lineNumber: 1398,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                            className: "mt-1 font-pixel text-base font-bold text-[#B33A26] sm:text-lg",
                            children: t('slicer.resultTitle')
                        }, void 0, false, {
                            fileName: "[project]/src/components/game/popcorn-slicer.tsx",
                            lineNumber: 1401,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "mt-0.5 font-pixel text-xs font-bold tracking-wide",
                            style: {
                                color: KIND_COLOR[result.kind]
                            },
                            children: t(KIND_KEY[result.kind])
                        }, void 0, false, {
                            fileName: "[project]/src/components/game/popcorn-slicer.tsx",
                            lineNumber: 1405,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "mt-1 font-pixel text-2xl font-bold text-[#3f6b28] tabular-nums",
                            children: [
                                "+",
                                result.total
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/game/popcorn-slicer.tsx",
                            lineNumber: 1411,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            "aria-hidden": true,
                            className: "mt-0.5 text-xl leading-none tracking-[0.2em]",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "text-amber-500",
                                    children: '★'.repeat(result.stars)
                                }, void 0, false, {
                                    fileName: "[project]/src/components/game/popcorn-slicer.tsx",
                                    lineNumber: 1416,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "text-[#d9c6a8]",
                                    children: '★'.repeat(3 - result.stars)
                                }, void 0, false, {
                                    fileName: "[project]/src/components/game/popcorn-slicer.tsx",
                                    lineNumber: 1417,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/game/popcorn-slicer.tsx",
                            lineNumber: 1415,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "mt-1 font-ui text-[11px] font-medium text-[#8a5330]",
                            children: [
                                t('slicer.swipes', {
                                    n: result.swipes
                                }),
                                " ·",
                                ' ',
                                t('slicer.maxcombo', {
                                    n: result.maxMult
                                })
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/game/popcorn-slicer.tsx",
                            lineNumber: 1419,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "mt-1 font-pixel text-sm font-bold text-[#8a5a16]",
                            children: t('slicer.reward', {
                                n: result.coins
                            })
                        }, void 0, false, {
                            fileName: "[project]/src/components/game/popcorn-slicer.tsx",
                            lineNumber: 1423,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            type: "button",
                            "aria-label": t('slicer.take'),
                            onClick: ()=>{
                                __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$game$2f$audio$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["audio"].play('chest');
                                /* v0.0.59: награда уже засчитана onBank'ом — кнопка только закрывает */ if (paidRef.current) onDoneRef.current(result.total);
                                else onDoneRef.current(result.total, {
                                    coins: result.coins
                                }, {
                                    kind: result.kind
                                });
                            },
                            className: "mt-3 min-h-11 w-full rounded-xl border-2 border-[#8a5330] bg-[#f3e2c8] px-4 py-2.5 font-pixel text-sm font-bold text-[#8a5330] transition hover:bg-[#eed7b4] active:scale-[0.98]",
                            children: t('slicer.take')
                        }, void 0, false, {
                            fileName: "[project]/src/components/game/popcorn-slicer.tsx",
                            lineNumber: 1426,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/game/popcorn-slicer.tsx",
                    lineNumber: 1392,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/game/popcorn-slicer.tsx",
                lineNumber: 1386,
                columnNumber: 9
            }, this)
        ]
    }, "slicer", true, {
        fileName: "[project]/src/components/game/popcorn-slicer.tsx",
        lineNumber: 1306,
        columnNumber: 5
    }, this);
}
_s(PopcornSlicer, "QeKSQrs4fhCUEWjW3Sgzu2V4LK8=");
_c = PopcornSlicer;
var _c;
__turbopack_context__.k.register(_c, "PopcornSlicer");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/game/poster-interstitial.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "POSTER_COUNT",
    ()=>POSTER_COUNT,
    "POSTER_EVERY",
    ()=>POSTER_EVERY,
    "PosterInterstitial",
    ()=>PosterInterstitial,
    "VICTORY_POSTER_SRC",
    ()=>VICTORY_POSTER_SRC,
    "preloadPosters",
    ()=>preloadPosters
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
/**
 * «ПЛАКАТНАЯ ПЕРЕБИВКА» — трудовая мотивационная вставка каждые 5 уровней.
 *
 * После победного баннера на весь экран разворачивается плакат с куницей
 * Наной в духе советской трудовой пропаганды и ретро-пин-апа: знамёна,
 * лучи, «план выполнен», «бей свой рекорд». Плакаты ротируются строго
 * по порядку — каждый следующий рубеж сложности получает следующий плакат
 * (5-й уровень → №1, 10-й → №2 … 30-й → №6, 35-й → снова №1).
 *
 * ВАЖНО: арт нарисован БЕЗ текста — AI-генератор искажает кириллицу.
 * Слоган, подзаголовок и статистика накладываются настоящим HTML:
 * чётко на любом экране и на любом из 4 языков игры.
 *
 * Пиксельный плакат №7 (в стиле самой игры) — в запасе на будущее.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/render/components/motion/proxy.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$game$2f$audio$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/game/audio.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
/** Игровые плакаты: порядок = порядок усложнения. №7 — про запас. */ const POSTERS = [
    {
        src: '/posters/game/poster-1.webp',
        key: '1'
    },
    {
        src: '/posters/game/poster-2.webp',
        key: '2'
    },
    {
        src: '/posters/game/poster-3.webp',
        key: '3'
    },
    {
        src: '/posters/game/poster-4.webp',
        key: '4'
    },
    {
        src: '/posters/game/poster-5.webp',
        key: '5'
    },
    {
        src: '/posters/game/poster-6.webp',
        key: '6'
    }
];
const POSTER_EVERY = 5;
const POSTER_COUNT = POSTERS.length;
const VICTORY_POSTER_SRC = '/posters/game/poster-7.webp';
/* ── Предзагрузка постеров ──
   Плакаты весят ~150 КБ каждый и НЕ лежат в pre-cache SW: если начать
   грузить их только в момент показа перебивки, на мобильной сети оверлей
   открывается с пустой рамкой — игрок видит «постер не прогрузился».
   preloadPosters() стартует загрузку заранее (вызывается при старте
   забега и при показе плаката), к пятому уровню всё уже в кэше. */ let postersPreloaded = false;
function preloadPosters() {
    if (postersPreloaded || ("TURBOPACK compile-time value", "object") === 'undefined') return;
    postersPreloaded = true;
    for (const p of POSTERS){
        const img = new Image();
        img.src = p.src;
    }
    /* Победный плакат №7 — заранее, чтобы экран ПОБЕДЫ не открылся с пустой рамкой */ const victory = new Image();
    victory.src = VICTORY_POSTER_SRC;
}
function PosterInterstitial({ t, level, score, best, posterIdx, onContinue }) {
    _s();
    const idx = (posterIdx % POSTER_COUNT + POSTER_COUNT) % POSTER_COUNT;
    const poster = POSTERS[idx];
    const btnRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    /* Победная фанфара: плакат — награда за рубеж сложности.
     Заодно догружаем остальные постеры: следующий рубеж покажет мгновенно */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "PosterInterstitial.useEffect": ()=>{
            preloadPosters();
            const tm = window.setTimeout({
                "PosterInterstitial.useEffect.tm": ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$game$2f$audio$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["audio"].play('record')
            }["PosterInterstitial.useEffect.tm"], 320);
            return ({
                "PosterInterstitial.useEffect": ()=>window.clearTimeout(tm)
            })["PosterInterstitial.useEffect"];
        }
    }["PosterInterstitial.useEffect"], []);
    /* v0.0.59: автофокус на кнопке и Esc = «Продолжить» — доступность модалки */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "PosterInterstitial.useEffect": ()=>{
            btnRef.current?.focus();
            const onKey = {
                "PosterInterstitial.useEffect.onKey": (e)=>{
                    if (e.key === 'Escape') {
                        e.preventDefault();
                        onContinue();
                    }
                }
            }["PosterInterstitial.useEffect.onKey"];
            window.addEventListener('keydown', onKey);
            return ({
                "PosterInterstitial.useEffect": ()=>window.removeEventListener('keydown', onKey)
            })["PosterInterstitial.useEffect"];
        }
    }["PosterInterstitial.useEffect"], [
        onContinue
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
        className: "absolute inset-0 z-50 flex flex-col items-center overflow-y-auto bg-[#1d0f06]/95 p-3 backdrop-blur-sm [@media(max-height:520px)]:p-2 sm:p-5",
        initial: {
            opacity: 0
        },
        animate: {
            opacity: 1
        },
        exit: {
            opacity: 0,
            pointerEvents: 'none'
        },
        role: "dialog",
        "aria-modal": "true",
        "aria-label": t('poster.banner', {
            n: level
        }),
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                "aria-hidden": true,
                className: "pointer-events-none absolute inset-0 opacity-[0.09]",
                style: {
                    background: 'repeating-conic-gradient(from 0deg at 50% 42%, #e8b64c 0deg 6deg, transparent 6deg 18deg)'
                }
            }, void 0, false, {
                fileName: "[project]/src/components/game/poster-interstitial.tsx",
                lineNumber: 118,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                className: "z-10 mt-1 flex shrink-0 items-center gap-2 rounded-full border-2 border-[#e3cba4]/40 bg-[#B33A26] px-4 py-1.5 shadow-[0_6px_20px_rgba(0,0,0,0.45)] [@media(max-height:520px)]:py-1",
                initial: {
                    y: -18,
                    opacity: 0
                },
                animate: {
                    y: 0,
                    opacity: 1
                },
                transition: {
                    delay: 0.08,
                    type: 'spring',
                    stiffness: 300,
                    damping: 22
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        "aria-hidden": true,
                        className: "text-sm leading-none",
                        children: "★"
                    }, void 0, false, {
                        fileName: "[project]/src/components/game/poster-interstitial.tsx",
                        lineNumber: 134,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "font-pixel text-sm font-bold tracking-wide text-[#FFF3DC] [@media(max-height:520px)]:text-xs sm:text-base",
                        children: t('poster.banner', {
                            n: level
                        })
                    }, void 0, false, {
                        fileName: "[project]/src/components/game/poster-interstitial.tsx",
                        lineNumber: 137,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        "aria-hidden": true,
                        className: "text-sm leading-none",
                        children: "★"
                    }, void 0, false, {
                        fileName: "[project]/src/components/game/poster-interstitial.tsx",
                        lineNumber: 140,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/game/poster-interstitial.tsx",
                lineNumber: 128,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "z-10 flex min-h-0 w-full flex-1 items-center justify-center py-2 [@media(max-height:520px)]:py-1",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].img, {
                    src: poster.src,
                    alt: t('poster.alt'),
                    draggable: false,
                    loading: "eager",
                    className: "max-h-full max-w-full rounded-sm border-[6px] border-[#f6e7c9] bg-[#f6e7c9] object-contain shadow-[0_18px_50px_rgba(0,0,0,0.6)] [@media(max-height:520px)]:border-4 sm:border-[8px]",
                    initial: {
                        scale: 0.82,
                        rotate: -5,
                        opacity: 0
                    },
                    animate: {
                        scale: 1,
                        rotate: -1.5,
                        opacity: 1
                    },
                    transition: {
                        delay: 0.14,
                        type: 'spring',
                        stiffness: 210,
                        damping: 20
                    }
                }, void 0, false, {
                    fileName: "[project]/src/components/game/poster-interstitial.tsx",
                    lineNumber: 147,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/game/poster-interstitial.tsx",
                lineNumber: 146,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                className: "z-10 flex w-full max-w-md shrink-0 flex-col items-center gap-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] [@media(max-height:520px)]:gap-1",
                initial: {
                    y: 22,
                    opacity: 0
                },
                animate: {
                    y: 0,
                    opacity: 1
                },
                transition: {
                    delay: 0.22,
                    type: 'spring',
                    stiffness: 260,
                    damping: 22
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        className: "text-shadow-pixel rounded-lg bg-[#f6e7c9] px-4 py-1 text-center font-pixel text-xl font-bold uppercase leading-tight text-[#B33A26] [@media(max-height:520px)]:px-3 [@media(max-height:520px)]:text-sm sm:text-2xl",
                        children: t(`poster.${poster.key}.title`)
                    }, void 0, false, {
                        fileName: "[project]/src/components/game/poster-interstitial.tsx",
                        lineNumber: 167,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "hidden text-center font-ui text-xs font-medium text-[#d9b98c] [@media(max-height:560px)]:hidden sm:block",
                        children: t(`poster.${poster.key}.sub`)
                    }, void 0, false, {
                        fileName: "[project]/src/components/game/poster-interstitial.tsx",
                        lineNumber: 170,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-2",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "rounded-full border border-amber-300/40 bg-black/40 px-3 py-1 font-ui text-[11px] font-semibold text-amber-100 [@media(max-height:520px)]:text-[10px]",
                                children: t('poster.score', {
                                    n: score
                                })
                            }, void 0, false, {
                                fileName: "[project]/src/components/game/poster-interstitial.tsx",
                                lineNumber: 176,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "rounded-full border border-amber-300/40 bg-black/40 px-3 py-1 font-ui text-[11px] font-semibold text-amber-100 [@media(max-height:520px)]:text-[10px]",
                                children: t('poster.best', {
                                    n: best
                                })
                            }, void 0, false, {
                                fileName: "[project]/src/components/game/poster-interstitial.tsx",
                                lineNumber: 179,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/game/poster-interstitial.tsx",
                        lineNumber: 175,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "button",
                        ref: btnRef,
                        onClick: ()=>{
                            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$game$2f$audio$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["audio"].play('click');
                            onContinue();
                        },
                        className: "mt-0.5 w-full rounded-xl bg-[#E24B3B] px-6 py-3 font-pixel text-base text-white shadow-[0_5px_0_#9c2f22] transition-all hover:bg-[#ef5a4a] active:translate-y-[3px] active:shadow-[0_2px_0_#9c2f22] [@media(max-height:520px)]:py-2 sm:text-lg",
                        children: t('poster.btn')
                    }, void 0, false, {
                        fileName: "[project]/src/components/game/poster-interstitial.tsx",
                        lineNumber: 184,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/game/poster-interstitial.tsx",
                lineNumber: 160,
                columnNumber: 7
            }, this)
        ]
    }, "poster", true, {
        fileName: "[project]/src/components/game/poster-interstitial.tsx",
        lineNumber: 107,
        columnNumber: 5
    }, this);
}
_s(PosterInterstitial, "C0Emr1wh30nMwoszhyKbFmWlyVk=");
_c = PosterInterstitial;
var _c;
__turbopack_context__.k.register(_c, "PosterInterstitial");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=src_components_game_1u11d2hzjwlus._.js.map