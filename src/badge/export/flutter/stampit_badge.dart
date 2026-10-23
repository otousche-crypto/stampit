// STAMPIT:HEADER
//
// Needs one package: flutter pub add url_launcher
// Then: const StampitBadge() anywhere in your widget tree.

// Generated: every setting has a field, this badge uses some of them.
// ignore_for_file: unused_element_parameter, use_null_aware_elements
import 'dart:async';
import 'dart:math' as math;
import 'dart:ui' as ui;

import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:url_launcher/url_launcher.dart';

// STAMPIT:SPEC:START
const _spec = _Spec(
  layout: _Layout.pill,
  label: 'Crafted by Your Name',
  normal: 'Crafted by',
  bold: 'Your Name',
  boldFirst: false,
  boldWeight: FontWeight.w500,
  font: _Font.sans,
  height: 36,
  textSize: 15,
  avatarSize: 28,
  padLeft: 4,
  padRight: 12,
  gap: 8,
  iconSize: 14,
  bubbleSize: 40,
  radius: 18,
  avatarRadius: 14,
  initials: 'YN',
  avatarBackground: Color(0xFFFF6B35),
  adapt: true,
  light: _Palette(
    background: Color(0xFFFFFFFF),
    border: Color(0x0D000000),
    textNormal: Color(0xFF6E6E73),
    textBold: Color(0xFF000000),
    icon: Color(0xFF6E6E73),
    blur: 0,
    sheen: Color(0x1F000000),
    initials: Color(0xFF000000),
  ),
  dark: _Palette(
    background: Color(0xFF14141C),
    border: Color(0xFF2E2E3A),
    textNormal: Color(0xFF8A8A99),
    textBold: Color(0xFFFFFFFF),
    icon: Color(0xFF8A8A99),
    blur: 0,
    sheen: Color(0x8CFFFFFF),
    initials: Color(0xFF000000),
  ),
  softShadow: true,
  icon: _Icon('M7 17L17 7M7 7h10v10'),
  iconHover: _IconHover.arrow,
  entrance: _Effect.shake,
  repeat: _Effect.shine,
  hover: _Hover.grow,
  url: 'https://example.com',
  newTab: true,
);
// STAMPIT:SPEC:END

/// The badge. Light or dark follows your app's theme when "Adapt to site
/// theme" was on; links open with url_launcher.
class StampitBadge extends StatefulWidget {
  const StampitBadge({super.key});

  @override
  State<StampitBadge> createState() => _StampitBadgeState();
}

// ---------------------------------------------------------------------------
// Settings (filled in by Stampit)
// ---------------------------------------------------------------------------

enum _Layout { pill, stamp, split, card, team }

enum _Effect { none, shake, bump, shine }

enum _Hover { none, grow, lift, pulse, shake }

enum _IconHover { arrow, triangle, link }

enum _Font { sans, serif, mono }

class _Palette {
  const _Palette({
    required this.background,
    required this.border,
    required this.textNormal,
    required this.textBold,
    required this.icon,
    required this.blur,
    required this.sheen,
    required this.initials,
  });

  final Color background, border, textNormal, textBold, icon, sheen, initials;
  final double blur;
}

/// An icon on a 24 × 24 grid, as SVG path data: stroked, or filled.
class _Icon {
  const _Icon(this.path, {this.filled = false});

  final String path;
  final bool filled;
}

class _Link {
  const _Link(this.label, this.url, this.icon, {this.newTab = true, this.semantics});

  final String label, url;
  final _Icon icon;
  final bool newTab;
  final String? semantics;
}

class _Member {
  const _Member(this.initials, this.color);

  final String initials;
  final Color color;
}

class _RingPart {
  const _RingPart(this.text, {this.bold = false});

  final String text;
  final bool bold;
}

class _Spec {
  const _Spec({
    required this.layout,
    required this.label,
    required this.normal,
    required this.bold,
    this.role = '',
    required this.boldFirst,
    required this.boldWeight,
    required this.font,
    required this.height,
    required this.textSize,
    required this.avatarSize,
    required this.padLeft,
    required this.padRight,
    required this.gap,
    required this.iconSize,
    required this.bubbleSize,
    required this.radius,
    required this.avatarRadius,
    this.initials,
    this.image,
    required this.avatarBackground,
    this.team = const [],
    required this.adapt,
    required this.light,
    required this.dark,
    this.borderWidth = 0,
    required this.softShadow,
    this.icon,
    this.iconHover = _IconHover.arrow,
    this.entrance = _Effect.none,
    this.repeat = _Effect.none,
    this.hover = _Hover.none,
    this.url = '',
    this.newTab = true,
    this.bubbles = const [],
    this.bubbleLabels = false,
    this.socials = const [],
    this.stampSize = 112,
    this.ring = const [],
    this.ringFontSize = 9.5,
  });

  final _Layout layout;

  /// What screen readers announce.
  final String label;
  final String normal, bold, role;
  final bool boldFirst;
  final FontWeight boldWeight;
  final _Font font;

  final double height, textSize, avatarSize, padLeft, padRight, gap, iconSize, bubbleSize;

  /// Corner radius of the badge, and of its avatar, in logical pixels.
  final double radius, avatarRadius;

  /// Initials, or a photo (an http(s) or data: URL). Neither: no avatar.
  final String? initials, image;
  final Color avatarBackground;
  final List<_Member> team;

  /// Light and dark palettes, switched by the app theme when [adapt].
  final bool adapt;
  final _Palette light, dark;
  final double borderWidth;
  final bool softShadow;

  final _Icon? icon;
  final _IconHover iconHover;

  final _Effect entrance, repeat;
  final _Hover hover;

  final String url;
  final bool newTab;

  /// Not empty: a tap opens these links around the badge instead of [url].
  final List<_Link> bubbles;
  final bool bubbleLabels;

  /// Small round links next to the badge.
  final List<_Link> socials;

  final double stampSize;
  final List<_RingPart> ring;

  /// In ring units: the ring is drawn on a 100 × 100 grid.
  final double ringFontSize;
}

// ---------------------------------------------------------------------------
// Timings: Stampit's springs, as Flutter curves
// ---------------------------------------------------------------------------

const _fast = Duration(milliseconds: 80);
const _moderate = Duration(milliseconds: 160);
const _slow = Duration(milliseconds: 240);
const _attention = Duration(milliseconds: 480);
const _shine = Duration(milliseconds: 900);
const _repeatEvery = Duration(seconds: 5);
const _stagger = 30;
const _ease = Cubic(.4, 0, .2, 1);
const _exitCurve = Cubic(.4, 0, 1, 1);
const _springOut = Cubic(.2, .9, .3, 1.02);

const _softShadow = [BoxShadow(color: Color(0x14000000), offset: Offset(0, 1), blurRadius: 6)];
const _softShadowHover = [BoxShadow(color: Color(0x1F000000), offset: Offset(0, 2), blurRadius: 12)];

bool get _isTouch =>
    defaultTargetPlatform == TargetPlatform.iOS || defaultTargetPlatform == TargetPlatform.android;

Future<void> _open(String url, bool newTab) async {
  final uri = Uri.tryParse(url);
  if (uri == null || url.isEmpty) return;
  await launchUrl(uri, webOnlyWindowName: newTab ? '_blank' : '_self');
}

/// Keyframes like CSS: each step eased on its own.
Animatable<double> _keyframes(List<double> values) {
  return TweenSequence([
    for (var i = 0; i < values.length - 1; i++)
      TweenSequenceItem(tween: Tween(begin: values[i], end: values[i + 1]).chain(CurveTween(curve: _ease)), weight: 1),
  ]);
}

final _shakeFrames = _keyframes([0, -3, 3, -3, 3, 0]);
final _bumpFrames = TweenSequence([
  TweenSequenceItem(tween: Tween(begin: 1.0, end: 1.08).chain(CurveTween(curve: _ease)), weight: 35),
  TweenSequenceItem(tween: Tween(begin: 1.08, end: .97).chain(CurveTween(curve: _ease)), weight: 30),
  TweenSequenceItem(tween: Tween(begin: .97, end: 1.0).chain(CurveTween(curve: _ease)), weight: 35),
]);
final _hoverShakeFrames = _keyframes([0, -2, 2, -2, 2, 0]);
final _pulseFrames = _keyframes([1, 1.05, 1]);

// ---------------------------------------------------------------------------
// The badge
// ---------------------------------------------------------------------------

class _StampitBadgeState extends State<StampitBadge> with TickerProviderStateMixin {
  late final AnimationController _attn = AnimationController(vsync: this, duration: _attention);
  late final AnimationController _sweep = AnimationController(vsync: this, duration: _shine, value: 1);
  late final AnimationController _hoverFx = AnimationController(vsync: this, duration: _attention);
  late final AnimationController _spin = AnimationController(vsync: this, duration: const Duration(seconds: 24));
  late final AnimationController _menu = AnimationController(
    vsync: this,
    duration: _slow + Duration(milliseconds: _stagger * _spec.bubbles.length),
    reverseDuration: _moderate,
  );
  late final AnimationController _reveal = AnimationController(
    vsync: this,
    duration: _slow + Duration(milliseconds: _stagger * _spec.socials.length),
    reverseDuration: _moderate,
  );

  _Effect _attnEffect = _Effect.none;
  Curve _sweepCurve = _ease;
  Timer? _repeatTimer, _entranceDelay, _hideSocials;
  bool _hovered = false, _focused = false, _menuOpen = false, _menuUp = true, _reduced = false, _started = false;
  double _menuShift = 0;

  final _anchor = LayerLink();
  final _menuPortal = OverlayPortalController();
  final _socialsPortal = OverlayPortalController();
  final _menuKey = GlobalKey();
  final _badgeKey = GlobalKey();
  final _firstBubble = FocusNode();
  final _tapGroup = Object();

  bool get _floatingSocials => _spec.socials.isNotEmpty && _spec.layout != _Layout.card && !_isTouch;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    _reduced = MediaQuery.maybeDisableAnimationsOf(context) ?? false;
    if (_started) return;
    _started = true;
    if (_floatingSocials) WidgetsBinding.instance.addPostFrameCallback((_) => mounted ? _socialsPortal.show() : null);
    if (_reduced) return;
    if (_spec.layout == _Layout.stamp) _spin.repeat();
    if (_spec.entrance == _Effect.shine) {
      _entranceDelay = Timer(const Duration(milliseconds: 200), () => _play(_Effect.shine, _ease));
    } else {
      _play(_spec.entrance, _ease);
    }
    if (_spec.repeat != _Effect.none) {
      _repeatTimer = Timer.periodic(_repeatEvery, (_) => _play(_spec.repeat, Curves.linear));
    }
  }

  void _play(_Effect effect, Curve sweepCurve) {
    if (!mounted || _reduced) return;
    switch (effect) {
      case _Effect.none:
        return;
      case _Effect.shine:
        _sweepCurve = sweepCurve;
        _sweep.forward(from: 0);
      case _Effect.shake:
      case _Effect.bump:
        setState(() => _attnEffect = effect);
        _attn.forward(from: 0);
    }
  }

  @override
  void dispose() {
    _repeatTimer?.cancel();
    _entranceDelay?.cancel();
    _hideSocials?.cancel();
    for (final c in [_attn, _sweep, _hoverFx, _spin, _menu, _reveal]) {
      c.dispose();
    }
    _firstBubble.dispose();
    super.dispose();
  }

  // Hover and focus ---------------------------------------------------------

  void _setHovered(bool value) {
    if (_hovered == value) return;
    setState(() => _hovered = value);
    if (_reduced) return;
    if (value && _spec.hover == _Hover.shake) _hoverFx.forward(from: 0);
    if (_spec.hover == _Hover.pulse) {
      value ? _hoverFx.repeat() : _hoverFx.animateTo(0, duration: _fast);
    }
  }

  /// The floating social links show while the badge or the links are hovered.
  void _socialsHover(bool inside) {
    _hideSocials?.cancel();
    if (inside) {
      _reveal.forward();
    } else {
      _hideSocials = Timer(const Duration(milliseconds: 80), () {
        if (mounted && !_focused) _reveal.reverse();
      });
    }
  }

  // Bubble menu -------------------------------------------------------------

  void _toggleMenu({bool keyboard = false}) => _menuOpen ? _closeMenu() : _openMenu(keyboard: keyboard);

  /// From the keyboard, focus moves into the menu (arrows, Escape); a tap leaves it alone.
  void _openMenu({bool keyboard = false}) {
    final box = _badgeKey.currentContext?.findRenderObject() as RenderBox?;
    if (box == null) return;
    final top = box.localToGlobal(Offset.zero).dy;
    final labelsBelow = !_spec.bubbleLabels && _isTouch;
    // Rough height: the menu wraps to 2 rows when the screen is narrow.
    final rows = _spec.bubbles.length > 4 && MediaQuery.sizeOf(context).width < 600 ? 2 : 1;
    final needed = rows * (_spec.bubbleSize + (labelsBelow ? 18 : 0) + 8) + 16;
    setState(() {
      _menuOpen = true;
      _menuUp = top - 12 >= needed;
      _menuShift = 0;
    });
    _menuPortal.show();
    // Measure the row, keep it on screen, then let the bubbles out.
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!mounted || !_menuOpen) return;
      final row = _menuKey.currentContext?.findRenderObject() as RenderBox?;
      if (row != null) {
        final left = row.localToGlobal(Offset.zero).dx;
        final width = MediaQuery.sizeOf(context).width;
        final over = left + row.size.width - (width - 8);
        setState(() => _menuShift = left < 8 ? 8 - left : (over > 0 ? -over : 0));
      }
      _menu.forward();
      if (keyboard) _firstBubble.requestFocus();
    });
  }

  void _closeMenu() {
    if (!_menuOpen) return;
    setState(() => _menuOpen = false);
    _menu.reverse().whenComplete(() {
      if (mounted && !_menuOpen) _menuPortal.hide();
    });
  }

  void _activate({bool keyboard = false}) {
    if (_spec.bubbles.isNotEmpty) {
      _toggleMenu(keyboard: keyboard);
    } else {
      _open(_spec.url, _spec.newTab);
    }
  }

  // Build -------------------------------------------------------------------

  @override
  Widget build(BuildContext context) {
    final dark = _spec.adapt && Theme.of(context).brightness == Brightness.dark;
    final p = dark ? _spec.dark : _spec.light;
    final st = _Styles(p);

    Widget badge = _clickable(st, _surface(st));

    // Hover effect on the badge itself.
    badge = _hoverTransform(badge);

    if (_spec.socials.isNotEmpty && _spec.layout != _Layout.card && _isTouch) {
      // Touch screens have no hover: the links sit next to the badge.
      badge = Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          badge,
          for (final link in _spec.socials) ...[const SizedBox(width: 6), _SocialButton(link: link, st: st)],
        ],
      );
    }

    if (_floatingSocials) {
      badge = OverlayPortal(
        controller: _socialsPortal,
        overlayChildBuilder: (_) => _floatingSocialsLayer(st),
        child: badge,
      );
    }

    if (_spec.bubbles.isNotEmpty) {
      badge = OverlayPortal(
        controller: _menuPortal,
        overlayChildBuilder: (_) => _menuLayer(st),
        child: badge,
      );
    }

    // Appear and "On delay" effects move the whole badge.
    badge = AnimatedBuilder(
      animation: _attn,
      child: badge,
      // Always the same Transform, identity at rest: changing the tree's shape
      // would rebuild the badge and lose its state.
      builder: (context, child) {
        final idle = !_attn.isAnimating;
        final bump = !idle && _attnEffect == _Effect.bump;
        final dx = idle || bump ? 0.0 : _shakeFrames.evaluate(_attn);
        final scale = bump ? _bumpFrames.evaluate(_attn) : 1.0;
        return Transform(
          alignment: Alignment.center,
          transform: Matrix4.diagonal3Values(scale, scale, 1)..setTranslationRaw(dx, 0, 0),
          child: child,
        );
      },
    );

    return MouseRegion(
      onEnter: (_) => _floatingSocials ? _socialsHover(true) : null,
      onExit: (_) => _floatingSocials ? _socialsHover(false) : null,
      child: TapRegion(groupId: _tapGroup, child: badge),
    );
  }

  Widget _hoverTransform(Widget child) {
    if (_reduced || _spec.hover == _Hover.none) return child;
    switch (_spec.hover) {
      case _Hover.grow:
        return AnimatedScale(scale: _hovered ? 1.04 : 1, duration: _fast, curve: _ease, child: child);
      case _Hover.lift:
        return AnimatedContainer(
          duration: _fast,
          curve: _ease,
          transform: Matrix4.translationValues(0, _hovered ? -2 : 0, 0),
          child: child,
        );
      case _Hover.pulse:
        return AnimatedBuilder(
          animation: _hoverFx,
          child: child,
          builder: (_, child) => Transform.scale(scale: _pulseFrames.evaluate(_hoverFx), child: child),
        );
      case _Hover.shake:
        return AnimatedBuilder(
          animation: _hoverFx,
          child: child,
          builder: (_, child) => Transform.translate(offset: Offset(_hoverShakeFrames.evaluate(_hoverFx), 0), child: child),
        );
      case _Hover.none:
        return child;
    }
  }

  double get _outerHeight => _spec.layout == _Layout.stamp ? _spec.stampSize : _spec.height;

  /// Pointer, keyboard and screen reader: one tap target.
  Widget _clickable(_Styles st, Widget child) {
    final bubbles = _spec.bubbles.isNotEmpty;
    return Semantics(
      link: !bubbles,
      button: bubbles,
      expanded: bubbles ? _menuOpen : null,
      label: bubbles ? '${_spec.label}, show links' : (_spec.newTab ? '${_spec.label}, opens in a new tab' : _spec.label),
      excludeSemantics: _spec.layout != _Layout.card,
      child: FocusableActionDetector(
        mouseCursor: SystemMouseCursors.click,
        onShowHoverHighlight: _setHovered,
        onShowFocusHighlight: (v) {
          setState(() => _focused = v);
          if (_floatingSocials) _socialsHover(v);
        },
        actions: {ActivateIntent: CallbackAction<ActivateIntent>(onInvoke: (_) => _activate(keyboard: true))},
        child: GestureDetector(
          behavior: HitTestBehavior.opaque,
          onTap: _activate,
          child: CompositedTransformTarget(
            link: _anchor,
            child: KeyedSubtree(key: _badgeKey, child: _focusRing(st, child)),
          ),
        ),
      ),
    );
  }

  Widget _focusRing(_Styles st, Widget child) {
    final radius = _spec.layout == _Layout.stamp ? _spec.stampSize / 2 : _spec.radius;
    return Stack(
      clipBehavior: Clip.none,
      children: [
        child,
        if (_focused)
          Positioned(
            left: -4,
            top: -4,
            right: -4,
            bottom: -4,
            child: IgnorePointer(
              child: DecoratedBox(
                decoration: BoxDecoration(
                  border: Border.all(color: st.p.textBold, width: 2),
                  borderRadius: BorderRadius.circular(radius + 4),
                ),
              ),
            ),
          ),
      ],
    );
  }

  /// The badge's surface: background, ring, shadow, blur and Shine, around the layout's content.
  Widget _surface(_Styles st) {
    final stamp = _spec.layout == _Layout.stamp;
    final shape = stamp
        ? const CircleBorder() as ShapeBorder
        : RoundedRectangleBorder(borderRadius: BorderRadius.circular(_spec.radius));
    final content = switch (_spec.layout) {
      _Layout.pill => _pillContent(st),
      _Layout.stamp => _stampContent(st),
      _Layout.split => _splitContent(st),
      _Layout.team => _teamContent(st),
      _Layout.card => _cardContent(st),
    };

    Widget inner = Stack(
      children: [
        content,
        if (_spec.entrance == _Effect.shine || _spec.repeat == _Effect.shine)
          Positioned.fill(child: IgnorePointer(child: _ShineBand(animation: _sweep, curve: () => _sweepCurve, color: st.p.sheen))),
      ],
    );
    if (st.p.blur > 0) {
      inner = BackdropFilter(filter: ui.ImageFilter.blur(sigmaX: st.p.blur, sigmaY: st.p.blur), child: inner);
    }
    inner = ClipPath(clipper: ShapeBorderClipper(shape: shape), child: inner);

    return AnimatedContainer(
      duration: _fast,
      curve: _ease,
      decoration: ShapeDecoration(
        shape: shape,
        color: st.p.background,
        shadows: _spec.softShadow ? (_hovered ? _softShadowHover : _softShadow) : const [],
      ),
      foregroundDecoration: _spec.borderWidth > 0
          ? ShapeDecoration(
              shape: stamp
                  ? CircleBorder(side: BorderSide(color: st.p.border, width: _spec.borderWidth))
                  : RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(_spec.radius),
                      side: BorderSide(color: st.p.border, width: _spec.borderWidth),
                    ),
            )
          : null,
      child: inner,
    );
  }

  // Layouts ----------------------------------------------------------------

  Widget? _avatar(_Styles st, {double? size, double? radius, double? fontSize}) {
    final s = size ?? _spec.avatarSize;
    if (_spec.initials == null && _spec.image == null) return null;
    return _Avatar(
      size: s,
      radius: radius ?? _spec.avatarRadius,
      background: _spec.avatarBackground,
      initials: _spec.initials ?? '',
      image: _spec.image,
      style: st.text(fontSize ?? (s * .4).roundToDouble(), st.p.initials, FontWeight.w600, height: 1),
    );
  }

  Widget? _linkIcon(_Styles st, {Color? color}) {
    final icon = _spec.icon;
    if (icon == null) return null;
    final bubbles = _spec.bubbles.isNotEmpty;
    final on = _hovered || _focused;
    Matrix4 transform;
    if (bubbles) {
      transform = Matrix4.rotationZ((_menuOpen ? 45 : (on && !_reduced ? 15 : 0)) * math.pi / 180);
    } else if (!on || _reduced) {
      transform = Matrix4.identity();
    } else {
      transform = switch (_spec.iconHover) {
        _IconHover.arrow => Matrix4.translationValues(2, -2, 0),
        _IconHover.triangle => Matrix4.translationValues(2, 0, 0),
        _IconHover.link => Matrix4.rotationZ(-15 * math.pi / 180),
      };
    }
    return AnimatedContainer(
      duration: bubbles ? _moderate : _fast,
      curve: _ease,
      transform: transform,
      transformAlignment: Alignment.center,
      child: _SvgIcon(icon, size: _spec.iconSize, color: color ?? st.p.icon),
    );
  }

  /// Normal and bold text, in display order.
  Widget _label(_Styles st, {String? bold, Color? boldColor}) {
    final normal = TextSpan(text: _spec.normal, style: st.text(_spec.textSize, st.p.textNormal, FontWeight.w400));
    final strong = TextSpan(
      text: bold ?? _spec.bold,
      style: st.text(_spec.textSize, boldColor ?? st.p.textBold, _spec.boldWeight),
    );
    final parts = [
      if (_spec.normal.isNotEmpty) normal,
      if ((bold ?? _spec.bold).isNotEmpty) strong,
    ];
    final ordered = _spec.boldFirst ? parts.reversed.toList() : parts;
    return Text.rich(
      TextSpan(children: [
        for (var i = 0; i < ordered.length; i++) ...[
          if (i > 0) TextSpan(text: ' ', style: st.text(_spec.textSize, st.p.textNormal, FontWeight.w400)),
          ordered[i],
        ],
      ]),
      maxLines: 1,
      softWrap: false,
    );
  }

  Widget _row(List<Widget?> children, {double? gap, EdgeInsets? padding, double? height}) {
    final items = children.whereType<Widget>().toList();
    return Container(
      height: height ?? _spec.height,
      padding: padding,
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          for (var i = 0; i < items.length; i++) ...[
            if (i > 0) SizedBox(width: gap ?? _spec.gap),
            items[i],
          ],
        ],
      ),
    );
  }

  EdgeInsets get _pillPadding => EdgeInsets.only(left: _spec.padLeft, right: _spec.padRight);

  Widget _pillContent(_Styles st) => _row([_avatar(st), _label(st), _linkIcon(st)], padding: _pillPadding);

  Widget _splitContent(_Styles st) {
    final avatar = _avatar(st);
    return SizedBox(
      height: _spec.height,
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          _row(
            [avatar, if (_spec.normal.isNotEmpty) Text(_spec.normal, style: st.text(_spec.textSize, st.p.textNormal, FontWeight.w400))],
            padding: EdgeInsets.only(left: _spec.padLeft, right: _spec.gap),
          ),
          ColoredBox(
            color: st.p.textBold,
            child: _row(
              [
                if (_spec.bold.isNotEmpty) Text(_spec.bold, style: st.text(_spec.textSize, st.p.background, _spec.boldWeight)),
                _linkIcon(st, color: st.p.background),
              ],
              gap: 6,
              padding: EdgeInsets.only(left: _spec.gap, right: _spec.padRight),
            ),
          ),
        ],
      ),
    );
  }

  Widget _teamContent(_Styles st) {
    final size = _spec.avatarSize;
    final overlap = (size * .32).roundToDouble();
    final step = size - overlap;
    final members = _spec.team;
    final ringed = <Widget>[
      for (final m in members)
        _Avatar(
          size: size,
          radius: _spec.avatarRadius,
          background: m.color,
          initials: m.initials,
          style: st.text((size * .36).roundToDouble(), const Color(0xFFFFFFFF), FontWeight.w600, height: 1),
        ),
    ];
    final lead = _avatar(st)!;
    final count = members.length + 1;
    final stack = SizedBox(
      width: size + step * (count - 1),
      height: size,
      child: Stack(
        clipBehavior: Clip.none,
        children: [
          // Painted last-to-first: the lead avatar on top.
          for (var i = ringed.length - 1; i >= 0; i--)
            Positioned(left: step * (i + 1), top: 0, child: _ringed(ringed[i], st, size)),
          Positioned(left: 0, top: 0, child: _ringed(lead, st, size)),
        ],
      ),
    );
    return _row([stack, _label(st), _linkIcon(st)], padding: _pillPadding);
  }

  Widget _ringed(Widget avatar, _Styles st, double size) => DecoratedBox(
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(_spec.avatarRadius + 2),
          boxShadow: [BoxShadow(color: st.p.background, spreadRadius: 2)],
        ),
        child: avatar,
      );

  Widget _stampContent(_Styles st) {
    final d = _spec.stampSize;
    final av = (d * .44).roundToDouble();
    final ring = CustomPaint(
      size: Size.square(d),
      painter: _RingPainter(
        parts: _spec.ring,
        fontSize: _spec.ringFontSize,
        normal: st.text(10, st.p.textNormal, FontWeight.w500),
        bold: st.text(10, st.p.textBold, FontWeight.w600),
        border: st.p.border,
      ),
    );
    return SizedBox.square(
      dimension: d,
      child: Stack(
        alignment: Alignment.center,
        children: [
          _reduced ? ring : RotationTransition(turns: _spin, child: ring),
          if (_avatar(st, size: av, radius: av / 2, fontSize: (av * .36).roundToDouble()) case final a?) a,
        ],
      ),
    );
  }

  Widget _cardContent(_Styles st) {
    // Round avatar and links from "Radius" 50 % up (the card's corner is then 14 px or more).
    final circle = _spec.radius >= 14;
    final lines = <Widget>[
      if (_spec.normal.isNotEmpty) Text(_spec.normal, style: st.text(12, st.p.textNormal, FontWeight.w400, height: 1.25)),
      if (_spec.bold.isNotEmpty) Text(_spec.bold, style: st.text(16, st.p.textBold, _spec.boldWeight, height: 1.25)),
      if (_spec.role.isNotEmpty) Text(_spec.role, style: st.text(13, st.p.textNormal, FontWeight.w400, height: 1.25)),
    ];
    final icon = _linkIcon(st);
    return ConstrainedBox(
      constraints: const BoxConstraints(minWidth: 240),
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: IntrinsicWidth(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Row(
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  if (_avatar(st, size: 44, radius: circle ? 22 : _spec.radius - 4, fontSize: 17) case final a?) ...[
                    a,
                    const SizedBox(width: 12),
                  ],
                  Expanded(
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        for (var i = 0; i < lines.length; i++) ...[if (i > 0) const SizedBox(height: 1), lines[i]],
                      ],
                    ),
                  ),
                  if (icon != null) ...[
                    const SizedBox(width: 12),
                    Align(alignment: Alignment.topCenter, heightFactor: 1, child: icon),
                  ],
                ],
              ),
              if (_spec.socials.isNotEmpty) ...[
                const SizedBox(height: 12),
                Row(
                  children: [
                    for (var i = 0; i < _spec.socials.length; i++) ...[
                      if (i > 0) const SizedBox(width: 6),
                      _SocialButton(link: _spec.socials[i], st: st, size: 32, iconSize: 15, radius: circle ? 16 : 8, outlined: true),
                    ],
                  ],
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }

  // Floating social links (pointer devices) ---------------------------------

  Widget _floatingSocialsLayer(_Styles st) {
    final links = _spec.socials;
    return Positioned(
      left: 0,
      top: 0,
      child: CompositedTransformFollower(
        link: _anchor,
        targetAnchor: Alignment.centerRight,
        followerAnchor: Alignment.centerLeft,
        child: MouseRegion(
          onEnter: (_) => _socialsHover(true),
          onExit: (_) => _socialsHover(false),
          child: AnimatedBuilder(
            animation: _reveal,
            builder: (context, _) => IgnorePointer(
              ignoring: _reveal.value == 0,
              child: Padding(
                padding: const EdgeInsets.only(left: 6),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    for (var i = 0; i < links.length; i++) ...[
                      if (i > 0) const SizedBox(width: 6),
                      _staggered(
                        _reveal,
                        i,
                        links.length,
                        (t) => Opacity(
                          opacity: t.clamp(0.0, 1.0),
                          child: Transform.translate(
                            offset: Offset(_reduced ? 0 : -6 * (1 - t), 0),
                            child: Transform.scale(scale: _reduced ? 1 : .8 + .2 * t, child: _SocialButton(link: links[i], st: st)),
                          ),
                        ),
                      ),
                    ],
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }

  /// One item's share of a staggered animation, eased like the slow spring.
  Widget _staggered(AnimationController c, int index, int count, Widget Function(double t) build, {int? delayIndex}) {
    final total = c.duration!.inMilliseconds.toDouble();
    final start = (delayIndex ?? index) * _stagger / total;
    final end = math.min(1.0, start + _slow.inMilliseconds / total);
    final reversing = c.status == AnimationStatus.reverse;
    final t = reversing
        ? _exitCurve.transform(c.value)
        : _springOut.transform(Interval(start, end).transform(c.value));
    return build(t);
  }

  // Bubble menu -------------------------------------------------------------

  /// A bubble's width, measured before layout so the rows can be planned.
  double _bubbleWidth(_Link link, _Styles st, bool labelsBelow) {
    final b = _spec.bubbleSize;
    if (!_spec.bubbleLabels && !labelsBelow) return b;
    final painter = TextPainter(
      text: TextSpan(
        text: link.label,
        style: _spec.bubbleLabels
            ? st.text(_spec.textSize - 1, st.p.textBold, FontWeight.w400)
            : st.text(11, st.p.textBold, FontWeight.w400, height: 14 / 11),
      ),
      textDirection: TextDirection.ltr,
      maxLines: 1,
    )..layout();
    final text = painter.width;
    painter.dispose();
    if (labelsBelow) return math.max(b, text);
    return math.max(b, _spec.padRight + 18 + (_spec.gap - 2) + text + _spec.padRight + 2);
  }

  Widget _menuLayer(_Styles st) {
    final links = _spec.bubbles;
    final h = _spec.bubbleSize;
    final labelsBelow = !_spec.bubbleLabels && _isTouch;
    const gap = 8.0, arc = 8.0, offset = 12.0;
    final rowHeight = h + (labelsBelow ? 18 : 0);

    // One row if it fits the screen, else 2 or more, as even as possible.
    final widths = [for (final link in links) _bubbleWidth(link, st, labelsBelow)];
    final room = MediaQuery.sizeOf(context).width - 16;
    double span(List<int> row) => row.fold<double>(0, (sum, i) => sum + widths[i]) + gap * (row.length - 1);
    var rows = [List<int>.generate(links.length, (i) => i)];
    for (var count = 2; count <= links.length && rows.any((row) => span(row) > room); count++) {
      final size = (links.length / count).ceil();
      rows = [
        for (var start = 0; start < links.length; start += size)
          List<int>.generate(math.min(size, links.length - start), (i) => start + i),
      ];
    }

    Widget row(List<int> items, int ri) {
      final c = (items.length - 1) / 2;
      final total = span(items);
      var x = -total / 2;
      final children = <Widget>[];
      for (var j = 0; j < items.length; j++) {
        final i = items[j];
        final centre = x + widths[i] / 2;
        x += widths[i] + gap;
        if (j > 0) children.add(const SizedBox(width: gap));
        children.add(_staggered(_menu, i, links.length, delayIndex: (j - c).abs().floor() + ri, (t) {
          final k = c == 0 ? 0.0 : (j - c) / c;
          final rise = arc * (1 - k * k) * (_menuUp ? -1 : 1);
          // Starts at the badge's centre, small and clear, and springs into place.
          final fromX = -centre - _menuShift;
          final fromY = (_menuUp ? 1 : -1) * (offset + rowHeight / 2 + ri * (rowHeight + gap) + _outerHeight / 2) - rise;
          final dx = _reduced ? 0.0 : fromX * (1 - t);
          final dy = rise + (_reduced ? 0.0 : fromY * (1 - t));
          return Opacity(
            opacity: t.clamp(0.0, 1.0),
            child: Transform.translate(
              offset: Offset(dx, dy),
              child: Transform.scale(
                scale: _reduced ? 1 : .6 + .4 * t,
                child: _Bubble(
                  link: links[i],
                  st: st,
                  focusNode: i == 0 ? _firstBubble : null,
                  labelInside: _spec.bubbleLabels,
                  labelBelow: labelsBelow,
                  onOpen: _closeMenu,
                ),
              ),
            ),
          );
        }));
      }
      return Row(mainAxisSize: MainAxisSize.min, crossAxisAlignment: CrossAxisAlignment.start, children: children);
    }

    return Positioned(
      left: 0,
      top: 0,
      child: CompositedTransformFollower(
        link: _anchor,
        targetAnchor: _menuUp ? Alignment.topCenter : Alignment.bottomCenter,
        followerAnchor: _menuUp ? Alignment.bottomCenter : Alignment.topCenter,
        offset: Offset(_menuShift, _menuUp ? -offset : offset),
        child: TapRegion(
          groupId: _tapGroup,
          onTapOutside: (_) => _closeMenu(),
          child: CallbackShortcuts(
            bindings: {const SingleActivator(LogicalKeyboardKey.escape): _closeMenu},
            child: FocusTraversalGroup(
              child: AnimatedBuilder(
                animation: _menu,
                builder: (context, _) {
                  // The first row sits nearest the badge.
                  final built = [for (var ri = 0; ri < rows.length; ri++) row(rows[ri], ri)];
                  final ordered = _menuUp ? built.reversed.toList() : built;
                  return Padding(
                    // Room for the arc: the middle bubbles rise above their row.
                    padding: EdgeInsets.only(top: _menuUp ? arc : 0, bottom: _menuUp ? 0 : arc),
                    child: Column(
                      key: _menuKey,
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        for (var k = 0; k < ordered.length; k++) ...[
                          if (k > 0) const SizedBox(height: gap),
                          ordered[k],
                        ],
                      ],
                    ),
                  );
                },
              ),
            ),
          ),
        ),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Pieces
// ---------------------------------------------------------------------------

/// Text styles that ignore the app's own: the badge looks the same everywhere.
class _Styles {
  _Styles(this.p);

  final _Palette p;

  TextStyle text(double size, Color color, FontWeight weight, {double height = 1.2}) {
    final (family, fallback) = switch (_spec.font) {
      _Font.sans => (null, const <String>[]),
      _Font.serif => ('Georgia', const ['serif', 'Times New Roman', 'Noto Serif']),
      _Font.mono => ('Menlo', const ['monospace', 'SF Mono', 'Consolas', 'Roboto Mono']),
    };
    return TextStyle(
      inherit: false,
      fontSize: size,
      height: height,
      color: color,
      fontWeight: weight,
      fontFamily: family,
      fontFamilyFallback: fallback,
      letterSpacing: 0,
      decoration: TextDecoration.none,
      textBaseline: TextBaseline.alphabetic,
      leadingDistribution: TextLeadingDistribution.even,
    );
  }
}

class _Avatar extends StatelessWidget {
  const _Avatar({
    required this.size,
    required this.radius,
    required this.background,
    required this.initials,
    required this.style,
    this.image,
  });

  final double size, radius;
  final Color background;
  final String initials;
  final String? image;
  final TextStyle style;

  @override
  Widget build(BuildContext context) {
    final fallback = Center(child: Text(initials, style: style, maxLines: 1, softWrap: false));
    Widget child = fallback;
    final src = image;
    if (src != null) {
      Widget error(BuildContext context, Object error, StackTrace? stack) => fallback;
      if (src.startsWith('data:')) {
        final bytes = UriData.parse(src).contentAsBytes();
        child = Image.memory(bytes, width: size, height: size, fit: BoxFit.cover, errorBuilder: error);
      } else {
        child = Image.network(
          src,
          width: size,
          height: size,
          fit: BoxFit.cover,
          errorBuilder: error,
          // Flutter web: photos from hosts without CORS still show, as an <img>.
          webHtmlElementStrategy: WebHtmlElementStrategy.fallback,
        );
      }
    }
    return Container(
      width: size,
      height: size,
      clipBehavior: Clip.antiAlias,
      decoration: BoxDecoration(color: background, borderRadius: BorderRadius.circular(math.min(radius, size / 2))),
      child: child,
    );
  }
}

class _SocialButton extends StatefulWidget {
  const _SocialButton({
    required this.link,
    required this.st,
    this.size,
    this.iconSize,
    this.radius,
    this.outlined = false,
  });

  final _Link link;
  final _Styles st;
  final double? size, iconSize, radius;

  /// Inside the card: a thin ring instead of the shadow.
  final bool outlined;

  @override
  State<_SocialButton> createState() => _SocialButtonState();
}

class _SocialButtonState extends State<_SocialButton> {
  bool _hovered = false, _focused = false;

  @override
  Widget build(BuildContext context) {
    final p = widget.st.p;
    final size = widget.size ?? _spec.height;
    final radius = widget.radius ?? _spec.radius;
    final shape = RoundedRectangleBorder(
      borderRadius: BorderRadius.circular(radius),
      side: widget.outlined
          ? BorderSide(color: p.border, width: 1)
          : (_spec.borderWidth > 0 ? BorderSide(color: p.border, width: _spec.borderWidth) : BorderSide.none),
    );
    Widget button = AnimatedContainer(
      duration: _fast,
      width: size,
      height: size,
      decoration: ShapeDecoration(
        shape: shape,
        color: p.background,
        shadows: widget.outlined || !_spec.softShadow ? const [] : (_hovered ? _softShadowHover : _softShadow),
      ),
      alignment: Alignment.center,
      child: _SvgIcon(widget.link.icon, size: widget.iconSize ?? (size * .44).roundToDouble(), color: p.icon),
    );
    if (_focused) {
      button = DecoratedBox(
        position: DecorationPosition.foreground,
        decoration: BoxDecoration(
          border: Border.all(color: p.textBold, width: 2),
          borderRadius: BorderRadius.circular(radius),
        ),
        child: button,
      );
    }
    return Semantics(
      link: true,
      label: widget.link.newTab ? '${widget.link.label}, opens in a new tab' : widget.link.label,
      excludeSemantics: true,
      child: FocusableActionDetector(
        mouseCursor: SystemMouseCursors.click,
        onShowHoverHighlight: (v) => setState(() => _hovered = v),
        onShowFocusHighlight: (v) => setState(() => _focused = v),
        actions: {
          ActivateIntent: CallbackAction<ActivateIntent>(onInvoke: (_) => _open(widget.link.url, widget.link.newTab)),
        },
        child: GestureDetector(
          onTap: () => _open(widget.link.url, widget.link.newTab),
          child: AnimatedScale(scale: _hovered ? 1.06 : 1, duration: _fast, child: button),
        ),
      ),
    );
  }
}

class _Bubble extends StatefulWidget {
  const _Bubble({
    required this.link,
    required this.st,
    required this.labelInside,
    required this.labelBelow,
    required this.onOpen,
    this.focusNode,
  });

  final _Link link;
  final _Styles st;
  final bool labelInside, labelBelow;
  final VoidCallback onOpen;
  final FocusNode? focusNode;

  @override
  State<_Bubble> createState() => _BubbleState();
}

class _BubbleState extends State<_Bubble> {
  bool _hovered = false, _focused = false;

  void _activate() {
    _open(widget.link.url, widget.link.newTab);
    widget.onOpen();
  }

  @override
  Widget build(BuildContext context) {
    final p = widget.st.p;
    final b = _spec.bubbleSize;
    final radius = _spec.radius / _spec.height * b;
    Widget bubble = Container(
      height: b,
      constraints: BoxConstraints(minWidth: b),
      padding: widget.labelInside ? EdgeInsets.only(left: _spec.padRight, right: _spec.padRight + 2) : EdgeInsets.zero,
      decoration: ShapeDecoration(
        color: p.background,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(radius),
          side: _spec.borderWidth > 0 ? BorderSide(color: p.border, width: _spec.borderWidth) : BorderSide.none,
        ),
        shadows: _spec.softShadow ? _softShadow : const [],
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          _SvgIcon(widget.link.icon, size: 18, color: p.icon),
          if (widget.labelInside) ...[
            SizedBox(width: _spec.gap - 2),
            Text(widget.link.label, style: widget.st.text(_spec.textSize - 1, p.textBold, FontWeight.w400)),
          ],
        ],
      ),
    );
    if (_focused) {
      bubble = DecoratedBox(
        position: DecorationPosition.foreground,
        decoration: BoxDecoration(
          border: Border.all(color: p.textBold, width: 2),
          borderRadius: BorderRadius.circular(radius),
        ),
        child: bubble,
      );
    }
    bubble = AnimatedScale(scale: _hovered ? 1.08 : 1, duration: _fast, child: bubble);
    if (!widget.labelInside && !widget.labelBelow) {
      bubble = Tooltip(message: widget.link.label, waitDuration: const Duration(milliseconds: 300), child: bubble);
    }
    return Semantics(
      link: true,
      label: widget.link.semantics ?? widget.link.label,
      excludeSemantics: true,
      child: FocusableActionDetector(
        focusNode: widget.focusNode,
        mouseCursor: SystemMouseCursors.click,
        onShowHoverHighlight: (v) => setState(() => _hovered = v),
        onShowFocusHighlight: (v) => setState(() => _focused = v),
        actions: {ActivateIntent: CallbackAction<ActivateIntent>(onInvoke: (_) => _activate())},
        child: GestureDetector(
          onTap: _activate,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              bubble,
              if (widget.labelBelow) ...[
                const SizedBox(height: 4),
                Text(widget.link.label, style: widget.st.text(11, p.textBold, FontWeight.w400, height: 14 / 11)),
              ],
            ],
          ),
        ),
      ),
    );
  }
}

/// The light band that sweeps across the badge (Shine).
class _ShineBand extends StatelessWidget {
  const _ShineBand({required this.animation, required this.curve, required this.color});

  final Animation<double> animation;
  final Curve Function() curve;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: animation,
      builder: (context, _) {
        if (animation.value >= 1) return const SizedBox.shrink();
        final x = -1.1 + 2.2 * curve().transform(animation.value);
        return FractionalTranslation(
          translation: Offset(x, 0),
          child: DecoratedBox(
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: const Alignment(-1, -.27),
                end: const Alignment(1, .27),
                colors: [color.withAlpha(0), color, color.withAlpha(0)],
                stops: const [.3, .5, .7],
              ),
            ),
          ),
        );
      },
    );
  }
}

/// Stamp: the text runs once around the circle, spaced to fill the whole turn.
class _RingPainter extends CustomPainter {
  _RingPainter({required this.parts, required this.fontSize, required this.normal, required this.bold, required this.border});

  final List<_RingPart> parts;
  final double fontSize;
  final TextStyle normal, bold;
  final Color border;

  @override
  void paint(Canvas canvas, Size size) {
    final k = size.width / 100;
    final center = size.center(Offset.zero);
    canvas.drawCircle(
      center,
      29 * k,
      Paint()
        ..style = PaintingStyle.stroke
        ..strokeWidth = k
        ..color = border,
    );

    final glyphs = <TextPainter>[];
    for (final part in parts) {
      final style = (part.bold ? bold : normal).copyWith(fontSize: fontSize * k);
      for (final char in part.text.characters) {
        glyphs.add(TextPainter(text: TextSpan(text: char, style: style), textDirection: TextDirection.ltr)..layout());
      }
    }
    if (glyphs.isEmpty) return;
    final r = 37 * k;
    final length = 2 * math.pi * r;
    final natural = glyphs.fold<double>(0, (sum, g) => sum + g.width);
    final extra = (length - natural) / glyphs.length;
    var along = 0.0;
    for (final g in glyphs) {
      // From 9 o'clock, clockwise over the top; letters stand on the circle.
      final angle = math.pi + (along + g.width / 2) / r;
      final baseline = g.computeDistanceToActualBaseline(TextBaseline.alphabetic);
      canvas.save();
      canvas.translate(center.dx + r * math.cos(angle), center.dy + r * math.sin(angle));
      canvas.rotate(angle + math.pi / 2);
      g.paint(canvas, Offset(-g.width / 2, -baseline));
      canvas.restore();
      along += g.width + extra;
    }
    for (final g in glyphs) {
      g.dispose();
    }
  }

  @override
  bool shouldRepaint(_RingPainter old) => old.normal != normal || old.bold != bold || old.border != border;
}

class _SvgIcon extends StatelessWidget {
  const _SvgIcon(this.icon, {required this.size, required this.color});

  final _Icon icon;
  final double size;
  final Color color;

  @override
  Widget build(BuildContext context) => CustomPaint(size: Size.square(size), painter: _IconPainter(icon, color));
}

class _IconPainter extends CustomPainter {
  _IconPainter(this.icon, this.color);

  final _Icon icon;
  final Color color;
  static final _cache = <String, Path>{};

  @override
  void paint(Canvas canvas, Size size) {
    final path = _cache.putIfAbsent(icon.path, () => _parseSvgPath(icon.path));
    canvas.scale(size.width / 24);
    canvas.drawPath(
      path,
      Paint()
        ..color = color
        ..isAntiAlias = true
        ..style = icon.filled ? PaintingStyle.fill : PaintingStyle.stroke
        ..strokeWidth = 2
        ..strokeCap = StrokeCap.round
        ..strokeJoin = StrokeJoin.round,
    );
  }

  @override
  bool shouldRepaint(_IconPainter old) => old.icon != icon || old.color != color;
}

/// SVG path data → Path (M L H V C S Q T A Z, absolute and relative).
Path _parseSvgPath(String d) {
  final path = Path();
  final tokens = RegExp(r'[A-Za-z]|[-+]?(?:\d+\.?\d*|\.\d+)(?:[eE][-+]?\d+)?').allMatches(d).map((m) => m[0]!).toList();
  bool isCommand(String t) => RegExp(r'^[A-Za-z]$').hasMatch(t);
  var i = 0;
  var command = 'M';
  var x = 0.0, y = 0.0, startX = 0.0, startY = 0.0;
  // Last control point, for S and T.
  var cx = 0.0, cy = 0.0;
  var last = '';
  double n() => double.parse(tokens[i++]);

  while (i < tokens.length) {
    if (isCommand(tokens[i])) {
      command = tokens[i++];
    } else if (command == 'Z' || command == 'z') {
      break;
    }
    final relative = command == command.toLowerCase();
    final ox = relative ? x : 0.0, oy = relative ? y : 0.0;
    final upper = command.toUpperCase();
    switch (upper) {
      case 'M':
        x = ox + n();
        y = oy + n();
        path.moveTo(x, y);
        startX = x;
        startY = y;
        command = relative ? 'l' : 'L';
      case 'L':
        x = ox + n();
        y = oy + n();
        path.lineTo(x, y);
      case 'H':
        x = ox + n();
        path.lineTo(x, y);
      case 'V':
        y = oy + n();
        path.lineTo(x, y);
      case 'C':
        final x1 = ox + n(), y1 = oy + n();
        cx = ox + n();
        cy = oy + n();
        x = ox + n();
        y = oy + n();
        path.cubicTo(x1, y1, cx, cy, x, y);
      case 'S':
        final x1 = last == 'C' || last == 'S' ? 2 * x - cx : x;
        final y1 = last == 'C' || last == 'S' ? 2 * y - cy : y;
        cx = ox + n();
        cy = oy + n();
        x = ox + n();
        y = oy + n();
        path.cubicTo(x1, y1, cx, cy, x, y);
      case 'Q':
        cx = ox + n();
        cy = oy + n();
        x = ox + n();
        y = oy + n();
        path.quadraticBezierTo(cx, cy, x, y);
      case 'T':
        cx = last == 'Q' || last == 'T' ? 2 * x - cx : x;
        cy = last == 'Q' || last == 'T' ? 2 * y - cy : y;
        x = ox + n();
        y = oy + n();
        path.quadraticBezierTo(cx, cy, x, y);
      case 'A':
        final rx = n(), ry = n(), rotation = n(), large = n() != 0, sweep = n() != 0;
        x = ox + n();
        y = oy + n();
        path.arcToPoint(Offset(x, y), radius: Radius.elliptical(rx, ry), rotation: rotation, largeArc: large, clockwise: sweep);
      case 'Z':
        path.close();
        x = startX;
        y = startY;
      default:
        return path;
    }
    last = upper == 'M' ? 'L' : upper;
  }
  return path;
}
