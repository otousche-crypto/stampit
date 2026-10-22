# PRD — Stampit (V0)

> **Stamp everything you ship.**
> Petit site qui permet à chacun de créer sa « pastille de signature » (badge *Made by / Launched by*) pour le pied de page de ses projets, puis de la récupérer en un clic.

Document destiné à un agent de développement. Les libellés d'interface sont en **anglais** ; ils sont donnés tels quels entre guillemets.

---

## 0. Résumé

| | |
|---|---|
| **Produit** | Générateur de pastille de signature, personnalisable en direct |
| **Cible** | Makers / indie hackers / vibe coders qui shippent beaucoup de side projects |
| **Promesse** | Une pastille élégante, accessible, sans dépendance, à coller partout |
| **V0** | 2 pages (`/` accueil, `/create` éditeur), 1 seule pastille, pas de compte, pas de backend |
| **Export** | 2 boutons : **Copy prompt** (pour agent IA) et **Copy code** (HTML/CSS autonome) |
| **Stack** | Vite · React · TypeScript · Tailwind · Motion (Framer Motion) · shadcn/ui + design system **Fluid Functionalism** · déploiement statique Vercel |

---

## 1. Contexte et cible

- Les makers signent leurs projets à la main (badge bricolé) ou affichent le badge de l'outil qui a construit le site. Stampit leur donne une signature soignée en 2 minutes.
- La pastille sert à : revendiquer la paternité d'un projet, renvoyer vers ses canaux (site, X, GitHub…), faire circuler son nom de projet en projet.
- **Signature d'abord** : le mode par défaut est un simple lien. Le menu de « bulles » (liens sociaux) est une option, pas un link-in-bio.

---

## 2. Périmètre

### Dans la V0
1. Page d'accueil avec la pastille réelle d'Olivier Tousche (mode bulles, interactive).
2. Éditeur `/create` sur 3 colonnes : réglages · aperçu · export.
3. Personnalisation : texte (normal + gras), avatar, couleurs (4 presets + manuel), rayon, bordure, taille, icône.
4. Contrôle de contraste WCAG en direct (non bloquant).
5. Interrupteur « Adapt to site theme » (palette claire + sombre via `prefers-color-scheme`).
6. Mode **Link** (redirection) ou **Bubbles** (menu animé de 2 à 8 canaux).
7. Export : **Copy prompt** et **Copy code**.
8. Persistance : config dans le hash de l'URL + localStorage. L'URL de l'éditeur est le lien de partage.
9. Accessibilité complète du site et de la pastille générée.
10. Éditeur utilisable sur mobile.

### Hors V0 (ne pas implémenter)
- Compte, historique, plusieurs pastilles, édition à distance, script hébergé.
- Analytics de clics.
- Export React, Tailwind, web component, image SVG/PNG, URL d'image pour README.
- Interface en français.
- Polices web (seulement des piles système).
- Modèles par service (Product Hunt, GitHub…).

Le modèle de données doit néanmoins préparer la V2 (`id`, `schemaVersion`).

---

## 3. Stack et design system

### Stack
- **Vite + React 19 + TypeScript strict**
- **Tailwind CSS v4**
- **shadcn/ui**, primitive **Radix**
- **Fluid Functionalism** (https://www.fluidfunctionalism.com) pour tous les composants d'interface du site
- **Motion** (`motion/react`) pour les animations du site (requis par Fluid)
- **React Router** : 2 routes
- **Zod** : validation de la config
- **react-easy-crop** : recadrage de l'avatar
- **Shiki** (bundle léger, chargé à la demande) : coloration du code dans « Show code »
- **Vitest** : tests des générateurs d'export
- **Vercel** : déploiement statique, rewrite SPA vers `index.html`

### Fluid Functionalism
- Installation : `npx shadcn@latest registry add @fluid`, puis `npx shadcn@latest add @fluid/<component>`.
- Utiliser la **Skill** fournie par le design system : https://www.fluidfunctionalism.com/docs/skill
- **Inter variable** obligatoire (animations de graisse).
- Icônes de l'interface : **Lucide** (défaut du système).
- Envelopper l'app dans `<MotionConfig reducedMotion="user">`.
- Utiliser exclusivement les ressorts de `lib/springs` (`fast`, `moderate`, `slow` et leurs `.exit`). Aucune durée codée en dur dans les composants.

Composants à utiliser :

| Besoin | Composant Fluid |
|---|---|
| Sections de l'éditeur | Accordion |
| Champs texte, URL | InputGroup |
| Couleurs | ColorPicker |
| Rayon | Slider |
| Interrupteurs | Switch |
| Preset, ordre, taille, mode, graisse, bordure | RadioGroup |
| Ajout d'un canal | Combobox |
| Palettes Light / Dark | TabsSubtle |
| Recadrage avatar | Dialog |
| Boutons | Button (primary / secondary / ghost) |
| Alertes | Banner |
| Infobulles | Tooltip |

### Règle fondamentale
**Le site utilise Fluid Functionalism. La pastille exportée n'en dépend pas.** Elle reproduit la philosophie (le mouvement porte une information) et les valeurs de ressort, traduites en CSS pur (`linear()`), sans JS d'animation et sans aucune bibliothèque.

---

## 4. Architecture

```
src/
  app/
    routes/Home.tsx
    routes/Create.tsx
  components/            # composants Fluid installés + composants maison
  editor/                # panneaux, sections, contrôles
  badge/
    schema.ts            # types + schéma Zod + valeurs par défaut + migrate()
    presets.ts           # 4 presets, dérivation Brand
    contrast.ts          # ratio WCAG
    channels.ts          # catalogue des canaux + icônes SVG
    springs-css.ts       # 3 courbes linear() précalculées
    render/
      BadgePreview.tsx   # rendu de l'aperçu (injecte le HTML généré)
    export/
      generateHtml.ts    # config → snippet HTML/CSS/JS autonome
      generatePrompt.ts  # config → prompt texte
  storage/
    url.ts               # encode / decode du hash
    local.ts             # localStorage avec try/catch
scripts/
  build-demo.ts          # génère le snippet de la pastille démo pour l'accueil
```

**Point clé : l'aperçu de l'éditeur et la démo de l'accueil affichent la sortie réelle de `generateHtml()`**, et non un composant React parallèle. Ce qu'on voit est exactement ce qu'on copie. Dans l'éditeur, la navigation des liens est interceptée (voir §7.4).

Les générateurs `generateHtml` et `generatePrompt` sont des **fonctions pures**, testées par snapshot.

---

## 5. Page d'accueil `/`

### Contenu
- **En-tête** : « Stampit » à gauche, lien « GitHub » à droite.
- **Titre** : `Make your own badge`
- **Accroche** : `Stamp everything you ship.`
- **Sous-titre** : `A tiny, customizable badge for your footer. Style it, add your links, paste one snippet. No account, no dependency.`
- **CTA principal** : `Create`, qui mène à `/create`. Si une config existe en localStorage, le libellé devient `Continue editing`.
- **Lien secondaire** : `View on GitHub`
- **Démo** : sous le CTA, la pastille d'Olivier Tousche (reproduction de celle de Décadi, config §9.3), affichée à l'échelle 1,5× et interactive. Légende : `↑ Hover it. Then make yours.` (`↑ Click it. Then make yours.` si elle passe en mode Bubbles).
  - C'est la sortie de `generateHtml()` sur la config démo (§9.3), générée au build par `scripts/build-demo.ts` et injectée telle quelle.
- **3 arguments**, alignés en ligne (en pile sur mobile) :
  1. **Yours, pixel by pixel.** Text, colors, avatar, radius. Light and dark, with a contrast check built in.
  2. **One click, all your links.** Turn the badge into a small menu of your socials: X, GitHub, LinkedIn, Dribbble…
  3. **Paste and forget.** Copy a prompt for your AI coding agent, or plain HTML/CSS. Lightweight, zero dependencies.

### Contraintes
- Un seul écran sur desktop, sans scroll.
- Balises meta et Open Graph complètes (titre, description, image OG 1200×630 montrant une pastille).
- Thème du site : suit le système (clair / sombre), via les tokens Fluid.

---

## 6. Éditeur `/create`

### 6.1 Disposition
- **Desktop (≥ 1024 px)** : 3 colonnes.
  - Gauche, ~360 px : réglages, défilement indépendant.
  - Centre, flexible : aperçu.
  - Droite, ~280 px : export.
- **Tablette** : réglages à gauche, aperçu à droite, export sous l'aperçu.
- **Mobile** : aperçu fixé en haut (≈ 35 % de la hauteur), réglages qui défilent en dessous, bouton flottant `Get code` qui ouvre un tiroir avec l'export.
- **En-tête** : logo « Stampit » (lien vers `/`), bouton `Reset` (ghost, avec confirmation).

### 6.2 Comportement général
- Chaque modification met l'aperçu à jour immédiatement.
- Sauvegarde automatique, avec un délai de 300 ms : localStorage + hash de l'URL (`history.replaceState`).
- Au chargement : config du hash, sinon celle du localStorage, sinon la config par défaut.
- Si la config de l'URL est invalide : config par défaut + Banner `This link couldn't be read. We loaded a fresh badge.`
- Au premier chargement, le focus est placé dans le champ « Bold text ».
- Sections en Accordion, toutes ouvertes sur desktop ; seule « Text » est ouverte sur mobile.

### 6.3 Réglages

#### Preset (en tête, hors accordéon)
| Contrôle | Valeurs | Défaut |
|---|---|---|
| Preset | Light · Dark · Glass · Brand | **Light** |

- Choisir un preset écrase les couleurs de la palette active.
- Toute modification manuelle d'une couleur fait passer le preset à `custom`. Le RadioGroup n'affiche alors aucune option sélectionnée.
- **Brand** fait apparaître un ColorPicker unique `Brand color` (défaut `#4F46E5`). Fond = couleur de marque ; texte, icône et texte normal en blanc ou en noir selon le meilleur contraste ; texte normal et icône à 70 % d'opacité ; bordure transparente.
- **Glass** : si le fond de l'aperçu est clair, afficher la note `Glass works best on dark backgrounds.`

| Preset | background | border | textNormal | textBold | icon | blur | shadow |
|---|---|---|---|---|---|---|---|
| Light | `#FFFFFF` | `#0000000D` | `#6E6E73` | `#000000` | `#6E6E73` | 0 | soft |
| Dark | `#14141C` | `#2E2E3A` | `#8A8A99` | `#FFFFFF` | `#8A8A99` | 0 | none |
| Glass | `#FFFFFF14` | `#FFFFFF29` | `#FFFFFF99` | `#FFFFFF` | `#FFFFFF99` | 12 | none |
| Brand | brand | `#00000000` | auto 70 % | auto | auto 70 % | 0 | soft |

**Référence visuelle : la pastille du panneau « À propos » de Décadi** (https://decadi.vercel.app, bouton ⓘ). Le preset Light, la taille M, l'ombre douce et la micro-interaction de la flèche doivent la reproduire au pixel près :
- capsule blanche, hauteur 36 px, padding `4px 12px 4px 4px`, espacement 8 px, texte 15 px ;
- avatar rond 28 px sur fond `#FF6B35` ;
- « Par » en `#6E6E73` graisse 400, « Olivier Tousche » en `#000000` graisse 500 ;
- contour 1 px `rgba(0,0,0,.05)` (anneau intérieur, pas de bordure qui décale la mise en page) ;
- ombre `0 1px 6px rgba(0,0,0,.08)`, qui passe à `0 2px 12px rgba(0,0,0,.12)` au survol ;
- flèche ↗ 14 px, trait de 2 px, couleur `#6E6E73`, qui glisse de 2 px en diagonale au survol ;
- police système (`-apple-system, system-ui, "SF Pro Text", "Helvetica Neue", sans-serif`).

#### Text
| Contrôle | Valeurs | Défaut |
|---|---|---|
| `Normal text` | Texte, 24 caractères max., vide autorisé. Suggestions cliquables : `Made by` · `Launched by` · `Built by` · `Designed by` · `Crafted by` | `Made by` |
| `Bold text` | Texte, 32 caractères max. | `Your Name` |
| `Order` | `Normal → Bold` · `Bold → Normal` | `Normal → Bold` |
| `Bold weight` | Regular 400 · Medium 500 · Semibold 600 | **500** |
| `Size` | S · M · L | **M** |
| `Font` | Sans · Serif · Mono | Sans |

- Au moins un des deux textes doit être rempli. Sinon : erreur sous `Bold text` (`Add at least one line of text.`) et export désactivé.
- Piles de polices :
  - Sans : `-apple-system, system-ui, "SF Pro Text", "Helvetica Neue", "Segoe UI", Roboto, sans-serif`
  - Serif : `ui-serif, Georgia, "Times New Roman", serif`
  - Mono : `ui-monospace, "SF Mono", Menlo, Consolas, monospace`

#### Avatar
| Contrôle | Valeurs | Défaut |
|---|---|---|
| `Source` | None · Initials · Upload · URL | **Initials** |
| `Initials` | 1 à 2 caractères ; vide = déduit du texte gras (initiales des 2 premiers mots) | auto |
| `Upload` | PNG, JPG, WebP, 10 Mo max. Recadrage rond dans un Dialog (déplacement + zoom 1× à 3×). Sortie : WebP 96 × 96, qualité 0,75 | — |
| `Image URL` | URL. Raccourci `Use GitHub username` qui génère `https://github.com/{user}.png` | — |
| `Background` | ColorPicker, visible pour Initials et derrière les images transparentes | `#FF6B35` |

- Initiales : couleur = `textBold` si le contraste avec le fond de l'avatar est suffisant, sinon blanc ou noir.
- Si l'image d'URL ne charge pas : repli sur les initiales + avertissement `We couldn't load this image.`
- Fichier refusé (format ou taille) : message d'erreur explicite, rien n'est modifié.

#### Colors
| Contrôle | Valeurs | Défaut |
|---|---|---|
| `Background` · `Border` · `Normal text` · `Bold text` · `Icon` | ColorPicker en HEX avec alpha | selon le preset |
| `Adapt to site theme` | Switch | **Off** |

- Si `Adapt to site theme` est actif : TabsSubtle `Light` / `Dark` au-dessus des 5 couleurs. Chaque onglet édite sa palette. L'onglet affiché suit le fond de l'aperçu, et inversement.
- À la première activation : la palette active garde ses couleurs, l'autre reçoit le preset opposé (Light ↔ Dark ; Glass et Brand → Light).
- **Contraste**, recalculé en direct, sans blocage :
  - `textNormal` et `textBold` contre `background` : seuil **4,5:1**.
  - `icon` et `border` contre `background` : seuil **3:1**.
  - Couleurs avec alpha : composer sur le fond de l'aperçu avant calcul.
  - Couleur fautive : point rouge à côté du ColorPicker + Tooltip avec le ratio (`2.8:1 · needs 4.5:1`).
  - Banner récapitulatif en bas de section si au moins un problème.

#### Shape
| Contrôle | Valeurs | Défaut |
|---|---|---|
| `Radius` | Slider 0 à 100 % (100 % = moitié de la hauteur = capsule). Affiche la valeur en px | **100 %** |
| `Border` | 0 · 1 · 2 px | **1 px** |
| `Shadow` | None · Soft | selon le preset (Light : **Soft**) |
| `Show icon` | Switch | **On** |

- La bordure est rendue en **anneau intérieur** (`box-shadow: inset 0 0 0 Npx`), pour ne jamais modifier les dimensions.
- `Soft` = `0 1px 6px rgba(0,0,0,.08)`, et `0 2px 12px rgba(0,0,0,.12)` au survol (transition ressort `fast`).

#### On click
| Contrôle | Valeurs | Défaut |
|---|---|---|
| `Mode` | Link · Bubbles | **Link** |
| *(Link)* `URL` | URL ; préfixe `https://` ajouté si absent ; validation au blur | vide, placeholder `yoursite.com` |
| *(Link)* `Open in new tab` | Switch | **On** |
| *(Bubbles)* `Channels` | Liste réordonnable. Chaque ligne : poignée, icône, champ URL, bouton supprimer | vide, 2 suggestions affichées : Website, X |
| *(Bubbles)* `Add channel` | Combobox : X · LinkedIn · Website · Instagram · GitHub · Dribbble · Behance · Email · Threads · Bluesky · YouTube · Custom | — |
| *(Bubbles)* `Labels` | Icon only · Icon + label | **Icon only** |

- 2 à 8 canaux. Avec 1 seul : message `Only one link? Switch to Link mode.` (avec bouton qui bascule). Au-delà de 8 : `Add channel` désactivé.
- Chaque type de canal n'apparaît qu'une fois, sauf Custom.
- **Custom** : champ `Label` en plus (20 caractères max.), icône de lien générique.
- **Email** : accepte une adresse seule, convertie en `mailto:`.
- Domaine incohérent (ex. URL Instagram dans X) : avertissement non bloquant `This doesn't look like a X link.`
- Réordonnancement : glisser-déposer (`Reorder` de Motion) **et** clavier (`Alt + ↑ / ↓` sur la poignée).
- URL manquante ou invalide en mode actif : export désactivé, message sous le champ.

### 6.4 Aperçu (colonne centrale)
| Contrôle | Valeurs | Défaut |
|---|---|---|
| `Background` | Light · Dark | Light (gris très clair `#F2F2F7`, comme le panneau de Décadi) |
| `Zoom` | 1× · 2× | 2× |

- Non sauvegardé dans la config.
- La pastille est pleinement interactive (survol, clic, bulles, clavier).
- **Aucun lien ne quitte l'éditeur** : clic intercepté, Tooltip affichant l'URL cible.

### 6.5 Export (colonne de droite)
- `Copy prompt` : bouton **primaire**.
- `Copy code` : bouton **secondaire**.
- Ligne de poids : `~7 KB · zero dependency` (poids réel du snippet, arrondi au Ko).
- `Show code` : lien qui déplie le snippet avec coloration syntaxique (lecture seule). Replié par défaut.
- `Download avatar` : visible uniquement si `avatar.source = "upload"`. Télécharge `stampit-avatar.webp`.
- Après copie : toast `Copied`.
- Si une photo téléversée existe : note `Your uploaded photo isn't included in the page link. Shared links will show your initials.`
- Exports désactivés (avec explication) tant qu'une erreur bloquante subsiste.

---

## 7. La pastille générée

### 7.1 Anatomie
```
[ (avatar) · texte normal · texte gras · icône ]
```
| Taille | Hauteur | Texte | Avatar | Padding gauche | Padding droit | Espacement | Icône |
|---|---|---|---|---|---|---|---|
| S | 30 px | 13 px | 22 px | 4 px | 10 px | 6 px | 12 px |
| **M (référence Décadi)** | **36 px** | **15 px** | **28 px** | **4 px** | **12 px** | **8 px** | **14 px** |
| L | 44 px | 17 px | 36 px | 4 px | 14 px | 10 px | 16 px |

- Sans avatar : padding gauche = padding droit.
- Icône : flèche « arrow-up-right » (tracé Lucide/Feather : `line 7,17 → 17,7` + `polyline 7,7 17,7 17,17`), trait 2 px, `stroke="currentColor"`, `aria-hidden`.
- Espace entre texte normal et texte gras : une espace normale.
- Rayon en px = `radius × hauteur / 2`.
- Glass : `backdrop-filter: blur(12px)` (+ préfixe `-webkit-`).

### 7.2 Icône et micro-interactions
- **Mode Link** : flèche ↗. Au survol et au focus, elle glisse de 2 px vers le haut et la droite, ressort `fast`.
- **Mode Bubbles** : « + ». Il pivote de 45° et devient « × » à l'ouverture, ressort `moderate`.
- `prefers-reduced-motion: reduce` : pas de déplacement ni de rotation animée, changements instantanés ou en fondu.

### 7.3 Ressorts en CSS
Précalculer une fois les trois courbes Fluid et les coder en dur dans `springs-css.ts` sous forme de `linear()` (~20 points chacune) :

| Token | Durée | Rebond | Usage |
|---|---|---|---|
| `fast` | 0,08 s | 0 | survol, tooltips |
| `moderate` | 0,16 s | 0 | icône « + », fermeture |
| `slow` | 0,24 s | 0,12 | ouverture des bulles |
| `slow.exit` | 0,16 s | — | fermeture des bulles |

N'inclure dans l'export que les courbes réellement utilisées, déclarées une seule fois en custom properties.

### 7.4 Rendu dans l'éditeur
L'aperçu injecte le snippet généré (HTML + CSS + JS) dans le DOM, isolé dans un conteneur dédié. Un écouteur en phase de capture intercepte les clics sur `a[href]` à l'intérieur et affiche le Tooltip de l'URL.

---

## 8. Les bulles

### 8.1 Choix techniques
- **Pattern ARIA « disclosure »**, pas `role="menu"`. La pastille est un `<button>`, les bulles une `<ul>` de `<a>`.
- **API `popover`** native : `<ul popover="auto">` + `popovertarget` sur le bouton. Fournit fermeture par clic extérieur et Échap, `aria-expanded`, et affichage dans le *top layer* (jamais rogné par `overflow: hidden` ni masqué par un `z-index`).
- **JS (~1 Ko)** uniquement pour : le positionnement, la navigation aux flèches, le focus.
- Navigateur sans `popover` : détection, puis repli JS minimal (classe ouverte, clic extérieur, Échap).

### 8.2 Anatomie
| Élément | Spec |
|---|---|
| Bulle | Cercle de 36 / 40 / 44 px (S / M / L). Fond, bordure et rayon de bordure hérités de la pastille ; icône dans la couleur `icon` |
| Zone tactile | 44 × 44 px minimum |
| Icône | SVG inline 18 px, `fill="currentColor"` |
| Mode `Icon + label` | La bulle devient une capsule : icône + libellé (couleur `textBold`) |
| Espacement | 8 px entre bulles, 12 px entre bulles et pastille |

### 8.3 Disposition
- Une rangée centrée sur la pastille, **au-dessus**, en arc doux : décalage vertical parabolique, centre 8 px plus haut que les extrémités.
- **Bascule** : si l'espace au-dessus est inférieur à la hauteur du menu + 16 px, ouverture **en dessous**, arc inversé.
- **Bords** : la rangée est décalée pour rester à 8 px minimum des bords du viewport.
- **Débordement** : si la rangée dépasse `largeur du viewport − 16 px`, passage sur 2 rangées, la plus longue au plus près de la pastille.
- Repositionnement au scroll et au redimensionnement (`requestAnimationFrame`). Si la pastille sort du viewport : fermeture.
- Sans JS : le popover s'ouvre centré à l'écran (comportement par défaut) et reste utilisable.

### 8.4 Animations
| Moment | Animation | Ressort |
|---|---|---|
| Ouverture | Chaque bulle part du centre de la pastille vers sa position ; échelle 0,6 → 1 ; opacité 0 → 1 | `slow` |
| Décalage | 30 ms entre bulles, du centre vers l'extérieur | — |
| Fermeture | Toutes ensemble, retour vers la pastille + fondu | `slow.exit` |
| Survol d'une bulle | Échelle 1,08 | `fast` |
| Tooltip (Icon only) | Apparition après 300 ms au survol, immédiate au focus | `fast` |
| Mouvement réduit | Fondus uniquement, sans décalage | — |

### 8.5 Interactions
**Souris**
- Le survol de la pastille n'ouvre pas le menu (léger mouvement du « + » seulement).
- Clic sur la pastille : ouvre / ferme.
- Clic sur une bulle : navigue (nouvel onglet si réglé) et ferme.
- Clic extérieur : ferme.

**Clavier**
| Touche | Action |
|---|---|
| Tab | Atteint la pastille |
| Entrée / Espace | Ouvre ; focus sur la première bulle |
| ← → ↑ ↓ | Bulle précédente / suivante, en boucle |
| Origine / Fin | Première / dernière bulle |
| Entrée | Suit le lien |
| Échap | Ferme ; focus rendu à la pastille |
| Tab depuis une bulle | Ferme et poursuit l'ordre de tabulation |

**Tactile**
- Tap pour ouvrir, tap sur une bulle pour naviguer, tap extérieur pour fermer.
- En `Icon only`, si `(hover: none)` : afficher les libellés sous les bulles (taille 11 px).

**Lecteur d'écran**
- Pastille : nom accessible `{texte} , show links` (ex. `Launched by Olivier Tousche, show links`) + `aria-expanded` + `aria-controls`.
- Bulle : `{Canal}, opens in a new tab` ; Email : `Email {texte gras}`.
- En mode Link : `<a>` dont le nom est le texte de la pastille ; ajouter `, opens in a new tab` si applicable.

### 8.6 Cas limites
| Cas | Comportement attendu |
|---|---|
| Pastille en haut d'écran | Ouverture vers le bas |
| Parent `overflow: hidden` / `transform` | Sans effet (top layer) |
| Plusieurs pastilles sur la page | Classes et ids suffixés par `config.id` |
| CSS hôte agressif | Classes préfixées `sp-{id}`, `box-sizing`, `font`, `line-height`, `margin`, `padding`, `list-style` réinitialisés sur la racine et les enfants |
| Lien Email | `mailto:`, jamais `target="_blank"` |
| Adapt to site theme | Bulles et pastille suivent la palette active |
| Impression | Menu masqué |

---

## 9. Modèle de données

### 9.1 Type
```ts
type Hex = string; // "#RRGGBB" ou "#RRGGBBAA"

type Palette = {
  background: Hex;
  border: Hex;
  textNormal: Hex;
  textBold: Hex;
  icon: Hex;
  blur: 0 | 12;
};

type ChannelType =
  | "x" | "linkedin" | "website" | "instagram" | "github" | "dribbble"
  | "behance" | "email" | "threads" | "bluesky" | "youtube" | "custom";

type Channel = {
  id: string;         // nanoid
  type: ChannelType;
  url: string;        // "mailto:…" pour email
  label?: string;     // requis si type = "custom", 20 caractères max.
};

type BadgeConfig = {
  schemaVersion: 1;
  id: string;         // nanoid 8 caractères [a-z0-9]
  updatedAt: string;  // ISO 8601

  preset: "light" | "dark" | "glass" | "brand" | "custom";
  brandColor?: Hex;

  text: {
    normal: string;
    bold: string;
    order: "normal-first" | "bold-first";
    boldWeight: 400 | 500 | 600;
    size: "s" | "m" | "l";
    font: "sans" | "serif" | "mono";
  };

  avatar: {
    source: "none" | "initials" | "upload" | "url";
    initials: string | null;
    url: string | null;
    background: Hex;
  };

  theme: {
    adaptToSite: boolean;
    base: "light" | "dark";
    palettes: { light: Palette; dark: Palette };
  };

  shape: {
    radius: number;          // 0 à 1
    borderWidth: 0 | 1 | 2;
    shadow: "none" | "soft";
    showIcon: boolean;
  };

  click: {
    mode: "link" | "bubbles";
    link: { url: string; newTab: boolean };
    bubbles: {
      labels: "icon" | "icon-label";
      channels: Channel[];
    };
  };
};
```

- `theme.base` désigne la palette utilisée quand `adaptToSite = false`. Les presets Light/Dark/Glass/Brand écrivent dans `palettes[base]`.
- Les deux palettes sont toujours stockées (bascule réversible).
- La photo téléversée **n'est jamais dans la config** (voir §10).

### 9.2 Config par défaut
Texte `Made by` / `Your Name`, preset **Light** (= pastille Décadi), avatar Initials sur `#FF6B35`, taille M, graisse 500, rayon 1, bordure 1, ombre soft, icône visible, mode Link sans URL, `adaptToSite: false`, `base: "light"`, palette dark = preset Dark.

### 9.3 Config démo (page d'accueil)
```json
{
  "schemaVersion": 1,
  "id": "olivierT",
  "updatedAt": "2026-10-22T12:00:00Z",
  "preset": "light",
  "text": { "normal": "Made by", "bold": "Olivier Tousche", "order": "normal-first", "boldWeight": 500, "size": "m", "font": "sans" },
  "avatar": { "source": "url", "initials": null, "url": "/olivier-avatar.png", "background": "#FF6B35" },
  "theme": {
    "adaptToSite": false,
    "base": "light",
    "palettes": {
      "light": { "background": "#FFFFFF", "border": "#0000000D", "textNormal": "#6E6E73", "textBold": "#000000", "icon": "#6E6E73", "blur": 0 },
      "dark":  { "background": "#14141C", "border": "#2E2E3A", "textNormal": "#8A8A99", "textBold": "#FFFFFF", "icon": "#8A8A99", "blur": 0 }
    }
  },
  "shape": { "radius": 1, "borderWidth": 1, "shadow": "soft", "showIcon": true },
  "click": {
    "mode": "link",
    "link": { "url": "https://www.linkedin.com/in/olivier-tousche-a6160b122/", "newTab": true },
    "bubbles": { "labels": "icon", "channels": [] }
  }
}
```
- C'est la pastille de Décadi, avec « Made by » à la place de « Par » (site en anglais).
- **Avatar** : reprendre le fichier de Décadi, https://decadi.vercel.app/olivier-avatar.png, et le placer dans `public/olivier-avatar.png`.
- La démo est en **mode Link** (redirection vers LinkedIn), comme sur Décadi. Elle passera en mode Bubbles dès qu'Olivier aura fourni au moins un second canal ; dans ce cas, garder LinkedIn en premier.

---

## 10. Persistance et partage

### localStorage
| Clé | Contenu |
|---|---|
| `stampit:config` | Dernière `BadgeConfig` |
| `stampit:avatar:{id}` | Data URL WebP 96 px de la photo téléversée |

Toutes les lectures et écritures dans un `try/catch` (navigation privée, quota plein). En cas d'échec : l'app fonctionne sans persistance.

### Hash de l'URL
1. Retirer les champs égaux aux valeurs par défaut (toujours garder `schemaVersion`).
2. `JSON.stringify` → `CompressionStream("deflate-raw")` → base64url.
3. Écrire dans `/create#c=…` avec `history.replaceState` (pas d'entrée d'historique à chaque frappe).
4. Au chargement : décoder → fusionner avec les défauts → `migrate()` → valider avec Zod.
5. Si `avatar.source = "upload"` et aucune image locale pour cet `id` : afficher les initiales + Banner `Your photo isn't stored in this link. Upload it again or use an image URL.`

Taille cible du hash : 200 à 500 caractères.

---

## 11. Export

### 11.1 Copy code (`generateHtml`)
Un seul bloc autonome :
```html
<!-- Stampit badge · edit: https://stampit.dev/create#c=… -->
<style>/* custom properties sur .sp-{id} + règles utilisées uniquement */</style>
<div class="sp-{id}">
  <!-- Link : <a class="sp-{id}__pill" href="…">…</a> -->
  <!-- Bubbles : -->
  <button class="sp-{id}__pill" popovertarget="sp-{id}-menu" aria-label="…">…</button>
  <ul id="sp-{id}-menu" popover="auto" class="sp-{id}__menu">…</ul>
</div>
<script>/* uniquement en mode Bubbles, ~1 Ko, IIFE, aucune variable globale */</script>
```
- Le commentaire d'en-tête contient le **lien d'édition**, pour retrouver sa config plus tard.
- N'émettre que le CSS nécessaire : pas de `@media (prefers-color-scheme)` si `adaptToSite = false`, pas de `backdrop-filter` si `blur = 0`, pas de règles de bulles en mode Link.
- Avatar `upload` : intégré en data URL base64. Avatar `url` : simple `src`.
- Icônes : uniquement celles des canaux utilisés, tracés simplifiés (1 décimale).
- CSS et JS minifiés ; HTML lisible.
- Le snippet doit fonctionner collé n'importe où dans un `<body>`, plusieurs fois sur la même page (ids distincts).

**Poids indicatifs** (minifié) : Link + initiales ~2 Ko · Link + photo ~7 Ko · Bubbles 4 canaux + photo ~11 Ko · 8 canaux + photo + thème adaptatif ~15 Ko.

### 11.2 Copy prompt (`generatePrompt`)
Texte en anglais, structuré ainsi :
1. **Goal** : add this signature badge to the footer of the current project, using the project's own stack and conventions.
2. **Visual spec** : toutes les valeurs (couleurs par palette, tailles, rayon en px, graisse, police, bordure, avatar).
3. **Behavior** : mode, liens et URL, animations (durées, rebonds, décalage), positionnement des bulles, `prefers-reduced-motion`.
4. **Accessibility** : checklist §8.5 (disclosure, clavier, focus visible, ARIA, zones tactiles 44 px).
5. **Reference implementation** : le snippet HTML/CSS/JS complet, comme source de vérité à adapter (pas forcément à copier tel quel).
6. **Avatar** : si `upload`, instruction de placer le fichier téléchargé dans `public/stampit-avatar.webp` et de l'utiliser (le base64 est retiré de la référence et remplacé par ce chemin).
7. **Acceptance criteria** : 5 points vérifiables (rendu, survol, ouverture/fermeture, clavier, mouvement réduit).

---

## 12. Accessibilité

### Site (éditeur et accueil)
- Composants Fluid (accessibles par défaut) ; tout contrôle maison doit avoir un libellé, un focus visible et être utilisable au clavier.
- Ordre de tabulation logique : réglages → aperçu → export.
- Messages d'erreur reliés aux champs (`aria-describedby`), annonces des toasts via `aria-live="polite"`.
- Contraste AA sur tout le site, en clair et en sombre.

### Pastille générée
- Focus visible : anneau 2 px de la couleur `textBold`, décalage 2 px, via `:focus-visible`.
- Toutes les règles §8.5.
- Le contrôle de contraste de l'éditeur (§6.3) aide l'utilisateur, sans le bloquer.

---

## 13. Qualité et tests

- **Vitest** :
  - `generateHtml` et `generatePrompt` : snapshots sur 6 configs types (Link/initiales, Link/photo, Bubbles 2 canaux, Bubbles 8 canaux, Glass, thème adaptatif).
  - `contrast.ts` : valeurs WCAG de référence.
  - `url.ts` : aller-retour encode/decode, config invalide, migration.
- **Vérification manuelle** de la pastille exportée dans une page HTML vide et dans une page avec CSS agressif (reset global, `overflow: hidden`, `transform`).
- Navigateurs : Chrome, Safari, Firefox (versions récentes), Safari iOS, Chrome Android.
- Lighthouse : accessibilité ≥ 95 sur `/` et `/create`.

---

## 14. Ordre de construction

1. Setup : Vite, TS strict, Tailwind, shadcn, registre Fluid, Inter variable, React Router, déploiement Vercel.
2. `schema.ts` (types, Zod, défauts, `migrate`), `presets.ts`, `contrast.ts`, `channels.ts`.
3. `generateHtml` en mode Link + tests.
4. Éditeur : layout 3 colonnes, sections Text, Colors, Shape, aperçu branché sur `generateHtml`.
5. Avatar (initiales, URL, upload + recadrage).
6. Mode Bubbles : générateur, JS de positionnement et de clavier, éditeur des canaux.
7. Adapt to site theme + contrôle de contraste.
8. Persistance (localStorage + hash).
9. Export : `Copy code`, `generatePrompt`, `Copy prompt`, `Show code`, `Download avatar`.
10. Page d'accueil + `build-demo.ts` + meta/OG.
11. Responsive mobile (aperçu fixe, tiroir `Get code`).
12. Passe accessibilité et tests navigateurs.

---

## 15. Critères d'acceptation

- [ ] Depuis `/`, `Create` mène à `/create` ; la pastille démo est interactive et fonctionne au clavier.
- [ ] Chaque réglage de §6.3 modifie l'aperçu instantanément et respecte ses valeurs par défaut.
- [ ] Recharger la page restaure la pastille ; ouvrir l'URL de l'éditeur dans un autre navigateur reproduit la pastille (photo téléversée exceptée, avec message).
- [ ] Le snippet `Copy code`, collé dans un fichier HTML vide, rend une pastille identique à l'aperçu, sans aucune requête réseau (hors avatar par URL).
- [ ] Le snippet fonctionne deux fois sur la même page.
- [ ] Les bulles s'ouvrent au-dessus, basculent en dessous près du haut de l'écran, restent dans le viewport, passent sur 2 rangées si nécessaire.
- [ ] Clavier complet : Tab, Entrée, flèches, Origine/Fin, Échap avec retour du focus.
- [ ] `prefers-reduced-motion` supprime tous les déplacements.
- [ ] Le prompt copié, donné à un agent dans un projet Next.js vierge, produit une pastille conforme.
- [ ] L'éditeur est entièrement utilisable sur un écran de 375 px de large.
- [ ] Aucune durée ou courbe d'animation codée en dur hors de `lib/springs` (site) et `springs-css.ts` (pastille).

---

## 16. Points ouverts

| Point | Responsable |
|---|---|
| Canaux supplémentaires pour passer la démo en mode Bubbles (optionnel ; LinkedIn et avatar déjà connus) | Olivier |
| Domaine (`stampit.dev` pressenti, disponibilité à vérifier) | Olivier |
| URL du dépôt GitHub pour les liens `GitHub` | Olivier |
| Image Open Graph | Olivier / agent |
